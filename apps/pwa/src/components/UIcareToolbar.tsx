'use client';

import { useState, useEffect } from 'react';
import { useReality } from './RealityProvider';
import { useSettings } from './SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

export function UIcareToolbar() {
  const { filter, setFilter } = useReality();
  const { settings, updateSettings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Handle toolbar position persistence
  useEffect(() => {
    const savedPosition = localStorage.getItem('uicareToolbarPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    const newPosition = { x: position.x + info.offset.x, y: position.y + info.offset.y };
    setPosition(newPosition);
    localStorage.setItem('uicareToolbarPosition', JSON.stringify(newPosition));
    setIsDragging(false);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={{ x: position.x, y: position.y }}
      className="fixed top-4 left-4 z-50"
    >
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : '48px',
          width: isExpanded ? '320px' : '48px',
        }}
        className="bg-black/80 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
      >
        {/* Toolbar Header */}
        <div 
          className="h-12 flex items-center px-3 cursor-move"
          onMouseEnter={() => !isDragging && setIsExpanded(true)}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xs">UI</span>
          </button>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="ml-3 text-white/90 font-medium"
              >
                UICare Controls
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 pb-4"
              onMouseLeave={() => setIsExpanded(false)}
            >
              {/* Reality Filters */}
              <div className="mb-4">
                <h3 className="text-white/80 text-sm font-medium mb-2">Reality Filter</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['default', 'ninja', 'red'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilter(mode as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === mode
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Settings */}
              <div className="mb-4">
                <h3 className="text-white/80 text-sm font-medium mb-2">Audio Feedback</h3>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.audioEnabled}
                    onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
                    className="rounded border-white/20 bg-white/5"
                  />
                  <span className="text-white/70 text-sm">Enable Audio</span>
                </label>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.audioVolume}
                      onChange={(e) => updateSettings({ audioVolume: parseFloat(e.target.value) })}
                      className="w-full accent-white/70"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Frequency</label>
                    <input
                      type="range"
                      min="220"
                      max="880"
                      step="1"
                      value={settings.audioFrequency}
                      onChange={(e) => updateSettings({ audioFrequency: parseInt(e.target.value) })}
                      className="w-full accent-white/70"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Intensity */}
              <div>
                <h3 className="text-white/80 text-sm font-medium mb-2">Filter Intensity</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Ninja Mode</label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={settings.filterIntensity.ninja}
                      onChange={(e) => updateSettings({
                        filterIntensity: {
                          ...settings.filterIntensity,
                          ninja: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full accent-white/70"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Protocol Mode</label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={settings.filterIntensity.protocol}
                      onChange={(e) => updateSettings({
                        filterIntensity: {
                          ...settings.filterIntensity,
                          protocol: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full accent-white/70"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 