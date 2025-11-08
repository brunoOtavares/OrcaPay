/**
 * Utilitário para verificar configurações necessárias para o funcionamento da aplicação
 */

export interface ConfigStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Verifica se as configurações do Mercado Pago estão corretas
 */
export const checkMercadoPagoConfig = (): ConfigStatus => {
  const status: ConfigStatus = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Verificar chave pública
  const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
  if (!publicKey) {
    status.isValid = false;
    status.errors.push('VITE_MERCADO_PAGO_PUBLIC_KEY não está configurada');
  } else if (publicKey === 'your_public_key_here' || publicKey === 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx') {
    status.isValid = false;
    status.errors.push('VITE_MERCADO_PAGO_PUBLIC_KEY precisa ser substituída por uma chave real');
  }

  // Verificar URL do backend
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    status.warnings.push('VITE_BACKEND_URL não está configurada (usando localhost:3001)');
  }

  return status;
};

/**
 * Verifica se as configurações do Firebase estão corretas
 */
export const checkFirebaseConfig = (): ConfigStatus => {
  const status: ConfigStatus = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value) {
      status.isValid = false;
      status.errors.push(`${varName} não está configurada`);
    } else if (value.includes('your_') || value.includes('example')) {
      status.isValid = false;
      status.errors.push(`${varName} precisa ser substituída por um valor real`);
    }
  }

  return status;
};

/**
 * Verifica todas as configurações necessárias
 */
export const checkAllConfigs = (): ConfigStatus => {
  const mpStatus = checkMercadoPagoConfig();
  const fbStatus = checkFirebaseConfig();

  return {
    isValid: mpStatus.isValid && fbStatus.isValid,
    errors: [...mpStatus.errors, ...fbStatus.errors],
    warnings: [...mpStatus.warnings, ...fbStatus.warnings]
  };
};

/**
 * Exibe o status da configuração no console
 */
export const logConfigStatus = (): void => {
  const status = checkAllConfigs();
  
  console.group('🔍 Verificação de Configuração');
  
  if (status.isValid) {
    console.log('✅ Todas as configurações estão corretas');
  } else {
    console.error('❌ Problemas encontrados na configuração:');
    status.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (status.warnings.length > 0) {
    console.warn('⚠️ Avisos:');
    status.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.groupEnd();
};

/**
 * Verifica se o backend está acessível
 */
export const checkBackendConnection = async (): Promise<{ connected: boolean; error?: string; details?: any }> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    console.log(`🔍 Verificando conexão com backend: ${backendUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos (aumentado para Render)
    
    const startTime = Date.now();
    const response = await fetch(`${backendUrl}/`, {
      signal: controller.signal,
      method: 'GET'
    });
    const responseTime = Date.now() - startTime;
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend está acessível:', data);
      return {
        connected: true,
        details: {
          responseTime,
          status: response.status,
          serverInfo: data
        }
      };
    } else {
      console.error(`❌ Backend retornou status ${response.status}`);
      return {
        connected: false,
        error: `Backend retornou status ${response.status}`,
        details: {
          responseTime,
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    console.error('❌ Erro ao conectar ao backend:', error);
    
    let errorMessage = 'Erro desconhecido ao conectar ao backend';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout ao conectar ao backend (15s). Serviços como Render podem precisar de tempo para "acordar".';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Erro de rede ao conectar ao backend';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      connected: false,
      error: errorMessage,
      details: {
        backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
        errorType: error instanceof Error ? error.name : 'unknown'
      }
    };
  }
};