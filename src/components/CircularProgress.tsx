import React from 'react';
import { motion } from 'motion/react';

interface CircularProgressProps {
  value: number;
  label: string;
  color: string;
  size?: number;
}

export const CircularProgress = ({ value, label, color, size = 100 }: CircularProgressProps) => {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            className="text-white/10"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            className="shadow-[0_0_10px_var(--stroke-color)]"
            style={{ '--stroke-color': color } as any}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">{label}</span>
    </div>
  );
};
