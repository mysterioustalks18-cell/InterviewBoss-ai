import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Waveform } from './Waveform';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { getCopilotSuggestion } from '../services/geminiService';
import { EvolutionState } from '../types';
import { FOCUS_CONFIG } from '../constants';

interface CopilotScreenProps {
  state: EvolutionState;
  onExit: () => void;
}

export const CopilotScreen = ({ state, onExit }: CopilotScreenProps) => {
  const [stealth, setStealth] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  useEffect(() => {
    // Get suggestion every 10 words or so
    const words = transcript.split(' ');
    if (words.length > 0 && words.length % 10 === 0) {
      const fetchSuggestion = async () => {
        try {
          const res = await getCopilotSuggestion(transcript, state.question, state.focus, state.dialogueStyle, state.resume, state.jobDescription);
          setSuggestion(res.suggestion);
          setWarning(res.warning);
        } catch (e) {
          console.error(e);
        }
      };
      fetchSuggestion();
    }
  }, [transcript, state.question, state.resume, state.jobDescription]);

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ${stealth ? 'bg-transparent' : 'bg-black/80 backdrop-blur-sm'}`}>
      {/* Stealth Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        <button 
          onClick={() => setStealth(!stealth)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
        >
          {stealth ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button 
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500 text-xs font-mono uppercase tracking-widest"
        >
          Exit Copilot
        </button>
      </div>

      {/* Copilot UI */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 transition-all duration-500 ${stealth ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
        <GlassCard className="border-cyan-400/30 shadow-[0_0_30px_rgba(0,245,255,0.1)]">
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase tracking-widest font-mono text-white/50">
                  {isListening ? 'Copilot Listening...' : 'Copilot Standby'}
                </span>
              </div>
              <Waveform isAnimating={isListening} />
            </div>

            {/* Transcript Preview (Stealthy) */}
            <div className="text-xs text-white/30 font-mono line-clamp-1 italic">
              "{transcript || 'Waiting for speech...'}"
            </div>

            {/* AI Suggestion */}
            <AnimatePresence mode="wait">
              {suggestion && (
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-cyan-400/10 border border-cyan-400/20 rounded-xl flex gap-3"
                >
                  <Sparkles className="text-cyan-400 shrink-0" size={18} />
                  <p className="text-sm text-cyan-100 leading-relaxed">
                    {suggestion}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warning */}
            <AnimatePresence>
              {warning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 text-red-400 text-[10px] uppercase tracking-widest font-mono"
                >
                  <AlertCircle size={14} />
                  <span>{warning}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>
      </div>

      {/* Floating Question Reference */}
      {!stealth && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg px-6">
          <div className="text-center flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-mono">Current Question</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest font-mono text-white/40">
                {FOCUS_CONFIG[state.focus].icon}
                <span>{state.focus}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white/80 italic">"{state.question}"</h2>
          </div>
        </div>
      )}
    </div>
  );
};
