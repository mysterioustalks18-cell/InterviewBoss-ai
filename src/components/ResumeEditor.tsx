import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Sparkles, Wand2, ArrowRight, Save, AlertCircle, Loader2, CheckCircle2, Download, Layout, Eye, EyeOff, Settings, GripVertical, X, ShieldCheck, Target, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { ResumeData } from '../types';
import { improveBullet, getRealtimeSuggestions, rewriteResume, generateKeywords } from '../services/geminiService';
import { TEMPLATES } from '../constants';
import { cn } from '../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeEditorProps {
  initialData?: Partial<ResumeData>;
  templateId?: string;
  jobDescription?: string;
  onSave: (data: ResumeData) => void;
  onAnalyze: (data: ResumeData, jd?: string) => void;
  onBack: () => void;
  onBackToDashboard?: () => void;
}

export const ResumeEditor = ({ initialData, templateId: initialTemplateId, jobDescription: initialJd, onSave, onAnalyze, onBack, onBackToDashboard }: ResumeEditorProps) => {
  const [currentTemplateId, setCurrentTemplateId] = useState(initialTemplateId || 'modern-ats');
  const [jd, setJd] = useState(initialJd || '');
  const [showJdModal, setShowJdModal] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [data, setData] = useState<ResumeData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    summary: initialData?.summary || '',
    skills: initialData?.skills || [],
    experience: initialData?.experience || [],
    education: initialData?.education || [],
    projects: initialData?.projects || [],
  });

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const modalPreviewRef = useRef<HTMLDivElement>(null);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('resume_draft', JSON.stringify({ data, templateId: currentTemplateId }));
      setIsAutoSaving(true);
      setLastSaved(new Date());
      setTimeout(() => setIsAutoSaving(false), 2000);
    }, 3000);
    return () => clearTimeout(timer);
  }, [data, currentTemplateId]);

  const getTemplateStyles = () => {
    switch (currentTemplateId) {
      case 'minimal-clean':
        return {
          header: "text-center space-y-1 pb-6",
          name: "text-2xl font-light tracking-[0.2em] uppercase text-slate-800",
          role: "text-sm font-medium text-slate-400 uppercase tracking-[0.3em] pt-1",
          sectionTitle: "text-xs font-bold uppercase tracking-[0.4em] text-slate-400 border-b border-slate-100 pb-4 mb-6 text-center",
          company: "font-bold text-md text-slate-800",
        };
      case 'modern-clean-v2':
      case 'modern-ats':
        return {
          header: "text-center space-y-2 border-b-2 border-cyan-600 pb-8",
          name: "text-4xl font-bold uppercase tracking-tighter text-cyan-900",
          role: "text-xl font-bold text-cyan-600 uppercase tracking-widest pt-2",
          sectionTitle: "text-lg font-bold uppercase tracking-widest border-b border-cyan-200 pb-2 text-cyan-800",
          company: "font-bold text-lg text-cyan-900",
        };
      case 'professional-corporate':
      case 'professional-exec':
        return {
          header: "text-left space-y-2 border-l-4 border-slate-800 pl-6 pb-4",
          name: "text-3xl font-serif font-bold text-slate-900",
          role: "text-lg font-serif italic text-slate-600 pt-1",
          sectionTitle: "text-md font-bold uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-4 text-slate-800",
          company: "font-bold text-lg text-slate-900",
        };
      case 'fresher-skills':
        return {
          header: "text-center space-y-2 border-b-2 border-emerald-500 pb-8",
          name: "text-3xl font-bold tracking-tight text-slate-900",
          role: "text-lg font-semibold text-emerald-600 uppercase tracking-wide",
          sectionTitle: "text-sm font-bold uppercase tracking-widest bg-emerald-50 py-1 px-2 text-emerald-800 mb-4",
          company: "font-bold text-md text-slate-900",
        };
      case 'sales-results':
        return {
          header: "text-left space-y-2 bg-rose-50 p-8 rounded-3xl border-2 border-rose-100 mb-8",
          name: "text-4xl font-black text-rose-600 tracking-tighter",
          role: "text-xl font-bold text-slate-800",
          sectionTitle: "text-lg font-black uppercase tracking-tighter text-rose-500 mb-4",
          company: "font-black text-lg text-slate-900",
        };
      case 'creative-tech':
        return {
          header: "text-left space-y-4 bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white mb-8",
          name: "text-4xl font-black tracking-tight",
          role: "text-xl font-medium opacity-90",
          sectionTitle: "text-xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 border-b-2 border-purple-100 pb-2",
          company: "font-black text-lg text-slate-900",
        };
      case 'minimal-ats-safe':
        return {
          header: "text-left space-y-1 border-b border-slate-200 pb-4",
          name: "text-2xl font-bold tracking-tight text-slate-900",
          role: "text-sm font-medium text-slate-500 uppercase tracking-widest",
          sectionTitle: "text-xs font-bold uppercase tracking-widest border-b-2 border-slate-900 pb-1 mb-4 text-slate-900",
          company: "font-bold text-md text-slate-800",
        };
      case 'tech-sv':
        return {
          header: "text-left space-y-1 border-b-2 border-emerald-500 pb-4",
          name: "text-3xl font-bold tracking-tight text-slate-900",
          role: "text-lg font-semibold text-emerald-600 uppercase tracking-wide",
          sectionTitle: "text-sm font-bold uppercase tracking-widest bg-emerald-50 py-1 px-2 text-emerald-800 mb-4",
          company: "font-bold text-md text-slate-900",
        };
      case 'academic-cv':
        return {
          header: "text-center space-y-2 border-b-2 border-amber-600 pb-8",
          name: "text-3xl font-serif text-slate-900",
          role: "text-md font-serif italic text-amber-700",
          sectionTitle: "text-lg font-serif border-b border-amber-800 pb-1 mb-6 text-amber-900",
          company: "font-serif font-bold text-md",
        };
      case 'startup-bold':
        return {
          header: "text-left space-y-2 bg-rose-50 p-8 rounded-3xl border-2 border-rose-100 mb-8",
          name: "text-4xl font-black text-rose-600 tracking-tighter",
          role: "text-xl font-bold text-slate-800",
          sectionTitle: "text-lg font-black uppercase tracking-tighter text-rose-500 mb-4",
          company: "font-black text-lg text-slate-900",
        };
      case 'classic-serif':
        return {
          header: "text-center space-y-3 border-double border-b-4 border-indigo-300 pb-8",
          name: "text-4xl font-serif tracking-tight text-indigo-900",
          role: "text-lg font-serif uppercase tracking-[0.2em] text-indigo-600",
          sectionTitle: "text-md font-serif font-bold uppercase tracking-widest border-b border-indigo-300 pb-1 mb-6 text-indigo-800",
          company: "font-serif font-bold text-lg",
        };
      case 'healthcare-pro':
        return {
          header: "text-left space-y-2 border-l-8 border-teal-500 pl-6 pb-4",
          name: "text-3xl font-bold text-slate-900",
          role: "text-lg font-medium text-teal-600",
          sectionTitle: "text-sm font-bold uppercase tracking-widest bg-teal-50 text-teal-800 px-3 py-1 mb-4",
          company: "font-bold text-md text-slate-800",
        };
      case 'legal-formal':
        return {
          header: "text-center space-y-1 border-b border-stone-800 pb-6",
          name: "text-2xl font-serif font-bold uppercase tracking-widest text-stone-900",
          role: "text-sm font-serif italic text-stone-600",
          sectionTitle: "text-xs font-bold uppercase tracking-[0.3em] border-y border-stone-200 py-2 mb-6 text-stone-800",
          company: "font-serif font-bold text-md",
        };
      case 'retail-service':
        return {
          header: "text-left space-y-1 bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6",
          name: "text-2xl font-bold text-orange-700",
          role: "text-md font-medium text-slate-600",
          sectionTitle: "text-sm font-bold text-orange-600 border-b-2 border-orange-100 pb-1 mb-4",
          company: "font-bold text-md text-slate-800",
        };
      case 'creative-portfolio':
        return {
          header: "text-right space-y-2 border-r-4 border-pink-500 pr-6 pb-4",
          name: "text-4xl font-black tracking-tighter text-pink-600",
          role: "text-lg font-bold text-slate-400 uppercase tracking-widest",
          sectionTitle: "text-2xl font-black text-slate-900 mb-4 italic",
          company: "font-bold text-xl text-pink-500",
        };
      case 'management-consulting':
        return {
          header: "text-left space-y-2 border-b-2 border-blue-900 pb-4",
          name: "text-3xl font-bold tracking-tight text-blue-900",
          role: "text-lg font-semibold text-slate-500 uppercase tracking-widest",
          sectionTitle: "text-sm font-bold uppercase tracking-widest border-l-4 border-blue-900 pl-3 mb-4 text-blue-900",
          company: "font-bold text-md text-slate-900",
        };
      case 'freelance-gig':
        return {
          header: "text-center space-y-1 pb-4",
          name: "text-2xl font-medium text-lime-700",
          role: "text-sm font-mono text-slate-400",
          sectionTitle: "text-xs font-mono font-bold uppercase tracking-widest bg-lime-50 text-lime-800 px-2 py-1 mb-4 inline-block",
          company: "font-bold text-md text-slate-800",
        };
      default:
        return {
          header: "text-center space-y-2 border-b-2 border-black pb-8",
          name: "text-4xl font-bold uppercase tracking-tighter",
          role: "text-xl font-bold text-cyan-600 uppercase tracking-widest pt-2",
          sectionTitle: "text-lg font-bold uppercase tracking-widest border-b border-black/10 pb-2",
          company: "font-bold text-lg",
        };
    }
  };

  const styles = getTemplateStyles();

  const ResumeContent = ({ 
    contentData, 
    contentStyles, 
    contentVisibleSections, 
    contentWeakWords,
    isModal = false
  }: { 
    contentData: ResumeData, 
    contentStyles: any, 
    contentVisibleSections: any, 
    contentWeakWords: string[],
    isModal?: boolean
  }) => (
    <div className={cn("max-w-[800px] mx-auto space-y-8", isModal && "origin-top transition-transform duration-200")} style={isModal ? { transform: `scale(${zoomLevel})` } : {}}>
      <div className={contentStyles.header}>
        <h2 className={contentStyles.name}>{contentData.name || 'Your Name'}</h2>
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-500">
          {contentData.email && <span>{contentData.email}</span>}
          {contentData.phone && <span>• {contentData.phone}</span>}
          {contentData.location && <span>• {contentData.location}</span>}
        </div>
        <p className={contentStyles.role}>{contentData.role || 'Target Role'}</p>
      </div>

      {contentData.summary && contentVisibleSections.summary && (
        <div className="space-y-3">
          <h3 className={contentStyles.sectionTitle}>Professional Summary</h3>
          <p className="text-sm leading-relaxed text-gray-700">{contentData.summary}</p>
        </div>
      )}

      {contentData.experience.length > 0 && contentVisibleSections.experience && (
        <div className="space-y-6">
          <h3 className={contentStyles.sectionTitle}>Experience</h3>
          {contentData.experience.map(exp => (
            <div key={exp.id} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h4 className={contentStyles.company}>{exp.company}</h4>
                <span className="text-xs font-medium text-gray-400">{exp.duration}</span>
              </div>
              <p className="text-sm font-bold text-gray-600 italic">{exp.role}</p>
              <ul className="list-disc list-outside ml-5 space-y-1">
                {exp.bullets.map((bullet, i) => (
                  <li key={i} className="text-sm leading-relaxed text-gray-700">
                    {bullet.split(' ').map((word, wi) => {
                      const isWeak = contentWeakWords.some(ww => word.toLowerCase().includes(ww.toLowerCase()));
                      return (
                        <span key={wi} className={isWeak ? "bg-red-50 text-red-600 px-0.5 rounded" : ""}>
                          {word}{' '}
                        </span>
                      );
                    })}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {contentData.projects && contentData.projects.length > 0 && contentVisibleSections.projects && (
        <div className="space-y-6">
          <h3 className={contentStyles.sectionTitle}>Projects</h3>
          {contentData.projects.map(proj => (
            <div key={proj.id} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold text-gray-900">{proj.title}</h4>
                {proj.technologies && (
                  <div className="flex gap-1">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {contentData.skills.length > 0 && contentVisibleSections.skills && (
        <div className="space-y-3">
          <h3 className={contentStyles.sectionTitle}>Skills</h3>
          <div className="flex flex-wrap gap-2">
            {contentData.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {contentData.education.length > 0 && contentVisibleSections.education && (
        <div className="space-y-6">
          <h3 className={contentStyles.sectionTitle}>Education</h3>
          {contentData.education.map(edu => (
            <div key={edu.id} className="flex justify-between items-baseline">
              <div>
                <h4 className="font-bold text-gray-900">{edu.school}</h4>
                <p className="text-sm text-gray-600">{edu.degree}</p>
              </div>
              <span className="text-xs font-medium text-gray-400">{edu.year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weakWords, setWeakWords] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState<string | null>(null);
  const [isGlobalImproving, setIsGlobalImproving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [isAtsOptimizing, setIsAtsOptimizing] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    summary: true,
    experience: true,
    projects: true,
    skills: true,
    education: true
  });

  const calculateAtsScore = useCallback(() => {
    let score = 0;
    if (data.name) score += 5;
    if (data.role) score += 5;
    if (data.summary && data.summary.length > 50) score += 10;
    if (data.skills.length >= 5) score += 15;
    if (data.experience.length >= 2) score += 20;
    if (data.education.length >= 1) score += 10;
    
    // Check for keywords in experience
    const allExpText = data.experience.flatMap(e => e.bullets).join(' ').toLowerCase();
    const commonKeywords = ['led', 'managed', 'developed', 'achieved', 'increased', 'optimized', 'scaled'];
    const keywordCount = commonKeywords.filter(k => allExpText.includes(k)).length;
    score += Math.min(keywordCount * 5, 25);
    
    // Template bonus
    const currentTemplate = TEMPLATES.find(t => t.id === currentTemplateId);
    if (currentTemplate?.type === 'Minimal') score += 10;
    
    setAtsScore(Math.min(score, 100));
  }, [data, currentTemplateId]);

  useEffect(() => {
    calculateAtsScore();
  }, [calculateAtsScore]);

  const handleAtsOptimize = async () => {
    setIsAtsOptimizing(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      const keywords = await generateKeywords(data.role, "Expert");
      setData(prev => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...keywords])),
        summary: prev.summary.length < 100 ? "Accomplished " + prev.role + " with a proven track record of delivering high-impact solutions and driving operational excellence in fast-paced environments." : prev.summary
      }));
    } catch (error) {
      console.error('ATS Optimization failed:', error);
    } finally {
      setIsAtsOptimizing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.name.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const handleAddKeywords = async () => {
    setIsGeneratingKeywords(true);
    try {
      const keywords = await generateKeywords(data.role, "Experienced");
      setData(prev => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...keywords]))
      }));
    } catch (error) {
      console.error('Failed to generate keywords:', error);
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  const handleUpdateExperience = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const handleUpdateEducation = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const handleUpdateProject = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects?.map(proj => proj.id === id ? { ...proj, [field]: value } : proj) || []
    }));
  };

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    setData(prev => {
      const index = prev.experience.findIndex(e => e.id === id);
      if (index === -1) return prev;
      const newExp = [...prev.experience];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newExp.length) return prev;
      [newExp[index], newExp[targetIndex]] = [newExp[targetIndex], newExp[index]];
      return { ...prev, experience: newExp };
    });
  };

  const moveEducation = (id: string, direction: 'up' | 'down') => {
    setData(prev => {
      const index = prev.education.findIndex(e => e.id === id);
      if (index === -1) return prev;
      const newEdu = [...prev.education];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newEdu.length) return prev;
      [newEdu[index], newEdu[targetIndex]] = [newEdu[targetIndex], newEdu[index]];
      return { ...prev, education: newEdu };
    });
  };

  const moveProject = (id: string, direction: 'up' | 'down') => {
    setData(prev => {
      const projects = prev.projects || [];
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return prev;
      const newProj = [...projects];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newProj.length) return prev;
      [newProj[index], newProj[targetIndex]] = [newProj[targetIndex], newProj[index]];
      return { ...prev, projects: newProj };
    });
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Math.random().toString(36).substr(2, 9), company: '', role: '', duration: '', bullets: [''] }]
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: Math.random().toString(36).substr(2, 9), school: '', degree: '', year: '' }]
    }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { id: Math.random().toString(36).substr(2, 9), title: '', description: '', technologies: [] }]
    }));
  };

  const handleImproveBullet = async (expId: string, bulletIndex: number) => {
    const exp = data.experience.find(e => e.id === expId);
    if (!exp) return;
    const bullet = exp.bullets[bulletIndex];
    if (!bullet) return;

    setIsImproving(`${expId}-${bulletIndex}`);
    try {
      const improved = await improveBullet(bullet, data.role);
      const newBullets = [...exp.bullets];
      newBullets[bulletIndex] = improved;
      handleUpdateExperience(expId, 'bullets', newBullets);
    } catch (error) {
      console.error('Failed to improve bullet:', error);
    } finally {
      setIsImproving(null);
    }
  };

  const handleGlobalImprove = async () => {
    setIsGlobalImproving(true);
    try {
      const improvedData = await rewriteResume(data, jd);
      setData(improvedData);
    } catch (error) {
      console.error('Failed to rewrite resume:', error);
    } finally {
      setIsGlobalImproving(false);
    }
  };

  const checkSuggestions = useCallback(async (text: string) => {
    if (text.length < 10) return;
    try {
      const result = await getRealtimeSuggestions(text, data.role, jd);
      setSuggestions(result.suggestions);
      setWeakWords(result.weakWords);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  }, [data.role, jd]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const allText = [
        ...data.experience.flatMap(e => e.bullets),
        ...data.skills
      ].join(' ');
      checkSuggestions(allText);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, checkSuggestions]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight size={20} className="rotate-180" />
            <span className="text-xs uppercase tracking-widest font-mono hidden md:inline">Back</span>
          </button>
          {onBackToDashboard && (
            <button onClick={onBackToDashboard} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 border-l border-white/10 pl-6">
              <span className="text-xs uppercase tracking-widest font-mono">Dashboard</span>
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("w-2 h-2 rounded-full", isAutoSaving ? "bg-cyan-500 animate-pulse" : "bg-white/20")} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {isAutoSaving ? 'Saving...' : lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Draft ready'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowTemplateSelector(true)}
            className="bg-white/5 border-white/10"
          >
            <Layout size={16} className="mr-2 text-purple-400" />
            Switch Template
          </Button>

          <Button 
            variant="primary" 
            onClick={handleGlobalImprove} 
            disabled={isGlobalImproving}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 border-none shadow-lg shadow-cyan-500/20"
          >
            {isGlobalImproving ? <Loader2 className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
            Global Rewrite
          </Button>

          <Button variant="outline" onClick={handleAtsOptimize} disabled={isAtsOptimizing}>
            {isAtsOptimizing ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck size={16} className="mr-2 text-emerald-400" />}
            Optimize for ATS
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowJdModal(true)}
            className={cn("border-cyan-500/30", jd ? "text-cyan-400 bg-cyan-400/10" : "text-white/40")}
          >
            <Target size={16} className="mr-2" />
            {jd ? 'JD Context Active' : 'Add JD Context'}
          </Button>

          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download size={16} className="mr-2" /> Export PDF
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowQuickPreview(true)}
            className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
          >
            <Maximize size={16} className="mr-2" /> Quick Preview
          </Button>

          <Button variant="outline" onClick={() => onAnalyze(data, jd)} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Wand2 size={16} className="mr-2" />}
            Analyze
          </Button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden p-2 rounded-xl bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Left: Input Form */}
        <div className={cn("overflow-y-auto pr-4 space-y-6 custom-scrollbar", !showPreview && "lg:block")}>
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Personal Information
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setVisibleSections(prev => ({ ...prev, summary: !prev.summary }))}
                  className={cn("p-1.5 rounded-lg transition-colors", visibleSections.summary ? "text-cyan-400 bg-cyan-400/10" : "text-white/20 hover:text-white/40")}
                  title="Toggle Summary"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Full Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Target Role</label>
                <input
                  type="text"
                  value={data.role}
                  onChange={e => setData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={e => setData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Phone</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={e => setData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center justify-between">
                  Professional Summary
                  {!visibleSections.summary && <span className="text-[8px] text-red-400/60 lowercase tracking-normal font-sans">(Hidden in preview)</span>}
                </label>
                <textarea
                  value={data.summary}
                  onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/50 outline-none transition-colors min-h-[100px]"
                  placeholder="Briefly describe your professional background and key strengths..."
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Experience
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addExperience} className="h-8 text-xs">
                  <Plus size={14} className="mr-1.5" /> Add
                </Button>
                <button 
                  onClick={() => setVisibleSections(prev => ({ ...prev, experience: !prev.experience }))}
                  className={cn("p-1.5 rounded-lg transition-colors", visibleSections.experience ? "text-cyan-400 bg-cyan-400/10" : "text-white/20 hover:text-white/40")}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {data.experience.map(exp => (
                <div key={exp.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button onClick={() => moveExperience(exp.id, 'up')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="-rotate-90" /></button>
                    <button onClick={() => moveExperience(exp.id, 'down')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="rotate-90" /></button>
                    <button onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))} className="p-1.5 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={e => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={e => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={e => handleUpdateExperience(exp.id, 'duration', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Key Achievements</label>
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-1 relative">
                          <textarea
                            value={bullet}
                            onChange={e => {
                              const newBullets = [...exp.bullets];
                              newBullets[idx] = e.target.value;
                              handleUpdateExperience(exp.id, 'bullets', newBullets);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors min-h-[60px]"
                            placeholder="Describe a key achievement..."
                          />
                          <button
                            onClick={() => handleImproveBullet(exp.id, idx)}
                            disabled={isImproving === `${exp.id}-${idx}`}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                          >
                            {isImproving === `${exp.id}-${idx}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          </button>
                        </div>
                        <button onClick={() => {
                          const newBullets = exp.bullets.filter((_, i) => i !== idx);
                          handleUpdateExperience(exp.id, 'bullets', newBullets);
                        }} className="mt-2 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleUpdateExperience(exp.id, 'bullets', [...exp.bullets, ''])}
                      className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all text-xs"
                    >
                      + Add Achievement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Projects
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addProject} className="h-8 text-xs">
                  <Plus size={14} className="mr-1.5" /> Add
                </Button>
                <button 
                  onClick={() => setVisibleSections(prev => ({ ...prev, projects: !prev.projects }))}
                  className={cn("p-1.5 rounded-lg transition-colors", visibleSections.projects ? "text-cyan-400 bg-cyan-400/10" : "text-white/20 hover:text-white/40")}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {data.projects?.map(proj => (
                <div key={proj.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button onClick={() => moveProject(proj.id, 'up')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="-rotate-90" /></button>
                    <button onClick={() => moveProject(proj.id, 'down')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="rotate-90" /></button>
                    <button onClick={() => setData(prev => ({ ...prev, projects: prev.projects?.filter(p => p.id !== proj.id) }))} className="p-1.5 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={e => handleUpdateProject(proj.id, 'title', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Description</label>
                      <textarea
                        value={proj.description}
                        onChange={e => handleUpdateProject(proj.id, 'description', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies?.join(', ')}
                        onChange={e => handleUpdateProject(proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Skills
              </h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddKeywords} 
                  disabled={isGeneratingKeywords}
                  className="h-8 text-[10px] border-cyan-500/20 text-cyan-400"
                >
                  {isGeneratingKeywords ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                  AI Keywords
                </Button>
                <button 
                  onClick={() => setVisibleSections(prev => ({ ...prev, skills: !prev.skills }))}
                  className={cn("p-1.5 rounded-lg transition-colors", visibleSections.skills ? "text-cyan-400 bg-cyan-400/10" : "text-white/20 hover:text-white/40")}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                  <input
                    type="text"
                    value={skill}
                    onChange={e => {
                      const newSkills = [...data.skills];
                      newSkills[idx] = e.target.value;
                      setData(prev => ({ ...prev, skills: newSkills }));
                    }}
                    className="bg-transparent border-none outline-none text-xs w-20"
                  />
                  <button onClick={() => setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
              <button 
                onClick={() => setData(prev => ({ ...prev, skills: [...prev.skills, ''] }))}
                className="px-3 py-1 rounded-full border border-dashed border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-all text-xs"
              >
                + Add Skill
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="mt-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">Skill Improvement Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.filter(s => s.toLowerCase().includes('skill') || s.toLowerCase().includes('keyword') || s.length < 30).slice(0, 6).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setData(prev => ({
                          ...prev,
                          skills: Array.from(new Set([...prev.skills, s.replace(/suggested skill:|keyword:|skill:/gi, '').trim()]))
                        }));
                      }}
                      className="text-[10px] bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 px-2.5 py-1 rounded-lg transition-all text-white/60 hover:text-cyan-400"
                    >
                      + {s.replace(/suggested skill:|keyword:|skill:/gi, '').trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Education
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={addEducation} className="h-8 text-xs">
                  <Plus size={14} className="mr-1.5" /> Add
                </Button>
                <button 
                  onClick={() => setVisibleSections(prev => ({ ...prev, education: !prev.education }))}
                  className={cn("p-1.5 rounded-lg transition-colors", visibleSections.education ? "text-cyan-400 bg-cyan-400/10" : "text-white/20 hover:text-white/40")}
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {data.education.map(edu => (
                <div key={edu.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button onClick={() => moveEducation(edu.id, 'up')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="-rotate-90" /></button>
                    <button onClick={() => moveEducation(edu.id, 'down')} className="p-1.5 text-white/20 hover:text-cyan-400 transition-colors"><ArrowRight size={14} className="rotate-90" /></button>
                    <button onClick={() => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))} className="p-1.5 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">School/University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={e => handleUpdateEducation(edu.id, 'school', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={e => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={e => handleUpdateEducation(edu.id, 'year', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-cyan-500/50 outline-none transition-colors"
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: Live Preview */}
        <div className={cn("flex flex-col gap-6 overflow-hidden", !showPreview && "hidden lg:flex")}>
          {/* ATS Score Gauge */}
          <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                  <circle 
                    cx="24" cy="24" r="20" fill="transparent" stroke="currentColor" strokeWidth="4" 
                    strokeDasharray={125.6} 
                    strokeDashoffset={125.6 - (125.6 * atsScore) / 100}
                    className={cn("transition-all duration-1000", atsScore > 80 ? "text-emerald-500" : atsScore > 50 ? "text-amber-500" : "text-red-500")}
                  />
                </svg>
                <span className="absolute text-[10px] font-black">{atsScore}%</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">ATS Optimization Score</h4>
                <p className="text-[10px] text-white/40">Higher score = better machine readability</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn("px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest", atsScore > 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                {atsScore > 80 ? 'ATS Ready' : 'Needs Work'}
              </div>
            </div>
          </GlassCard>

          <div className={cn("flex-1 bg-white rounded-3xl overflow-y-auto text-black shadow-2xl print:shadow-none print:m-0 print:p-0 custom-scrollbar resume-preview-pane")}>
            <div ref={previewRef} className="p-12 min-h-full bg-white">
              <ResumeContent 
                contentData={data} 
                contentStyles={styles} 
                contentVisibleSections={visibleSections} 
                contentWeakWords={weakWords} 
              />
            </div>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <GlassCard className="p-5 border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-center gap-2 text-cyan-400 mb-3">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em]">AI Suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex gap-2 text-xs text-white/60 bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <CheckCircle2 size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                        <p>{s}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {showQuickPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Eye className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Interactive Quick Preview</h3>
                    <p className="text-sm text-white/40">Review your resume layout and content in detail</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1 border border-white/10">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                      title="Zoom Out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <span className="text-xs font-mono w-12 text-center text-white/80">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60"
                      title="Zoom In"
                    >
                      <ZoomIn size={18} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button 
                      onClick={() => setZoomLevel(1)}
                      className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 rounded-lg transition-colors text-white/40"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowQuickPreview(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-12 bg-slate-800/50 custom-scrollbar flex justify-center">
                <div 
                  ref={modalPreviewRef}
                  className="bg-white text-black shadow-2xl rounded-sm origin-top transition-transform duration-200"
                  style={{ 
                    width: '210mm', 
                    minHeight: '297mm',
                    padding: '20mm',
                    transform: `scale(${zoomLevel})`,
                    marginBottom: `${(zoomLevel - 1) * 297}mm` // Adjust margin to allow scrolling
                  }}
                >
                  <ResumeContent 
                    contentData={data} 
                    contentStyles={styles} 
                    contentVisibleSections={visibleSections} 
                    contentWeakWords={weakWords}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <AlertCircle size={14} />
                  <span>This is a high-fidelity preview of how your resume will look when exported.</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowQuickPreview(false)}>
                    Close Preview
                  </Button>
                  <Button variant="primary" onClick={handleDownloadPDF}>
                    <Download size={16} className="mr-2" />
                    Export as PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Selector Modal */}
      <AnimatePresence>
        {showTemplateSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplateSelector(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Choose Template</h2>
                  <p className="text-xs text-white/40 mt-1">Select a design that matches your professional identity.</p>
                </div>
                <button 
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTemplateId(t.id);
                        setShowTemplateSelector(false);
                      }}
                      className={cn(
                        "group relative flex flex-col text-left p-4 rounded-2xl border transition-all",
                        currentTemplateId === t.id 
                          ? "bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/50" 
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className={cn("w-full aspect-[3/4] rounded-xl mb-4 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity", t.previewColor)} />
                      <h4 className="font-bold text-sm">{t.name}</h4>
                      <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{t.description}</p>
                      {t.badge && (
                        <span className="absolute top-6 right-6 px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-mono uppercase tracking-widest text-white/60">
                          {t.badge}
                        </span>
                      )}
                      {currentTemplateId === t.id && (
                        <div className="absolute top-6 left-6 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* JD Context Modal */}
      <AnimatePresence>
        {showJdModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Target className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Job Description Context</h3>
                    <p className="text-sm text-white/40">Provide the JD to tailor your resume improvements</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowJdModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <label className="block text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">
                  Paste Job Description
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none font-mono text-sm"
                />
                
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <AlertCircle size={14} />
                    <span>Adding a JD helps the AI prioritize relevant keywords and skills.</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowJdModal(false)}>
                      Save Context
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        setShowJdModal(false);
                        handleGlobalImprove();
                      }}
                      disabled={isGlobalImproving}
                    >
                      {isGlobalImproving ? <Loader2 className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
                      Save & Global Rewrite
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
