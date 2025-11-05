import { useState, useEffect } from 'react';
import styles from './MakeQuote.module.css';

interface ProjectDetails {
  clientName: string;
  projectType: string;
  description: string;
  deliveryDate: string;
}

interface TimeFactors {
  research: number;
  creation: number;
  presentation: number;
  delivery: number;
}

interface PriceModifiers {
  complexity: 'baixa' | 'media' | 'alta';
  urgency: boolean;
  commercialUse: 'local' | 'regional' | 'nacional';
  revisions: number;
}

export function MakeQuote() {
  const [hasHourlyRate, setHasHourlyRate] = useState(false);
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
    presentation: 0,
    delivery: 0
  });
  const [priceModifiers, setPriceModifiers] = useState<PriceModifiers>({
    complexity: 'media',
    urgency: false,
    commercialUse: 'local',
    revisions: 2
  });
  const [finalPrice, setFinalPrice] = useState<number>(0);

  useEffect(() => {
    // Check if hourly rate exists in localStorage
    const savedHourlyRate = localStorage.getItem('orcapay_hourly_rate');
    setHasHourlyRate(!!savedHourlyRate);
    if (savedHourlyRate) {
      setHourlyRate(parseFloat(savedHourlyRate));
    }

    // Listen for custom hourly rate update events
    const handleHourlyRateUpdate = (event: any) => {
      const updatedHourlyRate = localStorage.getItem('orcapay_hourly_rate');
      setHasHourlyRate(!!updatedHourlyRate);
      if (updatedHourlyRate) {
        setHourlyRate(parseFloat(updatedHourlyRate));
      }
    };

    window.addEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    
    return () => {
      window.removeEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    };
  }, []);

  useEffect(() => {
    const total = timeFactors.research + timeFactors.creation + timeFactors.presentation + timeFactors.delivery;
    setTotalHours(total);
    calculateFinalPrice();
  }, [timeFactors, priceModifiers, hourlyRate]);

  const calculateFinalPrice = () => {
    const totalHours = timeFactors.research + timeFactors.creation + timeFactors.presentation + timeFactors.delivery;
    
    // Define o multiplicador de lucro baseado na complexidade
    let profitMargin = 2.0; // Padrão para complexidade média
    if (priceModifiers.complexity === 'baixa') profitMargin = 1.5; // 50% de lucro
    if (priceModifiers.complexity === 'alta') profitMargin = 2.5; // 150% de lucro
    
    // Calcula preço base
    let calculatedPrice = totalHours * hourlyRate * profitMargin;
    
    // Ajusta preço baseado no uso comercial
    if (priceModifiers.commercialUse === 'regional') calculatedPrice *= 1.2;
    if (priceModifiers.commercialUse === 'nacional') calculatedPrice *= 1.5;
    
    // Adiciona taxa de urgência se necessário
    if (priceModifiers.urgency) {
      calculatedPrice *= 1.3; // 30% extra para urgência
    }
    
    setFinalPrice(calculatedPrice);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  if (!hasHourlyRate) {
    return (
      <div className={styles.container}>
        <div className={styles.messageBox}>
          <h2>⚠️ Atenção</h2>
          <p>Primeiro calcule seu Valor/Hora na aba "Calcular Hora de Trabalho"</p>
          <p>Isso é necessário para fazer orçamentos precisos dos seus projetos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quoteContent}>
        <h2>Estrutura de Entrada para Orçamento de Projeto</h2>
        
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
                <select
                  value={projectDetails.projectType}
                  onChange={(e) => setProjectDetails({...projectDetails, projectType: e.target.value})}
                >
                  <option value="">Selecione</option>
                  <option value="criacao-logo">Logo</option>
                  <option value="design-post">Post</option>
                  <option value="web-design">Web</option>
                  <option value="identidade-visual">Identidade</option>
                  <option value="outro">Outro</option>
                </select>
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
                    value={timeFactors.research}
                    onChange={(e) => setTimeFactors({...timeFactors, research: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className={styles.timeFactor}>
                  <label>Criação:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.creation}
                    onChange={(e) => setTimeFactors({...timeFactors, creation: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className={styles.timeFactor}>
                  <label>Apresentação:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.presentation}
                    onChange={(e) => setTimeFactors({...timeFactors, presentation: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className={styles.timeFactor}>
                  <label>Entrega:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={timeFactors.delivery}
                    onChange={(e) => setTimeFactors({...timeFactors, delivery: parseFloat(e.target.value) || 0})}
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
                    value={priceModifiers.revisions}
                    onChange={(e) => setPriceModifiers({...priceModifiers, revisions: parseInt(e.target.value) || 0})}
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
                  {priceModifiers.complexity === 'baixa' && 'Multiplicador: 1.5x (50% de lucro)'}
                  {priceModifiers.complexity === 'media' && 'Multiplicador: 2.0x (100% de lucro)'}
                  {priceModifiers.complexity === 'alta' && 'Multiplicador: 2.5x (150% de lucro)'}
                  {priceModifiers.urgency && ' • Urgência: +30%'}
                  {priceModifiers.commercialUse === 'regional' && ' • Uso Regional: +20%'}
                  {priceModifiers.commercialUse === 'nacional' && ' • Uso Nacional: +50%'}
                </small>
              </div>
              
              <div className={styles.finalPrice}>
                <h4>Preço Final:</h4>
                <div className={styles.priceValue}>{formatCurrency(finalPrice)}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}