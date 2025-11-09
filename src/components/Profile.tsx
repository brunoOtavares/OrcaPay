import { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionManager } from './SubscriptionManager';

interface SavedQuote {
  id: string;
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
  createdAt: string;
  completed?: boolean;
  completedAt?: string;
}

export function Profile() {
  const { userProfile } = useAuth();
  const [completedProjects, setCompletedProjects] = useState<SavedQuote[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'subscription'>('stats');

  useEffect(() => {
    // Usar dados do Firebase
    if (userProfile?.quotes) {
      setCompletedProjects(userProfile.quotes.filter(q => q.completed));
    } else {
      setCompletedProjects([]);
    }
  }, [userProfile]);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getProjectTypeLabel = (type: string): string => {
    const types: { [key: string]: string } = {
      'criacao-logo': 'Logo',
      'design-post': 'Post',
      'web-design': 'Web',
      'identidade-visual': 'Identidade Visual',
      'outro': 'Outro'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTotalEarnings = () => {
    return completedProjects.reduce((sum, project) => sum + project.finalPrice, 0);
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyProjects = completedProjects.filter(project => {
      if (!project.completedAt) return false;
      const completedDate = new Date(project.completedAt);
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
    });

    const monthlyEarnings = monthlyProjects.reduce((sum, project) => sum + project.finalPrice, 0);

    return {
      count: monthlyProjects.length,
      earnings: monthlyEarnings
    };
  };

  const monthlyStats = getMonthlyStats();

  // Verificar se é plano Pro
  const isProPlan = userProfile?.subscription?.plan === 'pro' && userProfile?.subscription?.status === 'active';

  // Estatísticas avançadas para plano Pro
  const getAdvancedStats = () => {
    if (!completedProjects.length) return null;

    // Análise por tipo de projeto
    const projectsByType: { [key: string]: { count: number; total: number } } = {};
    completedProjects.forEach(project => {
      const type = project.projectType || 'outro';
      if (!projectsByType[type]) {
        projectsByType[type] = { count: 0, total: 0 };
      }
      projectsByType[type].count++;
      projectsByType[type].total += project.finalPrice;
    });

    // Análise por complexidade
    const projectsByComplexity: { [key: string]: { count: number; total: number } } = {};
    completedProjects.forEach(project => {
      const complexity = project.complexity || 'media';
      if (!projectsByComplexity[complexity]) {
        projectsByComplexity[complexity] = { count: 0, total: 0 };
      }
      projectsByComplexity[complexity].count++;
      projectsByComplexity[complexity].total += project.finalPrice;
    });

    // Taxa de urgência
    const urgentProjects = completedProjects.filter(p => p.urgency);
    const urgencyRate = (urgentProjects.length / completedProjects.length) * 100;

    // Evolução mensal (últimos 6 meses)
    const monthlyEvolution: { [key: string]: { count: number; total: number } } = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyEvolution[monthKey] = { count: 0, total: 0 };
    }

    completedProjects.forEach(project => {
      if (!project.completedAt) return;
      const date = new Date(project.completedAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (monthlyEvolution[monthKey]) {
        monthlyEvolution[monthKey].count++;
        monthlyEvolution[monthKey].total += project.finalPrice;
      }
    });

    // Tempo médio de projeto (em dias)
    const projectDurations = completedProjects
      .filter(p => p.completedAt && p.createdAt)
      .map(p => {
        const start = new Date(p.createdAt);
        const end = new Date(p.completedAt!);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      });
    
    const avgDuration = projectDurations.length > 0
      ? projectDurations.reduce((a, b) => a + b, 0) / projectDurations.length
      : 0;

    return {
      projectsByType,
      projectsByComplexity,
      urgencyRate,
      urgentProjects: urgentProjects.length,
      monthlyEvolution,
      avgDuration
    };
  };

  const advancedStats = isProPlan ? getAdvancedStats() : null;

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <h2>Perfil</h2>
        <p>Gerencie suas estatísticas e assinatura</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'stats' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estatísticas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'subscription' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Assinatura
        </button>
      </div>

      {activeTab === 'stats' ? (
        <div className={styles.content}>
          {/* Estatísticas Gerais */}
          <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Total de Projetos</h3>
              <p className={styles.statValue}>{completedProjects.length}</p>
              <span className={styles.statLabel}>Projetos Concluídos</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Total Ganho</h3>
              <p className={styles.statValue}>{formatCurrency(getTotalEarnings())}</p>
              <span className={styles.statLabel}>Receita Total</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Neste Mês</h3>
              <p className={styles.statValue}>{monthlyStats.count}</p>
              <span className={styles.statLabel}>{formatCurrency(monthlyStats.earnings)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div className={styles.statContent}>
              <h3>Ticket Médio</h3>
              <p className={styles.statValue}>
                {completedProjects.length > 0 
                  ? formatCurrency(getTotalEarnings() / completedProjects.length)
                  : formatCurrency(0)
                }
              </p>
              <span className={styles.statLabel}>Por Projeto</span>
            </div>
          </div>
        </div>

        {/* Estatísticas Avançadas - Apenas Pro */}
        {isProPlan && advancedStats && completedProjects.length > 0 && (
          <div className={styles.advancedStats}>
            <div className={styles.sectionHeader}>
              <h3>Análises Avançadas</h3>
              <span className={styles.proBadge}>PRO</span>
            </div>

            {/* Análise por Tipo de Projeto */}
            <div className={styles.analysisSection}>
              <h4>Desempenho por Tipo de Projeto</h4>
              <div className={styles.analysisGrid}>
                {Object.entries(advancedStats.projectsByType).map(([type, data]) => (
                  <div key={type} className={styles.analysisCard}>
                    <div className={styles.analysisHeader}>
                      <span className={styles.analysisType}>{type}</span>
                      <span className={styles.analysisCount}>{data.count} projeto(s)</span>
                    </div>
                    <div className={styles.analysisValue}>
                      {formatCurrency(data.total)}
                    </div>
                    <div className={styles.analysisAvg}>
                      Média: {formatCurrency(data.total / data.count)}
                    </div>
                    <div className={styles.analysisBar}>
                      <div 
                        className={styles.analysisBarFill}
                        style={{ width: `${(data.count / completedProjects.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Análise por Complexidade */}
            <div className={styles.analysisSection}>
              <h4>Distribuição por Complexidade</h4>
              <div className={styles.complexityGrid}>
                {Object.entries(advancedStats.projectsByComplexity).map(([complexity, data]) => {
                  const percentage = (data.count / completedProjects.length) * 100;
                  const avgValue = data.total / data.count;
                  
                  return (
                    <div key={complexity} className={styles.complexityCard}>
                      <div className={styles.complexityHeader}>
                        <span className={styles.complexityLabel}>
                          {complexity === 'baixa' ? 'Baixa' : complexity === 'media' ? 'Média' : 'Alta'}
                        </span>
                        <span className={styles.complexityPercentage}>{percentage.toFixed(0)}%</span>
                      </div>
                      <div className={styles.complexityStats}>
                        <div className={styles.complexityStat}>
                          <span>Projetos:</span>
                          <strong>{data.count}</strong>
                        </div>
                        <div className={styles.complexityStat}>
                          <span>Total:</span>
                          <strong>{formatCurrency(data.total)}</strong>
                        </div>
                        <div className={styles.complexityStat}>
                          <span>Média:</span>
                          <strong>{formatCurrency(avgValue)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Métricas de Eficiência */}
            <div className={styles.analysisSection}>
              <h4>Métricas de Eficiência</h4>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <div className={styles.metricContent}>
                    <h5>Taxa de Urgência</h5>
                    <p className={styles.metricValue}>{advancedStats.urgencyRate.toFixed(1)}%</p>
                    <span className={styles.metricLabel}>
                      {advancedStats.urgentProjects} de {completedProjects.length} projetos
                    </span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className={styles.metricContent}>
                    <h5>Tempo Médio</h5>
                    <p className={styles.metricValue}>{advancedStats.avgDuration.toFixed(0)} dias</p>
                    <span className={styles.metricLabel}>Duração média dos projetos</span>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                  </div>
                  <div className={styles.metricContent}>
                    <h5>Crescimento</h5>
                    <p className={styles.metricValue}>
                      {(() => {
                        const months = Object.values(advancedStats.monthlyEvolution);
                        if (months.length < 2) return '0%';
                        const lastMonth = months[months.length - 1].total;
                        const prevMonth = months[months.length - 2].total;
                        if (prevMonth === 0) return '+100%';
                        const growth = ((lastMonth - prevMonth) / prevMonth) * 100;
                        return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                      })()}
                    </p>
                    <span className={styles.metricLabel}>Variação último mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade para Pro */}
        {!isProPlan && completedProjects.length > 0 && (
          <div className={styles.upgradeCard}>
            <div className={styles.upgradeContent}>
              <h3>Desbloqueie Análises Avançadas</h3>
              <p>Upgrade para o plano Pro e tenha acesso a:</p>
              <ul>
                <li>Desempenho por tipo de projeto</li>
                <li>Distribuição por complexidade</li>
                <li>Métricas de eficiência e crescimento</li>
                <li>Análises detalhadas de performance</li>
                <li>E muito mais!</li>
              </ul>
              <button 
                className={styles.upgradeBtn}
                onClick={() => setActiveTab('subscription')}
              >
                Fazer Upgrade para Pro
              </button>
            </div>
          </div>
        )}

        {/* Lista de Projetos Concluídos */}
        <div className={styles.completedSection}>
          <div className={styles.sectionHeader}>
            <h3>Projetos Concluídos</h3>
            <span className={styles.badge}>{completedProjects.length} projetos</span>
          </div>

          {completedProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum projeto concluído ainda</p>
              <small>Complete seus primeiros projetos para ver suas estatísticas aqui</small>
            </div>
          ) : (
            <div className={styles.projectsList}>
              {completedProjects.map((project) => (
                <div key={project.id} className={styles.projectItem}>
                  <div className={styles.projectInfo}>
                    <h4>{project.clientName}</h4>
                    <div className={styles.projectMeta}>
                      <span className={styles.projectType}>{getProjectTypeLabel(project.projectType)}</span>
                      <span className={styles.projectDate}>
                        Concluído em {formatDate(project.completedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.projectValue}>
                    {formatCurrency(project.finalPrice)}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      ) : (
        <div className={styles.subscriptionContent}>
          <SubscriptionManager />
        </div>
      )}
    </div>
  );
}