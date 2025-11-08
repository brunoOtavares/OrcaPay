# 🔑 Como Adicionar as Chaves do Mercado Pago

## 📍 Onde Colocar o ACCESS_TOKEN

### Opção 1: Desenvolvimento Local (Rápido)

1. **Crie arquivo `.env.local` na raiz do projeto:**
```bash
# .env.local (NÃO COMMITAR!)
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-sua-public-key-aqui
VITE_MERCADO_PAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
```

2. **Adicione ao `.gitignore`:**
```
.env.local
.env
```

### Opção 2: Produção na Vercel (Recomendado)

**⚠️ NUNCA adicione ACCESS_TOKEN nas variáveis de ambiente da Vercel (frontend)!**

1. **No Frontend (Vercel):**
   - Adicione apenas: `VITE_MERCADO_PAGO_PUBLIC_KEY`

2. **Crie um Backend Separado:**
   - Backend em Node.js, Python, ou qualquer linguagem
   - Configure ACCESS_TOKEN no servidor backend
   - Veja exemplo: `backend-example.ts`

3. **Ou use Vercel Functions:**
```typescript
// api/create-payment.ts
export default async function handler(req, res) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  // Processar pagamento
}
```

## 🔐 Pegar as Chaves

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login
3. **Aplicações** → **Criar aplicação**
4. Nome: "CálculoCerto"
5. Vá em **Credenciais**

### Modo Teste (Desenvolvimento):
```
Public Key:     TEST-xxxxx-xxxxx-xxxxx-xxxxx
Access Token:   TEST-xxxxx-xxxxx-xxxxx-xxxxx
```

### Modo Produção:
```
Public Key:     APP-xxxxx-xxxxx-xxxxx-xxxxx
Access Token:   APP-xxxxx-xxxxx-xxxxx-xxxxx
```

## 📁 Estrutura de Arquivos

```
seu-projeto/
├── .env.example          # Template (OK commitar)
├── .env.local           # Suas chaves REAIS (NÃO commitar)
├── .gitignore           # Ignorar .env.local
└── src/
    └── config/
        └── mercadopago.ts
```

## ✅ Checklist

- [ ] Criou conta no Mercado Pago
- [ ] Criou aplicação no painel
- [ ] Pegou PUBLIC_KEY (modo teste)
- [ ] Pegou ACCESS_TOKEN (modo teste)
- [ ] Criou `.env.local`
- [ ] Adicionou as chaves no `.env.local`
- [ ] Adicionou `.env.local` no `.gitignore`
- [ ] Testou localmente
- [ ] Para produção: Criou backend separado

## 🚨 Lembretes de Segurança

✅ **PODE fazer:**
- Usar PUBLIC_KEY no frontend
- Commitar código com PUBLIC_KEY
- Expor PUBLIC_KEY no navegador

❌ **NUNCA faça:**
- Expor ACCESS_TOKEN no frontend
- Commitar ACCESS_TOKEN no Git
- Adicionar ACCESS_TOKEN na Vercel (frontend)

## 📖 Leia Mais

- [MERCADOPAGO_SEGURANCA.md](./MERCADOPAGO_SEGURANCA.md) - Guia completo de segurança
- [backend-example.ts](./backend-example.ts) - Exemplo de backend
- [Docs Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)

---

**Dúvidas?** Leia o arquivo `MERCADOPAGO_SEGURANCA.md` para entender melhor!
