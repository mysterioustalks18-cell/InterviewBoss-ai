import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity } from 'lucide-react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-[12px]" />
        
        {/* Main Icon */}
        <div className="relative z-10 w-10 h-10 bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Cpu size={24} className="text-cyan-400" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"
          />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tighter text-white leading-none">
          Persona<span className="text-cyan-400">OS</span>
        </h1>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-mono">Evolution Engine v2.0</span>
      </div>
    </div>
  );
};
