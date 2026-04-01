import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RefreshCcw, 
  Share2, 
  Copy, 
  Shield, 
  Zap, 
  Trophy,
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { AnalysisResult, EvolutionState } from '../types';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { cn } from '../lib/utils';

interface ResultsScreenProps {
  result: AnalysisResult;
  state: EvolutionState;
  onRetry: () => void;
  isAuthenticated?: boolean;
  onSignUp?: () => void;
}

const TypewriterText = ({ text, speed = 20, onComplete, className }: { text: string; speed?: number; onComplete?: () => void; className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <div className={className}>{displayedText}</div>;
};

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}</span>;
};

export const ResultsScreen = ({ result, state, onRetry, isAuthenticated = true, onSignUp }: ResultsScreenProps) => {
  const [mode, setMode] = useState<'professional' | 'savage'>('professional');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isFeedbackComplete, setIsFeedbackComplete] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    // Check if user leveled up
    const earnedXp = Math.round(result.hire_probability * 10);
    const oldLevel = Math.floor((state.xp - earnedXp) / 1000) + 1;
    const newLevel = Math.floor(state.xp / 1000) + 1;
    
    if (newLevel > oldLevel) {
      setTimeout(() => setShowLevelUp(true), 2000);
    }
  }, [result.hire_probability, state.xp]);

  const getVerdict = () => {
    if (result.hire_probability >= 80) return { label: "Hireable", icon: <CheckCircle2 className="text-green-400" />, color: "text-green-400", bg: "bg-green-400/10" };
    if (result.hire_probability >= 50) return { label: "Needs Work", icon: <AlertCircle className="text-yellow-400" />, color: "text-yellow-400", bg: "bg-yellow-400/10" };
    return { label: "Not Ready", icon: <XCircle className="text-red-400" />, color: "text-red-400", bg: "bg-red-400/10" };
  };

  const verdict = getVerdict();

  const stats = [
    { label: "Clarity", value: result.clarity },
    { label: "Confidence", value: result.confidence },
    { label: "Structure", value: result.structure },
    { label: "Relevance", value: result.relevance },
    { label: "Authenticity", value: result.authenticity },
    { label: "EQ Score", value: result.eq_score },
    { label: "Pace", value: result.pace_score },
    { label: "Tech Depth", value: result.technical_depth },
    { label: "Alignment", value: result.strategic_alignment },
  ];

  return (
    <div className={cn(
      "flex flex-col min-h-screen p-6 gap-8 max-w-5xl mx-auto pb-24 transition-all duration-500",
      mode === 'savage' && "animate-red-flash"
    )}>
      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center animate-level-up"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"
                />
                <Trophy size={120} className="text-purple-400 relative z-10 mb-6 mx-auto" />
              </div>
              <h2 className="text-6xl font-black tracking-tighter text-white mb-2">LEVEL UP</h2>
              <p className="text-purple-400 font-mono tracking-[0.3em] uppercase">You are now a {state.level === 4 ? 'Evolution Master' : state.level === 3 ? 'Confident Speaker' : 'Rising Talent'}</p>
              <div className="mt-12 text-white/40 text-xs animate-pulse">Click anywhere to continue</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: Hire Probability or Practice Title */}
      <div className="flex flex-col items-center gap-4 py-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-mono"
        >
          {state.mode === 'PRACTICE' ? 'Practice Session Complete' : 'Analysis Complete'}
        </motion.div>
        
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "absolute inset-0 blur-[64px] rounded-full",
              state.mode === 'PRACTICE' ? "bg-purple-400/20" : "bg-cyan-400/20"
            )}
          />
          {state.mode === 'PRACTICE' ? (
            <h2 className="text-5xl font-bold text-white tracking-tighter relative z-10 text-center">
              Growth <span className="text-purple-400">Unlocked</span>
            </h2>
          ) : (
            <h2 className="text-7xl font-bold text-white tracking-tighter relative z-10">
              <CountUp end={result.hire_probability} />%
            </h2>
          )}
        </div>
        
        {state.mode !== 'PRACTICE' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={cn(
              "px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 backdrop-blur-md",
              verdict.bg
            )}
          >
            {verdict.icon}
            <span className={cn("text-xs font-bold uppercase tracking-widest font-mono", verdict.color)}>
              {verdict.label}
            </span>
          </motion.div>
        )}
      </div>

      {/* Stats Grid - De-emphasized for Practice */}
      <div className={cn(
        "grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4",
        state.mode === 'PRACTICE' && "opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
      )}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.5 }}
          >
            <GlassCard className="p-4 flex flex-col items-center gap-2 text-center group hover:border-cyan-400/40 transition-colors">
              <span className="text-[8px] uppercase tracking-widest text-white/40 font-mono">{stat.label}</span>
              <span className="text-xl font-bold text-white"><CountUp end={stat.value} duration={1.5} /></span>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.value}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                  className="h-full bg-cyan-400"
                />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Feedback & Improved Answer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feedback Section */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <GlassCard className={cn(
            "p-8 flex flex-col gap-6 transition-all duration-300",
            mode === 'savage' && "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] animate-screen-shake"
          )}>
            <div className="flex items-center justify-between">
              <h3 className={cn(
                "text-lg font-bold flex items-center gap-2",
                mode === 'savage' ? "text-red-400 glitch-effect" : "text-white"
              )} data-text="Performance Feedback">
                <Zap className={mode === 'savage' ? "text-red-400" : "text-yellow-400"} size={18} />
                Performance Feedback
              </h3>
              
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => { setMode('professional'); setIsFeedbackComplete(false); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all",
                    mode === 'professional' ? "bg-white/10 text-white shadow-lg" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Professional
                </button>
                <button
                  onClick={() => { setMode('savage'); setIsFeedbackComplete(false); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all",
                    mode === 'savage' ? "bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "text-white/30 hover:text-white/60"
                  )}
                >
                  Savage
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "text-sm leading-relaxed min-h-[80px]",
                  mode === 'savage' ? "text-red-100 italic" : "text-white/70"
                )}
              >
                <TypewriterText 
                  text={mode === 'professional' ? result.professional_feedback : result.savage_feedback} 
                  speed={15}
                  onComplete={() => setIsFeedbackComplete(true)}
                />
              </motion.div>
            </AnimatePresence>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isFeedbackComplete ? 1 : 0 }}
              className="flex flex-col gap-3 pt-4 border-t border-white/10"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">Key Takeaways</span>
              <div className="grid grid-cols-1 gap-2">
                {result.key_takeaways.map((point, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs text-white/60"
                  >
                    <ChevronRight size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </GlassCard>

          <GlassCard className="p-8 border-cyan-400/20 group hover:border-cyan-400/40 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                <Sparkles size={18} className="animate-pulse" />
                Improved Answer
              </h3>
              <button 
                onClick={() => navigator.clipboard.writeText(result.improved_answer)}
                className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/30 hover:text-white"
              >
                <Copy size={16} />
              </button>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-white/80 leading-relaxed italic"
            >
              "{result.improved_answer}"
            </motion.p>
          </GlassCard>
        </div>

        {/* Gamification & Share */}
        <div className="flex flex-col gap-6">
          {state.mode === 'EVOLUTION' && (
            <GlassCard className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 overflow-hidden relative">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-[40px] rounded-full"
              />
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                  <Trophy className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="font-bold">Level {state.level}</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Evolution Progress</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-white/40">{state.xp % 1000} / 1000 XP</span>
                  <span className="text-purple-400">+{Math.round(result.hire_probability * 10)} XP</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(state.xp % 1000) / 10}%` }}
                    transition={{ duration: 2, ease: "circOut", delay: 1 }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  />
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 font-mono">Confidence Trend</h4>
              <TrendingUp size={14} className="text-cyan-400" />
            </div>
            <div className="h-24 w-full relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                <motion.path
                  d="M 0 60 Q 50 20 100 50 T 200 10 T 300 40 T 400 20"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6C5CE7" />
                    <stop offset="100%" stopColor="#00F5FF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-white/20 font-mono uppercase">
                <span>Start</span>
                <span>Mid</span>
                <span>End</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 font-mono">Reality Check</h4>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/60 leading-relaxed italic">
              <TypewriterText text={result.confidence_analysis} speed={30} />
            </div>
          </GlassCard>

          <div className="flex flex-col gap-3">
            {!isAuthenticated && (
              <GlassCard className="p-6 border-cyan-400/30 bg-cyan-400/5 mb-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-400/20 rounded-lg">
                    <TrendingUp size={16} className="text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-sm">Save Your Progress</h4>
                </div>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  You've just completed a high-value simulation. Create an account to track your <span className="text-white">Interview Readiness Score</span> and unlock personalized growth paths.
                </p>
                <Button variant="primary" className="w-full h-10 text-sm" onClick={onSignUp}>
                  Claim Your Profile
                </Button>
              </GlassCard>
            )}
            <Button variant="primary" className="w-full h-14 text-lg" onClick={onRetry}>
              <RefreshCcw size={18} className="mr-2" /> {state.mode === 'EVOLUTION' ? 'Retry Evolution' : 'Practice Again'}
            </Button>
            <Button variant="outline" className="w-full h-14 text-lg">
              <Share2 size={18} className="mr-2" /> Share Results
            </Button>
            <Button variant="ghost" className="w-full h-10 text-xs text-white/40 hover:text-white" onClick={onRetry}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Combined Career Report (if resume was used) */}
      {state.resumeAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8"
        >
          <GlassCard className="p-8 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Shield className="text-purple-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Combined Career Report</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Resume + Interview Analysis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-2 p-6 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Resume Score</span>
                <span className="text-4xl font-black text-purple-400">{state.resumeAnalysis.resume_score}%</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Interview Score</span>
                <span className="text-4xl font-black text-cyan-400">{result.hire_probability}%</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Final Hire Probability</span>
                <span className="text-4xl font-black text-white">
                  {Math.round((state.resumeAnalysis.resume_score * 0.4) + (result.hire_probability * 0.6))}%
                </span>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono mb-4">Strategic Career Insight</h4>
              <p className="text-sm text-white/70 leading-relaxed italic">
                Based on your resume's impact level ({state.resumeAnalysis.impact_level}) and your interview performance, 
                you are currently positioned in the top {100 - Math.round((state.resumeAnalysis.resume_score * 0.4) + (result.hire_probability * 0.6))}% 
                of candidates for this role. Focus on addressing the {state.resumeAnalysis.weaknesses[0]} in your resume 
                while maintaining the {result.confidence > 80 ? 'high confidence' : 'clarity'} shown in your interview.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};
