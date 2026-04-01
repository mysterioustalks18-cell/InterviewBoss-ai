import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Award,
  Activity,
  User,
  Bot
} from 'lucide-react';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../services/gemini';
import { db, collection, addDoc, auth, getDocs, query, where, orderBy, limit, handleFirestoreError, OperationType } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';

type InterviewMode = 'HR' | 'Technical' | 'Stress' | 'Behavioral' | 'Company Fit';

export const InterviewTrainer: React.FC = () => {
  const [mode, setMode] = useState<InterviewMode>('HR');
  const [role, setRole] = useState('Software Engineer');
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = async () => {
    if (!auth.currentUser) return;
    const path = 'interviews';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      setSessionHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentQuestion]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const q = await generateInterviewQuestion(role, mode, []);
      setCurrentQuestion(q);
      setIsStarted(true);
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer || loading) return;
    setLoading(true);
    try {
      const evalResult = await evaluateInterviewAnswer(currentQuestion.question, userAnswer);
      setEvaluation(evalResult);
      setTotalScore(prev => prev + evalResult.score);
      
      const newHistoryItem = {
        question: currentQuestion.question,
        answer: userAnswer,
        evaluation: evalResult,
        timestamp: new Date().toISOString()
      };
      
      setHistory(prev => [...prev, newHistoryItem]);
      setUserAnswer('');
      
      // Generate next question
      const nextQ = await generateInterviewQuestion(role, mode, [...history, newHistoryItem]);
      setCurrentQuestion(nextQ);
      setEvaluation(null);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (auth.currentUser) {
      const path = 'interviews';
      try {
        await addDoc(collection(db, path), {
          userId: auth.currentUser.uid,
          role,
          mode,
          questions: history,
          score: Math.round(totalScore / history.length),
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
    setIsStarted(false);
    setHistory([]);
    setCurrentQuestion(null);
    setTotalScore(0);
  };

  const toggleListening = () => {
    if (!isListening) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
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
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">AI Interview Trainer PRO</h2>
          </div>
          <p className="text-white/40 text-lg">Master your interview skills with real-time AI feedback and scoring.</p>
        </div>
        {!isStarted && (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) fetchHistory();
              }}
              className="glass-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} className={showHistory ? 'animate-spin' : ''} /> History
            </button>
            <div className="flex gap-2 flex-wrap">
              {(['HR', 'Technical', 'Stress', 'Behavioral', 'Company Fit'] as InterviewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === m 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {showHistory && !isStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-8 border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionHistory.length === 0 && <p className="text-white/40 text-sm italic col-span-full">No history found.</p>}
              {sessionHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setRole(item.role);
                    setMode(item.mode);
                    setHistory(item.questions);
                    setIsStarted(true);
                    setShowHistory(false);
                  }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest truncate max-w-[150px]">{item.role}</span>
                    <span className="text-[10px] text-white/20">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/40">Avg Score: {item.score}</span>
                    <ChevronRight size={12} className="text-white/20 group-hover:text-white transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isStarted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 border-white/5 space-y-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target size={20} className="text-purple-400" /> Session Setup
            </h3>
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-white/40">Target Role</label>
              <input 
                type="text" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full notion-style-input p-4 text-sm"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10 space-y-4">
              <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest">Selected Mode: {mode}</h4>
              <p className="text-xs text-white/40 leading-relaxed">
                {mode === 'HR' && "Focuses on behavioral questions, cultural fit, and soft skills."}
                {mode === 'Technical' && "Focuses on domain knowledge, architecture, and problem-solving."}
                {mode === 'Stress' && "Focuses on high-pressure scenarios, critical thinking, and conflict resolution."}
                {mode === 'Behavioral' && "Focuses on past experiences, actions, and how you handle specific situations."}
                {mode === 'Company Fit' && "Focuses on alignment with company values, mission, and team culture."}
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-5 bg-gradient-primary rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
              Start AI Interview
            </button>
          </div>

          <div className="glass-card p-8 border-white/5 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-purple-500/10 rounded-full mb-8">
              <Award size={64} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Pro Performance Tracking</h3>
            <p className="text-white/40 mb-8 max-w-sm">Get real-time scores on confidence, clarity, and relevance. Improve with STAR method suggestions.</p>
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { label: 'Confidence', icon: Activity },
                { label: 'Clarity', icon: Sparkles },
                { label: 'Relevance', icon: Target },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <m.icon size={20} className="text-purple-400 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-8 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 min-h-0">
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar"
              >
                {history.map((item, i) => (
                  <div key={i} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Bot size={20} />
                      </div>
                      <div className="glass-card p-6 border-white/5 flex-1">
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
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">AI Feedback</h4>
                          <span className="text-xs font-bold text-purple-400">Score: {item.evaluation.score}/100</span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{item.evaluation.feedback}</p>
                        <div className="pt-4 border-t border-white/5">
                          <h5 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">STAR Method Improvement</h5>
                          <p className="text-xs text-white/40 italic leading-relaxed">{item.evaluation.starMethodImprovement}</p>
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
                    onClick={handleSubmit}
                    disabled={!userAnswer || loading}
                    className={`p-3 rounded-xl transition-all ${
                      !userAnswer || loading ? 'bg-white/5 text-white/20' : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20 active:scale-95'
                    }`}
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-8 border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Live Performance</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Confidence', value: history.length > 0 ? history[history.length-1].evaluation?.metrics?.confidence || 0 : 0 },
                    { label: 'Clarity', value: history.length > 0 ? history[history.length-1].evaluation?.metrics?.clarity || 0 : 0 },
                    { label: 'Relevance', value: history.length > 0 ? history[history.length-1].evaluation?.metrics?.relevance || 0 : 0 },
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
                          className="h-full bg-purple-500" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Session Info</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Role</span>
                    <span className="font-bold">{role}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Mode</span>
                    <span className="font-bold text-purple-400">{mode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Questions</span>
                    <span className="font-bold">{history.length}</span>
                  </div>
                </div>
                <button
                  onClick={handleEnd}
                  className="w-full mt-8 py-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
