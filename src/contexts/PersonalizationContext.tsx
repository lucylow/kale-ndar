import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PersonalizationSettings {
  dashboardLayout: 'grid' | 'list' | 'compact';
  favoriteMarkets: string[];
  favoriteCategories: string[];
  notificationPreferences: {
    marketUpdates: boolean;
    priceAlerts: boolean;
    newMarkets: boolean;
    weeklyDigest: boolean;
    pushNotifications: boolean;
  };
  displayPreferences: {
    showTutorialTips: boolean;
    autoRefresh: boolean;
    compactMode: boolean;
    showAdvancedMetrics: boolean;
  };
  language: string;
  theme: 'dark' | 'light' | 'system';
}

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (updates: Partial<PersonalizationSettings>) => void;
  addFavoriteMarket: (marketId: string) => void;
  removeFavoriteMarket: (marketId: string) => void;
  addFavoriteCategory: (category: string) => void;
  removeFavoriteCategory: (category: string) => void;
  isMarketFavorite: (marketId: string) => boolean;
  isCategoryFavorite: (category: string) => boolean;
  resetSettings: () => void;
}

const defaultSettings: PersonalizationSettings = {
  dashboardLayout: 'grid',
  favoriteMarkets: [],
  favoriteCategories: [],
  notificationPreferences: {
    marketUpdates: true,
    priceAlerts: true,
    newMarkets: true,
    weeklyDigest: false,
    pushNotifications: false,
  },
  displayPreferences: {
    showTutorialTips: true,
    autoRefresh: true,
    compactMode: false,
    showAdvancedMetrics: false,
  },
  language: 'en',
  theme: 'dark',
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

interface PersonalizationProviderProps {
  children: ReactNode;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    const stored = localStorage.getItem('kale-personalization');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('kale-personalization', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<PersonalizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addFavoriteMarket = (marketId: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteMarkets: [...prev.favoriteMarkets.filter(id => id !== marketId), marketId]
    }));
  };

  const removeFavoriteMarket = (marketId: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteMarkets: prev.favoriteMarkets.filter(id => id !== marketId)
    }));
  };

  const addFavoriteCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteCategories: [...prev.favoriteCategories.filter(cat => cat !== category), category]
    }));
  };

  const removeFavoriteCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.filter(cat => cat !== category)
    }));
  };

  const isMarketFavorite = (marketId: string) => {
    return settings.favoriteMarkets.includes(marketId);
  };

  const isCategoryFavorite = (category: string) => {
    return settings.favoriteCategories.includes(category);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('kale-personalization');
  };

  return (
    <PersonalizationContext.Provider value={{
      settings,
      updateSettings,
      addFavoriteMarket,
      removeFavoriteMarket,
      addFavoriteCategory,
      removeFavoriteCategory,
      isMarketFavorite,
      isCategoryFavorite,
      resetSettings,
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};