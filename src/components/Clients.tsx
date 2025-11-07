import { useState } from 'react';
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
  completed?: boolean;
  completedAt?: string;
}

interface ClientsProps {
  quotes: SavedQuote[];
  onDeleteQuote: (id: string) => void;
  onUpdateQuote?: (id: string, updatedQuote: SavedQuote) => void;
}

export function Clients({ quotes, onDeleteQuote, onUpdateQuote }: ClientsProps) {
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState<SavedQuote | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  
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
      'criacao-logo': 'Logo',
      'design-post': 'Post',
      'web-design': 'Web',
      'identidade-visual': 'Identidade',
      'outro': 'Outro'
    };
    return types[type] || type;
  };

  const handleCardClick = (quote: SavedQuote) => {
    setSelectedQuote(quote);
    setEditedQuote({ ...quote });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
    setEditedQuote(null);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    if (editedQuote && onUpdateQuote) {
      onUpdateQuote(editedQuote.id, editedQuote);
      setSelectedQuote(editedQuote);
      setIsEditing(false);
    }
  };

  const handleEditChange = (field: keyof SavedQuote, value: any) => {
    if (editedQuote) {
      setEditedQuote({ ...editedQuote, [field]: value });
    }
  };

  const handleCompleteProject = () => {
    if (selectedQuote && onUpdateQuote) {
      const completedQuote = {
        ...selectedQuote,
        completed: true,
        completedAt: new Date().toISOString()
      };
      onUpdateQuote(selectedQuote.id, completedQuote);
      setShowCompleteConfirm(false);
      handleCloseModal();
    }
  };

  return (
    <div className={styles.clients}>
      <div className={styles.header}>
        <h2>Clientes e Orçamentos</h2>
        <p>Gerencie todos os orçamentos enviados</p>
      </div>
      
      <div className={styles.content}>
        {quotes.filter(q => !q.completed).length === 0 ? (
          <div className={styles.placeholder}>
            <div className={styles.icon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Nenhum orçamento em andamento</h3>
            <p>Crie seu primeiro orçamento na aba "Fazer Orçamento"</p>
          </div>
        ) : (
          <div className={styles.quotesGrid}>
            {quotes.filter(q => !q.completed).map((quote) => (
              <div key={quote.id} className={styles.quoteCard}>
                <div 
                  className={styles.quoteCardClickable}
                  onClick={() => handleCardClick(quote)}
                >
                  <div className={styles.quoteHeader}>
                    <h3>{quote.clientName}</h3>
                  </div>

                  <div className={styles.quoteInfo}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Serviço:</span>
                      <span className={styles.infoValue}>{getProjectTypeLabel(quote.projectType)}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Prazo:</span>
                      <span className={styles.infoValue}>{formatDate(quote.deliveryDate)}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={styles.manageButton}
                  onClick={() => handleCardClick(quote)}
                >
                  Gerenciar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedQuote && editedQuote && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderContent}>
                <h2>{isEditing ? 'Editar Orçamento' : 'Detalhes do Orçamento'}</h2>
                {selectedQuote.completed && (
                  <span className={styles.completedBadgeLarge}>Projeto Concluído</span>
                )}
              </div>
              <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalSection}>
                  <label>Cliente:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedQuote.clientName}
                      onChange={(e) => handleEditChange('clientName', e.target.value)}
                    />
                  ) : (
                    <p>{selectedQuote.clientName}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Tipo de Projeto:</label>
                  {isEditing ? (
                    <select
                      value={editedQuote.projectType}
                      onChange={(e) => handleEditChange('projectType', e.target.value)}
                    >
                      <option value="criacao-logo">Logo</option>
                      <option value="design-post">Post</option>
                      <option value="web-design">Web</option>
                      <option value="identidade-visual">Identidade</option>
                      <option value="outro">Outro</option>
                    </select>
                  ) : (
                    <p>{getProjectTypeLabel(selectedQuote.projectType)}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Data de Entrega:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editedQuote.deliveryDate}
                      onChange={(e) => handleEditChange('deliveryDate', e.target.value)}
                    />
                  ) : (
                    <p>{formatDate(selectedQuote.deliveryDate)}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Total de Horas:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedQuote.totalHours}
                      onChange={(e) => handleEditChange('totalHours', parseFloat(e.target.value))}
                    />
                  ) : (
                    <p>{selectedQuote.totalHours}h</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Complexidade:</label>
                  {isEditing ? (
                    <select
                      value={editedQuote.complexity}
                      onChange={(e) => handleEditChange('complexity', e.target.value)}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  ) : (
                    <p>{selectedQuote.complexity === 'baixa' ? 'Baixa' : selectedQuote.complexity === 'media' ? 'Média' : 'Alta'}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Uso Comercial:</label>
                  {isEditing ? (
                    <select
                      value={editedQuote.commercialUse}
                      onChange={(e) => handleEditChange('commercialUse', e.target.value)}
                    >
                      <option value="local">Local</option>
                      <option value="regional">Regional</option>
                      <option value="nacional">Nacional</option>
                    </select>
                  ) : (
                    <p>{selectedQuote.commercialUse}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Revisões:</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedQuote.revisions}
                      onChange={(e) => handleEditChange('revisions', parseInt(e.target.value))}
                    />
                  ) : (
                    <p>{selectedQuote.revisions}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Urgente:</label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedQuote.urgency}
                      onChange={(e) => handleEditChange('urgency', e.target.checked)}
                    />
                  ) : (
                    <p>{selectedQuote.urgency ? 'Sim' : 'Não'}</p>
                  )}
                </div>

                <div className={styles.modalSection}>
                  <label>Criado em:</label>
                  <p>{formatDate(selectedQuote.createdAt)}</p>
                </div>
              </div>

              <div className={styles.modalSectionFull}>
                <label>Descrição:</label>
                {isEditing ? (
                  <textarea
                    value={editedQuote.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p>{selectedQuote.description || 'Sem descrição'}</p>
                )}
              </div>

              <div className={styles.modalSectionFull}>
                <label>Valor Final:</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editedQuote.finalPrice}
                    onChange={(e) => handleEditChange('finalPrice', parseFloat(e.target.value))}
                  />
                ) : (
                  <p className={styles.modalPrice}>{formatCurrency(selectedQuote.finalPrice)}</p>
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              {isEditing ? (
                <>
                  <button className={styles.cancelBtn} onClick={() => {
                    setEditedQuote({ ...selectedQuote });
                    setIsEditing(false);
                  }}>
                    Cancelar
                  </button>
                  <button className={styles.saveBtn} onClick={handleSaveChanges}>
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.deleteBtn} 
                    onClick={() => {
                      if (window.confirm('Deseja realmente excluir este orçamento?')) {
                        onDeleteQuote(selectedQuote.id);
                        handleCloseModal();
                      }
                    }}
                  >
                    Excluir
                  </button>
                  <div className={styles.modalActionsRight}>
                    {!selectedQuote.completed && (
                      <button 
                        className={styles.completeBtn} 
                        onClick={() => setShowCompleteConfirm(true)}
                      >
                        Concluir Projeto
                      </button>
                    )}
                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                      Editar
                    </button>
                    <button className={styles.closeBtn} onClick={handleCloseModal}>
                      Fechar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Conclusão */}
      {showCompleteConfirm && selectedQuote && (
        <div className={styles.modalOverlay} onClick={() => setShowCompleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Concluir Projeto</h3>
            <p>Tem certeza que deseja marcar o projeto <strong>{selectedQuote.clientName}</strong> como concluído?</p>
            <p className={styles.confirmNote}>Esta ação não pode ser desfeita.</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setShowCompleteConfirm(false)}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmCompleteBtn} 
                onClick={handleCompleteProject}
              >
                Sim, Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}