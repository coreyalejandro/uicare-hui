'use client';

import { useState } from 'react';
import { useSettings } from './SettingsContext';

export default function SettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-foreground/10 backdrop-blur-sm hover:bg-foreground/20 transition-colors"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 w-80 bg-background/90 backdrop-blur-sm border border-foreground/20 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          
          <div className="space-y-4">
            {/* Audio Settings */}
            <div>
              <h4 className="font-medium mb-2">Audio Feedback</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.audioEnabled}
                    onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
                    className="rounded border-foreground/20"
                  />
                  <span>Enable Audio</span>
                </label>
                
                <div>
                  <label className="block text-sm mb-1">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.audioVolume}
                    onChange={(e) => updateSettings({ audioVolume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Frequency (Hz)</label>
                  <input
                    type="range"
                    min="220"
                    max="880"
                    step="1"
                    value={settings.audioFrequency}
                    onChange={(e) => updateSettings({ audioFrequency: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Filter Intensity Settings */}
            <div>
              <h4 className="font-medium mb-2">Filter Intensity</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">Ninja Vision</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.filterIntensity.ninja}
                    onChange={(e) => updateSettings({
                      filterIntensity: {
                        ...settings.filterIntensity,
                        ninja: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Protocol</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.filterIntensity.protocol}
                    onChange={(e) => updateSettings({
                      filterIntensity: {
                        ...settings.filterIntensity,
                        protocol: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 