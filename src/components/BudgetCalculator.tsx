import { useState, useEffect } from 'react';
import styles from './BudgetCalculator.module.css';
import { useAuth } from '../contexts/AuthContext';
import { updateHourlyRate as updateFirebaseHourlyRate, updateCalculatorData } from '../services/firestoreService';

interface Cost {
  description: string;
  value: number;
}

interface CalculatorData {
  fixedCosts: Cost[];
  variableCosts: Cost[];
  salary1?: number;
  salary2?: number;
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

export function BudgetCalculator() {
  const { currentUser, userProfile } = useAuth();
  
  // Carrega dados do Firebase ou usa valores padrão
  const loadInitialData = (): CalculatorData => {
    if (userProfile?.calculatorData) {
      return userProfile.calculatorData;
    }
    return {
      fixedCosts: [],
      variableCosts: [],
      salary1: 0,
      salary2: 0,
      desiredSalary: 0,
      hoursPerDay: 8,
      daysPerMonth: 20
    };
  };

  const initialData = loadInitialData();
  const [fixedCosts, setFixedCosts] = useState<Cost[]>(initialData.fixedCosts);
  const [variableCosts, setVariableCosts] = useState<Cost[]>(initialData.variableCosts);
  const [hoursPerDay, setHoursPerDay] = useState<number>(initialData.hoursPerDay);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(initialData.daysPerMonth);
  const [newFixedCost, setNewFixedCost] = useState<Cost>({ description: '', value: 0 });
  const [newVariableCost, setNewVariableCost] = useState<Cost>({ description: '', value: 0 });
  const [salary1, setSalary1] = useState<number>(initialData.salary1 || 0);
  const [salary2, setSalary2] = useState<number>(initialData.salary2 || 0);


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

  const removeFixedCost = (index: number) => {
    setFixedCosts(fixedCosts.filter((_, i) => i !== index));
  };

  const removeVariableCost = (index: number) => {
    setVariableCosts(variableCosts.filter((_, i) => i !== index));
  };

  const calculateAverageSalary = () => {
    if (salary1 > 0 && salary2 > 0) {
      return (salary1 + salary2) / 2;
    }
    return salary1 || salary2 || 0;
  };

  const calculateTotalMonthlyCosts = () => {
    const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.value, 0);
    const totalVariable = variableCosts.reduce((sum, cost) => sum + cost.value, 0);
    const averageSalary = calculateAverageSalary();
    return totalFixed + totalVariable + averageSalary;
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

  // Atualizar dados quando userProfile mudar
  useEffect(() => {
    if (userProfile?.calculatorData) {
      setFixedCosts(userProfile.calculatorData.fixedCosts);
      setVariableCosts(userProfile.calculatorData.variableCosts);
      setHoursPerDay(userProfile.calculatorData.hoursPerDay);
      setDaysPerMonth(userProfile.calculatorData.daysPerMonth);
      setSalary1(userProfile.calculatorData.salary1 || 0);
      setSalary2(userProfile.calculatorData.salary2 || 0);
    }
  }, [userProfile]);

  // Salva dados no Firebase quando houver mudanças
  useEffect(() => {
    if (!currentUser) return;

    const averageSalary = calculateAverageSalary();
    const data = {
      fixedCosts,
      variableCosts,
      salary1,
      salary2,
      desiredSalary: averageSalary,
      hoursPerDay,
      daysPerMonth
    };

    // Salvar dados da calculadora no Firebase
    updateCalculatorData(currentUser.uid, data).catch(err => {
      console.error('Erro ao salvar dados da calculadora:', err);
    });

    // Salvar valor/hora
    const hourlyRate = calculateHourlyRate();
    if (hourlyRate > 0) {
      updateFirebaseHourlyRate(currentUser.uid, hourlyRate).catch(err => {
        console.error('Erro ao salvar valor/hora no Firebase:', err);
      });
      
      // Dispara evento customizado para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('hourlyRateUpdated', { detail: { hourlyRate } }));
    } else {
      // Dispara evento customizado para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('hourlyRateUpdated', { detail: { hourlyRate: null } }));
    }
  }, [fixedCosts, variableCosts, salary1, salary2, hoursPerDay, daysPerMonth, currentUser]);

  return (
    <div className={styles.budgetCalculator}>
      <div className={styles.header}>
        <h1>Calcule o Valor da sua Hora</h1>
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
              value={newFixedCost.value > 0 ? formatCurrency(newFixedCost.value) : ''}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/\D/g, '');
                if (cleanValue === '') {
                  setNewFixedCost({ ...newFixedCost, value: 0 });
                } else {
                  handleCurrencyInput(e.target.value, (value) => setNewFixedCost({ ...newFixedCost, value }));
                }
              }}
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
                <button 
                  className={styles.removeButton}
                  onClick={() => removeFixedCost(index)}
                  title="Remover"
                >
                  ×
                </button>
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
              placeholder="Ex: Manuntençoes , cursos"
              value={newVariableCost.description}
              onChange={(e) => setNewVariableCost({ ...newVariableCost, description: e.target.value })}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="R$ 0,00"
              value={newVariableCost.value > 0 ? formatCurrency(newVariableCost.value) : ''}
              onChange={(e) => {
                const cleanValue = e.target.value.replace(/\D/g, '');
                if (cleanValue === '') {
                  setNewVariableCost({ ...newVariableCost, value: 0 });
                } else {
                  handleCurrencyInput(e.target.value, (value) => setNewVariableCost({ ...newVariableCost, value }));
                }
              }}
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
                <button 
                  className={styles.removeButton}
                  onClick={() => removeVariableCost(index)}
                  title="Remover"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Media Salarial Desejada
            <div className={styles.salaryInputsInline}>
              <input
                className={styles.inputInline}
                type="text"
                placeholder="R$ 0,00"
                value={salary1 > 0 ? formatCurrency(salary1) : ''}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '');
                  if (cleanValue === '') {
                    setSalary1(0);
                  } else {
                    handleCurrencyInput(e.target.value, setSalary1);
                  }
                }}
              />
              
              <input
                className={styles.inputInline}
                type="text"
                placeholder="R$ 0,00"
                value={salary2 > 0 ? formatCurrency(salary2) : ''}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '');
                  if (cleanValue === '') {
                    setSalary2(0);
                  } else {
                    handleCurrencyInput(e.target.value, setSalary2);
                  }
                }}
              />
            </div>
          </h2>
          {(salary1 > 0 || salary2 > 0) && (
            <div className={styles.salaryResult}>
  
      
              <span className={styles.salaryValue}>{formatCurrency(salary1)}</span>
              <span className={styles.dash}>-</span>
              <span className={styles.salaryValue}>{formatCurrency(salary2)}</span>
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
                min="0"
                max="24"
                value={hoursPerDay || ''}
                onChange={(e) => setHoursPerDay(e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="Ex: 8"
              />
            </div>
            <div className={styles.inputField}>
              <label>Dias por mês:</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                max="31"
                value={daysPerMonth || ''}
                onChange={(e) => setDaysPerMonth(e.target.value === '' ? 0 : Number(e.target.value))}
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