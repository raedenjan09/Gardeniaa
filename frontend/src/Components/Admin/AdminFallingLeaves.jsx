import React, { useEffect, useState } from 'react';
import './AdminFallingLeaves.css';

const AdminFallingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  
  // Elegant admin-themed leaf emojis - more sophisticated and professional
  const adminLeafEmojis = ['🍃', '🌿', '✨', '🌟', '💎', '🌱', '🌸', '🌼'];
  
  // Sophisticated colors for admin interface
  const adminColors = ['#2c7a4b', '#38a169', '#2b6cb0', '#3182ce', '#553c9a', '#6b46c1', '#d53f8c', '#ed64a6'];

  useEffect(() => {
    // Generate initial leaves
    const generateLeaves = () => {
      const newLeaves = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 12 + Math.random() * 6, // Slower, more elegant fall
        opacity: 0.3 + Math.random() * 0.4,
        size: 18 + Math.random() * 24,
        rotation: Math.random() * 360,
        emoji: adminLeafEmojis[Math.floor(Math.random() * adminLeafEmojis.length)],
        color: adminColors[Math.floor(Math.random() * adminColors.length)],
        type: Math.random() > 0.7 ? 'special' : 'regular'
      }));
      setLeaves(newLeaves);
    };

    generateLeaves();

    // Periodically add new leaves (slower for more elegance)
    const interval = setInterval(() => {
      setLeaves(prev => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100,
          delay: 0,
          duration: 12 + Math.random() * 6,
          opacity: 0.3 + Math.random() * 0.4,
          size: 18 + Math.random() * 24,
          rotation: Math.random() * 360,
          emoji: adminLeafEmojis[Math.floor(Math.random() * adminLeafEmojis.length)],
          color: adminColors[Math.floor(Math.random() * adminColors.length)],
          type: Math.random() > 0.8 ? 'special' : 'regular'
        }
      ]);
    }, 3000); // Slower interval for elegance

    return () => clearInterval(interval);
  }, []);

  // Clean up old leaves
  useEffect(() => {
    const cleanup = setInterval(() => {
      setLeaves(prev => prev.slice(-25)); // Keep fewer leaves for cleaner look
    }, 4000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="admin-falling-leaves-container">
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className={`admin-leaf ${leaf.type}`}
          style={{
            left: `${leaf.left}%`,
            '--delay': `${leaf.delay}s`,
            '--duration': `${leaf.duration}s`,
            '--opacity': leaf.opacity,
            '--size': `${leaf.size}px`,
            '--rotation': `${leaf.rotation}deg`,
            '--color': leaf.color,
          }}
        >
          {leaf.emoji}
        </div>
      ))}
    </div>
  );
};

export default AdminFallingLeaves;