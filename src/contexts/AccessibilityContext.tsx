import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  focusVisible: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  focusVisible: true,
  fontSize: 'medium',
  keyboardNavigation: true,
  screenReader: false,
  colorBlindMode: 'none',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Initialize with default settings to avoid browser API access during render
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Use useEffect for initialization to avoid SSR/hydration issues
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kale-accessibility');
      const userSettings = stored ? JSON.parse(stored) : {};
      
      // Detect user preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      const initialSettings = {
        ...defaultSettings,
        ...userSettings,
        reducedMotion: userSettings.reducedMotion ?? prefersReducedMotion,
        highContrast: userSettings.highContrast ?? prefersHighContrast,
      };
      
      setSettings(initialSettings);
    } catch (error) {
      console.warn('Failed to initialize accessibility settings:', error);
    }
  }, []);

  const [announcer, setAnnouncer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create screen reader announcer element
    const announcerElement = document.createElement('div');
    announcerElement.setAttribute('aria-live', 'polite');
    announcerElement.setAttribute('aria-atomic', 'true');
    announcerElement.style.position = 'absolute';
    announcerElement.style.left = '-10000px';
    announcerElement.style.width = '1px';
    announcerElement.style.height = '1px';
    announcerElement.style.overflow = 'hidden';
    document.body.appendChild(announcerElement);
    setAnnouncer(announcerElement);

    return () => {
      if (announcerElement.parentNode) {
        announcerElement.parentNode.removeChild(announcerElement);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kale-accessibility', JSON.stringify(settings));
    
    const root = document.documentElement;
    
    // Apply high contrast mode
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Apply reduced motion
    root.classList.toggle('reduce-motion', settings.reducedMotion);
    
    // Apply font size
    root.setAttribute('data-font-size', settings.fontSize);
    
    // Apply color blind mode
    root.setAttribute('data-color-blind', settings.colorBlindMode);
    
    // Apply focus visible
    root.classList.toggle('focus-visible', settings.focusVisible);
    
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('kale-accessibility');
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      // Clear the message after a short delay
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      announceToScreenReader,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};