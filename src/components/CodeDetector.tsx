import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  ChevronRight,
  Terminal,
  Bug,
  Activity,
  Cpu,
  Layers,
  Info,
  Copy,
  Check,
  History as HistoryIcon
} from 'lucide-react';
import { detectCodeErrors } from '../services/gemini';
import { db, collection, addDoc, getDocs, query, where, orderBy, limit, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'csharp', label: 'C#' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'php', label: 'PHP' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'swift', label: 'Swift' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'sql', label: 'SQL' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'shell', label: 'Shell' },
  { id: 'r', label: 'R' },
  { id: 'dart', label: 'Dart' },
];

export const CodeDetector: React.FC = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('// Paste your code here to analyze...');
  const [language, setLanguage] = useState('javascript');
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    const path = 'code_audits';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  const handleAnalyze = async () => {
    if (!code || loading || !user) return;
    setLoading(true);
    try {
      const analysis = await detectCodeErrors(code, language, beginnerMode);
      setResult(analysis);
      
      const path = 'code_audits';
      try {
        await addDoc(collection(db, path), {
          userId: user.uid,
          code,
          language,
          analysis,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: any) => {
    setCode(item.code);
    setLanguage(item.language);
    setResult(item.analysis);
    setShowHistory(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
              <Code size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Code Error Detector PRO</h2>
          </div>
          <p className="text-white/40 text-lg">Deep AI analysis for errors, optimizations, and security risks.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) fetchHistory();
            }}
            className="glass-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2 hover:bg-white/5"
          >
            <HistoryIcon size={14} /> History
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setBeginnerMode(false)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                !beginnerMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'
              }`}
            >
              Expert
            </button>
            <button
              onClick={() => setBeginnerMode(true)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                beginnerMode ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'
              }`}
            >
              Beginner
            </button>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer hover:bg-white/10"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[#0B0F1A]">{lang.label}</option>
            ))}
          </select>
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
                  onClick={() => loadFromHistory(item)}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{item.language}</span>
                    <span className="text-[10px] text-white/20">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate mb-2 font-mono">{item.code.substring(0, 50)}...</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/40">Score: {item.analysis.qualityScore}/100</span>
                    <ChevronRight size={12} className="text-white/20 group-hover:text-white transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card border-white/5 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-white/40" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Input Editor</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Analysis Active</span>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 }
                }}
              />
            </div>
            <div className="p-6 border-t border-white/5">
              <button
                onClick={handleAnalyze}
                disabled={loading || !code}
                className={`w-full py-4 bg-emerald-500 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 ${
                  loading || !code ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                {loading ? 'Analyzing Code...' : 'Analyze & Detect Errors'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 border-white/5 h-full flex flex-col items-center justify-center text-center"
              >
                <div className="p-6 bg-emerald-500/10 rounded-full mb-8">
                  <Sparkles size={64} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ready for Analysis</h3>
                <p className="text-white/40 max-w-sm leading-relaxed">Paste your code and click analyze to detect bugs, security risks, and optimization opportunities.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Quality Score', value: `${result.qualityScore}/100`, icon: Activity, color: 'text-emerald-400' },
                    { label: 'Complexity', value: result.timeComplexity, icon: Cpu, color: 'text-blue-400' },
                    { label: 'Bug Risk', value: result.bugRisk, icon: Bug, color: 'text-red-400' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-4 border-white/5 text-center">
                      <stat.icon size={18} className={`${stat.color} mx-auto mb-2`} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">{stat.label}</p>
                      <p className="text-sm font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-8 border-white/5 space-y-8">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-400" /> Issues Detected
                    </h4>
                    <div className="space-y-3">
                      {result.errors.length === 0 && result.warnings.length === 0 && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-400">No critical errors found.</span>
                        </div>
                      )}
                      {result.errors.map((err: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-red-400 font-medium leading-relaxed">{err}</span>
                        </div>
                      ))}
                      {result.warnings.map((warn: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-amber-400 font-medium leading-relaxed">{warn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" /> Fixed & Optimized Code
                    </h4>
                    <div className="relative group">
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={handleCopy}
                          className="p-2 bg-white/10 rounded-lg text-white/40 hover:text-white transition-all backdrop-blur-md"
                        >
                          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="bg-[#011627] rounded-2xl p-6 overflow-x-auto border border-white/5 text-sm font-mono leading-relaxed">
                        <pre className="text-emerald-400/90">{result.fixedCode}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Layers size={14} className="text-blue-400" /> Line-by-Line Explanation
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-white/60 leading-relaxed">
                        <ReactMarkdown>{result.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <RefreshCw size={14} className="text-purple-400" /> Refactor Suggestions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.refactorSuggestions.map((sug: string, i: number) => (
                        <div key={i} className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 flex items-center gap-3">
                          <ChevronRight size={14} className="text-purple-400" />
                          <span className="text-xs text-white/60 font-medium">{sug}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
