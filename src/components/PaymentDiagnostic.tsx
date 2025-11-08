import { useState, useEffect } from 'react';
import { checkAllConfigs, checkBackendConnection } from '../utils/configChecker';
import { isMercadoPagoLoaded } from '../utils/mercadoPagoLoader';
import styles from './PaymentDiagnostic.module.css';

export function PaymentDiagnostic() {
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [backendStatus, setBackendStatus] = useState<boolean | null>(null);
  const [sdkStatus, setSdkStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runDiagnostics = async () => {
    setIsChecking(true);
    
    // Verificar configurações
    const config = checkAllConfigs();
    setConfigStatus(config);
    
    // Verificar backend
    const backend = await checkBackendConnection();
    setBackendStatus(backend);
    
    // Verificar SDK
    const sdk = isMercadoPagoLoaded();
    setSdkStatus(sdk);
    
    setIsChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return styles.pending;
    return status ? styles.success : styles.error;
  };

  return (
    <div className={styles.diagnosticContainer}>
      <div className={styles.header}>
        <h2>🔍 Diagnóstico do Sistema de Pagamento</h2>
        <p>Verifique se tudo está configurado corretamente para processar pagamentos</p>
      </div>

      <div className={styles.statusGrid}>
        {/* Configurações */}
        <div className={`${styles.statusCard} ${getStatusColor(configStatus?.isValid)}`}>
          <div className={styles.statusHeader}>
            <span className={styles.statusIcon}>{getStatusIcon(configStatus?.isValid)}</span>
            <h3>Configurações</h3>
          </div>
          <div className={styles.statusDetails}>
            {configStatus?.errors?.map((error: string, index: number) => (
              <div key={index} className={styles.errorItem}>
                <span className={styles.errorIcon}>❌</span>
                <span>{error}</span>
              </div>
            ))}
            {configStatus?.warnings?.map((warning: string, index: number) => (
              <div key={index} className={styles.warningItem}>
                <span className={styles.warningIcon}>⚠️</span>
                <span>{warning}</span>
              </div>
            ))}
            {configStatus?.isValid && (
              <div className={styles.successItem}>
                <span className={styles.successIcon}>✅</span>
                <span>Todas as configurações estão corretas</span>
              </div>
            )}
          </div>
        </div>

        {/* Backend */}
        <div className={`${styles.statusCard} ${getStatusColor(backendStatus)}`}>
          <div className={styles.statusHeader}>
            <span className={styles.statusIcon}>{getStatusIcon(backendStatus)}</span>
            <h3>Backend</h3>
          </div>
          <div className={styles.statusDetails}>
            {backendStatus === true && (
              <div className={styles.successItem}>
                <span className={styles.successIcon}>✅</span>
                <span>Backend está acessível</span>
              </div>
            )}
            {backendStatus === false && (
              <div className={styles.errorItem}>
                <span className={styles.errorIcon}>❌</span>
                <span>Backend não está acessível</span>
              </div>
            )}
            {backendStatus === null && (
              <div className={styles.pendingItem}>
                <span className={styles.pendingIcon}>⏳</span>
                <span>Verificando backend...</span>
              </div>
            )}
          </div>
        </div>

        {/* SDK do Mercado Pago */}
        <div className={`${styles.statusCard} ${getStatusColor(sdkStatus)}`}>
          <div className={styles.statusHeader}>
            <span className={styles.statusIcon}>{getStatusIcon(sdkStatus)}</span>
            <h3>SDK Mercado Pago</h3>
          </div>
          <div className={styles.statusDetails}>
            {sdkStatus === true && (
              <div className={styles.successItem}>
                <span className={styles.successIcon}>✅</span>
                <span>SDK está carregado</span>
              </div>
            )}
            {sdkStatus === false && (
              <div className={styles.errorItem}>
                <span className={styles.errorIcon}>❌</span>
                <span>SDK não está carregado</span>
              </div>
            )}
            {sdkStatus === null && (
              <div className={styles.pendingItem}>
                <span className={styles.pendingIcon}>⏳</span>
                <span>Verificando SDK...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.checkButton}
          onClick={runDiagnostics}
          disabled={isChecking}
        >
          {isChecking ? 'Verificando...' : 'Verificar Novamente'}
        </button>
      </div>

      <div className={styles.helpSection}>
        <h3>🛠️ Como Corrigir Problemas</h3>
        <div className={styles.helpItems}>
          <div className={styles.helpItem}>
            <h4>Configurações Incorretas</h4>
            <p>Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo .env</p>
          </div>
          <div className={styles.helpItem}>
            <h4>Backend Inacessível</h4>
            <p>Certifique-se de que o backend está rodando na porta correta (3001 por padrão)</p>
          </div>
          <div className={styles.helpItem}>
            <h4>SDK Não Carregado</h4>
            <p>Verifique sua conexão com a internet e se não há bloqueadores de scripts</p>
          </div>
        </div>
      </div>
    </div>
  );
}