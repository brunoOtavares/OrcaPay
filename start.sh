#!/bin/bash

# Script para iniciar Frontend e Backend juntos

echo "🚀 Iniciando CálculoCerto..."
echo ""

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado!"
    echo "📝 Criando .env.local..."
    cp .env.example .env.local
fi

# Verificar se backend/node_modules existe
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

# Iniciar backend em background
echo "🔧 Iniciando backend na porta 3001..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 2

# Iniciar frontend
echo "🎨 Iniciando frontend na porta 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Aplicação rodando!"
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://localhost:3001"
echo ""
echo "Pressione Ctrl+C para parar ambos os servidores"
echo ""

# Função para parar ambos os processos ao pressionar Ctrl+C
trap "echo ''; echo '🛑 Parando servidores...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Manter o script rodando
wait
