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
  seniority: 'iniciante' | 'experiente' | 'avancado';
}

export function MakeQuote() {
  const [hasHourlyRate, setHasHourlyRate] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
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
    revisions: 2,
    seniority: 'experiente'
  });
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);

  useEffect(() => {
    const savedHourlyRate = localStorage.getItem('orcapay_hourly_rate');
    setHasHourlyRate(!!savedHourlyRate);
    if (savedHourlyRate) {
      setHourlyRate(parseFloat(savedHourlyRate));
    }
  }, []);

  useEffect(() => {
    const total = Object.values(timeFactors).reduce((sum, value) => sum + value, 0);
    setTotalHours(total);
    calculateFinalPrice();
  }, [timeFactors, priceModifiers, hourlyRate]);

  const calculateFinalPrice = () => {
    // Ajusta a taxa horária com base na senioridade
    let adjustedHourlyRate = hourlyRate;
    if (priceModifiers.seniority === 'iniciante') adjustedHourlyRate *= 0.8;
    if (priceModifiers.seniority === 'experiente') adjustedHourlyRate *= 1.0;
    if (priceModifiers.seniority === 'avancado') adjustedHourlyRate *= 1.3;
    
    // Usa margem de lucro fixa de 2.0
    const fixedProfitMargin = 2.0;
    
    // Calcula preço base
    let calculatedPrice = totalHours * adjustedHourlyRate * fixedProfitMargin;
    
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
          <h2>
            <span role="img" aria-label="warning">⚠️</span> 
            Atenção
          </h2>
          <p>Para criar um orçamento, você precisa primeiro calcular seu valor/hora.</p>
          <p>Clique em "Calcular Valor/Hora" no menu lateral para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.quoteContent}>
        <h2>
          <span role="img" aria-label="document">📋</span>
          Estrutura de Entrada para Orçamento de 
        </h2>
        
        <div className={styles.mainGrid}>
          <section className={styles.section}>
            <h3>
              <span role="img" aria-label="information">ℹ️</span>
              I. Detalhes Básicos do Projeto
            </h3>
            <div className={styles.formGroup}>
              <label htmlFor="clientName">Nome do Cliente/Empresa:</label>
              <input
                id="clientName"
                className={styles.input}
                type="text"
                value={projectDetails.clientName}
                onChange={(e) => setProjectDetails({...projectDetails, clientName: e.target.value})}
                placeholder="Digite o nome do cliente ou empresa"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="projectType">Tipo de Projeto:</label>
              <select
                id="projectType"
                className={styles.select}
                value={projectDetails.projectType}
                onChange={(e) => setProjectDetails({...projectDetails, projectType: e.target.value})}
              >
                <option value="">Selecione um tipo</option>
                <option value="criacao-logo">Criação de Logo</option>
                <option value="design-post">Design de Post</option>
                <option value="web-design">Web Design</option>
                <option value="identidade-visual">Identidade Visual</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Descrição Breve:</label>
              <textarea
                id="description"
                className={styles.input}
                value={projectDetails.description}
                onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
                placeholder="Descreva brevemente o projeto e seus objetivos"
                rows={3}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="deliveryDate">Data de Entrega Desejada:</label>
              <input
                id="deliveryDate"
                className={styles.input}
                type="date"
                value={projectDetails.deliveryDate}
                onChange={(e) => setProjectDetails({...projectDetails, deliveryDate: e.target.value})}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3>
              <span role="img" aria-label="time">⏱️</span>
              II. Tempo Estimado
            </h3>
            <p className={styles.sectionDescription}>
              Informe as horas estimadas por etapa. O sistema somará automaticamente.
            </p>
            
            <div className={styles.timeInputs}>
              <div className={styles.formRow}>
                <label htmlFor="research">Pesquisa e Planejamento:</label>
                <input
                  id="research"
                  className={styles.numberInput}
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeFactors.research}
                  onChange={(e) => setTimeFactors({
                    ...timeFactors,
                    research: parseFloat(e.target.value) || 0
                  })}
                />
                <span className={styles.hint}>Tempo para entender briefing, público e concorrência</span>
              </div>
              
              <div className={styles.formRow}>
                <label htmlFor="creation">Criação e Execução:</label>
                <input
                  id="creation"
                  className={styles.numberInput}
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeFactors.creation}
                  onChange={(e) => setTimeFactors({
                    ...timeFactors,
                    creation: parseFloat(e.target.value) || 0
                  })}
                />
                <span className={styles.hint}>Tempo dedicado à criação (design, protótipos, etc.)</span>
              </div>
              
              <div className={styles.formRow}>
                <label htmlFor="presentation">Apresentação e Reuniões:</label>
                <input
                  id="presentation"
                  className={styles.numberInput}
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeFactors.presentation}
                  onChange={(e) => setTimeFactors({
                    ...timeFactors,
                    presentation: parseFloat(e.target.value) || 0
                  })}
                />
                <span className={styles.hint}>Tempo gasto em comunicação com o cliente</span>
              </div>
              
              <div className={styles.formRow}>
                <label htmlFor="delivery">Preparação e Entrega:</label>
                <input
                  id="delivery"
                  className={styles.numberInput}
                  type="number"
                  min="0"
                  step="0.5"
                  value={timeFactors.delivery}
                  onChange={(e) => setTimeFactors({
                    ...timeFactors,
                    delivery: parseFloat(e.target.value) || 0
                  })}
                />
                <span className={styles.hint}>Tempo para finalização e entrega dos arquivos</span>
              </div>
              
              <div className={styles.totalHours}>
                <strong>Total de Horas:</strong>
                <span>{totalHours}</span>
              </div>
            </div>
          </section>

          <div className={styles.pricePreview}>
            <h2>Preço Final Estimado:</h2>
            <div className={styles.priceValue}>
              {formatCurrency(finalPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}