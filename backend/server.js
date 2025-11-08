import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import crypto from 'crypto';

dotenv.config();

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
    price: 29.00,
  },
  agency: {
    id: 'agency',
    title: 'Plano Agência',
    description: 'Recursos avançados para agências',
    price: 99.00,
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
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
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

    console.log('📥 Webhook recebido:', { type, data });

    // Validar webhook secret (se configurado)
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    
    if (process.env.MERCADO_PAGO_WEBHOOK_SECRET && xSignature) {
      const parts = xSignature.split(',');
      const ts = parts.find(p => p.startsWith('ts=')).replace('ts=', '');
      const hash = parts.find(p => p.startsWith('v1=')).replace('v1=', '');
      
      const manifest = `id:${data.id};request-id:${xRequestId};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', process.env.MERCADO_PAGO_WEBHOOK_SECRET);
      hmac.update(manifest);
      const calculatedHash = hmac.digest('hex');
      
      if (calculatedHash !== hash) {
        console.error('❌ Webhook signature inválida');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Responder rapidamente (o Mercado Pago espera resposta em até 2 segundos)
    res.sendStatus(200);

    // Processar notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const paymentData = await payment.get({ id: paymentId });
      
      console.log('💰 Pagamento:', {
        id: paymentData.id,
        status: paymentData.status,
        metadata: paymentData.metadata,
      });

      // Se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        const userId = paymentData.metadata.user_id;
        const planId = paymentData.metadata.plan_id;

        console.log(`✅ Pagamento aprovado! Ativando plano ${planId} para usuário ${userId}`);

        // Aqui você integraria com Firebase para atualizar a assinatura
        // Por enquanto, apenas log
        console.log('TODO: Atualizar Firebase com assinatura ativa');
        
        // Exemplo de como seria:
        // await updateUserSubscription(userId, {
        //   plan: planId,
        //   status: 'active',
        //   startDate: new Date().toISOString(),
        //   endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        //   mercadoPagoPaymentId: paymentData.id,
        // });
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
