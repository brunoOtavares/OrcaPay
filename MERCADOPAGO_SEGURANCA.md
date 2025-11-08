# 🔐 Segurança: PUBLIC KEY vs ACCESS TOKEN

## ⚠️ IMPORTANTE - Entenda a Diferença

### 🟢 PUBLIC KEY (Chave Pública)
- **PODE** ser exposta no frontend
- **PODE** ser commitada no código (se quiser)
- Usada para: Criar preferências de pagamento, iniciar checkout
- Exemplo: `TEST-49880c8d-83dc-404f-a8f5-2409dc468f85`

### 🔴 ACCESS TOKEN (Token de Acesso)
- **NUNCA** deve ser exposta no frontend
- **NUNCA** commite no Git
- Usada para: Processar pagamentos, criar assinaturas, webhooks
- Exemplo: `TEST-4918234692816847-070802-1234567890abcdef-1234567890`

## 📋 Como Usar Corretamente

### Opção 1: Backend Próprio (Recomendado)
```
Frontend (React)
    ↓ envia dados do pagamento
Backend (Node.js/Python/etc)
    ↓ usa ACCESS_TOKEN
Mercado Pago API
```

**Estrutura:**
```
frontend/
  - Usa apenas PUBLIC_KEY
  - Cria preferência de pagamento
  - Envia para backend

backend/
  - Usa ACCESS_TOKEN
  - Processa pagamento
  - Recebe webhooks
```

### Opção 2: Vercel Functions / Firebase Functions
```typescript
// api/create-payment.ts (Vercel Function)
export default async function handler(req, res) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  
  // Processar pagamento com ACCESS_TOKEN
  const payment = await fetch('https://api.mercadopago.com/v1/payments', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}
```

### Opção 3: Desenvolvimento/Teste (Atual)
Por enquanto, estamos usando apenas a PUBLIC_KEY no frontend para demonstração.
**Para produção, você DEVE criar um backend.**

## 🚀 Onde Colocar as Chaves

### 1. Desenvolvimento Local
Crie arquivo `.env.local` (nunca commite):
```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token
```

### 2. Vercel (Frontend)
No dashboard da Vercel:
- Settings → Environment Variables
- Adicione: `VITE_MERCADO_PAGO_PUBLIC_KEY`
- **NÃO adicione o ACCESS_TOKEN aqui!**

### 3. Backend (se criar)
No servidor backend:
- Adicione apenas: `MERCADO_PAGO_ACCESS_TOKEN`
- O frontend se comunica com seu backend
- Seu backend usa o ACCESS_TOKEN

## 📖 Pegar as Chaves

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie uma aplicação
3. Vá em **Credenciais**
4. Modo **Teste** (para desenvolvimento):
   - Public Key: `TEST-xxxx`
   - Access Token: `TEST-xxxx`
5. Modo **Produção** (para lançar):
   - Public Key: `APP-xxxx`
   - Access Token: `APP-xxxx`

## ⚙️ Fluxo Completo de Pagamento

### Frontend (React + PUBLIC_KEY)
```typescript
// 1. Usuário seleciona plano
// 2. Frontend cria preferência usando PUBLIC_KEY
const preference = {
  items: [{
    title: 'Plano Pro',
    unit_price: 29,
    quantity: 1
  }]
};

// 3. Redireciona para checkout do Mercado Pago
// Mercado Pago processa o pagamento
```

### Backend (Node.js + ACCESS_TOKEN)
```javascript
// 1. Recebe webhook do Mercado Pago
app.post('/webhook', async (req, res) => {
  const paymentId = req.body.data.id;
  
  // 2. Verifica pagamento com ACCESS_TOKEN
  const payment = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    }
  );
  
  // 3. Se aprovado, ativa assinatura no Firebase
  if (payment.status === 'approved') {
    await updateSubscription(userId, {
      plan: 'pro',
      status: 'active'
    });
  }
});
```

## 🎯 Implementação Atual

**Status Atual:**
- ✅ Frontend configurado com PUBLIC_KEY
- ✅ Interface de assinatura pronta
- ⏳ Backend para processar pagamentos (você precisa criar)

**Para Produção:**
1. Crie um backend (Node.js, Python, etc.)
2. Configure webhooks no painel do Mercado Pago
3. Backend recebe notificações e ativa assinaturas
4. Nunca exponha ACCESS_TOKEN no frontend

## 📚 Recursos

- [Mercado Pago - Documentação](https://www.mercadopago.com.br/developers/pt/docs)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/landing)

## ⚠️ Nunca Faça Isso

```typescript
// ❌ NUNCA faça isso no frontend!
const accessToken = "TEST-4918234692816847-070802...";

// ❌ NUNCA commite ACCESS_TOKEN no Git!
git add .env

// ❌ NUNCA exponha ACCESS_TOKEN no código frontend!
export const config = {
  accessToken: "TEST-123..."
};
```

## ✅ Faça Isso

```typescript
// ✅ OK no frontend
const publicKey = "TEST-49880c8d-83dc-404f-a8f5...";

// ✅ OK no .env.local (não commitado)
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-xxx

// ✅ OK no backend
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
```

---

**Resumo:** 
- 🟢 PUBLIC_KEY = Frontend (seguro)
- 🔴 ACCESS_TOKEN = Backend (secreto)
