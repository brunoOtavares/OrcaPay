// Configuração do Mercado Pago
// Pegue suas chaves em: https://www.mercadopago.com.br/developers/panel/app

export const mercadoPagoConfig = {
  // PUBLIC KEY: Usada no frontend (SEGURO expor)
  publicKey: import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'TEST-49880c8d-83dc-404f-a8f5-2409dc468f85',
  
  // ACCESS TOKEN: Usada no backend (NUNCA exponha diretamente no frontend!)
  // Em produção, crie uma API backend que use o ACCESS_TOKEN
  // Esta variável só deve ser usada em funções serverless ou backend
  accessToken: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'TEST-104444737441901-110807-63032f5af6ac5412102855c5b91ebbaf-215062504',
};

// IDs dos planos (você criará no painel do Mercado Pago)
export const mercadoPagoPlans = {
  pro: {
    id: 'plan_pro_monthly', // Substitua pelo ID real do plano
    price: 1.00,
    title: 'CálculoCerto Pro',
    description: 'Plano mensal Pro com todos os recursos'
  },
  agency: {
    id: 'plan_agency_monthly', // Substitua pelo ID real do plano
    price: 1.00,
    title: 'CálculoCerto Agência',
    description: 'Plano mensal Agência para equipes'
  }
};
