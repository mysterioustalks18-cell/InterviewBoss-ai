import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Layout, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  ChevronRight,
  Download,
  Eye,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Edit3,
  Star,
  Award,
  Zap,
  ShieldCheck,
  Target,
  Search,
  Filter,
  BrainCircuit,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { Input } from './Input';
import { cn } from '../lib/utils';

import { TEMPLATES, Template } from '../constants';

const CATEGORIES = ['All', 'Minimal', 'Modern', 'Professional', 'Fresher', 'Sales', 'Creative'] as const;

interface ResumeTemplatesProps {
  onBack: () => void;
  onSelect: (templateId: string) => void;
}

export const ResumeTemplates = ({ onBack, onSelect }: ResumeTemplatesProps) => {
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [selectedPreview, setSelectedPreview] = useState<Template | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesFilter = filter === 'All' || t.type === filter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSmartMatch = () => {
    setIsAiMatching(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAiMatching(false);
      setAiRecommendation("Based on your profile, 'The Essential' (Minimal) is your best bet for 100% ATS parsing accuracy.");
    }, 2000);
  };

  const ResumePreview = ({ template, theme, scale = 1 }: { template: Template, theme: 'dark' | 'light', scale?: number }) => (
    <div 
      className={cn(
        "w-full h-full p-10 transition-colors duration-500 origin-top shadow-inner",
        theme === 'dark' ? "bg-slate-900 text-slate-200" : "bg-white text-slate-900"
      )}
      style={{ transform: `scale(${scale})` }}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="border-b-2 border-current/10 pb-6">
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">{template.content.name}</h2>
          <div className="flex items-center justify-between">
            <p className={cn("text-sm font-bold tracking-widest uppercase", theme === 'dark' ? "text-cyan-400" : "text-blue-600")}>
              {template.content.role}
            </p>
            <div className="flex gap-4 text-[10px] opacity-50 font-medium">
              <span>alex@example.com</span>
              <span>+1 (555) 000-1111</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 opacity-40">Professional Summary</h3>
          <p className="text-[11px] leading-relaxed opacity-80 italic">\"{template.content.summary}\"</p>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-1 space-y-8">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">Core Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {template.content.skills.map(skill => (
                  <span key={skill} className="text-[9px] px-2 py-1 rounded-md bg-current/5 border border-current/10 font-medium">{skill}</span>
                ))}
              </div>
            </section>
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">Education</h3>
              <div className="space-y-4">
                {template.content.education.map((edu, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold">{edu.degree}</p>
                    <p className="text-[9px] opacity-60">{edu.school}</p>
                    <p className="text-[8px] opacity-40">{edu.year}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="col-span-2 space-y-8">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40">Professional Experience</h3>
              <div className="space-y-6">
                {template.content.experience.map((exp, i) => (
                  <div key={i} className="space-y-2 relative pl-4 border-l border-current/10">
                    <div className="absolute top-1 left-[-4.5px] w-2 h-2 rounded-full bg-current/20" />
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-[11px] font-bold">{exp.role}</h4>
                      <span className="text-[9px] opacity-40 font-mono">{exp.period}</span>
                    </div>
                    <p className={cn("text-[10px] font-bold", theme === 'dark' ? "text-cyan-400/70" : "text-blue-600/70")}>{exp.company}</p>
                    <p className="text-[10px] leading-relaxed opacity-70">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background SaaS Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-all mb-12 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Back to Dashboard</span>
        </motion.button>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-black mb-6"
            >
              <Award size={12} className="animate-bounce" />
              <span>Premium ATS-Optimized Blueprints</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]"
            >
              Smart Resume <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Search & Match
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/50 font-medium max-w-2xl leading-relaxed"
            >
              Our deep search engine understands your intent. Find the perfect template for your role, experience, and industry in seconds.
            </motion.p>
          </div>

          {/* Search & AI Match */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 w-full lg:w-[400px]"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search e.g. 'best for sales fresher'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <Button 
              variant="primary" 
              onClick={handleSmartMatch}
              disabled={isAiMatching}
              className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl shadow-purple-500/20 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              {isAiMatching ? (
                <BrainCircuit className="animate-spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {isAiMatching ? 'Analyzing Intent...' : 'Smart AI Match'}
            </Button>
            <AnimatePresence>
              {aiRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono leading-relaxed relative group"
                >
                  <button 
                    onClick={() => setAiRecommendation(null)}
                    className="absolute top-2 right-2 text-white/20 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex gap-2">
                    <BrainCircuit size={14} className="shrink-0" />
                    <span>{aiRecommendation}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* High Value Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Flame className="text-cyan-400" size={20} />
              </div>
              <span className="text-[10px] font-mono text-white/20">2026 Edition</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Top Templates for 2026</h3>
            <p className="text-xs text-white/40 leading-relaxed">Engineered for the latest AI-driven recruitment algorithms.</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-fit text-cyan-400 p-0 hover:bg-transparent"
              onClick={() => {
                setFilter('Modern');
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              View Collection <ChevronRight size={14} />
            </Button>
          </GlassCard>
          
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="text-purple-400" size={20} />
              </div>
              <span className="text-[10px] font-mono text-white/20">Popular</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Most Selected Templates</h3>
            <p className="text-xs text-white/40 leading-relaxed">The blueprints that landed our users jobs at top tech firms.</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-fit text-purple-400 p-0 hover:bg-transparent"
              onClick={() => {
                setFilter('Professional');
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              View Collection <ChevronRight size={14} />
            </Button>
          </GlassCard>

          <GlassCard className="p-6 border-white/5 bg-white/[0.02] flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Zap className="text-emerald-400" size={20} />
              </div>
              <span className="text-[10px] font-mono text-white/20">Entry Level</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Best for Freshers</h3>
            <p className="text-xs text-white/40 leading-relaxed">Skills-focused layouts designed to highlight potential over experience.</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-fit text-emerald-400 p-0 hover:bg-transparent"
              onClick={() => {
                setFilter('Fresher');
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            >
              View Collection <ChevronRight size={14} />
            </Button>
          </GlassCard>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-3"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all border relative overflow-hidden group",
                  filter === cat 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]" 
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/30"
                )}
              >
                <span className="relative z-10">{cat}</span>
                {filter === cat && (
                  <motion.div 
                    layoutId="filter-glow"
                    className="absolute inset-0 bg-white/20 blur-xl"
                  />
                )}
              </button>
            ))}
          </motion.div>

          {/* Theme Toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md"
          >
            <button
              onClick={() => setPreviewTheme('light')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                previewTheme === 'light' ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "text-white/40 hover:text-white/60"
              )}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => setPreviewTheme('dark')}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                previewTheme === 'dark' ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]" : "text-white/40 hover:text-white/60"
              )}
            >
              <Moon size={14} /> Dark
            </button>
          </motion.div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, i) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group"
              >
                <GlassCard className="p-0 overflow-hidden border-white/10 hover:border-cyan-500/50 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col h-full relative">
                  {/* Badge */}
                  {template.badge && (
                    <div className="absolute top-6 left-6 z-20">
                      <span className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black text-[10px] font-black uppercase tracking-widest shadow-2xl">
                        {template.badge}
                      </span>
                    </div>
                  )}

                  {/* Preview Area */}
                  <div className="aspect-[3/4] relative overflow-hidden bg-slate-950 group/preview">
                    {/* Real Resume Content Preview */}
                    <div className="absolute inset-0 pointer-events-none transition-transform duration-700 group-hover/preview:scale-110">
                      <ResumePreview template={template} theme={previewTheme} scale={0.6} />
                    </div>

                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 opacity-10 bg-gradient-to-br transition-opacity duration-700 group-hover/preview:opacity-30",
                      template.previewColor
                    )} />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 p-10 text-center">
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        className="flex flex-col gap-4 w-full max-w-[200px]"
                      >
                        <Button 
                          variant="ghost" 
                          size="md" 
                          onClick={() => setSelectedPreview(template)}
                          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white w-full rounded-xl"
                        >
                          <Eye size={18} className="mr-2" /> Quick Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="md" 
                          onClick={() => onSelect(template.id)}
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 w-full rounded-xl"
                        >
                          <Edit3 size={18} className="mr-2" /> Customize
                        </Button>
                        <Button 
                          variant="primary" 
                          size="md" 
                          onClick={() => onSelect(template.id)}
                          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-2xl shadow-cyan-500/40 w-full rounded-xl font-black uppercase tracking-widest"
                        >
                          <Star size={18} className="mr-2" /> Use Template
                        </Button>
                      </motion.div>
                      <div className="flex items-center gap-2 text-[10px] text-cyan-400/60 font-black uppercase tracking-[0.3em] mt-4">
                        <ShieldCheck size={12} />
                        <span>Recruiter Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-8 flex flex-col gap-5 flex-1 bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-2xl tracking-tighter group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
                        <Target size={12} className="text-cyan-400" />
                        <span className="text-[11px] font-black text-cyan-400">ATS {template.atsScore}</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/40 font-medium leading-relaxed flex-1">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", template.previewColor.split(' ')[0].replace('from-', 'bg-'))} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">{template.type}</span>
                      </div>
                      <ChevronRight size={20} className="text-white/10 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Full Preview Modal */}
        <AnimatePresence>
          {selectedPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12 bg-black/95 backdrop-blur-2xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-7xl h-full flex flex-col bg-slate-950 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/[0.03] backdrop-blur-md">
                  <div className="flex items-center gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-2xl", selectedPreview.previewColor)}>
                      <FileText className="text-white" size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter">{selectedPreview.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">{selectedPreview.type} Blueprint</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black">ATS Score: {selectedPreview.atsScore}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 mr-4">
                      <button onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"><ZoomOut size={18} /></button>
                      <div className="w-[1px] h-4 bg-white/10" />
                      <span className="text-[11px] font-black font-mono w-16 text-center text-white/60">{Math.round(zoom * 100)}%</span>
                      <div className="w-[1px] h-4 bg-white/10" />
                      <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"><ZoomIn size={18} /></button>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => onSelect(selectedPreview.id)}
                      className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-cyan-500/20"
                    >
                      Use This Template
                    </Button>
                    <button 
                      onClick={() => {
                        setSelectedPreview(null);
                        setZoom(1);
                      }}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Split View */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Sidebar with Details */}
                  <div className="hidden lg:flex w-96 border-r border-white/10 p-10 flex-col gap-10 bg-white/[0.01] overflow-y-auto custom-scrollbar">
                    <section>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-cyan-400 mb-6 flex items-center gap-2">
                        <Sparkles size={12} /> Why it works
                      </h4>
                      <p className="text-sm text-white/60 leading-relaxed font-medium">
                        {selectedPreview.description}
                      </p>
                    </section>
                    
                    <section>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-cyan-400 mb-6 flex items-center gap-2">
                        <Target size={12} /> ATS Performance
                      </h4>
                      <div className="flex items-center gap-4 p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 shadow-inner">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                          <ShieldCheck size={24} className="text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-white">{selectedPreview.atsScore}%</div>
                          <div className="text-[10px] text-cyan-400/60 font-black uppercase tracking-widest">Parsing Accuracy</div>
                        </div>
                      </div>
                      <p className="text-xs text-white/30 mt-4 leading-relaxed italic">
                        "This blueprint uses standard section headers and a machine-readable structure that parses perfectly in 99.9% of modern ATS systems."
                      </p>
                    </section>

                    <section>
                      <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-cyan-400 mb-6 flex items-center gap-2">
                        <Award size={12} /> Best Fit For
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPreview.type === 'Minimal' && ['Software Engineering', 'Data Science', 'Academic', 'Finance'].map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">{tag}</span>
                        ))}
                        {selectedPreview.type === 'Modern' && ['Creative Roles', 'Marketing', 'Startups', 'Product Design'].map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">{tag}</span>
                        ))}
                        {selectedPreview.type === 'Professional' && ['Executive', 'Legal', 'Management', 'Corporate'].map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">{tag}</span>
                        ))}
                        {selectedPreview.type === 'Fresher' && ['Entry Level', 'Internships', 'New Grads', 'Career Change'].map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">{tag}</span>
                        ))}
                        {selectedPreview.type === 'Sales' && ['Sales Rep', 'Account Manager', 'Business Dev', 'Real Estate'].map(tag => (
                          <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 transition-all cursor-default">{tag}</span>
                        ))}
                      </div>
                    </section>

                    <section className="mt-auto">
                      <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Pro Tip</h5>
                        <p className="text-xs text-white/40 leading-relaxed">
                          Pair this template with our <span className="text-cyan-400">AI Bullet Point Optimizer</span> for maximum impact.
                        </p>
                      </div>
                    </section>
                  </div>

                  {/* Main Preview Area */}
                  <div className="flex-1 overflow-auto p-12 md:p-20 bg-black/60 custom-scrollbar flex justify-center items-start relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                    <motion.div 
                      layout
                      className="w-full max-w-4xl shadow-[0_0_100px_rgba(0,0,0,0.6)] transition-all duration-300"
                      style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                    >
                      <ResumePreview template={selectedPreview} theme={previewTheme} />
                    </motion.div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-white/10 bg-white/[0.03] flex justify-center gap-12">
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap size={16} className="text-cyan-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-white/60 transition-colors">ATS Optimized</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck size={16} className="text-cyan-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-white/60 transition-colors">Recruiter Approved</span>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layout size={16} className="text-cyan-400" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-white/60 transition-colors">Mobile Ready</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Feature Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 mb-20"
        >
          <GlassCard className="p-16 border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black shrink-0 shadow-[0_0_50px_rgba(34,211,238,0.3)] animate-pulse">
                <Sparkles size={64} />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-4xl font-black mb-6 tracking-tighter">AI-Engineered Success</h3>
                <p className="text-xl text-white/50 leading-relaxed max-w-2xl font-medium">
                  Our templates are more than just layouts. They are data-driven structures built on deep analysis of what top-tier recruiters and ATS algorithms prioritize in <span className="text-cyan-400">2026</span>.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 shrink-0 w-full lg:w-auto">
                {[
                  { icon: Target, text: "Standard Headings" },
                  { icon: Award, text: "Font Hierarchies" },
                  { icon: Zap, text: "Metric-First Layouts" },
                  { icon: ShieldCheck, text: "Parsing Accuracy" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors group/item">
                    <item.icon size={20} className="text-cyan-400 group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};
