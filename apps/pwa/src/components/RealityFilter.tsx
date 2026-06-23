'use client';

import { useReality } from './RealityProvider';

export const RealityFilter = () => {
  const { filter, setFilter } = useReality();
  
  return (
    <div className="fixed top-4 right-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      {[
        { id: 'default' as const, label: 'Standard', icon: '🌐' },
        { id: 'ninja' as const, label: 'Ninja Vision', icon: '👁' },
        { id: 'red' as const, label: 'Protocol', icon: '🔴' }
      ].map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setFilter(id)}
          className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
            filter === id
              ? 'bg-foreground text-background'
              : 'hover:bg-foreground/10'
          }`}
          aria-pressed={filter === id}
        >
          <span className="mr-1">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}; 