import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { HologramAvatar } from './HologramAvatar';
import { Waveform } from './Waveform';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { EvolutionState } from '../types';
import { FOCUS_CONFIG, STYLE_CONFIG } from '../constants';
import { cn } from '../lib/utils';

interface PracticeScreenProps {
  state: EvolutionState;
  onFinish: (answer: string) => void;
  onExit: () => void;
}

export const PracticeScreen = ({ state, onFinish, onExit }: PracticeScreenProps) => {
  const [answer, setAnswer] = useState('');
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
    }
  }, [transcript]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onFinish(answer);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-cyan-400">Practice Mode</span>
          <h1 className="text-xl font-bold text-white">No Pressure, Just Growth</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>Exit</Button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
        <HologramAvatar active={isListening} />
        
        <GlassCard className="w-full max-w-2xl text-center border-white/10">
          <div className="flex flex-col gap-4 p-8">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
                <Sparkles size={12} />
                <span>Practice Question</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest font-mono text-white/40">
                {FOCUS_CONFIG[state.focus].icon}
                <span>{state.focus}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] uppercase tracking-widest font-mono text-white/40">
                {STYLE_CONFIG[state.dialogueStyle].icon}
                <span>{state.dialogueStyle}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              "{state.question}"
            </h2>
          </div>
        </GlassCard>
      </div>

      {/* Interaction Area */}
      <div className="flex flex-col gap-4 pb-8">
        <div className="relative group">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer or use the mic..."
            className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 transition-all resize-none font-mono text-sm"
          />
          
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Waveform isAnimating={isListening} />
            <button
              onClick={handleMicToggle}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                isListening ? "bg-red-500 shadow-[0_0_20px_#FF3B3B]" : "bg-cyan-400 shadow-[0_0_20px_#00F5FF]"
              )}
            >
              <Mic size={20} className={isListening ? "text-white" : "text-black"} />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={() => setAnswer('')}
          >
            Clear
          </Button>
          <Button 
            variant="primary" 
            className="flex-[2] flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Get Feedback <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
