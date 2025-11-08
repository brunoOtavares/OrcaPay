# 🚀 Rodar CálculoCerto - Frontend + Backend

## Método 1: Script Automático (Recomendado)

```bash
# Dar permissão de execução ao script
chmod +x start.sh

# Rodar tudo de uma vez
./start.sh
```

Isso vai:
- ✅ Instalar dependências do backend (se necessário)
- ✅ Iniciar backend na porta 3001
- ✅ Iniciar frontend na porta 5173
- ✅ Parar ambos com Ctrl+C

---

## Método 2: Manualmente (2 terminais)

### Terminal 1 - Backend

```bash
cd backend

# Instalar dependências (primeira vez)
npm install

# Rodar servidor
npm start
```

Backend estará em: http://localhost:3001

### Terminal 2 - Frontend

```bash
# Na pasta raiz do projeto
npm run dev
```

Frontend estará em: http://localhost:5173

---

## 📝 Testar Pagamentos

1. Acesse: http://localhost:5173
2. Faça login
3. Vá em Perfil → Assinatura
4. Escolha um plano (Pro ou Agência)
5. Clique em "Assinar"
6. Você será redirecionado para o Mercado Pago (ambiente de testes)

### Dados de Teste do Mercado Pago

**Cartões de Teste:**

✅ **Aprovado:**
- Número: `5031 4332 1540 6351`
- Vencimento: Qualquer data futura
- CVV: Qualquer 3 dígitos
- Nome: APRO

⏳ **Pendente:**
- Número: `5031 4332 1540 6351`
- Nome: CONT

❌ **Recusado:**
- Número: `5031 4332 1540 6351`
- Nome: OTHE

Mais cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards

---

## 🔍 Verificar se está funcionando

### Testar Backend
```bash
curl http://localhost:3001
```

Resposta esperada:
```json
{
  "status": "online",
  "message": "Backend CálculoCerto rodando!",
  "timestamp": "2025-11-08T..."
}
```

### Logs do Backend
O backend mostrará logs de:
- ✅ Preferências criadas
- 📥 Webhooks recebidos
- 💰 Pagamentos processados

### Logs do Frontend
Abra o Console do navegador (F12) para ver:
- Chamadas à API
- Erros (se houver)

---

## ⚡ Comandos Úteis

```bash
# Parar todos os processos Node.js
killall node

# Ver processos rodando nas portas
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Matar processo específico por porta
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:5173)
```

---

## 🐛 Problemas Comuns

### Porta já em uso
```bash
# Matar processo na porta 3001
kill -9 $(lsof -t -i:3001)

# Matar processo na porta 5173
kill -9 $(lsof -t -i:5173)
```

### Erro de dependências
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

### Backend não conecta com frontend
Verifique o arquivo `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

---

## 📦 Estrutura de Arquivos

```
OrçaPay/
├── backend/
│   ├── .env                 # Chaves do Mercado Pago (backend)
│   ├── package.json
│   └── server.js            # Servidor Express
├── src/
│   ├── components/
│   │   ├── SubscriptionManager.tsx
│   │   └── PaymentResult.tsx
│   └── config/
│       └── mercadopago.ts   # Config frontend
├── .env.local               # Chaves do Firebase e PUBLIC_KEY
├── start.sh                 # Script para rodar tudo
└── COMO_RODAR.md           # Este arquivo
```

---

## 🎯 Próximos Passos

Após testar localmente com sucesso:

1. **Configurar Webhook no Mercado Pago:**
   - Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
   - Adicione a URL do webhook (produção)

2. **Deploy do Backend:**
   - Heroku, Railway, Render, etc.
   - Configure as variáveis de ambiente

3. **Deploy do Frontend:**
   - Vercel, Netlify, etc.
   - Configure VITE_MERCADO_PAGO_PUBLIC_KEY

4. **Modo Produção:**
   - Mude para credenciais de produção
   - Teste com cartões reais

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Verifique o console do navegador (F12)
3. Confirme que as chaves do Mercado Pago estão corretas
4. Teste os endpoints manualmente com curl

Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs
