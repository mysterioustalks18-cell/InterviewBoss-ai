import React from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';

interface HologramAvatarProps {
  active?: boolean;
}

export const HologramAvatar: React.FC<HologramAvatarProps> = ({ active }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-[64px] animate-pulse" />
      
      {/* Outer Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-cyan-400/20 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 border border-purple-500/20 rounded-full"
      />

      {/* Main Avatar */}
      <div className="relative z-10 w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(0,245,255,0.2)]">
        <motion.div
          animate={active ? { 
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <User size={64} className="text-cyan-400/50" />
        </motion.div>
        
        {/* Scanning Line */}
        <motion.div
          animate={{ top: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-cyan-400/30 blur-[2px]"
        />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 3 + i, 
            repeat: Infinity, 
            delay: i * 0.5 
          }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{ 
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`
          }}
        />
      ))}
    </div>
  );
};
