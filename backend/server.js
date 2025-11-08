import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';
import admin from 'firebase-admin';

dotenv.config();

// Inicializar Firebase Admin (usando variáveis de ambiente)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const preference = new Preference(client);
const payment = new Payment(client);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.calculocerto.net.br',
  'https://calculocerto.net.br',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Planos
const PLANS = {
  pro: {
    id: 'pro',
    title: 'Plano Pro',
    description: 'Orçamentos profissionais',
    price: 1.00,
  },
  agency: {
    id: 'agency',
    title: 'Plano Agência',
    description: 'Recursos avançados para agências',
    price: 1.50,
  }
};

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Backend CálculoCerto rodando!',
    timestamp: new Date().toISOString()
  });
});

// Rota para ativar assinatura manualmente (TEMPORÁRIA - para corrigir pagamentos já feitos)
app.post('/api/activate-subscription', async (req, res) => {
  try {
    const { userId, planId, paymentId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ error: 'userId e planId são obrigatórios' });
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    await db.collection('users').doc(userId).set({
      subscription: {
        plan: planId,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        mercadoPagoPaymentId: paymentId || 'manual_activation',
      }
    }, { merge: true });

    console.log(`✅ Assinatura ${planId} ativada manualmente para usuário ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'Assinatura ativada com sucesso!',
      subscription: {
        plan: planId,
        status: 'active',
        endDate: endDate.toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao ativar assinatura:', error);
    res.status(500).json({ error: 'Erro ao ativar assinatura' });
  }
});

// Criar preferência de pagamento
app.post('/api/create-preference', async (req, res) => {
  try {
    const { planId, userId, userEmail } = req.body;

    if (!planId || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Dados incompletos. Envie: planId, userId, userEmail' 
      });
    }

    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Plano inválido' });
    }

    // Criar preferência de pagamento
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: plan.price,
        }
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/?payment=success`,
        failure: `${process.env.FRONTEND_URL}/?payment=failure`,
        pending: `${process.env.FRONTEND_URL}/?payment=pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || `http://localhost:${PORT}`}/webhook`,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      statement_descriptor: 'CALCULOCERTO',
      external_reference: `${userId}_${planId}_${Date.now()}`,
    };

    const response = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', response.id);

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    res.status(500).json({ 
      error: 'Erro ao criar preferência de pagamento',
      details: error.message 
    });
  }
});

// Webhook - Receber notificações do Mercado Pago
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📥 Webhook recebido:', JSON.stringify({ type, data, headers: req.headers }, null, 2));

    // TODO: Validar webhook secret (desabilitado temporariamente para debug)
    // const xSignature = req.headers['x-signature'];
    // const xRequestId = req.headers['x-request-id'];
    // if (process.env.MERCADO_PAGO_WEBHOOK_SECRET && xSignature) {
    //   // Validação de assinatura aqui
    // }

    // Responder rapidamente (o Mercado Pago espera resposta em até 2 segundos)
    res.sendStatus(200);

    // Processar notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      console.log(`🔍 Buscando detalhes do pagamento: ${paymentId}`);
      const paymentData = await payment.get({ id: paymentId });
      
      console.log('💰 Detalhes do pagamento:', JSON.stringify({
        id: paymentData.id,
        status: paymentData.status,
        status_detail: paymentData.status_detail,
        metadata: paymentData.metadata,
      }, null, 2));

      // Se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        const userId = paymentData.metadata.user_id;
        const planId = paymentData.metadata.plan_id;

        console.log(`✅ Pagamento aprovado! Ativando plano ${planId} para usuário ${userId}`);

        try {
          // Atualizar Firebase com assinatura ativa
          const startDate = new Date();
          const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

          await db.collection('users').doc(userId).set({
            subscription: {
              plan: planId,
              status: 'active',
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              mercadoPagoPaymentId: paymentData.id,
            }
          }, { merge: true });

          console.log(`✅ Assinatura ${planId} ativada para usuário ${userId}`);
        } catch (error) {
          console.error('❌ Erro ao atualizar Firebase:', error);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Mesmo com erro, retornar 200 para não receber novamente
    res.sendStatus(200);
  }
});

// Verificar status de pagamento
app.get('/api/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentData = await payment.get({ id });
    
    res.json({
      id: paymentData.id,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      metadata: paymentData.metadata,
      transactionAmount: paymentData.transaction_amount,
      dateApproved: paymentData.date_approved,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar pagamento:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar pagamento',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Backend CálculoCerto rodando!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔑 Mercado Pago configurado: ${process.env.MERCADO_PAGO_ACCESS_TOKEN ? '✅' : '❌'}`);
  console.log(`🔐 Webhook Secret: ${process.env.MERCADO_PAGO_WEBHOOK_SECRET ? '✅' : '❌'}`);
  console.log(`\nEndpoints disponíveis:`);
  console.log(`  GET  / - Status do servidor`);
  console.log(`  POST /api/create-preference - Criar pagamento`);
  console.log(`  POST /webhook - Receber notificações`);
  console.log(`  GET  /api/payment/:id - Verificar pagamento\n`);
});
