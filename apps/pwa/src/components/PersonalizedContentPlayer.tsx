'use client';

import React, { useState } from 'react';

interface PersonalizedContentPlayerProps {
  queue: string[];
}

function getMediaType(url: string) {
  const ext = url.split('.').pop()?.toLowerCase();
  if (!ext) return 'unknown';
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
  if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
  return 'unknown';
}

export default function PersonalizedContentPlayer({ queue }: PersonalizedContentPlayerProps) {
  const [index, setIndex] = useState(0);
  const current = queue[index];
  const type = current ? getMediaType(current) : 'unknown';

  const next = () => setIndex((i) => (i + 1) % queue.length);
  const prev = () => setIndex((i) => (i - 1 + queue.length) % queue.length);

  if (!current) return null;

  return (
    <div className="p-4 border rounded-md bg-background/80">
      {type === 'audio' && (
        <audio src={current} controls autoPlay onEnded={next} className="w-full" />
      )}
      {type === 'video' && (
        <video src={current} controls autoPlay onEnded={next} className="w-full" />
      )}
      {type === 'image' && (
        <img src={current} alt="calming content" className="mx-auto" />
      )}
      <div className="flex justify-between mt-2">
        <button onClick={prev} aria-label="Previous" className="px-2 py-1 border rounded">
          Prev
        </button>
        <span>
          {index + 1} / {queue.length}
        </span>
        <button onClick={next} aria-label="Next" className="px-2 py-1 border rounded">
          Next
        </button>
      </div>
    </div>
  );
}

