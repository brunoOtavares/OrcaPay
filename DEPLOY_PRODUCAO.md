# 🚀 Deploy do CálculoCerto - Guia Completo

Este guia vai te ajudar a colocar o CálculoCerto em produção.

## 📋 Pré-requisitos

- [ ] Conta no GitHub
- [ ] Conta no Vercel (para frontend)
- [ ] Conta no Render ou Railway (para backend)
- [ ] Chaves do Mercado Pago (modo PRODUÇÃO)

---

## 🎯 PASSO 1: Preparar o Repositório

### 1.1 - Criar repositório no GitHub (se ainda não tiver)

```bash
# Inicializar git (se ainda não estiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: Preparar para produção"

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU-USUARIO/calculocerto.git
git branch -M main
git push -u origin main
```

### 1.2 - Adicionar .gitignore (já criado)

Certifique-se que estes arquivos NÃO sejam commitados:
- `.env.local`
- `.env.production` (com chaves reais)
- `backend/.env`

---

## 🔧 PASSO 2: Deploy do Backend (Render)

### 2.1 - Acessar Render.com

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New +" → "Web Service"

### 2.2 - Conectar Repositório

1. Selecione seu repositório `calculocerto`
2. Configure:
   - **Name**: `calculocerto-backend`
   - **Region**: Oregon (US West)
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 - Adicionar Variáveis de Ambiente

Clique em "Advanced" → "Add Environment Variable":

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-104444737441901-110807-63032f5af6ac5412102855c5b91ebbaf-215062504
MERCADO_PAGO_WEBHOOK_SECRET=cb98a3fd176dc596e028f1749a82c3e1233c23bf04ebe8be87d4c467e1109c78
FRONTEND_URL=https://seu-frontend.vercel.app
PORT=3001
NODE_ENV=production
```

**IMPORTANTE**: 
- Mude para chaves de PRODUÇÃO quando for real!
- Atualize `FRONTEND_URL` depois do deploy do frontend

### 2.4 - Deploy

1. Clique em "Create Web Service"
2. Aguarde o build (5-10 minutos)
3. **Anote a URL**: `https://calculocerto-backend.onrender.com`

---

## 🎨 PASSO 3: Deploy do Frontend (Vercel)

### 3.1 - Acessar Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New..." → "Project"

### 3.2 - Importar Repositório

1. Selecione `calculocerto`
2. Configure:
   - **Project Name**: `calculocerto`
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 - Adicionar Variáveis de Ambiente

Clique em "Environment Variables" e adicione:

```env
VITE_FIREBASE_API_KEY=AIzaSyBzp9MZ-KRdt234164sRmnaYTeWEO7Eefk
VITE_FIREBASE_AUTH_DOMAIN=orca-pay.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orca-pay
VITE_FIREBASE_STORAGE_BUCKET=orca-pay.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=947822787225
VITE_FIREBASE_APP_ID=1:947822787225:web:14809d75855cfe9ee49608
VITE_FIREBASE_MEASUREMENT_ID=G-TF5LGRMXLN
VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-49880c8d-83dc-404f-a8f5-2409dc468f85
VITE_BACKEND_URL=https://calculocerto-backend.onrender.com
```

**IMPORTANTE**: Use a URL do backend do Passo 2.4

### 3.4 - Deploy

1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. **Anote a URL**: `https://calculocerto.vercel.app`

---

## 🔄 PASSO 4: Atualizar URLs Cruzadas

### 4.1 - Atualizar Backend com URL do Frontend

1. Volte ao Render
2. Vá em seu web service
3. Environment → Edit
4. Atualize: `FRONTEND_URL=https://calculocerto.vercel.app`
5. Salve (vai fazer redeploy automático)

### 4.2 - Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/webhooks
2. Clique em "Criar webhook"
3. Configure:
   - **URL**: `https://calculocerto-backend.onrender.com/webhook`
   - **Eventos**: Pagamentos
4. Copie o **Webhook Secret** gerado
5. Volte ao Render e atualize a variável `MERCADO_PAGO_WEBHOOK_SECRET`

---

## 🔐 PASSO 5: Configurar Domínio Personalizado (Opcional)

### No Vercel (Frontend)

1. Vá em Settings → Domains
2. Adicione seu domínio (ex: `calculocerto.com`)
3. Configure DNS conforme instruções

### No Render (Backend)

1. Vá em Settings → Custom Domain
2. Adicione subdomínio (ex: `api.calculocerto.com`)
3. Configure DNS conforme instruções

---

## ✅ PASSO 6: Testes em Produção

### 6.1 - Testar Frontend

1. Acesse: `https://calculocerto.vercel.app`
2. Faça login
3. Verifique se carregou corretamente

### 6.2 - Testar Backend

```bash
curl https://calculocerto-backend.onrender.com
```

Deve retornar:
```json
{
  "status": "online",
  "message": "Backend CálculoCerto rodando!",
  "timestamp": "..."
}
```

### 6.3 - Testar Pagamento

1. Vá em Perfil → Assinatura
2. Escolha um plano
3. Use cartão de teste:
   - Número: `5031 4332 1540 6351`
   - Nome: `APRO`
   - Vencimento: `12/30`
   - CVV: `123`
4. Verifique se o webhook foi recebido nos logs do Render

---

## 🔄 PASSO 7: Migrar para Produção (Quando for cobrar de verdade)

### 7.1 - Obter Chaves de Produção

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Vá em "Credenciais de produção"
3. Copie:
   - **Public Key** (começa com `APP_USR-`)
   - **Access Token** (começa com `APP_USR-`)

### 7.2 - Atualizar Variáveis de Ambiente

**Vercel (Frontend):**
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-producao
```

**Render (Backend):**
```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-access-token-producao
```

### 7.3 - Reconfigurar Webhook

Crie novo webhook apontando para a URL de produção do backend.

---

## 📊 Monitoramento

### Logs do Backend (Render)

1. Acesse dashboard do Render
2. Clique em seu web service
3. Vá em "Logs"
4. Monitore pagamentos e webhooks

### Logs do Frontend (Vercel)

1. Acesse dashboard do Vercel
2. Clique em seu projeto
3. Vá em "Functions" → "Logs"

### Analytics do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/home
2. Vá em "Suas vendas"
3. Monitore transações

---

## 🚨 Troubleshooting

### Backend não responde
```bash
# Ver logs
curl https://calculocerto-backend.onrender.com

# Verificar variáveis de ambiente no Render
# Dashboard → Environment → Check all variables
```

### Frontend não conecta ao backend
```javascript
// Verificar no console do navegador (F12)
// Procurar por erros de CORS ou URL incorreta
```

### Webhook não recebe notificações
```bash
# Testar manualmente
curl -X POST https://calculocerto-backend.onrender.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123"}}'
```

### Pagamento não ativa assinatura
1. Verificar logs do webhook no Render
2. Verificar se o Firebase está acessível
3. Verificar se o userId está correto

---

## 🎉 Pronto!

Seu app está em produção! 🚀

**URLs:**
- Frontend: `https://calculocerto.vercel.app`
- Backend: `https://calculocerto-backend.onrender.com`
- Webhook: `https://calculocerto-backend.onrender.com/webhook`

**Próximos passos:**
- [ ] Adicionar Google Analytics
- [ ] Configurar domínio personalizado
- [ ] Ativar SSL/HTTPS
- [ ] Fazer backup do Firebase
- [ ] Monitorar uptime com UptimeRobot

---

## 📞 Suporte

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Mercado Pago Docs: https://www.mercadopago.com.br/developers/pt/docs
