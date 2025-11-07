import styles from './Sidebar.module.css';
import { logoutUser } from '../services/authService';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
}

export function Sidebar({ activeTab, onTabChange, isOpen = false }: SidebarProps) {
  const menuItems = [
    { id: 'calc-hour', label: 'Calcule o Valor/Hora', disabled: false },
    { id: 'budget', label: 'Fazer Orçamento', disabled: false },
    { id: 'clients', label: 'Clientes', disabled: false },
    { id: 'profile', label: 'Perfil', disabled: false },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo}>
        <h1>CálculoCerto</h1>
      </div>
      
      <nav className={styles.navigation}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className={styles.bottomButtons}>
        <button 
          className={styles.configBtn}
          onClick={() => onTabChange('settings')}
          title="Configurações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button className={styles.layoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}