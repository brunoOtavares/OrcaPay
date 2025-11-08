# 🔑 ONDE COLOCAR AS CHAVES DO MERCADO PAGO

## 1️⃣ Public Key (Frontend)

**Criar arquivo:** `.env.local` na raiz do projeto

```bash
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 2️⃣ Access Token (Backend - OBRIGATÓRIO)

⚠️ **NUNCA coloque o Access Token no frontend!**

Você precisa criar um backend simples (Node.js, Python, PHP, etc.)

**Exemplo Node.js:**

```bash
# backend/.env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🎯 Como Pegar as Chaves

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique na sua aplicação
3. Vá em "Credenciais de produção" (ou "Credenciais de teste" para testar)
4. Copie:
   - **Public Key** → `.env.local` (frontend)
   - **Access Token** → backend

## 🚀 Para Testar Agora (Modo Demo)

Atualmente o sistema está no **modo demonstração** e simula os pagamentos.

Para ativar pagamentos reais, siga o guia completo: `CONFIGURAR_MERCADOPAGO.md`

---

**Arquivos atualizados:**
- ✅ `src/config/mercadopago.ts` - Configuração das chaves
- ✅ `src/services/mercadoPagoService.ts` - Serviço de integração
- ✅ `.env.example` - Template das variáveis

**Próximos passos:**
1. Criar `.env.local` com sua Public Key
2. Criar backend para processar pagamentos
3. Configurar webhooks no Mercado Pago
