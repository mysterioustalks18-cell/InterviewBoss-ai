import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Target, 
  Zap, 
  Loader2, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Award, 
  ChevronRight,
  RefreshCw,
  User,
  Bot,
  BrainCircuit,
  BarChart3,
  ClipboardCheck,
  ShieldCheck
} from 'lucide-react';
import { 
  analyzeSmartInterviewMatch, 
  generateSmartInterviewQuestion, 
  evaluateSmartInterviewAnswer, 
  generateSmartInterviewFinalReport 
} from '../services/gemini';
import { db, collection, addDoc, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { extractTextFromFile } from '../lib/fileParser';
import ReactMarkdown from 'react-markdown';

type InterviewStep = 'SETUP' | 'ANALYSIS' | 'INTERVIEW' | 'REPORT';

export const SmartInterview: React.FC = () => {
  const [step, setStep] = useState<InterviewStep>('SETUP');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [interviewMode, setInterviewMode] = useState<string>('HR');
  const [loading, setLoading] = useState(false);
  
  // Analysis Data
  const [matchData, setMatchData] = useState<any>(null);
  
  // Interview Data
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<any>(null);
  
  // Final Report
  const [finalReport, setFinalReport] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentQuestion, lastFeedback]);

  const onDropResume = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setResumeFile(file);
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
    } catch (error) {
      console.error('Failed to extract text:', error);
    }
  }, []);

  const { getRootProps: getResumeProps, getInputProps: getResumeInput, isDragActive: isResumeActive } = useDropzone({
    onDrop: onDropResume,
    accept: { 
      'application/pdf': ['.pdf'], 
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleStartAnalysis = async () => {
    if (!resumeText || !jobDescription) return;
    setLoading(true);
    try {
      const data = await analyzeSmartInterviewMatch(resumeText, jobDescription);
      setMatchData(data);
      setStep('ANALYSIS');
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const q = await generateSmartInterviewQuestion(resumeText, jobDescription, [], matchData, interviewMode);
      setCurrentQuestion(q);
      setStep('INTERVIEW');
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer || loading) return;
    setLoading(true);
    try {
      const evalResult = await evaluateSmartInterviewAnswer(
        currentQuestion.question, 
        userAnswer, 
        resumeText, 
        jobDescription
      );
      
      const newHistoryItem = {
        question: currentQuestion.question,
        type: currentQuestion.type,
        answer: userAnswer,
        evaluation: evalResult,
        timestamp: new Date().toISOString()
      };
      
      setHistory(prev => [...prev, newHistoryItem]);
      setLastFeedback(evalResult);
      setUserAnswer('');
      
      // Check if we should continue or end (e.g. after 5 questions)
      if (history.length >= 4) {
        handleFinishInterview([...history, newHistoryItem]);
      } else {
        const nextQ = await generateSmartInterviewQuestion(
          resumeText, 
          jobDescription, 
          [...history, newHistoryItem], 
          matchData,
          interviewMode
        );
        setCurrentQuestion(nextQ);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async (fullHistory: any[]) => {
    setLoading(true);
    try {
      const report = await generateSmartInterviewFinalReport(fullHistory, resumeText, jobDescription);
      setFinalReport(report);
      setStep('REPORT');
      
      // Save to Firestore
      if (auth.currentUser) {
        const path = 'smart_interviews';
        try {
          await addDoc(collection(db, path), {
            userId: auth.currentUser.uid,
            resumeTitle: resumeFile?.name || 'Uploaded Resume',
            jobDescription: jobDescription.substring(0, 100) + '...',
            matchData,
            history: fullHistory,
            finalReport: report,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (!isListening) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">AI Smart Interview</h2>
          </div>
          <p className="text-white/40 text-lg">Personalized interview simulation based on your resume and target job.</p>
        </div>
        {step !== 'SETUP' && (
          <button 
            onClick={() => {
              setStep('SETUP');
              setMatchData(null);
              setHistory([]);
              setCurrentQuestion(null);
              setFinalReport(null);
              setLastFeedback(null);
            }}
            className="glass-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Reset
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {step === 'SETUP' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="glass-card p-8 border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Upload size={20} className="text-blue-400" /> 1. Upload Resume
                </h3>
                <div 
                  {...getResumeProps()} 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group ${
                    isResumeActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/2'
                  }`}
                >
                  <input {...getResumeInput()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <FileText size={40} className="text-white/20 group-hover:text-blue-400/50 transition-colors" />
                    </div>
                    {resumeFile ? (
                      <div>
                        <p className="text-blue-400 font-bold">{resumeFile.name}</p>
                        <p className="text-white/40 text-xs mt-1">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/60 font-medium">Drag & drop resume (PDF/TXT)</p>
                        <p className="text-white/40 text-xs mt-1">Personalized questions will be based on this</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Target size={20} className="text-purple-400" /> 2. Job Description
                </h3>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="w-full h-64 notion-style-input text-sm resize-none"
                />
              </div>

              <div className="glass-card p-8 border-white/5">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BrainCircuit size={20} className="text-cyan-400" /> 3. Interview Mode
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['HR', 'Technical', 'Stress', 'Behavioral', 'Company Fit'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setInterviewMode(m)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                        interviewMode === m 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="glass-card p-12 border-white/5 text-center space-y-8">
                <div className="p-6 bg-blue-500/10 rounded-full w-fit mx-auto">
                  <Zap size={64} className="text-blue-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Ready for Smart Analysis?</h3>
                  <p className="text-white/40 max-w-sm mx-auto">We'll match your profile with the job and generate a custom interview path.</p>
                </div>
                
                <button
                  onClick={handleStartAnalysis}
                  disabled={!resumeText || !jobDescription || loading}
                  className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                    !resumeText || !jobDescription || loading
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-gradient-primary text-white shadow-lg shadow-blue-500/20 active:scale-95'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  Analyze & Prepare
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'ANALYSIS' && matchData && (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 glass-card p-8 border-white/5 flex flex-col items-center justify-center text-center">
                <div className="relative w-40 h-40 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={465} strokeDashoffset={465 - (465 * matchData.matchScore) / 100}
                      className="text-blue-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold">{matchData.matchScore}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Match Score</span>
                  </div>
                </div>
                <p className="text-sm text-white/60">Based on your skills and the job requirements.</p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 border-white/5 space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {matchData.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card p-8 border-white/5 space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                    <AlertCircle size={16} /> Areas to Address
                  </h4>
                  <ul className="space-y-3">
                    {matchData.weakAreas.map((w: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="px-12 py-5 bg-gradient-primary rounded-2xl font-bold text-xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={24} />}
                Start Smart Interview
              </button>
            </div>
          </motion.div>
        )}

        {step === 'INTERVIEW' && (
          <motion.div 
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col gap-8 min-h-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
              <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar"
                >
                  {history.map((item, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <Bot size={20} />
                        </div>
                        <div className="glass-card p-6 border-white/5 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                              item.type === 'Follow-up' 
                                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{item.question}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <div className="glass-card p-6 bg-blue-500/10 border-blue-500/20 flex-1 text-right">
                          <p className="text-sm font-medium leading-relaxed text-blue-400">{item.answer}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <User size={20} />
                        </div>
                      </div>
                      <div className="pl-14">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">AI Feedback</h4>
                            <div className="flex gap-4">
                              {Object.entries(item.evaluation.metrics).map(([key, val]: [string, any]) => (
                                <div key={key} className="text-center">
                                  <p className="text-[8px] uppercase tracking-widest text-white/20">{key}</p>
                                  <p className="text-xs font-bold text-white/60">{val}%</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{item.evaluation.feedback}</p>
                          <div className="pt-6 border-t border-white/5">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                              <Sparkles size={12} /> Improved Answer
                            </h5>
                            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-white/50 italic leading-relaxed">
                              {item.evaluation.improvedAnswer}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentQuestion && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Bot size={20} />
                      </div>
                      <div className="glass-card p-6 border-white/5 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            currentQuestion.type === 'Follow-up' 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {currentQuestion.type}
                          </span>
                          <span className="text-[10px] text-white/20 italic">{currentQuestion.context}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{currentQuestion.question}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="glass-card p-6 border-white/5 relative group">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-32 bg-transparent border-none focus:outline-none text-sm resize-none pr-24 placeholder:text-white/20"
                  />
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-xl transition-all relative overflow-hidden ${
                        isListening ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isListening && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-white/30 rounded-full"
                        />
                      )}
                      {isListening ? <MicOff size={20} className="relative z-10" /> : <Mic size={20} className="relative z-10" />}
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer || loading}
                      className={`p-3 rounded-xl transition-all ${
                        !userAnswer || loading ? 'bg-white/5 text-white/20' : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-8 border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <BarChart3 size={14} /> Live Metrics
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Confidence', value: lastFeedback?.metrics?.confidence || 0, color: 'bg-blue-500' },
                      { label: 'Clarity', value: lastFeedback?.metrics?.clarity || 0, color: 'bg-purple-500' },
                      { label: 'Relevance', value: lastFeedback?.metrics?.relevance || 0, color: 'bg-emerald-500' },
                    ].map((m, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span>{m.label}</span>
                          <span>{m.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            className={`h-full ${m.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                    <ClipboardCheck size={14} /> Progress
                  </h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-white/40">Questions</span>
                    <span className="text-lg font-bold">{history.length} / 5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((q) => (
                      <div 
                        key={q} 
                        className={`h-1 rounded-full transition-all ${
                          q <= history.length ? 'bg-blue-500' : 'bg-white/10'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'REPORT' && finalReport && (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 glass-card p-8 border-white/5 flex flex-col items-center justify-center text-center">
                <div className="p-6 bg-blue-500/10 rounded-full mb-6">
                  <Award size={64} className="text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold mb-2">{finalReport.overallScore}%</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Overall Score</p>
                <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest ${
                  finalReport.recommendation.includes('Hire') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {finalReport.recommendation}
                </div>
              </div>

              <div className="lg:col-span-3 glass-card p-10 border-white/5 space-y-10">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Executive Summary</h4>
                  <p className="text-lg text-white/80 leading-relaxed">{finalReport.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                      <TrendingUp size={16} /> Key Strengths Shown
                    </h4>
                    <ul className="space-y-4">
                      {finalReport.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                      <AlertCircle size={16} /> Improvement Areas
                    </h4>
                    <ul className="space-y-4">
                      {finalReport.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex gap-4 text-sm text-white/60 leading-relaxed">
                          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setStep('SETUP')}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
              >
                Start New Interview
              </button>
              <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                Export Full Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
