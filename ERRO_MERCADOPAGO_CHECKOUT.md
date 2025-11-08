# 🔧 Como Resolver o Erro "X.checkout(...).then is not a function"

## 🚨 Sintoma
- Erro: `TypeError: X.checkout(...).then is not a function`
- O backend está funcionando e retorna a preferência corretamente
- O SDK do Mercado Pago carrega com sucesso
- O checkout não abre ou gera erro ao tentar abrir

## 🔍 Causa do Problema

A API do Mercado Pago mudou recentemente. O método `mp.checkout()` não retorna mais uma Promise, mas sim um objeto diretamente. O código antigo estava tentando usar `.then()` em um objeto que não é uma Promise.

## 🛠️ Solução

### Código Antigo (Incorreto)
```javascript
mp.checkout({
  preference: {
    id: preferenceId
  },
  autoOpen: true,
}).then((checkout) => {
  // Callbacks...
}).catch((error) => {
  // Tratamento de erro...
});
```

### Código Novo (Correto)
```javascript
try {
  const checkout = mp.checkout({
    preference: {
      id: preferenceId
    },
    autoOpen: true,
  });
  
  // Callbacks do checkout
  checkout.on('ready', () => {
    console.log('Checkout pronto');
  });

  checkout.on('close', () => {
    console.log('Modal fechado');
    setLoading(false);
    refreshUserProfile();
  });

  checkout.on('payment', (result) => {
    console.log('Pagamento realizado:', result);
    setLoading(false);
    window.location.href = '/payment/success';
  });

  checkout.on('error', (error) => {
    console.error('Erro no checkout:', error);
    setLoading(false);
    alert('Erro ao processar pagamento. Tente novamente.');
  });
} catch (error) {
  console.error('Erro ao abrir checkout:', error);
  setLoading(false);
  alert('Erro ao abrir checkout. Tente novamente.');
}
```

## 📋 Verificação

### 1. Verifique se o código foi atualizado
O arquivo `src/components/SubscriptionManager.tsx` já foi corrigido com a nova API.

### 2. Limpe o cache do navegador
- Pressione `Ctrl+F5` (ou `Cmd+Shift+R` no Mac)
- Limpe o cache do navegador completamente
- Recarregue a página

### 3. Verifique a versão do SDK
No console do navegador, verifique:
```javascript
console.log(window.MercadoPago?.VERSION);
```

A versão deve ser `2.x` ou superior.

## 🧪 Teste

1. Faça login na aplicação
2. Acesse Configurações > Diagnóstico do Sistema de Pagamento
3. Verifique se tudo está ✅
4. Tente fazer um pagamento novamente
5. Observe o console para mensagens de sucesso

## 📚 Documentação Oficial

- [Mercado Pago Checkout Documentation](https://www.mercadopago.com.br/developers/pt/docs/checkout/integration)
- [Mercado Pago SDK v2](https://www.mercadopago.com.br/developers/pt/docs/checkout/api/v2/checkout)

## 🆘 Se o Problema Persistir

### 1. Verifique se há múltiplas versões do SDK
```javascript
// Verifique no console
console.log(window.MercadoPago);
console.log(window.MercadoPago?.checkout);
```

### 2. Verifique conflitos com outros scripts
- Desative extensões do navegador
- Tente em modo anônimo
- Verifique se há outros scripts de pagamento na página

### 3. Use o CDN diretamente (temporário)
```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### 4. Verifique a chave pública
Certifique-se de que está usando a chave pública correta:
```javascript
console.log('Chave pública:', import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);
```

---

## ✅ Checklist Final

- [ ] Código atualizado para nova API do Mercado Pago
- [ ] Cache do navegador limpo
- [ ] Versão do SDK é 2.x ou superior
- [ ] Chave pública configurada corretamente
- [ ] Sem conflitos com outros scripts
- [ ] Backend retornando preferência corretamente

Se todos os itens estiverem marcados, o pagamento deve funcionar corretamente!