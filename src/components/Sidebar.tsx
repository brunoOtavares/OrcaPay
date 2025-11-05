import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [hasHourlyRate, setHasHourlyRate] = useState(false);

  useEffect(() => {
    const checkHourlyRate = () => {
      const hourlyRate = localStorage.getItem('orcapay_hourly_rate');
      setHasHourlyRate(!!hourlyRate);
    };

    // Initial check
    checkHourlyRate();

    // Listen for custom hourly rate update events
    const handleHourlyRateUpdate = () => {
      checkHourlyRate();
    };

    window.addEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    
    return () => {
      window.removeEventListener('hourlyRateUpdated', handleHourlyRateUpdate);
    };
  }, []);

  const menuItems = [
    { id: 'calc-hour', label: 'Calcule o Valor/Hora', disabled: false },
    { id: 'budget', label: 'Fazer Orçamento', disabled: false },
    { id: 'clients', label: 'Clientes', disabled: false },
    { id: 'profile', label: 'Perfil', disabled: false },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>OrçaPay</h1>
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
      
      <div className={styles.layoutButton}>
        <button className={styles.layoutBtn}>
          Layout
        </button>
      </div>
    </div>
  );
}