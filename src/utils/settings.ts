export interface SettingsData {
  complexityMultipliers: {
    baixa: number;
    media: number;
    alta: number;
  };
  commercialUseMultipliers: {
    local: number;
    regional: number;
    nacional: number;
  };
  urgencyMultiplier: number;
  priceRangePercentage: number;
}

export const DEFAULT_SETTINGS: SettingsData = {
  complexityMultipliers: {
    baixa: 1.5,
    media: 2.0,
    alta: 2.5,
  },
  commercialUseMultipliers: {
    local: 1.0,
    regional: 1.2,
    nacional: 1.5,
  },
  urgencyMultiplier: 1.3,
  priceRangePercentage: 30,
};

const STORAGE_KEY = 'orcapay_settings';

export function getSettings(): SettingsData {
  const savedSettings = localStorage.getItem(STORAGE_KEY);
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: SettingsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
