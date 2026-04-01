import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  Target, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  History,
  Sparkles
} from 'lucide-react';
import { EvolutionAnalysis } from '../types';
import { GlassCard } from './GlassCard';

interface EvolutionDashboardProps {
  analysis: EvolutionAnalysis;
  onClose: () => void;
}

export const EvolutionDashboard = ({ analysis, onClose }: EvolutionDashboardProps) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="text-green-400" size={18} />;
      case 'declining': return <TrendingDown className="text-red-400" size={18} />;
      default: return <Minus className="text-white/40" size={18} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl my-auto"
      >
        <GlassCard className="p-8 border-white/10 bg-[#0a0a0a]/90 relative overflow-hidden">
          {/* Background Atmosphere */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter text-white">Evolution Engine</h2>
                  <p className="text-white/40 text-sm uppercase tracking-widest font-mono">Personal Growth Analysis</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Close Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Patterns & Truth */}
              <div className="lg:col-span-7 space-y-6">
                {/* Truth Insight */}
                <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-400/20 text-blue-400">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Truth Insight</h3>
                      <p className="text-lg text-white font-medium leading-relaxed italic">
                        "{analysis?.truth_insight || 'No insight available yet.'}"
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Pattern Detection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                      <History size={14} /> Pattern Detection
                    </h3>
                    <ul className="space-y-3">
                      {analysis?.pattern_detection?.map((pattern, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          {pattern}
                        </li>
                      )) || <li className="text-sm text-white/30 italic">No patterns detected yet.</li>}
                    </ul>
                  </GlassCard>

                  <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                      <Brain size={14} /> Current Analysis
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2 block">Strengths</span>
                        <div className="flex flex-wrap gap-2">
                          {analysis?.current_analysis?.strengths?.map((s, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-green-400/10 text-green-400 text-[10px] font-mono border border-green-400/20">
                              {s}
                            </span>
                          )) || <span className="text-[10px] text-white/20 italic">No strengths identified.</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 block">Weaknesses</span>
                        <div className="flex flex-wrap gap-2">
                          {analysis?.current_analysis?.weaknesses?.map((w, i) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-red-400/10 text-red-400 text-[10px] font-mono border border-red-400/20">
                              {w}
                            </span>
                          )) || <span className="text-[10px] text-white/20 italic">No weaknesses identified.</span>}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Improvement Plan */}
                <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Improvement Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis?.improvement_plan?.map((step, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">{step}</p>
                      </div>
                    )) || <p className="text-sm text-white/30 italic">No improvement plan available.</p>}
                  </div>
                </GlassCard>
              </div>

              {/* Right Column: Progress & Focus */}
              <div className="lg:col-span-5 space-y-6">
                {/* Progress Tracking */}
                <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Progress Tracking
                  </h3>
                  <div className="space-y-6">
                    {analysis?.progress_tracking?.map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white/80">{item.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/40">{item.previous}</span>
                            <ArrowRight size={12} className="text-white/20" />
                            <span className="text-sm font-bold text-white">{item.current}</span>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.current}%` }}
                            className={`h-full rounded-full ${
                              item.trend === 'improving' ? 'bg-green-400' : 
                              item.trend === 'declining' ? 'bg-red-400' : 'bg-blue-400'
                            }`}
                          />
                        </div>
                      </div>
                    )) || <p className="text-sm text-white/30 italic">No progress tracking data.</p>}
                  </div>
                </GlassCard>

                {/* Focus Area */}
                <GlassCard className="p-6 border-purple-500/20 bg-purple-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-purple-400/20 text-purple-400">
                      <Target size={20} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">Next Focus Area</h3>
                  </div>
                  <p className="text-xl font-bold text-white mb-4 leading-tight">
                    {analysis?.focus_area || 'General Improvement'}
                  </p>
                  <div className="p-4 rounded-xl bg-purple-400/10 border border-purple-400/20 text-purple-300 text-sm flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    Focusing on this will yield the highest growth in your next session.
                  </div>
                </GlassCard>

                {/* Motivation Card */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 text-center">
                  <p className="text-white/60 text-sm mb-2">Current Evolution Level</p>
                  <div className="text-4xl font-black tracking-tighter text-white mb-4">
                    STRATEGIST II
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full w-[65%] bg-gradient-to-r from-blue-400 to-purple-500" />
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">350 XP to next evolution</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
