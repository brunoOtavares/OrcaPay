# 🚀 Deploy na Vercel - OrçaPay

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Firebase já configurado (Authentication + Firestore)
3. Repositório no GitHub

## 📋 Passo a Passo

### 1. Importar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Selecione seu repositório do GitHub
4. Clique em **"Import"**

### 2. Configurar Variáveis de Ambiente (OPCIONAL)

Se quiser usar variáveis de ambiente em vez das credenciais hardcoded:

Na página de configuração do projeto na Vercel, adicione as seguintes variáveis:

```
VITE_FIREBASE_API_KEY=AIzaSyBzp9MZ-KRdt234164sRmnaYTeWEO7Eefk
VITE_FIREBASE_AUTH_DOMAIN=orca-pay.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=orca-pay
VITE_FIREBASE_STORAGE_BUCKET=orca-pay.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=947822787225
VITE_FIREBASE_APP_ID=1:947822787225:web:14809d75855cfe9ee49608
VITE_FIREBASE_MEASUREMENT_ID=G-TF5LGRMXLN
```

⚠️ **NOTA:** As credenciais já estão no código como fallback, então este passo é opcional!

### 3. Configurar Build Settings

A Vercel deve detectar automaticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Se não detectar, configure manualmente.

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-3 minutos)
3. Pronto! Seu app estará no ar 🎉

## 🔧 Configurações Importantes

### Domínio Autorizado no Firebase

Após o deploy, você receberá uma URL tipo: `https://seu-app.vercel.app`

**IMPORTANTE:** Adicione este domínio no Firebase:

1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto **orca-pay**
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **"Add domain"**
5. Adicione: `seu-app.vercel.app`

### CORS e Firestore

As regras do Firestore já estão configuradas corretamente:

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

## 🔄 Atualizações Automáticas

Toda vez que você fizer `git push` para o branch `main`, a Vercel fará deploy automático! 🚀

## 🐛 Troubleshooting

### Erro de Build

Se o build falhar:
1. Verifique se `package.json` está correto
2. Teste localmente: `npm run build`
3. Veja os logs na Vercel

### Erro de Autenticação

Se aparecer erro de domínio não autorizado:
1. Adicione o domínio da Vercel no Firebase (passo acima)
2. Aguarde 5 minutos para propagar

### Erro 404 nas rotas

O arquivo `vercel.json` já está configurado para SPA (Single Page Application):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```


## ✅ Verificação Final

Teste tudo no ambiente de produção:
- ✅ Login funciona
- ✅ Cadastro funciona
- ✅ Calculadora salva dados
- ✅ Orçamentos são salvos
- ✅ Perfil mostra projetos

Seu CálculoCerto está online e funcional!

URL de exemplo: `https://calculocerto.vercel.app`
