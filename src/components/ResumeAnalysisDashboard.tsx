import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp,
  BarChart3,
  Sparkles,
  RefreshCcw,
  Wand2,
  FileText,
  Search,
  CheckCircle
} from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { ResumeAnalysis, ResumeData } from '../types';

interface ResumeAnalysisDashboardProps {
  analysis: ResumeAnalysis;
  resumeData: ResumeData;
  onEdit: () => void;
  onStartInterview: () => void;
  onBack: () => void;
}

export const ResumeAnalysisDashboard = ({ analysis, resumeData, onEdit, onStartInterview, onBack }: ResumeAnalysisDashboardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyan-400';
    if (score >= 60) return 'text-purple-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Medium': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Low': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 group"
      >
        <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-mono uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles size={16} />
            <span className="text-xs font-mono uppercase tracking-[0.3em]">AI Resume Analysis Complete</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Elite Hireability Report</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onEdit}>
            <RefreshCcw size={18} className="mr-2" /> Refine Architecture
          </Button>
          <Button variant="primary" onClick={onStartInterview} className="animate-pulse-glow">
            Initiate Full Simulation <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Card */}
        <GlassCard className="lg:col-span-1 p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-6">
            <span className="text-sm font-mono uppercase tracking-[0.4em] text-white/40">Elite Score</span>
            <div className={`text-[120px] font-black tracking-tighter leading-none ${getScoreColor(analysis.resume_score)}`}>
              {analysis.resume_score}
            </div>
            
            {analysis.jd_match_score !== undefined && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
                  <span>JD Sync Match</span>
                  <span className="text-purple-400">{analysis.jd_match_score}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.jd_match_score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                  />
                </div>
              </div>
            )}

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${getImpactColor(analysis.impact_level)} text-[10px] uppercase tracking-widest font-bold`}>
              {analysis.impact_level} Impact Level
            </div>
            <p className="text-white/40 text-sm max-w-[200px] mx-auto leading-relaxed">
              Your profile is {analysis.resume_score}% optimized for elite performance as {resumeData.role}.
            </p>
          </div>
          
          <div className="mt-12 w-full space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
                <span>ATS Compatibility</span>
                <span className="text-cyan-400">{analysis.ats_score}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.ats_score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-cyan-400" 
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Strengths & Weaknesses */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8 space-y-8 border-cyan-500/10 bg-cyan-500/5">
            <div className="flex items-center gap-3 text-cyan-400">
              <CheckCircle size={24} />
              <h3 className="text-xl font-bold">Key Strengths</h3>
            </div>
            <div className="space-y-4">
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-cyan-500/30 transition-colors">
                  <div className="mt-1"><Zap size={16} className="text-cyan-400" /></div>
                  <p className="text-sm text-white/70 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 space-y-8 border-red-500/10 bg-red-500/5">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold">Critical Gaps</h3>
            </div>
            <div className="space-y-4">
              {analysis.weaknesses.map((w, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-red-500/30 transition-colors">
                  <div className="mt-1"><Target size={16} className="text-red-400" /></div>
                  <p className="text-sm text-white/70 leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Keyword Gaps & Metrics */}
        <GlassCard className="p-8 space-y-8">
          <div className="flex items-center gap-3 text-purple-400">
            <Search size={24} />
            <h3 className="text-xl font-bold">Keyword Optimization</h3>
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {analysis.keyword_gaps.map((k, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
                  + {k}
                </span>
              ))}
            </div>
            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <h4 className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-4">Missing Metrics</h4>
              <ul className="space-y-3">
                {analysis.missing_metrics.map((m, i) => (
                  <li key={i} className="text-sm text-white/70 flex gap-3">
                    <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Rewrite Suggestions */}
        <GlassCard className="lg:col-span-2 p-8 space-y-8">
          <div className="flex items-center gap-3 text-cyan-400">
            <Wand2 size={24} />
            <h3 className="text-xl font-bold">AI Rewrite Suggestions</h3>
          </div>
          <div className="space-y-6">
            {analysis.rewrite_suggestions.map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 group hover:border-cyan-500/30 transition-colors">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">Original</span>
                  <p className="text-sm text-white/40 line-through">{s.original}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/60">Improved</span>
                  <p className="text-base text-white/90 font-medium">{s.improved}</p>
                </div>
                <div className="pt-4 border-t border-white/5 text-xs text-white/40 italic">
                  Reason: {s.reason}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Interview Sync CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <GlassCard className="p-16 text-center border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 opacity-50" />
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                <Trophy size={40} />
              </div>
              <h2 className="text-5xl font-bold tracking-tight">Ready for the real test?</h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto font-light">
                Your resume is optimized. Now let's see if you can defend it. Start an AI interview evolution based on your specific background.
              </p>
            </div>
            <Button variant="primary" size="lg" className="px-20 h-20 text-2xl animate-pulse-glow" onClick={onStartInterview}>
              Start Interview Evolution <ArrowRight size={24} className="ml-3" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
