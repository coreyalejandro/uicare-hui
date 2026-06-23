'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FilterIntensity {
  ninja: number;
  protocol: number;
}

interface Settings {
  audioEnabled: boolean;
  audioVolume: number;
  audioFrequency: number;
  filterIntensity: FilterIntensity;
  theme: 'system' | 'light' | 'dark';
  reducedMotion: boolean;
  highContrast: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  audioEnabled: false,
  audioVolume: 0.5,
  audioFrequency: 440,
  filterIntensity: {
    ninja: 1,
    protocol: 1,
  },
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('uicareSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...parsedSettings,
        }));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        filterIntensity: {
          ...prevSettings.filterIntensity,
          ...(newSettings.filterIntensity || {}),
        },
      };
      localStorage.setItem('uicareSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 