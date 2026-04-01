import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Target, Brain, Trophy, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface ResumeTransitionProps {
  onStart: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const ResumeTransition = ({ onStart, onBack, isLoading }: ResumeTransitionProps) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 space-y-12"
      >
        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-cyan-400 to-purple-500 p-px"
          >
            <div className="w-full h-full rounded-[39px] bg-[#0a0a0a] flex items-center justify-center text-cyan-400">
              <Brain size={64} />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-mono">
              <Sparkles size={12} className="animate-pulse" />
              <span>Resume Data Synced</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">Preparing Your Evolution.</h1>
            <p className="text-xl text-white/40 max-w-xl mx-auto font-light leading-relaxed">
              We've analyzed your resume and generated a custom interview scenario. The AI persona is ready to challenge your claims.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: <ShieldCheck className="text-cyan-400" />, title: "Custom Questions", desc: "Based on your specific experience" },
            { icon: <Zap className="text-purple-400" />, title: "EQ Detection", desc: "Analyzing your delivery and tone" },
            { icon: <Target className="text-red-400" />, title: "Hire Probability", desc: "Real-time accuracy tracking" }
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 flex flex-col items-center gap-4 border-white/5 bg-white/[0.02]">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">{item.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="flex flex-col gap-6 items-center">
          <Button 
            variant="primary" 
            size="lg" 
            className="px-20 h-20 text-2xl shadow-[0_0_50px_rgba(34,211,238,0.4)] animate-pulse-glow" 
            onClick={onStart}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Trophy size={24} className="mr-3" />}
            Enter Evolution Arena
          </Button>
          <button 
            onClick={onBack}
            className="text-xs font-mono uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
          >
            Cancel and Return
          </button>
        </div>
      </motion.div>
    </div>
  );
};
