# ⚠️ CONFIGURAÇÃO OBRIGATÓRIA DO FIRESTORE

## Passo 1: Ativar Authentication

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **orca-pay**
3. No menu lateral, clique em **Authentication**
4. Clique em "Começar" (se ainda não ativou)
5. Na aba **Sign-in method**, clique em **E-mail/Senha**
6. Ative o toggle e clique em **Salvar**

## Passo 2: Criar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha o modo **Produção** 
4. Selecione a localização: **southamerica-east1 (São Paulo)**
5. Clique em **Ativar**

## Passo 3: Configurar Regras de Segurança (IMPORTANTE!)

Após criar o banco, clique na aba **Regras** e substitua tudo por:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite que cada usuário leia e escreva apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

**Clique em "Publicar"**

## Passo 4: Testar

1. Acesse: http://localhost:5174/
2. Clique em "Registre-se"
3. Crie uma conta com seu e-mail e senha
4. Pronto! Seus dados serão salvos automaticamente no Firebase 🎉

## ✅ Estrutura dos Dados

Cada usuário terá um documento em `/users/{uid}` com:

```json
{
  "email": "seu@email.com",
  "createdAt": "2025-11-07T...",
  "hourlyRate": 50,
  "settings": {
    "complexityMultipliers": {
      "baixa": 1.5,
      "media": 2.0,
      "alta": 2.5
    },
    "commercialUseMultipliers": {
      "local": 1.0,
      "regional": 1.3,
      "nacional": 1.8
    },
    "urgencyMultiplier": 1.5,
    "priceRangePercentage": 20
  },
  "quotes": []
}
```

## 🔒 Segurança

✅ Cada usuário só pode acessar seus próprios dados
✅ Senhas criptografadas pelo Firebase Auth
✅ Regras de segurança impedem acesso não autorizado
✅ Dados sincronizados automaticamente

## 🚨 Troubleshooting

**Erro: Missing or insufficient permissions**
- Verifique se as regras de segurança foram configuradas corretamente

**Erro: auth/invalid-email**
- Use um e-mail válido

**Erro: auth/weak-password**
- A senha deve ter pelo menos 6 caracteres

**Não aparece tela de login**
- Verifique o console do navegador (F12) para ver erros
- Certifique-se que o Firebase foi configurado corretamente
