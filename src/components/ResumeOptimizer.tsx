import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Download, 
  ChevronRight,
  Target,
  Search,
  Zap,
  Eye,
  Edit3,
  History
} from 'lucide-react';
import { analyzeResume } from '../services/gemini';
import { db, collection, addDoc, auth, getDocs, query, where, orderBy, limit, handleFirestoreError, OperationType } from '../lib/firebase';
import { extractTextFromFile } from '../lib/fileParser';
import ReactMarkdown from 'react-markdown';

export const ResumeOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'OPTIMIZATION' | 'RECRUITER' | 'REWRITE'>('OPTIMIZATION');
  const [showRecruiterView, setShowRecruiterView] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    const path = 'resumes';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false 
  });

  const handleAnalyze = async () => {
    if (!file || !jobDescription) return;
    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      const analysis = await analyzeResume(text, jobDescription);
      setResult(analysis);
      
      // Save to history
      if (auth.currentUser) {
        const path = 'resumes';
        try {
          await addDoc(collection(db, path), {
            userId: auth.currentUser.uid,
            title: file.name,
            content: text,
            atsScore: analysis.atsScore,
            optimization: analysis.optimization,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <FileText size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Resume Optimizer PRO</h2>
          </div>
          <p className="text-white/40 text-lg">Optimize your resume for ATS and recruiters with AI precision.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) fetchHistory();
            }}
            className="glass-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            <History size={14} /> History
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-8 border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.length === 0 && <p className="text-white/40 text-sm italic col-span-full">No history found.</p>}
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setResult({ atsScore: item.atsScore, optimization: item.optimization });
                    setShowHistory(false);
                  }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest truncate max-w-[150px]">{item.title}</span>
                    <span className="text-[10px] text-white/20">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/40">ATS Score: {item.atsScore}</span>
                    <ChevronRight size={12} className="text-white/20 group-hover:text-white transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
              <div className="glass-card p-8 border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Upload size={20} className="text-blue-400" /> Upload Resume
                </h3>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                    isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/2'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <FileText size={40} className="text-white/20 group-hover:text-blue-400/50 transition-colors" />
                    </div>
                    {file ? (
                      <div>
                        <p className="text-blue-400 font-bold">{file.name}</p>
                        <p className="text-white/40 text-xs mt-1">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/60 font-medium">Drag & drop your resume here</p>
                        <p className="text-white/40 text-xs mt-1">Supports PDF, TXT (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Target size={20} className="text-purple-400" /> Job Description
                </h3>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="w-full h-64 notion-style-input text-sm resize-none"
                />
              </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8 border-white/5 h-full flex flex-col justify-center items-center text-center">
              <div className="p-6 bg-blue-500/10 rounded-full mb-8">
                <Sparkles size={64} className="text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to Optimize?</h3>
              <p className="text-white/40 mb-12 max-w-sm">Our AI will analyze your resume against the job description and provide actionable improvements.</p>
              
              <button
                onClick={handleAnalyze}
                disabled={!file || !jobDescription || loading}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  !file || !jobDescription || loading
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-gradient-primary text-white shadow-lg shadow-blue-500/20 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Zap size={20} /> Start AI Optimization
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 glass-card p-8 border-white/5 flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * result.atsScore) / 100}
                    className="text-blue-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{result.atsScore}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1 uppercase tracking-widest text-white/40">ATS Score</h3>
              <p className="text-xs text-blue-400 font-bold">Optimization Success</p>
            </div>

            <div className="lg:col-span-3 glass-card p-8 border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  {[
                    { id: 'OPTIMIZATION', label: 'AI Optimization', icon: Sparkles },
                    { id: 'RECRUITER', label: 'Recruiter View', icon: Eye },
                    { id: 'REWRITE', label: 'One-Click Rewrite', icon: Edit3 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        viewMode === tab.id 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
                <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                  <Download size={18} />
                </button>
              </div>

              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    {viewMode === 'OPTIMIZATION' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Search size={14} /> Keyword Suggestions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.optimization.keywordSuggestions.map((kw: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/20">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Zap size={14} /> Bullet Improvements
                          </h4>
                          <ul className="space-y-3">
                            {result.optimization.bulletImprovements.map((bullet: string, i: number) => (
                              <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {viewMode === 'RECRUITER' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Recruiter Analysis</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Toggle Detail</span>
                            <button 
                              onClick={() => setShowRecruiterView(!showRecruiterView)}
                              className={`w-10 h-5 rounded-full transition-all relative ${showRecruiterView ? 'bg-blue-500' : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showRecruiterView ? 'left-6' : 'left-1'}`} />
                            </button>
                          </div>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <div className={`p-8 bg-white/5 rounded-2xl border border-white/10 transition-all ${showRecruiterView ? 'opacity-100' : 'opacity-40 blur-sm'}`}>
                            <ReactMarkdown>{result.optimization.recruiterView}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {viewMode === 'REWRITE' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">AI-Enhanced Version</h4>
                          <button className="text-xs font-bold text-blue-400 flex items-center gap-2">
                            <RefreshCw size={14} /> Regenerate
                          </button>
                        </div>
                        <div className="p-8 bg-white/5 rounded-2xl border border-white/10 font-serif text-white/80 leading-relaxed whitespace-pre-wrap">
                          {result.optimization.oneClickRewrite}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setResult(null)}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
            >
              <RefreshCw size={16} /> Start New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
