import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.markets': 'Markets',
    'nav.portfolio': 'Portfolio',
    'nav.settings': 'Settings',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'markets.title': 'Prediction Markets',
    'markets.bet_for': 'Bet FOR',
    'markets.bet_against': 'Bet AGAINST',
    'markets.total_volume': 'Total Volume',
    'markets.active_markets': 'Active Markets',
    'markets.avg_roi': 'Avg. ROI',
    'wallet.connect': 'Connect Wallet',
    'wallet.connected': 'Connected',
    'wallet.disconnect': 'Disconnect',
    'tutorial.welcome': 'Welcome to KALE-ndar!',
    'tutorial.step': 'Step',
    'tutorial.complete': 'Complete',
    'tutorial.skip': 'Skip Tutorial',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'accessibility.skip_to_content': 'Skip to main content',
    'accessibility.menu': 'Menu',
    'accessibility.close': 'Close',
  },
  es: {
    'nav.dashboard': 'Tablero',
    'nav.markets': 'Mercados',
    'nav.portfolio': 'Portafolio',
    'nav.settings': 'Configuración',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'markets.title': 'Mercados de Predicción',
    'markets.bet_for': 'Apostar A FAVOR',
    'markets.bet_against': 'Apostar EN CONTRA',
    'markets.total_volume': 'Volumen Total',
    'markets.active_markets': 'Mercados Activos',
    'markets.avg_roi': 'ROI Promedio',
    'wallet.connect': 'Conectar Billetera',
    'wallet.connected': 'Conectado',
    'wallet.disconnect': 'Desconectar',
    'tutorial.welcome': '¡Bienvenido a KALE-ndar!',
    'tutorial.step': 'Paso',
    'tutorial.complete': 'Completar',
    'tutorial.skip': 'Saltar Tutorial',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notificaciones',
    'accessibility.skip_to_content': 'Saltar al contenido principal',
    'accessibility.menu': 'Menú',
    'accessibility.close': 'Cerrar',
  },
  fr: {
    'nav.dashboard': 'Tableau de Bord',
    'nav.markets': 'Marchés',
    'nav.portfolio': 'Portefeuille',
    'nav.settings': 'Paramètres',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Sauvegarder',
    'markets.title': 'Marchés de Prédiction',
    'markets.bet_for': 'Parier POUR',
    'markets.bet_against': 'Parier CONTRE',
    'markets.total_volume': 'Volume Total',
    'markets.active_markets': 'Marchés Actifs',
    'markets.avg_roi': 'ROI Moyen',
    'wallet.connect': 'Connecter Portefeuille',
    'wallet.connected': 'Connecté',
    'wallet.disconnect': 'Déconnecter',
    'tutorial.welcome': 'Bienvenue à KALE-ndar!',
    'tutorial.step': 'Étape',
    'tutorial.complete': 'Terminer',
    'tutorial.skip': 'Passer le Tutoriel',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.notifications': 'Notifications',
    'accessibility.skip_to_content': 'Aller au contenu principal',
    'accessibility.menu': 'Menu',
    'accessibility.close': 'Fermer',
  }
};

interface I18nContextType {
  currentLanguage: Language;
  supportedLanguages: Language[];
  setLanguage: (languageCode: string) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('kale-language');
    const browserLang = navigator.language.split('-')[0];
    const langCode = stored || browserLang || 'en';
    return supportedLanguages.find(lang => lang.code === langCode) || supportedLanguages[0];
  });

  const setLanguage = (languageCode: string) => {
    const language = supportedLanguages.find(lang => lang.code === languageCode);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('kale-language', languageCode);
      document.documentElement.lang = languageCode;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langTranslations = translations[currentLanguage.code];
    return langTranslations?.[key] || translations.en[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{
      currentLanguage,
      supportedLanguages,
      setLanguage,
      t,
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};