#!/bin/bash

echo "🚀 Preparando CálculoCerto para Produção..."
echo ""

# 1. Build do Frontend
echo "📦 Fazendo build do frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build com sucesso!"
else
    echo "❌ Erro no build do frontend!"
    exit 1
fi

echo ""
echo "✅ Preparação concluída!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Fazer commit e push para GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: Deploy para produção'"
echo "   git push origin main"
echo ""
echo "2. Deploy do Backend no Render:"
echo "   - Acesse: https://render.com"
echo "   - New Web Service"
echo "   - Conecte o repositório"
echo "   - Root Directory: backend"
echo "   - Adicione as variáveis de ambiente"
echo ""
echo "3. Deploy do Frontend no Vercel:"
echo "   - Acesse: https://vercel.com"
echo "   - Import Project"
echo "   - Selecione o repositório"
echo "   - Adicione as variáveis de ambiente"
echo ""
echo "📖 Guia completo: DEPLOY_PRODUCAO.md"
echo ""
