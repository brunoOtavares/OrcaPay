import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateSubscription, getUserProfile } from '../services/firestoreService';
import { loadAndInitMercadoPago } from '../utils/mercadoPagoLoader';
import { checkMercadoPagoConfig, checkBackendConnection } from '../utils/configChecker';
import styles from './SubscriptionManager.module.css';

export function SubscriptionManager() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'agency' | null>(null);

  const currentPlan = userProfile?.subscription?.plan || 'free';
  const currentStatus = userProfile?.subscription?.status || 'inactive';

  // Carregar perfil quando o componente monta ou quando o usuário muda
  useEffect(() => {
    if (!currentUser) return;

    // Carrega o perfil apenas uma vez ao montar ou quando currentUser muda
    refreshUserProfile();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]); // Apenas quando o ID do usuário mudar

  // Verificar configurações ao montar o componente
  useEffect(() => {
    const configStatus = checkMercadoPagoConfig();
    if (!configStatus.isValid) {
      console.error('❌ Configuração do Mercado Pago inválida:', configStatus.errors);
    }
    
    // Verificar conexão com o backend
    checkBackendConnection().then(isConnected => {
      if (!isConnected) {
        console.error('❌ Backend não está acessível');
      }
    });
  }, []);

  const plans = [
    {
      id: 'free',
      name: 'Grátis',
      price: 0,
      features: [
        'Cálculo de valor/hora',
        'Até 5 orçamentos/mês',
        'Gestão básica de clientes',
        'Salvamento na nuvem',
        'Suporte por email'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      features: [
        'Tudo do plano Grátis',
        'Orçamentos ilimitados',
        'Relatórios avançados',
        'Suporte prioritário',
        
      ]
    },
    {
      id: 'agency',
      name: 'Agência',
      price: 99.99,
      disabled: true,
      comingSoon: true,
      features: [
        'Tudo do plano Pro',
        'Múltiplos usuários',
        'Marca personalizada',
        'API de integração',
        'Suporte 24/7',
        'Treinamento incluído'
      ]
    }
  ];

  const handleSelectPlan = (planId: 'pro' | 'agency') => {
    setSelectedPlan(planId);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !currentUser) return;

    setLoading(true);
    try {
      // Verificar se a chave pública do Mercado Pago está configurada
      const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Chave pública do Mercado Pago não configurada. Verifique as variáveis de ambiente.');
      }

      // Carregar e inicializar o SDK do Mercado Pago
      console.log('Carregando SDK do Mercado Pago...');
      const mp = await loadAndInitMercadoPago(publicKey);
      console.log('SDK do Mercado Pago carregado com sucesso');

      // URL do backend (local ou produção)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      console.log('URL do backend:', backendUrl);
      
      // Chamar backend para criar preferência de pagamento
      console.log('Criando preferência de pagamento...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos (aumentado para Render)
      
      let response;
      try {
        console.log(`⏱️ Aguardando resposta do backend (timeout: 30s)...`);
        response = await fetch(`${backendUrl}/api/create-preference`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: selectedPlan,
            userId: currentUser.uid,
            userEmail: currentUser.email,
          }),
          signal: controller.signal
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Erro na requisição:', fetchError);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(`O backend está demorando muito para responder (mais de 30s). Serviços como Render podem precisar de tempo para "acordar". Tente novamente em alguns instantes.`);
        } else {
          throw new Error(`Não foi possível conectar ao backend em ${backendUrl}. Verifique se o servidor está online.`);
        }
      }

      clearTimeout(timeoutId);
      console.log('Resposta do backend:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta do backend:', errorData);
        
        if (response.status === 0) {
          throw new Error(`Não foi possível conectar ao backend. Verifique se o servidor está online em ${backendUrl}`);
        } else if (response.status >= 500) {
          throw new Error(`Erro interno do servidor (${response.status}). Tente novamente em alguns minutos.`);
        } else if (response.status === 404) {
          throw new Error(`Endpoint não encontrado (${response.status}). Verifique se o backend está atualizado.`);
        } else {
          throw new Error(errorData.error || `Erro ao criar pagamento (${response.status})`);
        }
      }

      const data = await response.json();
      console.log('Preferência criada:', data);
      
      if (!data.preferenceId) {
        throw new Error('ID da preferência não retornado pelo backend');
      }
      
      // Abrir checkout do Mercado Pago em modal/popup
      console.log('Abrindo checkout do Mercado Pago...');
      
      // Flag para evitar mostrar erro se o modal abrir com sucesso
      let checkoutOpened = false;
      let checkoutTimeout: number;

      // Timeout para evitar carregamento infinito
      checkoutTimeout = setTimeout(() => {
        if (!checkoutOpened) {
          console.error('Timeout ao abrir checkout do Mercado Pago');
          setLoading(false);
          alert('O sistema de pagamento está demorando para responder. Tente novamente.');
        }
      }, 15000); // 15 segundos

      // A API do Mercado Pago mudou - agora usamos o método direto
      try {
        const checkout = mp.checkout({
          preference: {
            id: data.preferenceId
          },
          autoOpen: true,
        });
        
        checkoutOpened = true;
        clearTimeout(checkoutTimeout);
        console.log('Checkout do Mercado Pago aberto com sucesso');

        // Variável para controlar o polling
        let pollingInterval: number | null = null;
        let paymentDetected = false;
        let maxAttempts = 60; // 60 tentativas = 3 minutos (60 * 3s)
        let attempts = 0;

        // Função para verificar se o pagamento foi aprovado
        const checkPaymentStatus = async () => {
          try {
            // Parar se já detectou pagamento
            if (paymentDetected) {
              if (pollingInterval) clearInterval(pollingInterval);
              return;
            }

            attempts++;
            console.log(`🔍 Verificando status do pagamento... (tentativa ${attempts}/${maxAttempts})`);
            
            // Parar após máximo de tentativas
            if (attempts >= maxAttempts) {
              console.log('⏱️ Tempo limite de verificação atingido');
              if (pollingInterval) clearInterval(pollingInterval);
              return;
            }

            // Buscar perfil atualizado diretamente
            if (!currentUser) {
              if (pollingInterval) clearInterval(pollingInterval);
              return;
            }
            
            const updatedProfile = await getUserProfile(currentUser.uid);
            console.log('📊 Status da assinatura:', updatedProfile?.subscription?.status);
            
            // Se a assinatura for ativada, fechar o modal e mostrar sucesso
            if (updatedProfile?.subscription?.status === 'active') {
              console.log('✅ Pagamento detectado! Assinatura ativada.');
              paymentDetected = true;
              if (pollingInterval) clearInterval(pollingInterval);
              setLoading(false);
              alert('✅ Pagamento confirmado! Sua assinatura foi ativada com sucesso.');
              // Forçar fechamento do modal e reload
              window.location.reload();
            }
          } catch (error) {
            console.error('Erro ao verificar status do pagamento:', error);
            // Em caso de erro, continuar tentando até maxAttempts
          }
        };

        // Callbacks do checkout
        checkout.on('ready', () => {
          console.log('Checkout pronto - iniciando verificação automática de pagamento');
          attempts = 0;
          paymentDetected = false;
          // Iniciar polling a cada 3 segundos para detectar pagamento
          pollingInterval = setInterval(checkPaymentStatus, 3000) as unknown as number;
        });

        checkout.on('close', () => {
          console.log('Modal fechado pelo usuário');
          if (pollingInterval) clearInterval(pollingInterval);
          pollingInterval = null;
          setLoading(false);
          refreshUserProfile();
        });

        checkout.on('payment', (result: any) => {
          console.log('Pagamento realizado:', result);
          paymentDetected = true;
          if (pollingInterval) clearInterval(pollingInterval);
          pollingInterval = null;
          setLoading(false);
          // Aguardar webhook processar e atualizar perfil
          setTimeout(() => {
            refreshUserProfile();
            alert('✅ Pagamento realizado com sucesso! Sua assinatura será ativada em alguns segundos.');
          }, 2000);
        });

        checkout.on('error', (error: any) => {
          console.error('Erro no checkout:', error);
          clearTimeout(checkoutTimeout);
          setLoading(false);
          alert('Erro ao processar pagamento. Tente novamente.');
        });
      } catch (error) {
        console.error('Erro ao abrir checkout:', error);
        clearTimeout(checkoutTimeout);
        if (!checkoutOpened) {
          setLoading(false);
          alert('Erro ao abrir checkout. Tente novamente.');
        }
      }

    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      setLoading(false);
      
      let errorMessage = 'Erro ao criar pagamento. Verifique sua conexão e tente novamente.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'O backend está demorando para responder. Tente novamente em alguns instantes.';
        } else {
          errorMessage = `Erro ao criar pagamento: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentUser) return;

    const confirm = window.confirm('Tem certeza que deseja cancelar sua assinatura?');
    if (!confirm) return;

    setLoading(true);
    try {
      await updateSubscription(currentUser.uid, {
        plan: 'free',
        status: 'active',
        startDate: new Date().toISOString()
      });

      await refreshUserProfile();
      alert('Assinatura cancelada. Você foi movido para o plano gratuito.');
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      alert('Erro ao cancelar assinatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.subscriptionManager}>
      <div className={styles.header}>
        <h2>Gerenciar Assinatura</h2>
        <p>Escolha o plano ideal para você</p>
      </div>

      {/* Current Plan Info */}
      {currentPlan !== 'free' && currentStatus === 'active' && (
        <div className={styles.currentPlanBanner}>
          <div className={styles.bannerContent}>
            <h3>Plano Atual: {plans.find(p => p.id === currentPlan)?.name}</h3>
            <p>Sua assinatura está ativa e renovará automaticamente</p>
          </div>
          <button 
            className={styles.cancelBtn} 
            onClick={handleCancelSubscription}
            disabled={loading}
          >
            Cancelar Assinatura
          </button>
        </div>
      )}

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan && currentStatus === 'active';
          const isPlanSelected = selectedPlan === plan.id;

          return (
            <div 
              key={plan.id}
              className={`
                ${styles.planCard} 
                ${isCurrentPlan ? styles.planCardCurrent : ''} 
                ${isPlanSelected ? styles.planCardSelected : ''}
                ${plan.id === 'pro' ? styles.planCardFeatured : ''}
              `}
            >
              {plan.id === 'pro' && <div className={styles.badge}>Mais Popular</div>}
              {plan.comingSoon && <div className={styles.badgeComingSoon}>Em Construção 🚧</div>}
              {isCurrentPlan && <div className={styles.badgeCurrent}>Plano Atual</div>}

              <h3>{plan.name}</h3>
              <div className={styles.price}>
                <span className={styles.priceValue}>R$ {plan.price}</span>
                <span className={styles.pricePeriod}>/mês</span>
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <button className={styles.planBtn} disabled>
                  {isCurrentPlan ? 'Plano Atual' : 'Plano Gratuito'}
                </button>
              ) : plan.disabled ? (
                <button className={styles.planBtnDisabled} disabled>
                  Em Construção 🚧
                </button>
              ) : (
                <>
                  {isCurrentPlan ? (
                    <button className={styles.planBtnCurrent} disabled>
                      Plano Atual
                    </button>
                  ) : (
                    <button 
                      className={`${styles.planBtn} ${isPlanSelected ? styles.planBtnSelected : ''}`}
                      onClick={() => handleSelectPlan(plan.id as 'pro' | 'agency')}
                      disabled={loading}
                    >
                      {isPlanSelected ? 'Selecionado' : 'Selecionar'}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <div className={styles.paymentModal}>
          <div className={styles.modalContent}>
            <h3>Confirmar Assinatura</h3>
            <p>
              Você selecionou o plano <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>
            </p>
            <div className={styles.paymentInfo}>
              <div className={styles.paymentRow}>
                <span>Plano:</span>
                <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>
              </div>
              <div className={styles.paymentRow}>
                <span>Valor:</span>
                <strong>R$ {plans.find(p => p.id === selectedPlan)?.price}/mês</strong>
              </div>
              <div className={styles.paymentRow}>
                <span>Renovação:</span>
                <span>Automática mensal</span>
              </div>
            </div>

            <div className={styles.paymentNote}>
              <p><strong>Nota:</strong> Esta é uma versão de demonstração. Em produção, você será redirecionado para o Mercado Pago para finalizar o pagamento.</p>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelPaymentBtn}
                onClick={() => setSelectedPlan(null)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmPaymentBtn}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
