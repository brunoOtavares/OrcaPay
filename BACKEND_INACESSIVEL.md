
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

