# ⚠️ IMPORTANTE - Antes do Deploy

## 🔒 Segurança

### Credenciais Firebase
As credenciais do Firebase estão **hardcoded** no arquivo `src/config/firebase.ts` como fallback. Isso funciona perfeitamente para este projeto porque:

1. ✅ As credenciais do Firebase **não são secretas** - elas são públicas no frontend
2. ✅ A segurança está nas **Firestore Rules** que impedem acesso não autorizado
3. ✅ Cada usuário só pode acessar seus próprios dados

**Suas Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Isso significa: **Usuário autenticado só acessa seus próprios dados!** ✅

## 📝 Antes de Fazer Deploy

### 1. Adicionar Domínio no Firebase

**MUITO IMPORTANTE!** Após o deploy na Vercel, você receberá uma URL como:
- `https://seu-projeto.vercel.app`

Você DEVE adicionar este domínio no Firebase:

1. Acesse: https://console.firebase.google.com
2. Selecione projeto: **orca-pay**
3. Vá em: **Authentication** → **Settings** → **Authorized domains**
4. Clique em: **Add domain**
5. Cole sua URL da Vercel: `seu-projeto.vercel.app`
6. Salve

**Se não fizer isso, o login não funcionará em produção!** ❌

### 2. Testar Build Local

Antes de fazer deploy, teste se o build funciona:

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173` e teste tudo!

### 3. Verificar Firestore Rules

Certifique-se que as regras estão publicadas:

1. Firebase Console → **Firestore Database**
2. Aba **Rules**
3. Copie as regras do arquivo `CONFIGURAR_FIRESTORE.md`
4. Clique em **Publicar**

## 🚀 Deploy na Vercel

### Opção 1: Via GitHub (Recomendado)

1. Faça commit de tudo:
```bash
git add .
git commit -m "feat: sistema completo com Firebase auth"
git push
```

2. Vá para [vercel.com](https://vercel.com)
3. Clique em **New Project**
4. Importe seu repositório
5. **Deploy!**

### Opção 2: Via CLI

```bash
npm i -g vercel
vercel
```

Siga as instruções no terminal.

## ✅ Checklist Final

- [ ] Firestore Rules publicadas
- [ ] Build local testado (`npm run build`)
- [ ] Código commitado no GitHub
- [ ] Deploy feito na Vercel
- [ ] **Domínio da Vercel adicionado no Firebase** ⚠️
- [ ] Testado login em produção
- [ ] Testado criação de orçamento
- [ ] Testado conclusão de projeto

## 🎯 URLs Importantes

- **Firebase Console:** https://console.firebase.google.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Seu Projeto:** (será gerado após deploy)

## 💡 Dicas

1. **URLs Customizadas:** Na Vercel você pode configurar domínio próprio
2. **Monitoramento:** Vercel mostra analytics e logs
3. **Deploy Automático:** Cada push no GitHub = deploy automático
4. **Preview Branches:** PRs criam deploys de preview automaticamente

## 🆘 Suporte

Se algo der errado:
1. Verifique os logs na Vercel
2. Confira o console do navegador (F12)
3. Verifique se o domínio foi adicionado no Firebase
4. Teste em modo anônimo para descartar cache

---

**Tudo pronto para deploy!** 🚀✨
