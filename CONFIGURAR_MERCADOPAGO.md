# 💳 Configuração do Mercado Pago

## 📋 Passo a Passo

### 1. Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br
2. Crie sua conta ou faça login
3. Vá para o painel de desenvolvedores: https://www.mercadopago.com.br/developers/panel

### 2. Criar Aplicação

1. No painel, clique em **"Suas integrações"**
2. Clique em **"Criar aplicação"**
3. Preencha:
   - Nome: `CálculoCerto`
   - Modelo de integração: `Pagamentos online e presenciais`
4. Clique em **"Criar aplicação"**

### 3. Pegar Credenciais

1. Na sua aplicação, vá em **"Credenciais de produção"**
2. Copie:
   - **Public Key** (chave pública)
   - **Access Token** (token de acesso - NUNCA exponha no frontend!)

### 4. Configurar no Projeto

#### Frontend (.env.local):

```bash
# Criar arquivo .env.local na raiz do projeto
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

⚠️ **IMPORTANTE**: Adicione `.env.local` no `.gitignore` para não commitar as chaves!

#### Backend (necessário para produção):

O **Access Token** deve ficar APENAS no backend. Nunca no frontend!

```javascript
// backend/config/mercadopago.js
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
});
```

### 5. Criar Endpoints no Backend

Você precisa criar um backend (Node.js, Python, PHP, etc.) com os seguintes endpoints:

#### POST /api/create-preference
Cria uma preferência de pagamento

```javascript
// Exemplo Node.js + Express
app.post('/api/create-preference', async (req, res) => {
  const { plan, userId, userEmail } = req.body;

  const preference = {
    items: [
      {
        title: plan === 'pro' ? 'CálculoCerto Pro' : 'CálculoCerto Agência',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plan === 'pro' ? 29.00 : 99.00
      }
    ],
    payer: {
      email: userEmail
    },
    back_urls: {
      success: 'https://seu-site.com/payment/success',
      failure: 'https://seu-site.com/payment/failure',
      pending: 'https://seu-site.com/payment/pending'
    },
    auto_return: 'approved',
    external_reference: userId,
    notification_url: 'https://seu-backend.com/webhooks/mercadopago'
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    res.json({ preferenceId: response.body.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### POST /webhooks/mercadopago
Recebe notificações de pagamento

```javascript
app.post('/webhooks/mercadopago', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'payment') {
    const paymentId = data.id;
    
    // Buscar informações do pagamento
    const payment = await mercadopago.payment.get(paymentId);
    
    if (payment.body.status === 'approved') {
      const userId = payment.body.external_reference;
      
      // Atualizar assinatura no Firebase
      await updateUserSubscription(userId, {
        plan: getPlanFromAmount(payment.body.transaction_amount),
        status: 'active',
        mercadoPagoPaymentId: paymentId,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  res.sendStatus(200);
});
```

### 6. Atualizar o Frontend

No `SubscriptionManager.tsx`, atualize a função `handlePayment`:

```typescript
const handlePayment = async () => {
  if (!selectedPlan || !currentUser || !userProfile) return;

  setLoading(true);
  try {
    // Chamar seu backend para criar a preferência
    const response = await fetch('https://seu-backend.com/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: selectedPlan,
        userId: currentUser.uid,
        userEmail: userProfile.email
      })
    });

    const { preferenceId } = await response.json();

    // Abrir checkout do Mercado Pago
    const mp = new window.MercadoPago(mercadoPagoConfig.publicKey);
    mp.checkout({
      preference: { id: preferenceId },
      autoOpen: true
    });

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    alert('Erro ao processar pagamento. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

### 7. Testar no Modo Sandbox

1. No painel do Mercado Pago, use as **Credenciais de teste**
2. Use cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
3. Cartões para testar:
   - **Aprovado**: 5031 4332 1540 6351 | CVV: 123 | Validade: 11/25
   - **Recusado**: 5031 7557 3453 0604 | CVV: 123 | Validade: 11/25

### 8. Configurar Webhook no Mercado Pago

1. No painel, vá em **"Webhooks"**
2. Configure a URL: `https://seu-backend.com/webhooks/mercadopago`
3. Selecione os eventos: `payment`

## 📁 Estrutura Recomendada

```
projeto/
├── frontend/ (React + Vite)
│   ├── src/
│   │   ├── config/
│   │   │   └── mercadopago.ts (public key)
│   │   └── services/
│   │       └── mercadoPagoService.ts
│   └── .env.local (VITE_MERCADO_PAGO_PUBLIC_KEY)
│
└── backend/ (Node.js/Python/PHP)
    ├── routes/
    │   ├── payments.js (criar preferência)
    │   └── webhooks.js (receber notificações)
    └── .env (MERCADO_PAGO_ACCESS_TOKEN)
```

## 🔒 Segurança

### ✅ PODE expor no frontend:
- Public Key

### ❌ NUNCA exponha no frontend:
- Access Token
- Lógica de criação de pagamento
- Processamento de webhooks

## 🚀 Deploy

### Frontend (Vercel):
```bash
# Adicionar variável de ambiente no Vercel
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
```

### Backend (Railway/Heroku/etc):
```bash
# Adicionar variável de ambiente
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
```

## 📚 Recursos

- Documentação: https://www.mercadopago.com.br/developers/pt
- SDKs: https://www.mercadopago.com.br/developers/pt/docs/sdks-library
- Testes: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

## ⚠️ Status Atual

**Modo Demonstração Ativo**

O projeto está configurado para simular pagamentos. Para ativar pagamentos reais:

1. ✅ Configure as variáveis de ambiente
2. ✅ Crie o backend com os endpoints
3. ✅ Configure os webhooks
4. ✅ Teste com credenciais de sandbox
5. ✅ Deploy em produção com credenciais reais

---

**Precisa de ajuda?** Entre em contato com o suporte do Mercado Pago: https://www.mercadopago.com.br/developers/pt/support
