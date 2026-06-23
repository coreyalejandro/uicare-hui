'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

type RealityFilter = 'default' | 'ninja' | 'red';

type RealityContextType = {
  filter: RealityFilter;
  setFilter: (filter: RealityFilter) => void;
};

const RealityContext = createContext<RealityContextType | undefined>(undefined);

export function useReality() {
  const context = useContext(RealityContext);
  if (context === undefined) {
    throw new Error('useReality must be used within a RealityProvider');
  }
  return context;
}

export function RealityProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<RealityFilter>('default');
  const { settings } = useSettings();

  useEffect(() => {
    if (filter === 'red' && settings.audioEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = settings.audioFrequency;
      gainNode.gain.value = settings.audioVolume;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 100);
    }
  }, [filter, settings.audioEnabled, settings.audioFrequency, settings.audioVolume]);

  // Calculate filter styles based on settings
  const getFilterStyle = () => {
    const baseStyle: React.CSSProperties = {
      minHeight: '100vh',
      transition: 'all 0.5s ease-in-out',
    };

    if (filter === 'ninja') {
      const intensity = settings.filterIntensity.ninja;
      return {
        ...baseStyle,
        filter: `contrast(${1.3 * intensity}) brightness(${0.7 * intensity}) saturate(${1.4 * intensity})`,
        background: `linear-gradient(rgba(0, 0, 0, ${0.1 * intensity}), rgba(0, 0, 0, ${0.1 * intensity}))`,
      };
    }

    if (filter === 'red') {
      const intensity = settings.filterIntensity.protocol;
      return {
        ...baseStyle,
        filter: `sepia(${1 * intensity}) hue-rotate(${320 * intensity}deg) saturate(${2.5 * intensity})`,
        background: `linear-gradient(rgba(255, 0, 0, ${0.05 * intensity}), rgba(255, 0, 0, ${0.05 * intensity}))`,
      };
    }

    return baseStyle;
  };

  const value = {
    filter,
    setFilter,
  };

  return (
    <RealityContext.Provider value={value}>
      <div style={getFilterStyle()}>
        {children}
      </div>
    </RealityContext.Provider>
  );
} 