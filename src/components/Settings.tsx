import { useState, useEffect } from 'react';
import styles from './Settings.module.css';
import type { SettingsData } from '../utils/settings';
import { DEFAULT_SETTINGS } from '../utils/settings';
import { useAuth } from '../contexts/AuthContext';
import { updateSettings as updateFirebaseSettings } from '../services/firestoreService';

export function Settings() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Carregar do Firebase
    if (userProfile?.settings) {
      setSettings(userProfile.settings);
    }
  }, [userProfile]);

  const handleChange = (category: keyof SettingsData, key: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object'
        ? { ...(prev[category] as any), [key]: value }
        : value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para salvar configurações');
      return;
    }

    setSaving(true);
    
    try {
      await updateFirebaseSettings(currentUser.uid, settings);
      await refreshUserProfile();
      alert('Configurações salvas com sucesso!');
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Deseja restaurar as configurações padrão?')) {
      return;
    }

    if (!currentUser) {
      alert('Você precisa estar logado');
      return;
    }

    setSettings(DEFAULT_SETTINGS);
    
    try {
      await updateFirebaseSettings(currentUser.uid, DEFAULT_SETTINGS);
      await refreshUserProfile();
      setHasChanges(false);
      alert('Configurações restauradas!');
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      alert('Erro ao restaurar configurações');
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h2>Configurações</h2>
        <p>Ajuste os multiplicadores e porcentagens usados nos cálculos de orçamento</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h3>Multiplicadores de Complexidade</h3>
          <p className={styles.description}>
            <strong>Como funciona:</strong> Multiplica o preço base (Horas × Valor/Hora) pelo fator de complexidade para adicionar margem de lucro.
            <br /><br />
            <strong>Exemplo:</strong> Se o custo base é R$ 1.000 e a complexidade é Média (2.0x), o preço será R$ 2.000 (100% de lucro sobre o custo).
          </p>
          
          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <label>Baixa Complexidade</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.complexityMultipliers.baixa}
                  onChange={(e) => handleChange('complexityMultipliers', 'baixa', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x ({((settings.complexityMultipliers.baixa - 1) * 100).toFixed(0)}% de lucro)</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>Média Complexidade</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.complexityMultipliers.media}
                  onChange={(e) => handleChange('complexityMultipliers', 'media', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x ({((settings.complexityMultipliers.media - 1) * 100).toFixed(0)}% de lucro)</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>Alta Complexidade</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.complexityMultipliers.alta}
                  onChange={(e) => handleChange('complexityMultipliers', 'alta', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x ({((settings.complexityMultipliers.alta - 1) * 100).toFixed(0)}% de lucro)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Multiplicadores de Uso Comercial</h3>
          <p className={styles.description}>
            <strong>Como funciona:</strong> Multiplica o preço (já com complexidade aplicada) pelo fator de uso comercial. Quanto maior o alcance, maior o valor.
            <br /><br />
            <strong>Exemplo:</strong> Se o preço está em R$ 2.000 e o uso é Regional (1.2x), o preço final será R$ 2.400 (+20%).
            <br />
            <strong>Uso Local:</strong> Pequenos negócios locais | <strong>Regional:</strong> Várias cidades/estado | <strong>Nacional:</strong> Todo o país
          </p>
          
          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <label>Uso Local</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.commercialUseMultipliers.local}
                  onChange={(e) => handleChange('commercialUseMultipliers', 'local', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x ({((settings.commercialUseMultipliers.local - 1) * 100).toFixed(0)}% extra)</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>Uso Regional</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.commercialUseMultipliers.regional}
                  onChange={(e) => handleChange('commercialUseMultipliers', 'regional', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x (+{((settings.commercialUseMultipliers.regional - 1) * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>Uso Nacional</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.commercialUseMultipliers.nacional}
                  onChange={(e) => handleChange('commercialUseMultipliers', 'nacional', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x (+{((settings.commercialUseMultipliers.nacional - 1) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Outros Ajustes</h3>
          <p className={styles.description}>
            <strong>Multiplicador de Urgência:</strong> Aplicado quando o checkbox "Urgente" é marcado ao criar um orçamento. Multiplica o valor já calculado (complexidade + uso comercial).
            <br /><br />
            <strong>Exemplo:</strong> Preço em R$ 2.400 × 1.3 (urgente) = R$ 3.120 (+30%).
            <br /><br />
            <strong>Faixa de Preço:</strong> Cria um intervalo de negociação. O mínimo é o valor calculado, o máximo é o mínimo + esta porcentagem.
            <br /><br />
            <strong>Exemplo:</strong> Com 30%, um projeto de R$ 3.000 terá faixa de R$ 3.000 a R$ 3.900 (você pode sugerir qualquer valor neste intervalo).
          </p>
          
          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <label>Multiplicador de Urgência</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="0.1"
                  value={settings.urgencyMultiplier}
                  onChange={(e) => handleChange('urgencyMultiplier', '', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>x (+{((settings.urgencyMultiplier - 1) * 100).toFixed(0)}%)</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>Porcentagem da Faixa de Preço</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  step="1"
                  value={settings.priceRangePercentage}
                  onChange={(e) => handleChange('priceRangePercentage', '', parseFloat(e.target.value))}
                />
                <span className={styles.suffix}>%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={saving}
          >
            Restaurar Padrão
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Salvando...' : hasChanges ? 'Salvar Alterações' : 'Salvo'}
          </button>
        </div>
      </div>
    </div>
  );
}
