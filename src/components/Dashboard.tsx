import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  MessageSquare, 
  Code,
  ShieldCheck, 
  Mail, 
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  Target,
  Award,
  Activity,
  BrainCircuit,
  Flame,
  Trophy,
  Star,
  Sparkles,
  Layout,
  ArrowRight
} from 'lucide-react';
import { db, collection, getDocs, query, where, orderBy, limit, handleFirestoreError, OperationType } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { GlassCard } from './GlassCard';

import { VerificationBanner } from './VerificationBanner';

interface DashboardProps {
  onNavigate: (screen: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    resumes: 0,
    interviews: 0,
    smartInterviews: 0,
    codeAudits: 0,
    avgScore: 0,
    jobReadiness: 0,
    xp: 1250,
    level: 12,
    streak: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      try {
        const [resumesSnap, interviewsSnap, smartInterviewsSnap, auditsSnap] = await Promise.all([
          getDocs(query(collection(db, 'resumes'), where('userId', '==', userId))).catch(e => handleFirestoreError(e, OperationType.GET, 'resumes')),
          getDocs(query(collection(db, 'interviews'), where('userId', '==', userId))).catch(e => handleFirestoreError(e, OperationType.GET, 'interviews')),
          getDocs(query(collection(db, 'smart_interviews'), where('userId', '==', userId))).catch(e => handleFirestoreError(e, OperationType.GET, 'smart_interviews')),
          getDocs(query(collection(db, 'code_audits'), where('userId', '==', userId))).catch(e => handleFirestoreError(e, OperationType.GET, 'code_audits'))
        ]);

        if (!resumesSnap || !interviewsSnap || !smartInterviewsSnap || !auditsSnap) return;

        const totalInterviews = (interviewsSnap as any).size + (smartInterviewsSnap as any).size;
        const totalScore = (interviewsSnap as any).docs.reduce((acc: number, doc: any) => acc + (doc.data().score || 0), 0) +
                           (smartInterviewsSnap as any).docs.reduce((acc: number, doc: any) => acc + (doc.data().finalReport?.overallScore || 0), 0);
        
        const avgScore = totalInterviews > 0 ? totalScore / totalInterviews : 0;
        
        // Calculate Job Readiness Score (weighted average)
        // 40% Interview, 30% Resume (mocked as 85 if exists), 30% Code (mocked as 80 if exists)
        const resumeScore = (resumesSnap as any).size > 0 ? 85 : 0;
        const codeScore = (auditsSnap as any).size > 0 ? 80 : 0;
        const jobReadiness = (avgScore * 0.4) + (resumeScore * 0.3) + (codeScore * 0.3);

        setStats({
          resumes: (resumesSnap as any).size,
          interviews: (interviewsSnap as any).size,
          smartInterviews: (smartInterviewsSnap as any).size,
          codeAudits: (auditsSnap as any).size,
          avgScore: Math.round(avgScore),
          jobReadiness: Math.round(jobReadiness),
          xp: 1250 + ((resumesSnap as any).size * 100) + (totalInterviews * 250),
          level: Math.floor((1250 + ((resumesSnap as any).size * 100) + (totalInterviews * 250)) / 500) + 1,
          streak: 5 // Mocked for now
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-10 w-64 skeleton" />
            <div className="h-6 w-96 skeleton" />
          </div>
          <div className="h-10 w-48 skeleton rounded-xl" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 border-white/5 h-32">
              <div className="flex justify-between mb-4">
                <div className="w-10 h-10 skeleton rounded-lg" />
                <div className="w-16 h-4 skeleton" />
              </div>
              <div className="h-4 w-24 skeleton mb-2" />
              <div className="h-8 w-16 skeleton" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-8 h-64 border-white/5">
              <div className="flex justify-between mb-8">
                <div className="w-16 h-16 skeleton rounded-2xl" />
                <div className="w-6 h-6 skeleton rounded-full" />
              </div>
              <div className="h-8 w-48 skeleton mb-4" />
              <div className="h-4 w-full skeleton mb-2" />
              <div className="h-4 w-2/3 skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { 
      id: 'SMART_INTERVIEW', 
      title: 'AI Smart Interview', 
      desc: 'Personalized simulation based on your resume and target job.', 
      icon: BrainCircuit, 
      color: 'cyan',
      stat: `${stats.smartInterviews} Sessions`,
      bgClass: 'bg-cyan-500/20',
      textClass: 'text-cyan-400',
      glowClass: 'bg-cyan-500/10'
    },
    { 
      id: 'RESUME', 
      title: 'Resume Optimizer', 
      desc: 'ATS-ready optimization with AI-powered rewrites and score analysis.', 
      icon: FileText, 
      color: 'blue',
      stat: `${stats.resumes} Versions`,
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-400',
      glowClass: 'bg-blue-500/10'
    },
    { 
      id: 'INTERVIEW', 
      title: 'Interview Trainer', 
      desc: 'Real-time voice and text practice sessions with instant AI feedback.', 
      icon: MessageSquare, 
      color: 'purple',
      stat: `${stats.interviews} Sessions`,
      bgClass: 'bg-purple-500/20',
      textClass: 'text-purple-400',
      glowClass: 'bg-purple-500/10'
    },
    { 
      id: 'CODE', 
      title: 'Code Error Detector', 
      desc: 'Deep analysis, optimization suggestions, and automated bug fixing.', 
      icon: Code, 
      color: 'emerald',
      stat: `${stats.codeAudits} Audits`,
      bgClass: 'bg-emerald-500/20',
      textClass: 'text-emerald-400',
      glowClass: 'bg-emerald-500/10'
    },
  ];

  return (
    <div className="space-y-12">
      <VerificationBanner />
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            Welcome back, {auth.currentUser?.displayName?.split(' ')[0]}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg"
          >
            Your career evolution is in progress. Ready for the next level?
          </motion.p>
        </div>

        {/* Gamification Stats */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <button 
            onClick={() => onNavigate('EVOLUTION')}
            className="glass-card px-4 py-2 flex items-center gap-3 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition-all group"
          >
            <Sparkles size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Evolution Engine</span>
          </button>
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-amber-500/20 bg-amber-500/5">
            <Flame size={18} className="text-amber-500 animate-pulse" />
            <div>
              <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest leading-none mb-1">Streak</p>
              <p className="text-sm font-bold text-amber-500">{stats.streak} Days</p>
            </div>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-blue-500/20 bg-blue-500/5">
            <Trophy size={18} className="text-blue-400" />
            <div>
              <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest leading-none mb-1">Level</p>
              <p className="text-sm font-bold text-blue-400">{stats.level}</p>
            </div>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-purple-500/20 bg-purple-500/5">
            <Star size={18} className="text-purple-400" />
            <div>
              <p className="text-[10px] font-bold text-purple-400/60 uppercase tracking-widest leading-none mb-1">XP</p>
              <p className="text-sm font-bold text-purple-400">{stats.xp.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Job Readiness Score Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={552.92}
                  initial={{ strokeDashoffset: 552.92 }}
                  animate={{ strokeDashoffset: 552.92 - (552.92 * stats.jobReadiness) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-blue-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black tracking-tighter">{stats.jobReadiness}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Readiness</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Job Readiness Score</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-xl">
                Your overall readiness score is calculated based on your performance across all modules. 
                Keep practicing to reach the <span className="text-blue-400 font-bold">Elite Tier (90+)</span>.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Interview</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{stats.avgScore}%</span>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${stats.avgScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Resume</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{stats.resumes > 0 ? '85%' : '0%'}</span>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: stats.resumes > 0 ? '85%' : '0%' }} />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Technical</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{stats.codeAudits > 0 ? '80%' : '0%'}</span>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: stats.codeAudits > 0 ? '80%' : '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Tools Grid */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <motion.button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="group relative text-left"
              >
                <div className={`absolute inset-0 ${card.glowClass} blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700`} />
                <div className="glass-card p-6 h-full border-white/5 group-hover:border-white/20 transition-all relative z-10 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 ${card.bgClass} rounded-xl ${card.textClass} group-hover:scale-110 transition-transform duration-500`}>
                      <card.icon size={24} />
                    </div>
                    <ArrowUpRight size={18} className="text-white/20 group-hover:text-white transition-all" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{card.title}</h3>
                  <p className="text-white/40 mb-6 text-xs leading-relaxed line-clamp-2">{card.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{card.stat}</span>
                    <span className={`text-[10px] font-bold ${card.textClass} flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest`}>
                      Launch <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* AI Recommendations */}
          <GlassCard className="p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold">AI Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Improve Behavioral Responses', desc: 'Your recent interview showed a need for better STAR method implementation.', action: 'Start Training', icon: BrainCircuit },
                { title: 'Optimize Resume for Tech Roles', desc: 'Your resume score can be improved by adding more quantitative metrics.', action: 'Optimize Now', icon: FileText },
              ].map((rec, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-blue-400 transition-colors">
                      <rec.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded">High Impact</span>
                  </div>
                  <h4 className="font-bold mb-2">{rec.title}</h4>
                  <p className="text-xs text-white/40 mb-4 leading-relaxed">{rec.desc}</p>
                  <button className="text-xs font-bold text-white flex items-center gap-2 hover:gap-3 transition-all">
                    {rec.action} <ArrowRight size={14} className="text-blue-400" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar: Daily Tasks & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Tasks */}
          <GlassCard className="p-6 border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layout size={18} className="text-blue-400" />
                <h3 className="font-bold uppercase tracking-widest text-xs">Daily Tasks</h3>
              </div>
              <span className="text-[10px] font-mono text-white/20">2/5 Done</span>
            </div>
            <div className="space-y-3">
              {[
                { task: 'Complete 1 Technical Interview', done: true },
                { task: 'Analyze 1 Code Snippet', done: true },
                { task: 'Update Resume Skills', done: false },
                { task: 'Practice STAR Method', done: false },
                { task: 'Review System Design', done: false },
              ].map((task, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${task.done ? 'bg-emerald-500/5 border-emerald-500/10 opacity-50' : 'bg-white/5 border-white/5'}`}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20'}`}>
                    {task.done && <CheckCircle2 size={12} />}
                  </div>
                  <span className={`text-xs font-medium ${task.done ? 'line-through text-white/40' : 'text-white/80'}`}>{task.task}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all">
              View All Tasks
            </button>
          </GlassCard>

          {/* Quick Stats */}
          <div className="space-y-4">
            {[
              { label: 'Avg Interview Score', value: `${stats.avgScore}%`, icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Code Quality Avg', value: '88/100', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
