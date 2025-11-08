import { mercadoPagoConfig, mercadoPagoPlans } from '../config/mercadopago';

// Tipos para Mercado Pago
interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface CreatePreferenceData {
  plan: 'pro' | 'agency';
  userId: string;
  userEmail: string;
}

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * NOTA: Esta função precisa ser executada no backend por segurança
 * Esta é apenas uma demonstração - em produção, faça isso no servidor
 */
export const createPaymentPreference = async (
  data: CreatePreferenceData
): Promise<MercadoPagoPreference | null> => {
  const plan = mercadoPagoPlans[data.plan];
  
  if (!plan) {
    console.error('Plano inválido');
    return null;
  }

  try {
    // IMPORTANTE: Em produção, essa chamada deve ser feita no BACKEND
    // Nunca exponha sua Access Token no frontend!
    
    // Por enquanto, retorna dados mockados para demonstração
    console.log('📝 Criando preferência de pagamento para:', {
      plan: plan.title,
      price: plan.price,
      userId: data.userId,
      email: data.userEmail
    });

    // Simulação - em produção, chame seu backend que fará a requisição ao MP
    const mockPreference: MercadoPagoPreference = {
      id: `mock_preference_${Date.now()}`,
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock',
      sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock'
    };

    return mockPreference;

    /* 
    // CÓDIGO PARA PRODUÇÃO (executar no backend):
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_ACCESS_TOKEN` // Apenas no backend!
      },
      body: JSON.stringify({
        items: [
          {
            title: plan.title,
            description: plan.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: plan.price
          }
        ],
        payer: {
          email: data.userEmail
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        },
        auto_return: 'approved',
        external_reference: data.userId,
        notification_url: 'https://seu-backend.com/webhooks/mercadopago' // URL do webhook
      })
    });

    const preference = await response.json();
    return preference;
    */
  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return null;
  }
};

/**
 * Inicializa o SDK do Mercado Pago no frontend
 */
export const initMercadoPago = () => {
  // Carregar SDK do Mercado Pago
  if (typeof window !== 'undefined' && !window.MercadoPago) {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const mp = new window.MercadoPago(mercadoPagoConfig.publicKey);
      console.log('✅ Mercado Pago SDK carregado');
    };
    document.body.appendChild(script);
  }
};

/**
 * Abre o checkout do Mercado Pago
 */
export const openMercadoPagoCheckout = async (preferenceId: string) => {
  try {
    // @ts-ignore
    const mp = new window.MercadoPago(mercadoPagoConfig.publicKey);
    
    mp.checkout({
      preference: {
        id: preferenceId
      },
      autoOpen: true
    });
  } catch (error) {
    console.error('Erro ao abrir checkout:', error);
    throw error;
  }
};

// Tipos para o SDK do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any;
  }
}
