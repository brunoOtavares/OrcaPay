import { useEffect, useState } from 'react';

interface HeaderProps {
  activeTab: string;
}

export function Header({ }: HeaderProps) {
  const [, setHourlyRate] = useState<number | null>(null);

  useEffect(() => {
    const loadHourlyRate = () => {
      const savedRate = localStorage.getItem('calculocerto_hourly_rate');
      if (savedRate) {
        setHourlyRate(parseFloat(savedRate));
      } else {
        setHourlyRate(null);
      }
    };

    // Carrega inicialmente
    loadHourlyRate();

    // Adiciona evento para detectar mudanças no localStorage
    window.addEventListener('storage', loadHourlyRate);

    // Cleanup do evento
    return () => {
      window.removeEventListener('storage', loadHourlyRate);
    };
  }, []);

  // Não mostra mais o valor/hora em nenhuma página
  return null;
}