import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Briefcase, Sparkles, ShieldCheck, ChevronRight, ChevronLeft, Upload, Loader2, Video, TrendingUp } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './Button';
import { FileUpload } from './FileUpload';
import { Difficulty, Difficulty as DifficultyType, PersonaType, InterviewFocus, DialogueStyle, InterviewerPersona } from '../types';
import { DIFFICULTY_CONFIG, PERSONA_CONFIG, FOCUS_CONFIG, STYLE_CONFIG } from '../constants';
import { GlassCard } from './GlassCard';
import { extractTextFromFile } from '../lib/fileParser';
import { Input } from './Input';
import { VerificationBanner } from './VerificationBanner';

const INTERVIEWER_PERSONA_CONFIG: Record<InterviewerPersona, { name: string; description: string; icon: string }> = {
  'Skeptic': { name: 'The Skeptic', description: 'Critical and evidence-based.', icon: '🧐' },
  'Visionary': { name: 'The Visionary', description: 'Focuses on innovation and big picture.', icon: '🚀' },
  'Empathetic': { name: 'The Empathetic', description: 'Focuses on soft skills and culture.', icon: '🤝' },
  'DrillSergeant': { name: 'The Drill Sergeant', description: 'High pressure and rapid-fire.', icon: '💂' }
};

interface HomeScreenProps {
  onStart: (difficulty: DifficultyType, personaType: PersonaType, focus: InterviewFocus, dialogueStyle: DialogueStyle, resume: string, jd: string, customPrompt?: string) => void;
  onStartCopilot: (resume: string, jd: string) => void;
  onStartPractice: (focus: InterviewFocus, dialogueStyle: DialogueStyle, resume: string, jd: string, customPrompt?: string) => void;
  onStartInterview: (role: string, experience: 'Fresher' | 'Experienced', persona: InterviewerPersona, resume: string, jd: string) => void;
  onStartResume: () => void;
  onStartSecurityAudit: () => void;
  onViewEvolution: () => void;
  onStartVoiceMode: () => void;
}

export const HomeScreen = ({ onStart, onStartCopilot, onStartPractice, onStartInterview, onStartResume, onStartSecurityAudit, onViewEvolution, onStartVoiceMode }: HomeScreenProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<DifficultyType>('Medium');
  const [selectedPersonaType, setSelectedPersonaType] = React.useState<PersonaType>('HRDirector');
  const [selectedFocus, setSelectedFocus] = React.useState<InterviewFocus>('Behavioral');
  const [selectedStyle, setSelectedStyle] = React.useState<DialogueStyle>('Professional');
  const [selectedPersona, setSelectedPersona] = React.useState<InterviewerPersona>('Skeptic');
  const [resume, setResume] = React.useState('');
  const [jd, setJd] = React.useState('');
  const [role, setRole] = React.useState('Software Engineer');
  const [experience, setExperience] = React.useState<'Fresher' | 'Experienced'>('Fresher');
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [step, setStep] = React.useState(1);
  const [mode, setMode] = React.useState<'EVOLUTION' | 'INTERVIEW'>('EVOLUTION');

  const handleStart = () => {
    if (mode === 'INTERVIEW') {
      onStartInterview(role, experience, selectedPersona, resume, jd);
    } else {
      onStart(selectedDifficulty, selectedPersonaType, selectedFocus, selectedStyle, resume, jd, customPrompt);
    }
  };

  const handleCopilot = () => {
    onStartCopilot(resume, jd);
  };

  const handlePractice = () => {
    onStartPractice(selectedFocus, selectedStyle, resume, jd, customPrompt);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 text-center gap-12 max-w-6xl mx-auto pb-24 overflow-hidden">
      <VerificationBanner />
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />
      
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-8 w-full relative z-10"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Logo />
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest">v2.4.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent pb-2">
            Command Center
          </h1>
          <p className="text-white/40 max-w-xl text-lg font-light leading-relaxed">
            All systems <span className="text-cyan-400 font-mono uppercase tracking-widest text-sm">Nominal</span>. Accessing <span className="text-white/80 font-medium">Full Level</span> features.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button 
            variant="secondary" 
            className="neon-glow-primary px-8 group overflow-hidden relative"
            onClick={onStartResume}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles size={18} className="mr-2 relative z-10 group-hover:rotate-12 transition-transform" /> 
            <span className="relative z-10">Resume Studio Pro</span>
          </Button>
          <Button 
            variant="ghost" 
            className="px-8 border border-white/5 hover:bg-white/5 text-red-400 hover:text-red-300 group"
            onClick={onStartSecurityAudit}
          >
            <ShieldCheck size={18} className="mr-2 group-hover:scale-110 transition-transform" /> Security Audit Elite
          </Button>
          <Button 
            variant="ghost" 
            className="px-8 border border-white/5 hover:bg-white/5 text-purple-400 hover:text-purple-300 group"
            onClick={onViewEvolution}
          >
            <TrendingUp size={18} className="mr-2 group-hover:translate-y-[-2px] transition-transform" /> Evolution Master
          </Button>
        </div>

        {/* Instant Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl mt-4">
          {[
            { 
              title: "AI Voice Mode", 
              desc: "Real-time verbal feedback", 
              icon: <Video className="text-pink-400" />, 
              action: onStartVoiceMode, 
              accent: "border-pink-500/20 hover:border-pink-500/50",
              isPro: true
            },
            { 
              title: "Secure Rewrite", 
              desc: "One-click vulnerability fix", 
              icon: <ShieldCheck className="text-emerald-400" />, 
              action: onStartSecurityAudit, 
              accent: "border-emerald-500/20 hover:border-emerald-500/50",
              isPro: true
            },
            { 
              title: "ATS Predictor", 
              desc: "Predict your hireability", 
              icon: <FileText className="text-purple-400" />, 
              action: onStartResume, 
              accent: "border-purple-500/20 hover:border-purple-500/50",
              isPro: true
            },
            { 
              title: "Network Audit", 
              desc: "Analyze traffic patterns", 
              icon: <TrendingUp className="text-blue-400" />, 
              action: onStartSecurityAudit, 
              accent: "border-blue-500/20 hover:border-blue-500/50",
              isPro: true
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              onClick={card.action}
              className={`group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 ${card.accent} transition-all cursor-pointer hover:bg-white/[0.05] overflow-hidden`}
            >
              {card.isPro && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[8px] font-bold text-white uppercase tracking-widest shadow-lg z-20">
                  PRO
                </div>
              )}
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white group-hover:text-white transition-colors">{card.title}</h3>
                  <p className="text-xs text-white/40">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Mode & Setup */}
              <div className="lg:col-span-8 space-y-8">
                <GlassCard className="p-8 space-y-8 bg-white/[0.03] border-white/10" hover={false}>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-center gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                      <button 
                        onClick={() => setMode('EVOLUTION')}
                        className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all ${
                          mode === 'EVOLUTION' 
                            ? 'text-white' 
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {mode === 'EVOLUTION' && (
                          <motion.div 
                            layoutId="mode-bg"
                            className="absolute inset-0 bg-gradient-primary rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <ShieldCheck size={18} /> Persona Evolution
                        </span>
                      </button>
                      <button 
                        onClick={() => setMode('INTERVIEW')}
                        className={`relative flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-xs font-mono uppercase tracking-widest transition-all ${
                          mode === 'INTERVIEW' 
                            ? 'text-white' 
                            : 'text-white/20 hover:text-white/40'
                        }`}
                      >
                        {mode === 'INTERVIEW' && (
                          <motion.div 
                            layoutId="mode-bg"
                            className="absolute inset-0 bg-gradient-primary rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Briefcase size={18} /> AI Interviewer
                        </span>
                      </button>
                    </div>

                    <div className="text-left space-y-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        {mode === 'EVOLUTION' ? 'Evolution Parameters' : 'Interview Context'}
                      </h2>
                      <p className="text-sm text-white/40">
                        {mode === 'EVOLUTION' ? 'Configure the simulation for maximum impact.' : 'Tell us about the role you are targeting.'}
                      </p>
                    </div>
                  </div>

                  {mode === 'INTERVIEW' && (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-3 text-left">
                          <label className="text-[10px] uppercase tracking-widest font-mono text-white/30">Target Job Role</label>
                          <Input 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g. Senior Product Designer"
                          />
                        </div>
                        <div className="flex flex-col gap-3 text-left">
                          <label className="text-[10px] uppercase tracking-widest font-mono text-white/30">Experience Level</label>
                          <div className="grid grid-cols-2 gap-2 h-full">
                            {(['Fresher', 'Experienced'] as const).map((exp) => (
                              <button
                                key={exp}
                                onClick={() => setExperience(exp)}
                                className={`flex items-center justify-center rounded-xl text-xs font-bold uppercase tracking-widest border transition-all h-12 ${
                                  experience === exp ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-white/10 bg-white/5 text-white/40'
                                }`}
                              >
                                {exp}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 text-left">
                        <label className="text-[10px] uppercase tracking-widest font-mono text-white/30">Interviewer Persona</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(Object.keys(INTERVIEWER_PERSONA_CONFIG) as InterviewerPersona[]).map((p) => (
                            <button
                              key={p}
                              onClick={() => setSelectedPersona(p)}
                              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all group ${
                                selectedPersona === p 
                                  ? 'border-purple-400/50 bg-purple-400/5 text-purple-400' 
                                  : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10'
                              }`}
                            >
                              {selectedPersona === p && (
                                <motion.div 
                                  layoutId="persona-glow"
                                  className="absolute inset-0 bg-purple-400/5 blur-xl rounded-xl"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                              <span className="text-2xl relative z-10 group-hover:scale-110 transition-transform">{INTERVIEWER_PERSONA_CONFIG[p].icon}</span>
                              <div className="text-center relative z-10">
                                <div className="text-[10px] font-bold uppercase tracking-tighter">{INTERVIEWER_PERSONA_CONFIG[p].name}</div>
                                <div className="text-[8px] opacity-50 lowercase leading-tight">{INTERVIEWER_PERSONA_CONFIG[p].description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUpload 
                      label="Your Resume"
                      icon={<FileText size={14} />}
                      accentColor="text-cyan-400"
                      value={resume}
                      onChange={setResume}
                      onParse={extractTextFromFile}
                      placeholder="Paste resume text..."
                    />
                    <FileUpload 
                      label="Job Description"
                      icon={<Briefcase size={14} />}
                      accentColor="text-purple-400"
                      value={jd}
                      onChange={setJd}
                      onParse={extractTextFromFile}
                      placeholder="Paste JD text..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-14 border border-white/5"
                      onClick={handleCopilot}
                    >
                      <ShieldCheck size={18} className="mr-2" /> Stealth Copilot
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-1 h-14 text-lg animate-pulse-glow"
                      onClick={mode === 'INTERVIEW' ? handleStart : () => setStep(2)}
                    >
                      {mode === 'INTERVIEW' ? 'Start Interview' : 'Next: Select Persona'} <ChevronRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </GlassCard>
              </div>

              {/* Right Side: Quick Stats & Info */}
              <div className="lg:col-span-4 space-y-6">
                <GlassCard className="p-6 text-left space-y-6 bg-white/[0.03] border-white/10" hover={false}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-white/30">System Status</h3>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-cyan-400/40" />
                      <div className="w-1 h-1 rounded-full bg-cyan-400/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                          <Sparkles size={14} />
                        </div>
                        <span className="text-sm text-white/60">AI Engine v4.0</span>
                      </div>
                      <span className="text-[10px] font-mono text-green-400">OPTIMIZED</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-400/10 text-red-400">
                          <ShieldCheck size={14} />
                        </div>
                        <span className="text-sm text-white/60">Savage Mode</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400">UNLOCKED</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
                          <Video size={14} />
                        </div>
                        <span className="text-sm text-white/60">Neural Link</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">FULL LEVEL</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 text-left space-y-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10" hover={false}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-white/30">Quick Practice</h3>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Short on time? Jump into a quick practice session with instant feedback.
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full py-6 group relative overflow-hidden"
                    onClick={handlePractice}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-center gap-2 text-cyan-400 group-hover:scale-110 transition-transform relative z-10">
                      <Sparkles size={18} />
                      <span className="font-bold">Instant Practice</span>
                    </div>
                  </Button>
                </GlassCard>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase size={40} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Global Activity</span>
                    </div>
                    <span className="text-[8px] font-mono text-cyan-400/60 uppercase tracking-widest animate-pulse">Live</span>
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-white flex items-baseline gap-1">
                    12,402
                    <span className="text-xs font-normal text-green-400/60">+12%</span>
                  </div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Evolutions Completed Today</div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full"
          >
            <GlassCard className="flex flex-col gap-10 p-10 max-w-4xl mx-auto bg-white/[0.03] border-white/10" hover={false}>
              <div className="flex flex-col gap-2 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/40">Step 02</span>
                  <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tighter">Select Your Persona</h2>
                <p className="text-white/40 max-w-md mx-auto">Each persona has a unique personality, testing style, and difficulty level.</p>
              </div>

              {/* Persona Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(PERSONA_CONFIG) as PersonaType[]).map((persona) => (
                  <motion.button
                    key={persona}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPersonaType(persona)}
                    className={`flex flex-col gap-4 p-6 rounded-2xl border-2 transition-all duration-500 text-left relative overflow-hidden group ${
                      selectedPersonaType === persona 
                        ? `bg-white/5 shadow-[0_0_40px_rgba(108,92,231,0.15)]` 
                        : "border-white/5 bg-white/[0.02] opacity-40 hover:opacity-100 hover:border-white/20"
                    }`}
                    style={{ borderColor: selectedPersonaType === persona ? PERSONA_CONFIG[persona].color : 'transparent' }}
                  >
                    {selectedPersonaType === persona && (
                      <>
                        <div 
                          className="absolute inset-0 opacity-10 animate-pulse"
                          style={{ backgroundColor: PERSONA_CONFIG[persona].color }}
                        />
                        <div className="absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-20" style={{ backgroundColor: PERSONA_CONFIG[persona].color }} />
                      </>
                    )}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: PERSONA_CONFIG[persona].color }}>
                        {PERSONA_CONFIG[persona].name}
                      </span>
                      {selectedPersonaType === persona && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: PERSONA_CONFIG[persona].color }} />}
                    </div>
                    <div className="flex flex-col gap-1 relative z-10">
                      <span className="text-xl font-bold text-white leading-tight tracking-tight">{PERSONA_CONFIG[persona].title}</span>
                      <span className="text-[10px] text-white/40 leading-relaxed line-clamp-3 font-light">{PERSONA_CONFIG[persona].description}</span>
                    </div>
                    <div className="mt-auto pt-2 relative z-10">
                      <span className="text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">
                        {persona === 'HRDirector' ? 'Medium' : persona === 'TechLead' ? 'Hard' : 'Legendary'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Difficulty & Focus */}
                <div className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/30 text-left">Difficulty Level</span>
                    <div className="relative flex items-center justify-between px-2 bg-white/5 rounded-xl py-3 border border-white/5">
                      {(Object.keys(DIFFICULTY_CONFIG) as DifficultyType[]).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`relative z-10 px-4 py-1 text-xs font-mono uppercase tracking-widest transition-all ${
                            selectedDifficulty === diff ? 'text-white font-bold' : 'text-white/20 hover:text-white/40'
                          }`}
                        >
                          {selectedDifficulty === diff && (
                            <motion.div 
                              layoutId="diff-bg"
                              className="absolute inset-0 bg-white/10 rounded-lg"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{diff}</span>
                        </button>
                      ))}
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-400"
                        animate={{ 
                          width: selectedDifficulty === 'Easy' ? '33%' : selectedDifficulty === 'Medium' ? '66%' : '100%',
                          backgroundColor: DIFFICULTY_CONFIG[selectedDifficulty].color
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/30 text-left">Interview Focus</span>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(FOCUS_CONFIG) as InterviewFocus[]).map((focus) => (
                        <button
                          key={focus}
                          onClick={() => setSelectedFocus(focus)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            selectedFocus === focus 
                              ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" 
                              : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/60"
                          }`}
                        >
                          <span className="text-lg">{FOCUS_CONFIG[focus].icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{focus}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Style & Custom */}
                <div className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/30 text-left">Dialogue Style</span>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(STYLE_CONFIG) as DialogueStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            selectedStyle === style 
                              ? "border-purple-400 bg-purple-400/10 text-purple-400" 
                              : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/60"
                          }`}
                        >
                          <span className="text-lg">{STYLE_CONFIG[style].icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-white/30 text-left">Custom Traits</span>
                    <Input
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. 'Extremely detail-oriented'..."
                      className="bg-white/[0.02]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  className="flex-1 h-14 border border-white/5"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft size={18} className="mr-2" /> Back
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1 h-14 text-xl shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  onClick={handleStart}
                >
                  Initiate Evolution <Sparkles size={18} className="ml-2" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-white/5 w-full max-w-4xl relative z-10">
        {[
          { label: "Evolutions Completed", value: "12,402", icon: <ShieldCheck size={14} /> },
          { label: "Hire Rate", value: "14.2%", icon: <Sparkles size={14} /> },
          { label: "Top Level", value: "Persona Elite", icon: <Briefcase size={14} /> },
          { label: "Active Personas", value: "4", icon: <Video size={14} /> },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex flex-col gap-3 items-center md:items-start p-4 rounded-2xl hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-2 text-white/20 group-hover:text-cyan-400 transition-colors">
              {stat.icon}
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono">{stat.label}</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tighter">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
