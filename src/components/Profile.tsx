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
          📊 Estatísticas
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'subscription' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          💳 Assinatura
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