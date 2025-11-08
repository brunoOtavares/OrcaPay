import { useState, useEffect } from 'react';
import styles from './MakeQuote.module.css';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_SETTINGS } from '../utils/settings';

const parseCurrencyInput = (value: string): number => {
  // Remove tudo exceto números
  const numericValue = value.replace(/\D/g, '');
  // Divide por 100 para obter o valor com centavos
  return Number(numericValue) / 100;
};

interface ProjectDetails {
  clientName: string;
  projectType: string;
  description: string;
  deliveryDate: string;
}

interface TimeFactors {
  research: number;
  creation: number;
  meetings: number;
}

interface PriceModifiers {
  complexity: 'baixa' | 'media' | 'alta';
  urgency: boolean;
  commercialUse: 'local' | 'regional' | 'nacional';
  revisions: number;
}

interface MakeQuoteProps {
  onSaveQuote: (quote: {
    clientName: string;
    projectType: string;
    description: string;
    deliveryDate: string;
    totalHours: number;
    finalPrice: number;
    complexity: string;
    urgency: boolean;
    commercialUse: string;
    revisions: number;
  }) => void;
}

export function MakeQuote({ onSaveQuote }: MakeQuoteProps) {
  const { userProfile } = useAuth();
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    clientName: '',
    projectType: '',
    description: '',
    deliveryDate: ''
  });
  const [timeFactors, setTimeFactors] = useState<TimeFactors>({
    research: 0,
    creation: 0,
    meetings: 0
  });
  const [priceModifiers, setPriceModifiers] = useState<PriceModifiers>({
    complexity: 'media',
    urgency: false,
    commercialUse: 'local',
    revisions: 2
  });
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasHourlyRate, setHasHourlyRate] = useState(false);
  const [confirmFinalPrice, setConfirmFinalPrice] = useState<string>('');

  // Verificar limite de orçamentos
  const getQuotesThisMonth = () => {
    if (!userProfile?.quotes) return 0;
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const filtered = userProfile.quotes.filter(quote => {
      const quoteDate = new Date(quote.createdAt);
      return quoteDate >= firstDayOfMonth;
    });
    
    console.log('📅 Filtrando orçamentos:', {
      mesAtual: `${now.getMonth() + 1}/${now.getFullYear()}`,
      primeiroDiaDoMes: firstDayOfMonth.toISOString(),
      totalOrçamentos: userProfile.quotes.length,
      orçamentosEsteMês: filtered.length,
      orçamentos: filtered.map(q => ({
        id: q.id,
        cliente: q.clientName,
        data: q.createdAt,
        dataParsed: new Date(q.createdAt).toLocaleDateString('pt-BR')
      }))
    });
    
    return filtered.length;
  };

  const isFreePlan = !userProfile?.subscription || 
                     userProfile.subscription.plan === 'free' ||
                     userProfile.subscription.status !== 'active';
  const quotesThisMonth = getQuotesThisMonth();
  const hasReachedLimit = isFreePlan && quotesThisMonth >= 5;

  // Debug detalhado
  console.log('🔍 Subscription Debug:', {
    hasSubscription: !!userProfile?.subscription,
    subscriptionObject: userProfile?.subscription,
    plan: userProfile?.subscription?.plan,
    status: userProfile?.subscription?.status,
    statusIsActive: userProfile?.subscription?.status === 'active',
    statusIsNotActive: userProfile?.subscription?.status !== 'active'
  });

  console.log('📊 Quota Check:', {
    isFreePlan,
    quotesThisMonth,
    hasReachedLimit,
    LIMITE: 5,
    totalQuotes: userProfile?.quotes?.length || 0
  });

  useEffect(() => {
    // Buscar hourlyRate do Firebase
    if (userProfile?.hourlyRate) {
      setHourlyRate(userProfile.hourlyRate);
      setHasHourlyRate(true);
    }
  }, [userProfile]);

  useEffect(() => {
    // Listener para atualização do valor/hora
    const handleHourlyRateUpdate = (event: any) => {
      const updatedHourlyRate = event.detail.hourlyRate;
      if (updatedHourlyRate) {
        setHourlyRate(parseFloat(updatedHourlyRate));
        setHasHourlyRate(true);
      } else {
        setHourlyRate(0);
        setHasHourlyRate(false);
      }
    };

    window.addEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    
    return () => {
      window.removeEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    };
  }, []);

  useEffect(() => {
    const total = timeFactors.research + timeFactors.creation + timeFactors.meetings;
    setTotalHours(total);
    calculateFinalPrice();
  }, [timeFactors, priceModifiers, hourlyRate]);

  const calculateFinalPrice = () => {
    const totalHours = timeFactors.research + timeFactors.creation + timeFactors.meetings;
    
    // Carrega configurações do Firebase ou usa padrão
    const settings = userProfile?.settings || DEFAULT_SETTINGS;
    
    // Define o multiplicador de lucro baseado na complexidade
    let profitMargin = settings.complexityMultipliers[priceModifiers.complexity];
    
    // Calcula preço base
    let calculatedPrice = totalHours * hourlyRate * profitMargin;
    
    // Ajusta preço baseado no uso comercial
    calculatedPrice *= settings.commercialUseMultipliers[priceModifiers.commercialUse];
    
    // Adiciona taxa de urgência se necessário
    if (priceModifiers.urgency) {
      calculatedPrice *= settings.urgencyMultiplier;
    }
    
    setFinalPrice(calculatedPrice);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleOpenConfirmModal = () => {
    if (!projectDetails.clientName || !projectDetails.projectType) {
      alert('Por favor, preencha o nome do cliente e o tipo de projeto.');
      return;
    }

    if (totalHours === 0) {
      alert('Por favor, adicione as horas do projeto.');
      return;
    }

    // Define o preço inicial como o preço calculado formatado em BRL
    setConfirmFinalPrice(formatCurrency(finalPrice));
    setShowConfirmModal(true);
  };

  const handleConfirmQuote = () => {
    console.log('🔍 Tentando confirmar orçamento...', { hasReachedLimit, quotesThisMonth, isFreePlan });
    
    // Bloquear se o limite foi atingido
    if (hasReachedLimit) {
      console.log('❌ Bloqueado por limite!');
      alert('Você atingiu o limite de 5 orçamentos no plano gratuito. Faça upgrade para continuar!');
      setShowConfirmModal(false);
      return;
    }

    console.log('✅ Prosseguindo com salvamento...');
    const priceToSave = parseCurrencyInput(confirmFinalPrice);
    
    if (isNaN(priceToSave) || priceToSave <= 0) {
      alert('Por favor, insira um preço válido.');
      return;
    }

    onSaveQuote({
      clientName: projectDetails.clientName,
      projectType: projectDetails.projectType,
      description: projectDetails.description,
      deliveryDate: projectDetails.deliveryDate,
      totalHours,
      finalPrice: priceToSave,
      complexity: priceModifiers.complexity,
      urgency: priceModifiers.urgency,
      commercialUse: priceModifiers.commercialUse,
      revisions: priceModifiers.revisions
    });

    // Fechar modal e limpar formulário
    setShowConfirmModal(false);
    setProjectDetails({
      clientName: '',
      projectType: '',
      description: '',
      deliveryDate: ''
    });
    setTimeFactors({
      research: 0,
      creation: 0,
      meetings: 0
    });
    setPriceModifiers({
      complexity: 'media',
      urgency: false,
      commercialUse: 'local',
      revisions: 2
    });
  };

  if (!hasHourlyRate) {
    return (
      <div className={styles.container}>
        <div className={styles.messageBox}>
          <h2>Atenção</h2>
          <p>Primeiro calcule seu Valor/Hora na aba "Calcular Hora de Trabalho"</p>
          <p>Isso é necessário para fazer orçamentos precisos dos seus projetos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quoteContent}>
        <h2>Faça o Orçamento do seu Projeto</h2>
        
        {/* Aviso de limite atingido */}
        {hasReachedLimit && (
          <div className={styles.limitWarning}>
            <span className={styles.warningIcon}>⚠️</span>
            <div className={styles.warningContent}>
              <strong>Limite atingido!</strong>
              <p>Você atingiu o limite de 5 orçamentos no plano gratuito este mês.</p>
              <button 
                className={styles.upgradeButton}
                onClick={() => window.location.href = '#assinaturas'}
              >
                Fazer Upgrade
              </button>
            </div>
          </div>
        )}
        
        {/* Contador de orçamentos para plano gratuito */}
        {isFreePlan && !hasReachedLimit && (
          <div className={styles.quotaInfo}>
            📊 Você usou <strong>{quotesThisMonth}</strong> de <strong>5</strong> orçamentos este mês
          </div>
        )}
        
        <div className={styles.mainGrid}>
          {/* Coluna da Esquerda - Informações do Projeto */}
          <div className={styles.leftColumn}>
            {/* Seção de Detalhes do Projeto */}
            <section className={styles.section}>
              <h3>Detalhes Básicos do Projeto</h3>
              
              <div className={styles.formGroup}>
                <label>Cliente:</label>
                <input
                  type="text"
                  value={projectDetails.clientName}
                  onChange={(e) => setProjectDetails({...projectDetails, clientName: e.target.value})}
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Tipo:</label>
                <input
                  type="text"
                  value={projectDetails.projectType}
                  onChange={(e) => setProjectDetails({...projectDetails, projectType: e.target.value})}
                  placeholder="Ex: Logo, Post, Web, Identidade Visual..."
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Descrição:</label>
                <textarea
                  value={projectDetails.description}
                  onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                  placeholder="Descrição"
                  rows={1}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Entrega:</label>
                <input
                  type="date"
                  value={projectDetails.deliveryDate}
                  onChange={(e) => setProjectDetails({...projectDetails, deliveryDate: e.target.value})}
                />
              </div>
            </section>

            {/* Seção de Fatores de Tempo */}
            <section className={styles.section}>
              <h3>Fatores de Tempo</h3>
              
              <div className={styles.timeFactorsGrid}>
                <div className={styles.timeFactor}>
                  <label>Pesquisa:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.research || ''}
                    onChange={(e) => setTimeFactors({...timeFactors, research: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className={styles.timeFactor}>
                  <label>Criação:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.creation || ''}
                    onChange={(e) => setTimeFactors({...timeFactors, creation: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className={styles.timeFactor}>
                  <label>Reuniões:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.meetings || ''}
                    onChange={(e) => setTimeFactors({...timeFactors, meetings: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className={styles.totalHours}>
                <strong>Total: {totalHours}h</strong>
              </div>
            </section>
          </div>

          {/* Coluna Direita */}
          <div className={styles.rightColumn}>
            {/* Modificadores de Preço */}
            <section className={styles.section}>
              <h3>Modificadores de Preço</h3>
              
              <div className={styles.modifiersGrid}>
                <div className={styles.modifier}>
                  <label>Complexidade:</label>
                  <select
                    value={priceModifiers.complexity}
                    onChange={(e) => setPriceModifiers({...priceModifiers, complexity: e.target.value as 'baixa' | 'media' | 'alta'})}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                
                <div className={styles.modifier}>
                  <label>Urgência:</label>
                  <div className={styles.checkboxGroup}>
                    <input
                      type="checkbox"
                      id="urgency"
                      checked={priceModifiers.urgency}
                      onChange={(e) => setPriceModifiers({...priceModifiers, urgency: e.target.checked})}
                    />
                    <label htmlFor="urgency">+30%</label>
                  </div>
                </div>
                
                <div className={styles.modifier}>
                  <label>Uso Comercial:</label>
                  <select
                    value={priceModifiers.commercialUse}
                    onChange={(e) => setPriceModifiers({...priceModifiers, commercialUse: e.target.value as 'local' | 'regional' | 'nacional'})}
                  >
                    <option value="local">Local</option>
                    <option value="regional">Regional</option>
                    <option value="nacional">Nacional</option>
                  </select>
                </div>
                
                <div className={styles.modifier}>
                  <label>Revisões:</label>
                  <input
                    type="number"
                    min="0"
                    value={priceModifiers.revisions || ''}
                    onChange={(e) => setPriceModifiers({...priceModifiers, revisions: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                  />
                </div>
                
              </div>
            </section>

            {/* Resultado Final */}
            <section className={styles.section}>
              <h3>Resultado Final</h3>
              <div className={styles.formula}>
                <p>Cálculo: (Total Horas × Valor/Hora × Multiplicador) + Ajustes</p>
                <small>
                  {(() => {
                    const settings = userProfile?.settings || DEFAULT_SETTINGS;
                    const complexityMult = settings.complexityMultipliers[priceModifiers.complexity];
                    const complexityProfit = ((complexityMult - 1) * 100).toFixed(0);
                    const commercialMult = settings.commercialUseMultipliers[priceModifiers.commercialUse];
                    const commercialExtra = ((commercialMult - 1) * 100).toFixed(0);
                    const urgencyExtra = ((settings.urgencyMultiplier - 1) * 100).toFixed(0);
                    
                    return (
                      <>
                        Multiplicador: {complexityMult}x ({complexityProfit}% de lucro)
                        {priceModifiers.urgency && ` • Urgência: +${urgencyExtra}%`}
                        {priceModifiers.commercialUse === 'regional' && ` • Uso Regional: +${commercialExtra}%`}
                        {priceModifiers.commercialUse === 'nacional' && ` • Uso Nacional: +${commercialExtra}%`}
                      </>
                    );
                  })()}
                </small>
              </div>
              
              <div className={styles.finalPrice}>
                <h4>Faixa de Preço:</h4>
                <div className={styles.priceRange}>
                  <span className={styles.priceMin}>{formatCurrency(finalPrice)}</span>
                  <span className={styles.priceSeparator}>até</span>
                  <span className={styles.priceMax}>{formatCurrency(finalPrice * (1 + (userProfile?.settings || DEFAULT_SETTINGS).priceRangePercentage / 100))}</span>
                </div>
              </div>

              <button 
                className={styles.confirmButton}
                onClick={handleOpenConfirmModal}
                disabled={hasReachedLimit}
                style={hasReachedLimit ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {hasReachedLimit ? 'Limite Atingido - Faça Upgrade' : 'Confirmar e Enviar para Clientes'}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Confirmar Orçamento</h2>
            
            <div className={styles.modalInfo}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Cliente:</span>
                <span className={styles.value}>{projectDetails.clientName}</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Projeto:</span>
                <span className={styles.value}>{projectDetails.projectType}</span>
              </div>
              
              {projectDetails.description && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Descrição:</span>
                  <span className={styles.value}>{projectDetails.description}</span>
                </div>
              )}
              
              {projectDetails.deliveryDate && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Data de Entrega:</span>
                  <span className={styles.value}>
                    {new Date(projectDetails.deliveryDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Total de Horas:</span>
                <span className={styles.value}>{totalHours}h</span>
              </div>
              
              <div className={styles.infoRow}>
                <span className={styles.label}>Preço Sugerido:</span>
                <span className={styles.value}>
                  {formatCurrency(finalPrice)} até {formatCurrency(finalPrice * 1.3)}
                </span>
              </div>
            </div>
            
            <div className={styles.modalPriceInput}>
              <label>Preço Final:</label>
              <input
                type="text"
                value={confirmFinalPrice}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, '');
                  if (rawValue === '') {
                    setConfirmFinalPrice('');
                  } else {
                    const numberValue = parseFloat(rawValue) / 100;
                    setConfirmFinalPrice(formatCurrency(numberValue));
                  }
                }}
                placeholder="R$ 0,00"
                autoFocus
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmModalButton}
                onClick={handleConfirmQuote}
              >
                Confirmar Orçamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}