// Exemplo de Backend com Node.js + Express
// Este arquivo é apenas um EXEMPLO de como criar o backend
// Você precisará criar um projeto Node.js separado ou usar Vercel Functions

import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const app = express();
app.use(express.json());

// Configurar Mercado Pago com ACCESS_TOKEN (do .env do backend)
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!
});

const payment = new Payment(client);

// Endpoint para criar preferência de pagamento
app.post('/api/create-preference', async (req, res) => {
  try {
    const { plan, userId, userEmail } = req.body;

    const planPrices = {
      pro: 29,
      agency: 99
    };

    const preference = await payment.create({
      body: {
        items: [{
          title: `CálculoCerto - Plano ${plan}`,
          quantity: 1,
          unit_price: planPrices[plan],
          currency_id: 'BRL'
        }],
        payer: {
          email: userEmail
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/payment/success`,
          failure: `${process.env.FRONTEND_URL}/payment/failure`,
          pending: `${process.env.FRONTEND_URL}/payment/pending`
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACKEND_URL}/webhook`,
        metadata: {
          user_id: userId,
          plan: plan
        }
      }
    });

    res.json({ 
      preferenceId: preference.id,
      initPoint: preference.init_point 
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Webhook para receber notificações do Mercado Pago
app.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Apenas processar notificações de pagamento
    if (type === 'payment') {
      const paymentId = data.id;

      // Buscar detalhes do pagamento
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const userId = paymentInfo.metadata.user_id;
        const plan = paymentInfo.metadata.plan;

        // Atualizar assinatura no Firebase
        await fetch(`${process.env.FRONTEND_URL}/api/update-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            subscription: {
              plan,
              status: 'active',
              mercadoPagoSubscriptionId: paymentId,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          })
        });

        console.log(`Pagamento aprovado para usuário ${userId}, plano ${plan}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro');
  }
});

// Endpoint para verificar status do pagamento
app.get('/api/payment/:id', async (req, res) => {
  try {
    const paymentInfo = await payment.get({ id: req.params.id });
    res.json(paymentInfo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});

export default app;
