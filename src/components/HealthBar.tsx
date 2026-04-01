import React from 'react';
import { motion } from 'motion/react';

interface HealthBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  isPersona?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ label, value, max, color, isPersona }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/50">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};
