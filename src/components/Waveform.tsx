import React from 'react';
import { motion } from 'motion/react';

interface WaveformProps {
  isAnimating?: boolean;
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({ isAnimating, color = "#22d3ee" }) => {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={isAnimating ? { 
            height: [4, 16, 8, 24, 4],
            opacity: [0.3, 0.8, 0.5, 1, 0.3]
          } : { height: 4, opacity: 0.2 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{ backgroundColor: color }}
          className="w-1 rounded-full"
        />
      ))}
    </div>
  );
};
