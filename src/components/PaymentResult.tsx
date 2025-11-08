import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './PaymentResult.module.css';

export function PaymentResult() {
  const { refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  // Pegar parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const paymentId = urlParams.get('payment_id');

  useEffect(() => {
    const checkPayment = async () => {
      if (paymentId) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/api/payment/${paymentId}`);
          const data = await response.json();
          setPaymentInfo(data);
          
          // Atualizar perfil do usuário para pegar a nova assinatura
          await refreshUserProfile();
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error);
        }
      }
      setLoading(false);
    };

    checkPayment();
  }, [paymentId, refreshUserProfile]);

  const getStatusInfo = () => {
    if (status === 'approved' || paymentInfo?.status === 'approved') {
      return {
        icon: '✅',
        title: 'Pagamento Aprovado!',
        message: 'Sua assinatura foi ativada com sucesso.',
        color: 'success'
      };
    }
    if (status === 'pending' || paymentInfo?.status === 'pending') {
      return {
        icon: '⏳',
        title: 'Pagamento Pendente',
        message: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
        color: 'warning'
      };
    }
    return {
      icon: '❌',
      title: 'Pagamento Não Processado',
      message: 'Houve um problema com seu pagamento. Tente novamente.',
      color: 'error'
    };
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[statusInfo.color]}`}>
        <div className={styles.icon}>{statusInfo.icon}</div>
        <h1 className={styles.title}>{statusInfo.title}</h1>
        <p className={styles.message}>{statusInfo.message}</p>

        {paymentInfo && (
          <div className={styles.details}>
            <p><strong>ID do Pagamento:</strong> {paymentInfo.id}</p>
            <p><strong>Valor:</strong> R$ {paymentInfo.transactionAmount?.toFixed(2)}</p>
            {paymentInfo.dateApproved && (
              <p><strong>Data:</strong> {new Date(paymentInfo.dateApproved).toLocaleString('pt-BR')}</p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button 
            className={styles.btnPrimary}
            onClick={() => window.location.href = '/'}
          >
            Ir para Meu Perfil
          </button>
          <button 
            className={styles.btnSecondary}
            onClick={() => window.location.href = '/'}
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
