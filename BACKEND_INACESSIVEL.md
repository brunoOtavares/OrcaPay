# 🔧 Como Resolver o Problema de Backend Inacessível

## 🚨 Sintomas
- Erro: "The operation was aborted"
- Mensagem: "Não foi possível conectar ao backend"
- Timeout ao tentar criar preferência de pagamento
- Diagnóstico mostra backend como ❌

## 🔍 Causas Comuns

### 1. Backend não está rodando
O servidor backend pode estar offline ou não iniciado.

### 2. URL incorreta nas variáveis de ambiente
A variável `VITE_BACKEND_URL` pode estar apontando para um endereço errado.

### 3. Problemas de rede/firewall
Firewalls ou configurações de rede podem estar bloqueando o acesso.

### 4. Serviço de hosting (Render/Heroku) instável
Se estiver usando serviços como Render, o backend pode estar em "cold start" ou offline.

## 🛠️ Soluções

### Solução 1: Verificar se o backend está rodando (Desenvolvimento Local)

```bash
# Verifique se o processo está rodando
ps aux | grep node

# Verifique se a porta está sendo usada
lsof -i :3001

# Inicie o backend se não estiver rodando
cd backend
npm install
npm start
```

### Solução 2: Verificar variáveis de ambiente

**Frontend (.env):**
```env
VITE_BACKEND_URL=http://localhost:3001
# OU para produção:
VITE_BACKEND_URL=https://seu-backend.onrender.com
```

**Backend (.env):**
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
# OU para produção:
FRONTEND_URL=https://seu-dominio.com
```

### Solução 3: Testar conexão manualmente

```bash
# Teste local
curl http://localhost:3001

# Teste produção
curl https://seu-backend.onrender.com

# Teste endpoint específico
curl -X POST https://seu-backend.onrender.com/api/create-preference \
  -H "Content-Type: application/json" \
  -d '{"planId":"pro","userId":"test","userEmail":"test@test.com"}'
```

### Solução 4: Problemas com Render/Heroku

**Para Render:**
1. Acesse o dashboard do Render
2. Verifique se o serviço está "Live"
3. Verifique os logs de erro
4. Se estiver em "Free tier", pode haver limitações de tempo

**Para Heroku:**
1. Verifique se o dyno está rodando
2. Verifique os logs: `heroku logs --tail`
3. Reinicie o dyno: `heroku restart`

### Solução 5: Configurar CORS corretamente

No backend (`server.js`), verifique se o CORS está configurado:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.calculocerto.net.br',
  'https://calculocerto.net.br',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 🧪 Diagnóstico Avançado

### 1. Usando a Ferramenta de Diagnóstico
1. Acesse **Configurações** > **Diagnóstico do Sistema de Pagamento**
2. Clique em **"Verificar Novamente"**
3. Observe os detalhes do erro no backend

### 2. Verificando logs do navegador
1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Tente fazer um pagamento
4. Procure pela requisição para `/api/create-preference`
5. Verifique o status e a resposta

### 3. Verificando logs do backend
```bash
# Para desenvolvimento local
cd backend
npm start

# Para produção (Render/Heroku)
# Verifique o dashboard do serviço para logs
```

## 🚀 Deploy em Produção

### Render
1. **Configure o health check** no `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "healthcheck": "curl -f http://localhost:3001/ || exit 1"
  }
}
```

2. **Configure variáveis de ambiente** no dashboard do Render:
   - `PORT=3001`
   - `FRONTEND_URL=https://calculocerto.net.br`
   - `MERCADO_PAGO_ACCESS_TOKEN=seu_token`
   - `FIREBASE_PROJECT_ID=seu_project_id`
   - etc.

### Heroku
1. **Configure o Procfile**:
```
web: node server.js
```

2. **Configure variáveis de ambiente**:
```bash
heroku config:set PORT=3001
heroku config:set FRONTEND_URL=https://calculocerto.net.br
heroku config:set MERCADO_PAGO_ACCESS_TOKEN=seu_token
```

## 🆘 Se Nada Funcionar

### 1. Verifique se o problema é temporário
- Espere alguns minutos e tente novamente
- Serviços gratuitos podem ter limitações

### 2. Teste com outro backend
- Crie um backend de teste simples
- Use serviços como Glitch ou Replit para testar

### 3. Verifique se há bloqueios
- Desabilite VPN/proxy
- Verifique firewalls locais
- Teste em outra rede

### 4. Contate o suporte
- Se estiver usando Render/Heroku, verifique o status do serviço
- Verifique se há manutenção programada

---

## ✅ Checklist Final

- [ ] Backend está rodando e acessível
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] CORS configurado para permitir origem do frontend
- [ ] Porta correta (3001)
- [ ] Sem firewalls bloqueando
- [ ] Serviço de hosting está online
- [ ] Logs sem erros críticos

Se todos os itens estiverem marcados, o backend deve estar acessível!