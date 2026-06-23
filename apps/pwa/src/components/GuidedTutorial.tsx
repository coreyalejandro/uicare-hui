"use client";

import React, { useState } from "react";

export interface TutorialStep {
  text: string;
  image?: string;
  audio?: string;
  warnings?: string[];
}

export interface Tutorial {
  title: string;
  steps: TutorialStep[];
}

interface GuidedTutorialProps {
  tutorial: Tutorial;
  onFinish?: () => void;
}

const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ tutorial, onFinish }) => {
  const [index, setIndex] = useState(0);
  const step = tutorial.steps[index];

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white text-black p-4 rounded max-w-md w-full">
        <h2 className="font-bold mb-2">{tutorial.title}</h2>
        <p className="mb-2">{step.text}</p>
        {step.image && (
          <img src={step.image} alt={step.text} className="mb-2 max-w-full h-auto" />
        )}
        {step.audio && (
          <audio controls src={step.audio} data-testid="audio" className="mb-2">
            Your browser does not support the audio element.
          </audio>
        )}
        {step.warnings && step.warnings.length > 0 && (
          <ul className="list-disc pl-4 mb-2">
            {step.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
        <button
          className="bg-accent text-accent-foreground rounded px-4 py-2"
          onClick={() => {
            if (index < tutorial.steps.length - 1) {
              setIndex((i) => i + 1);
            } else {
              onFinish?.();
            }
          }}
        >
          {index < tutorial.steps.length - 1 ? "Next" : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default GuidedTutorial;
