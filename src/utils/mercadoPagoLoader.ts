/**
 * Utilitário para carregar e gerenciar o SDK do Mercado Pago
 */

export interface MercadoPagoWindow extends Window {
  MercadoPago: any;
}

declare const window: MercadoPagoWindow;

let sdkLoaded = false;
let sdkLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Carrega o SDK do Mercado Pago dinamicamente
 * @returns Promise que resolve quando o SDK estiver carregado
 */
export const loadMercadoPagoSDK = (): Promise<void> => {
  // Se já foi carregado, retorna imediatamente
  if (sdkLoaded) {
    return Promise.resolve();
  }

  // Se já está carregando, retorna a promise existente
  if (sdkLoading && loadPromise) {
    return loadPromise;
  }

  // Inicia o carregamento
  sdkLoading = true;
  loadPromise = new Promise((resolve, reject) => {
    // Verifica se o SDK já está disponível
    if (window.MercadoPago) {
      sdkLoaded = true;
      sdkLoading = false;
      resolve();
      return;
    }

    // Cria o script para carregar o SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      console.log('✅ SDK do Mercado Pago carregado com sucesso');
      sdkLoaded = true;
      sdkLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      console.error('❌ Erro ao carregar SDK do Mercado Pago:', error);
      sdkLoading = false;
      loadPromise = null;
      reject(new Error('Falha ao carregar SDK do Mercado Pago'));
    };

    // Adiciona timeout para evitar carregamento infinito
    const timeout = setTimeout(() => {
      console.error('❌ Timeout ao carregar SDK do Mercado Pago');
      sdkLoading = false;
      loadPromise = null;
      reject(new Error('Timeout ao carregar SDK do Mercado Pago'));
    }, 10000); // 10 segundos

    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ SDK do Mercado Pago carregado com sucesso');
      sdkLoaded = true;
      sdkLoading = false;
      resolve();
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Verifica se o SDK do Mercado Pago está disponível
 * @returns true se o SDK estiver carregado
 */
export const isMercadoPagoLoaded = (): boolean => {
  return sdkLoaded && typeof window.MercadoPago !== 'undefined';
};

/**
 * Inicializa o SDK do Mercado Pago com a chave pública
 * @param publicKey Chave pública do Mercado Pago
 * @returns Instância do Mercado Pago
 */
export const initMercadoPago = (publicKey: string) => {
  if (!isMercadoPagoLoaded()) {
    throw new Error('SDK do Mercado Pago não está carregado');
  }

  if (!publicKey) {
    throw new Error('Chave pública do Mercado Pago não fornecida');
  }

  return new window.MercadoPago(publicKey);
};

/**
 * Carrega o SDK do Mercado Pago e o inicializa com a chave pública
 * @param publicKey Chave pública do Mercado Pago
 * @returns Promise que resolve com a instância do Mercado Pago
 */
export const loadAndInitMercadoPago = async (publicKey: string) => {
  await loadMercadoPagoSDK();
  return initMercadoPago(publicKey);
};