import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hover = true, onClick }) => {
  return (
    <motion.div 
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      onClick={onClick}
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all duration-300",
        hover && "hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
