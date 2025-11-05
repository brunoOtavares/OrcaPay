import { useState, useEffect } from 'react';
import styles from './BudgetCalculator.module.css';

interface Cost {
  description: string;
  value: number;
}

interface CalculatorData {
  fixedCosts: Cost[];
  variableCosts: Cost[];
  desiredSalary: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const parseCurrencyInput = (value: string): number => {
  return Number(value.replace(/\D/g, '')) / 100;
};

const STORAGE_KEY = 'orcapay_calculator_data';

export function BudgetCalculator() {
  // Carrega dados do Local Storage ou usa valores padrão
  const loadInitialData = (): CalculatorData => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      fixedCosts: [],
      variableCosts: [],
      desiredSalary: 0,
      hoursPerDay: 8,
      daysPerMonth: 20
    };
  };

  const [fixedCosts, setFixedCosts] = useState<Cost[]>(loadInitialData().fixedCosts);
  const [variableCosts, setVariableCosts] = useState<Cost[]>(loadInitialData().variableCosts);
  const [desiredSalary, setDesiredSalary] = useState<number>(loadInitialData().desiredSalary);
  const [hoursPerDay, setHoursPerDay] = useState<number>(loadInitialData().hoursPerDay);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(loadInitialData().daysPerMonth);
  const [newFixedCost, setNewFixedCost] = useState<Cost>({ description: '', value: 0 });
  const [newVariableCost, setNewVariableCost] = useState<Cost>({ description: '', value: 0 });
  const [newSalary, setNewSalary] = useState<number>(0);


  const handleCurrencyInput = (value: string, setter: (value: number) => void) => {
    const numberValue = parseCurrencyInput(value);
    setter(numberValue);
  };

  const addFixedCost = () => {
    if (newFixedCost.description && newFixedCost.value > 0) {
      setFixedCosts([...fixedCosts, newFixedCost]);
      setNewFixedCost({ description: '', value: 0 });
    }
  };

  const addVariableCost = () => {
    if (newVariableCost.description && newVariableCost.value > 0) {
      setVariableCosts([...variableCosts, newVariableCost]);
      setNewVariableCost({ description: '', value: 0 });
    }
  };

  const calculateTotalMonthlyCosts = () => {
    const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.value, 0);
    const totalVariable = variableCosts.reduce((sum, cost) => sum + cost.value, 0);
    return totalFixed + totalVariable + desiredSalary;
  };

  const calculateTotalHours = () => {
    return hoursPerDay * daysPerMonth;
  };

  const calculateHourlyRate = () => {
    const totalMonthly = calculateTotalMonthlyCosts();
    const totalHours = calculateTotalHours();
    const hourlyRate = totalHours > 0 ? totalMonthly / totalHours : 0;
    return hourlyRate;
  };

  // Salva dados no Local Storage quando houver mudanças
  useEffect(() => {
    const data: CalculatorData = {
      fixedCosts,
      variableCosts,
      desiredSalary,
      hoursPerDay,
      daysPerMonth
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    // Salva o valor/hora calculado separadamente
    const hourlyRate = calculateHourlyRate();
    if (hourlyRate > 0) {
      localStorage.setItem('orcapay_hourly_rate', hourlyRate.toString());
      // Dispara evento customizado para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('hourlyRateUpdated', { detail: { hourlyRate } }));
    } else {
      localStorage.removeItem('orcapay_hourly_rate');
      // Dispara evento customizado para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('hourlyRateUpdated', { detail: { hourlyRate: null } }));
    }
  }, [fixedCosts, variableCosts, desiredSalary, hoursPerDay, daysPerMonth]);

  const addDesiredSalary = () => {
    if (newSalary > 0) {
      setDesiredSalary(newSalary);
      setNewSalary(0);
    }
  };

  return (
    <div className={styles.budgetCalculator}>
      <div className={styles.header}>
        <h1>Calculo De Valor/Hora</h1>
      </div>
      
      <div className={styles.mainGrid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Custos Fixos (Mensalmente)</h2>
          <div className={styles.inputGroup}>
            <select
              className={styles.input}
              value={newFixedCost.description}
              onChange={(e) => setNewFixedCost({ ...newFixedCost, description: e.target.value })}
            >
              <option value="">Selecione um custo fixo</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Água">Água</option>
              <option value="Luz">Luz</option>
              <option value="Internet">Internet</option>
              <option value="Assinaturas">Assinaturas</option>
              <option value="Outros">Outros</option>
            </select>
            <input
              className={styles.input}
              type="text"
              placeholder="R$ 0,00"
              value={newFixedCost.value ? formatCurrency(newFixedCost.value) : ''}
              onChange={(e) => handleCurrencyInput(e.target.value, (value) => setNewFixedCost({ ...newFixedCost, value }))}
            />
            <button className={styles.button} onClick={addFixedCost}>
              Adicionar
            </button>
          </div>
          <div className={styles.costList}>
            {fixedCosts.map((cost, index) => (
              <div key={index} className={styles.costItem}>
                <span>{cost.description}</span>
                <span>{formatCurrency(cost.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Custos Variáveis (Manuntençao/Reserva)</h2>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              placeholder="Ex: Reservas, Material de Escritório, Transporte, Alimentação"
              value={newVariableCost.description}
              onChange={(e) => setNewVariableCost({ ...newVariableCost, description: e.target.value })}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="R$ 0,00"
              value={newVariableCost.value ? formatCurrency(newVariableCost.value) : ''}
              onChange={(e) => handleCurrencyInput(e.target.value, (value) => setNewVariableCost({ ...newVariableCost, value }))}
            />
            <button className={styles.button} onClick={addVariableCost}>
              Adicionar
            </button>
          </div>
          <div className={styles.costList}>
            {variableCosts.map((cost, index) => (
              <div key={index} className={styles.costItem}>
                <span>{cost.description}</span>
                <span>{formatCurrency(cost.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Salário Desejado</h2>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              placeholder="R$ 0,00"
              value={newSalary ? formatCurrency(newSalary) : ''}
              onChange={(e) => handleCurrencyInput(e.target.value, setNewSalary)}
            />
            <button className={styles.button} onClick={addDesiredSalary}>
              Definir Salário
            </button>
          </div>
          {desiredSalary > 0 && (
            <div className={styles.costItem}>
              <span>Salário Definido:</span>
              <span>{formatCurrency(desiredSalary)}</span>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Horas Trabalhadas</h2>
          <div className={styles.workingHoursGroup}>
            <div className={styles.inputField}>
              <label>Horas por dia:</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                placeholder="Ex: 8"
              />
            </div>
            <div className={styles.inputField}>
              <label>Dias por mês:</label>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="31"
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                placeholder="Ex: 20"
              />
            </div>
            <div className={styles.totalHours}>
              <span>Total de horas mensais:</span>
              <span className={styles.resultValue}>{calculateTotalHours()} horas</span>
            </div>
          </div>
        </div>

        <div className={styles.results}>
          <h2>Resultados do Cálculo</h2>
          {/* <div className={styles.resultItem}>
            <span>Total Mensal:</span>
            <span className={styles.resultValue}>
              {formatCurrency(calculateTotalMonthlyCosts())}
            </span>
          </div> */}
          <div className={styles.resultItem}>
            <span>Valor por Hora:</span>
            <span className={styles.resultValue}>
              {formatCurrency(calculateHourlyRate())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}