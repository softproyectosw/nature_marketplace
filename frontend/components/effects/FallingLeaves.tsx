'use client';

import { useEffect, useState } from 'react';

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export function FallingLeaves({ count = 15 }: { count?: number }) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const newLeaves: Leaf[] = [];
    for (let i = 0; i < count; i++) {
      newLeaves.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 8,
        size: 12 + Math.random() * 16,
        rotation: Math.random() * 360,
      });
    }
    setLeaves(newLeaves);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-fall"
          style={{
            left: `${leaf.left}%`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${leaf.rotation}deg)` }}
            className="text-primary/60"
          >
            <path
              fill="currentColor"
              d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
