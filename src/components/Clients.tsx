import styles from './Clients.module.css';

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
}

interface ClientsProps {
  quotes: SavedQuote[];
  onDeleteQuote: (id: string) => void;
}

export function Clients({ quotes, onDeleteQuote }: ClientsProps) {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getProjectTypeLabel = (type: string): string => {
    const types: { [key: string]: string } = {
      'criacao-logo': '🎨 Logo',
      'design-post': '📱 Post',
      'web-design': '💻 Web',
      'identidade-visual': '🎯 Identidade',
      'outro': '📋 Outro'
    };
    return types[type] || type;
  };

  return (
    <div className={styles.clients}>
      <div className={styles.header}>
        <h2>💼 Clientes e Orçamentos</h2>
        <p>Gerencie todos os orçamentos enviados</p>
      </div>
      
      <div className={styles.content}>
        {quotes.length === 0 ? (
          <div className={styles.placeholder}>
            <div className={styles.icon}>�</div>
            <h3>Nenhum orçamento cadastrado</h3>
            <p>Crie seu primeiro orçamento na aba "Fazer Orçamento"</p>
          </div>
        ) : (
          <div className={styles.quotesGrid}>
            {quotes.map((quote) => (
              <div key={quote.id} className={styles.quoteCard}>
                <div className={styles.quoteHeader}>
                  <div className={styles.clientInfo}>
                    <h3>{quote.clientName}</h3>
                    <span className={styles.projectType}>
                      {getProjectTypeLabel(quote.projectType)}
                    </span>
                  </div>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => {
                      if (window.confirm('Deseja realmente excluir este orçamento?')) {
                        onDeleteQuote(quote.id);
                      }
                    }}
                    title="Excluir orçamento"
                  >
                    🗑️
                  </button>
                </div>

                {quote.description && (
                  <p className={styles.description}>{quote.description}</p>
                )}

                <div className={styles.quoteDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>⏱️ Total de Horas:</span>
                    <span className={styles.value}>{quote.totalHours}h</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>📊 Complexidade:</span>
                    <span className={styles.value}>
                      {quote.complexity === 'baixa' && '🟢 Baixa'}
                      {quote.complexity === 'media' && '🟡 Média'}
                      {quote.complexity === 'alta' && '🔴 Alta'}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>🌍 Uso Comercial:</span>
                    <span className={styles.value}>{quote.commercialUse}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>🔄 Revisões:</span>
                    <span className={styles.value}>{quote.revisions}</span>
                  </div>
                  {quote.urgency && (
                    <div className={styles.urgencyBadge}>⚡ Urgente</div>
                  )}
                  {quote.deliveryDate && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>📅 Entrega:</span>
                      <span className={styles.value}>{formatDate(quote.deliveryDate)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Valor Total:</span>
                  <span className={styles.priceValue}>{formatCurrency(quote.finalPrice)}</span>
                </div>

                <div className={styles.createdAt}>
                  Criado em: {formatDate(quote.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}