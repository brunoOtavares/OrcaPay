# 🔧 Como Resolver o Problema de Carregamento Infinito no Pagamento

## 📋 Sintomas
- O botão "Confirmar Pagamento" fica carregando indefinidamente
- O modal do Mercado Pago não abre
- Não há resposta do backend
- Erros de timeout ou conexão

## 🔍 Diagnóstico Rápido

### 1. Use a Ferramenta de Diagnóstico
Acesse **Configurações** > **Diagnóstico do Sistema de Pagamento** para verificar automaticamente:

- ✅ Configurações do Mercado Pago
- ✅ Conexão com o backend
- ✅ Carregamento do SDK

### 2. Verificação Manual

#### Backend está rodando?
```bash
# Verifique se o backend está rodando na porta 3001
curl http://localhost:3001
```

#### Variáveis de ambiente configuradas?
Verifique se você tem um arquivo `.env` com:
```env
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui
VITE_BACKEND_URL=http://localhost:3001
```

## 🛠️ Soluções Comuns

### Problema 1: Backend não está rodando
**Sintoma:** Timeout ao criar preferência de pagamento

**Solução:**
```bash
# Inicie o backend
cd backend
npm install
npm start
```

### Problema 2: Chave do Mercado Pago incorreta
**Sintoma:** Erro "Chave pública não configurada"

**Solução:**
1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel)
2. Copie a chave pública (TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
3. Adicione ao seu `.env`:
   ```env
   VITE_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### Problema 3: SDK do Mercado Pago não carrega
**Sintoma:** Erro "SDK não está carregado"

**Solução:**
1. Verifique sua conexão com a internet
2. Desative bloqueadores de scripts/anúncios
3. Limpe o cache do navegador
4. Recarregue a página (Ctrl+F5)

### Problema 4: CORS ou Firewall
**Sintoma:** Erro de conexão com o backend

**Solução:**
1. Verifique se não há firewall bloqueando a porta 3001
2. Confirme se o backend permite CORS da sua origem
3. Em produção, configure `FRONTEND_URL` no backend

## 🧪 Teste Passo a Passo

### 1. Teste do Backend
```bash
# Teste direto da API
curl -X POST http://localhost:3001/api/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro",
    "userId": "test_user",
    "userEmail": "test@example.com"
  }'
```

### 2. Teste do Frontend
1. Abra o console do navegador (F12)
2. Tente fazer um pagamento
3. Observe os logs para identificar onde está o problema

### 3. Teste do SDK
No console do navegador:
```javascript
// Verifique se o SDK está carregado
console.log(window.MercadoPago);

// Tente inicializar manualmente
const mp = new MercadoPago('sua_chave_publica');
console.log(mp);
```

## 📝 Logs Importantes

### Console do Navegador
Procure por:
- `✅ SDK do Mercado Pago carregado com sucesso`
- `✅ Preferência criada:`
- `✅ Checkout do Mercado Pago aberto com sucesso`

### Console do Backend
Procure por:
- `✅ Preferência criada:`
- `📥 Webhook recebido:`
- `✅ Pagamento aprovado!`

## 🚀 Deploy em Produção

### Backend
1. Configure as variáveis de ambiente no seu serviço de hosting:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
   FRONTEND_URL=https://seu-dominio.com
   ```

### Frontend
1. Configure a chave pública de produção:
   ```env
   VITE_MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_producao
   VITE_BACKEND_URL=https://seu-backend.com
   ```

## 🆘 Se Nada Funcionar

### 1. Modo Debug
Adicione logs extras no [`SubscriptionManager.tsx`](src/components/SubscriptionManager.tsx):
```javascript
console.log('Passo 1: Verificando configurações...');
console.log('Passo 2: Carregando SDK...');
console.log('Passo 3: Criando preferência...');
```

### 2. Teste com Dados Mockados
Temporariamente comente a chamada real e use dados mockados para isolar o problema.

### 3. Verifique a Rede
Use a aba Network do DevTools para:
- Verificar se a requisição está sendo feita
- Verificar o status da resposta
- Identificar erros de CORS

## 📞 Suporte

Se o problema persistir:
1. Tire print dos logs do console
2. Anote o passo exato onde ocorre o erro
3. Verifique as variáveis de ambiente
4. Teste em outro navegador/dispositivo

---

## ✅ Checklist Final

- [ ] Backend rodando na porta correta
- [ ] Chave pública do Mercado Pago configurada
- [ ] SDK do Mercado Pago carregando
- [ ] Sem erros de CORS
- [ ] Sem bloqueadores de script
- [ ] Internet funcionando
- [ ] Cache limpo
- [ ] Logs sem erros críticos

Se todos os itens estiverem marcados, o pagamento deve funcionar corretamente!