'use client';

import { useState } from 'react';

export const NinjaPresence = () => {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div 
      className={`fixed bottom-4 right-4 w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-sm cursor-pointer transition-all duration-300 flex items-center justify-center ${
        isActive ? 'scale-110 bg-foreground/20' : 'hover:bg-foreground/15'
      }`}
      onClick={() => {
        setIsActive(!isActive);
        alert('👁 Ninja Mode ' + (isActive ? 'Deactivated' : 'Activated'));
      }}
    >
      <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        👁
      </span>
    </div>
  );
}; 