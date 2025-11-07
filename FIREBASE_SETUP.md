# OrçaPay - Sistema de Autenticação Firebase

## 🔥 Configuração do Firebase

Para usar o sistema de login/senha, você precisa configurar o Firebase:

### 1. Criar Projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Clique em **Adicionar projeto**
3. Dê um nome ao projeto (ex: "calculocerto")
4. Desabilite o Google Analytics (opcional)

### 2. Ativar Autenticação

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Na aba "Sign-in method", ative **E-mail/Senha**

### 3. Criar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha o modo **Produção** (vamos configurar as regras depois)
4. Selecione uma localização próxima (ex: southamerica-east1)

### 4. Configurar Regras de Segurança

No Firestore, clique na aba **Regras** e cole:

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

Clique em "Publicar"

### 5. Obter Credenciais

1. Clique no ícone de **engrenagem** ao lado de "Visão geral do projeto"
2. Clique em "Configurações do projeto"
3. Role até "Seus apps" e clique no ícone **</>** (Web)
4. Dê um nome ao app e clique em "Registrar app"
5. Copie as credenciais do `firebaseConfig`

### 6. Adicionar Credenciais ao Projeto

Abra o arquivo `src/config/firebase.ts` e substitua:

```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 7. Testar

Rode o projeto:

```bash
npm run dev
```

Agora você deve ver a tela de login! 🎉

## 📊 Estrutura de Dados

Cada usuário tem um documento no Firestore com a seguinte estrutura:

```typescript
{
  email: string,
  createdAt: string,
  hourlyRate: number,
  settings: {
    complexityMultipliers: { baixa, media, alta },
    commercialUseMultipliers: { local, regional, nacional },
    urgencyMultiplier: number,
    priceRangePercentage: number
  },
  quotes: SavedQuote[]
}
```

## 🔐 Segurança

- Cada usuário só pode acessar seus próprios dados
- Senhas são criptografadas pelo Firebase Authentication
- Regras de segurança impedem acesso não autorizado

## 📝 Funcionalidades

✅ Login com e-mail e senha
✅ Registro de novos usuários
✅ Logout
✅ Perfil automático criado no primeiro login
✅ Dados sincronizados com Firebase Firestore
✅ Orçamentos salvos por usuário
✅ Configurações personalizadas por usuário

## 🚀 Próximos Passos

- [ ] Recuperação de senha
- [ ] Login com Google
- [ ] Validação de e-mail
- [ ] Foto de perfil
