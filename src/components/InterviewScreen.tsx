import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Send, 
  RotateCcw, 
  Briefcase, 
  User, 
  Bot, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { Waveform } from './Waveform';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { ChatMessage, InterviewSession, InterviewFeedback } from '../types';
import { conductInterviewStep, generateInterviewFeedback, generateQuestion } from '../services/geminiService';

interface InterviewScreenProps {
  session: InterviewSession;
  onUpdateSession: (session: InterviewSession) => void;
  onFinish: (feedback: InterviewFeedback, transcript: string) => void;
  onExit: () => void;
}

export const InterviewScreen = ({ session, onUpdateSession, onFinish, onExit }: InterviewScreenProps) => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [session.messages, isThinking]);

  // Initial question if none exists
  useEffect(() => {
    if (session.messages.length === 0) {
      handleNextStep([]);
    }
  }, []);

  const handleNextStep = async (currentMessages: ChatMessage[]) => {
    setIsThinking(true);
    try {
      let nextQuestion;
      if (currentMessages.length === 0) {
        // For the first question, use generateQuestion for a more tailored initial prompt
        // Map persona to personaType and dialogueStyle
        const personaType = session.persona === 'Skeptic' ? 'TechLead' : 
                           session.persona === 'Visionary' ? 'CEO' : 'HRDirector';
        const dialogueStyle = session.persona === 'DrillSergeant' ? 'Aggressive' : 
                             session.persona === 'Skeptic' ? 'Sarcastic' : 
                             session.persona === 'Empathetic' ? 'Supportive' : 'Professional';

        nextQuestion = await generateQuestion(
          'Medium',
          personaType,
          'Technical',
          dialogueStyle,
          session.resume,
          session.jobDescription
        );
      } else {
        nextQuestion = await conductInterviewStep(
          currentMessages,
          session.role,
          session.experience,
          session.persona,
          session.resume,
          session.jobDescription
        );
      }

      const newMessage: ChatMessage = {
        role: 'assistant',
        content: nextQuestion,
        timestamp: new Date().toISOString()
      };

      onUpdateSession({
        ...session,
        messages: [...currentMessages, newMessage],
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
    } catch (error) {
      console.error('Failed to get next question:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...session.messages, userMessage];
    onUpdateSession({
      ...session,
      messages: updatedMessages
    });
    setInput('');

    if (session.currentQuestionIndex >= session.totalQuestions) {
      handleFinish(updatedMessages);
    } else {
      handleNextStep(updatedMessages);
    }
  };

  const handleFinish = async (finalMessages: ChatMessage[]) => {
    setIsThinking(true);
    try {
      const feedback = await generateInterviewFeedback(
        finalMessages,
        session.role,
        session.experience
      );

      onUpdateSession({
        ...session,
        messages: finalMessages,
        isFinished: true,
        feedback
      });
      setShowFeedback(true);
      
      // Trigger evolution analysis via callback
      const transcript = finalMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Interviewer'}: ${m.content}`)
        .join('\n');
      onFinish(feedback, transcript);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRestart = async () => {
    if (isThinking) return;
    
    // Reset local state
    setInput('');
    setShowFeedback(false);
    setIsThinking(true);

    try {
      // Create the reset session state
      const resetSession: InterviewSession = {
        ...session,
        messages: [],
        currentQuestionIndex: 0,
        isFinished: false,
        feedback: undefined
      };

      // Get the first question for the new session
      const personaType = session.persona === 'Skeptic' ? 'TechLead' : 
                         session.persona === 'Visionary' ? 'CEO' : 'HRDirector';
      const dialogueStyle = session.persona === 'DrillSergeant' ? 'Aggressive' : 
                           session.persona === 'Skeptic' ? 'Sarcastic' : 
                           session.persona === 'Empathetic' ? 'Supportive' : 'Professional';

      const nextQuestion = await generateQuestion(
        'Medium',
        personaType,
        'Technical',
        dialogueStyle,
        session.resume,
        session.jobDescription
      );

      const newMessage: ChatMessage = {
        role: 'assistant',
        content: nextQuestion,
        timestamp: new Date().toISOString()
      };

      // Update with the fresh session
      onUpdateSession({
        ...resetSession,
        messages: [newMessage],
        currentQuestionIndex: 1
      });
    } catch (error) {
      console.error('Failed to restart interview:', error);
    } finally {
      setIsThinking(false);
    }
  };

  if (showFeedback && session.feedback) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <button onClick={onExit} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono uppercase tracking-widest">Exit to Home</span>
          </button>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRestart}
              className="text-white/40 hover:text-white hover:bg-white/5"
              disabled={isThinking}
            >
              <RotateCcw size={16} className="mr-2" /> Restart Interview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <GlassCard className="p-8 text-center flex flex-col items-center gap-4">
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Overall Score</div>
            <div className="text-6xl font-bold text-cyan-400">{session.feedback.overall_score}</div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${session.feedback.overall_score}%` }}
                className="h-full bg-cyan-400" 
              />
            </div>
          </GlassCard>

          <GlassCard className="p-8 col-span-2">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Communication', value: session.feedback.communication, color: 'text-purple-400' },
                { label: 'Confidence', value: session.feedback.confidence, color: 'text-blue-400' },
                { label: 'Relevance', value: session.feedback.relevance, color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      className={`h-full ${stat.color.replace('text-', 'bg-')}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-400" size={20} /> Key Strengths
            </h3>
            <ul className="space-y-4">
              {session.feedback.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-white/70">
                  <span className="text-green-400 mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <XCircle className="text-red-400" size={20} /> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {session.feedback.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-3 text-white/70">
                  <span className="text-red-400 mt-1">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-yellow-400" size={24} /> Improved Sample Answers
          </h3>
          {session.feedback.improved_answers.map((item, i) => (
            <GlassCard key={i} className="p-8 space-y-6">
              <div>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block mb-2">Question</span>
                <p className="text-lg font-bold">{item.question}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <span className="text-[10px] font-mono text-red-400/50 uppercase tracking-widest block mb-2">Your Answer</span>
                  <p className="text-sm text-white/60 italic">"{item.answer}"</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <span className="text-[10px] font-mono text-green-400/50 uppercase tracking-widest block mb-2">AI Suggestion</span>
                  <p className="text-sm text-white/90">{item.improved}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-screen flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bot className="text-cyan-400" size={20} /> AI Interviewer
            </h2>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
              {session.role} // Question {session.currentQuestionIndex} of {session.totalQuestions}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">
            Live Session
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRestart}
            className="text-white/40 hover:text-white hover:bg-white/5"
            disabled={isThinking}
          >
            <RotateCcw size={16} className="mr-2" />
            <span className="hidden sm:inline">Restart Interview</span>
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence initial={false}>
          {session.messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'assistant' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'assistant' 
                    ? 'bg-white/5 border border-white/10 rounded-tl-none' 
                    : 'bg-purple-500/10 border border-purple-500/20 rounded-tr-none'
                }`}>
                  <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot size={18} className="animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  <span className="text-xs text-white/40 font-mono uppercase tracking-widest">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
          {isListening && <Waveform isAnimating={true} color="#22d3ee" />}
        </div>
        
        <GlassCard className="p-4 flex items-center gap-4 border-white/10 bg-black/40 backdrop-blur-xl">
          <button 
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-500/20 text-red-400 animate-pulse' 
                : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mic size={20} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your answer here..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-white/20 resize-none max-h-32 min-h-[44px] py-3"
          />
          
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!input.trim() || isThinking}
            className="h-11 px-6"
          >
            <Send size={18} />
          </Button>
        </GlassCard>
        
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <TrendingUp size={12} />
            Progress: {Math.round((session.currentQuestionIndex / session.totalQuestions) * 100)}%
          </div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            Press Enter to send // Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};
