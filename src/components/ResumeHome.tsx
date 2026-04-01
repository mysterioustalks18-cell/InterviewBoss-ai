import React from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Plus, ArrowLeft, Sparkles, Layout, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface ResumeHomeProps {
  onBack: () => void;
  onBuild: () => void;
  onUpload: (text: string, jd?: string) => void;
  onBrowseTemplates: () => void;
}

export const ResumeHome = ({ onBack, onBuild, onUpload, onBrowseTemplates }: ResumeHomeProps) => {
  const [jd, setJd] = React.useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onUpload(text, jd);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-mono uppercase tracking-widest">Back to Home</span>
      </button>

      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-mono mb-6"
        >
          <Sparkles size={12} />
          <span>AI Career System v2.0</span>
        </motion.div>
        <h1 className="text-5xl font-bold tracking-tight mb-6">Forge Your Career Identity</h1>
        <p className="text-xl text-white/60 font-light max-w-2xl mx-auto">
          Build a high-impact resume from scratch or analyze your existing one to see if you're actually hireable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-8 h-full flex flex-col gap-6 hover:border-cyan-500/30 transition-all group border-cyan-500/20 bg-cyan-500/5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold">Build from Scratch</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Tell us about your experience and we'll generate a professional, high-impact resume using AI.
              </p>
            </div>
            <Button variant="primary" className="w-full mt-auto" onClick={onBuild}>
              Start Building <ChevronRight size={16} className="ml-2" />
            </Button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-8 h-full flex flex-col gap-6 hover:border-purple-500/30 transition-all group border-purple-500/20 bg-purple-500/5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Layout size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold">Browse Templates</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Choose from our library of high-ATS, professionally designed blueprints.
              </p>
            </div>
            <Button variant="outline" className="w-full mt-auto border-purple-500/30 text-purple-400 hover:bg-purple-500/10" onClick={onBrowseTemplates}>
              View Templates <ChevronRight size={16} className="ml-2" />
            </Button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-8 h-full flex flex-col gap-6 hover:border-white/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 group-hover:scale-110 transition-transform">
              <Upload size={24} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold">Analyze Existing</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Upload your current resume to get a detailed analysis, hire score, and suggestions.
              </p>
            </div>
            
            <div className="space-y-4 mt-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Target Job Description (Optional)</label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the JD here for tailored analysis..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                />
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  Upload (.txt) <Upload size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">ATS Score</span>
            <span className="text-xl font-bold text-cyan-400">95+</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">AI Analysis</span>
            <span className="text-xl font-bold text-purple-400">Deep</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Interview Sync</span>
            <span className="text-xl font-bold text-red-400">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
