'use client';

import React from 'react';
import { FutureState } from '@/lib/proactiveAgent';

interface Props {
  simulations: FutureState[];
  onClose: () => void;
}

export default function FutureSimulations({ simulations, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white text-black p-4 rounded max-w-lg max-h-full overflow-auto">
        <h2 className="font-bold mb-2">Future Simulations</h2>
        <div className="space-y-4">
          {simulations.map(sim => (
            <div key={sim.branch}>
              <h3 className="font-semibold">{sim.branch}</h3>
              <p className="text-sm mb-2">{sim.summary}</p>
              <ol className="list-decimal pl-4 text-sm">
                {sim.timeline.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <button
          className="mt-4 bg-accent text-accent-foreground rounded px-4 py-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
