import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-12">
      <Logo />
      
      <div className="relative w-64 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-1/2 bg-cyan-400 shadow-[0_0_15px_#00F5FF]"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-mono uppercase tracking-[0.4em] text-cyan-400"
        >
          Analyzing Performance
        </motion.p>
        <p className="text-xs text-white/30 font-mono">Running deep neural analysis...</p>
      </div>

      {/* Scanning Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <motion.div
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
        />
      </div>
    </div>
  );
};
