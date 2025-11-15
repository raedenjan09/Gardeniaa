import React, { useEffect, useState } from 'react';
import './FallingLeaves.css';

const FallingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const leafEmojis = ['🍃', '🍂', '🌿', '🍁']; // Mix of green and autumn leaves

  useEffect(() => {
    // Generate initial leaves
    const generateLeaves = () => {
      const newLeaves = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 8 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.5,
        size: 22 + Math.random() * 32,
        rotation: Math.random() * 360,
        emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
      }));
      setLeaves(newLeaves);
    };

    generateLeaves();

    // Periodically add new leaves
    const interval = setInterval(() => {
      setLeaves(prev => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100,
          delay: 0,
          duration: 8 + Math.random() * 4,
          opacity: 0.4 + Math.random() * 0.5,
          size: 22 + Math.random() * 32,
          rotation: Math.random() * 360,
          emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Clean up old leaves to avoid memory bloat
  useEffect(() => {
    const cleanup = setInterval(() => {
      setLeaves(prev => prev.slice(-30)); // Keep only the last 30 leaves
    }, 3000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="falling-leaves-container">
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="leaf"
          style={{
            left: `${leaf.left}%`,
            '--delay': `${leaf.delay}s`,
            '--duration': `${leaf.duration}s`,
            '--opacity': leaf.opacity,
            '--size': `${leaf.size}px`,
            '--rotation': `${leaf.rotation}deg`,
          }}
        >
          {leaf.emoji}
        </div>
      ))}
    </div>
  );
};

export default FallingLeaves;
