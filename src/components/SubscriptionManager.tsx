import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateSubscription } from '../services/firestoreService';
import styles from './SubscriptionManager.module.css';

export function SubscriptionManager() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'agency' | null>(null);

  const currentPlan = userProfile?.subscription?.plan || 'free';
  const currentStatus = userProfile?.subscription?.status || 'inactive';

  // Recarregar perfil periodicamente para detectar mudanças de assinatura
  useEffect(() => {
    if (!currentUser) return;

    // Recarrega imediatamente ao montar o componente
    refreshUserProfile();

    // Depois recarrega a cada 5 segundos enquanto não houver assinatura ativa
    const interval = setInterval(() => {
      if (currentStatus !== 'active') {
        refreshUserProfile();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, currentStatus, refreshUserProfile]);

  const plans = [
    {
      id: 'free',
      name: 'Grátis',
      price: 0,
      features: [
        'Cálculo de valor/hora',
        'Até 10 orçamentos/mês',
        'Gestão básica de clientes',
        'Salvamento na nuvem',
        'Suporte por email'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1,
      features: [
        'Tudo do plano Grátis',
        'Orçamentos ilimitados',
        'Relatórios avançados',
        'Exportação em PDF',
        'Suporte prioritário',
        'Sem marca d\'água'
      ]
    },
    {
      id: 'agency',
      name: 'Agência',
      price: 1.50,
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
      // URL do backend (local ou produção)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Chamar backend para criar preferência de pagamento
      const response = await fetch(`${backendUrl}/api/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pagamento');
      }

      const data = await response.json();
      
      // Abrir checkout do Mercado Pago em modal/popup
      const mp = new (window as any).MercadoPago(import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY);
      
      const checkout = mp.checkout({
        preference: {
          id: data.preferenceId
        },
        autoOpen: true, // Abre automaticamente
      });

      // Callbacks do checkout
      checkout.on('close', () => {
        console.log('Modal fechado');
        setLoading(false);
        // Recarrega o perfil para verificar se o pagamento foi aprovado
        refreshUserProfile();
      });

      checkout.on('payment', (result: any) => {
        console.log('Pagamento realizado:', result);
        setLoading(false);
        // Aguarda um pouco para o webhook processar
        setTimeout(() => {
          refreshUserProfile();
          alert('Pagamento realizado! Aguarde alguns segundos para ver sua assinatura ativada.');
        }, 2000);
      });

      checkout.on('error', (error: any) => {
        console.error('Erro no checkout:', error);
        setLoading(false);
        alert('Erro ao processar pagamento. Tente novamente.');
      });

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setLoading(false);
      alert('Erro ao criar pagamento. Verifique sua conexão e tente novamente.');
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
