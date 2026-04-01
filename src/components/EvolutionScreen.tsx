import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, AlertTriangle, Timer } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { HealthBar } from './HealthBar';
import { HologramAvatar } from './HologramAvatar';
import { Waveform } from './Waveform';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { Difficulty, EvolutionState } from '../types';
import { DIFFICULTY_CONFIG, FOCUS_CONFIG, STYLE_CONFIG } from '../constants';
import { cn } from '../lib/utils';

interface EvolutionScreenProps {
  state: EvolutionState;
  onFinish: (answer: string) => void;
  onExit: () => void;
}

export const EvolutionScreen = ({ state, onFinish, onExit }: EvolutionScreenProps) => {
  const [answer, setAnswer] = useState('');
  const [confidence, setConfidence] = useState(100);
  const [showWarning, setShowWarning] = useState(false);
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setAnswer(transcript);
      // Simulate confidence drop based on filler words
      const fillerWords = ['uh', 'um', 'like', 'maybe', 'i think', 'sort of'];
      const count = fillerWords.reduce((acc, word) => acc + (transcript.toLowerCase().split(word).length - 1), 0);
      
      if (count > 0) {
        setConfidence(prev => Math.max(20, 100 - count * 10));
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 2000);
      }
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
      {/* Header: Health Bars & Exit */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-cyan-500">Evolution Mode</span>
          <h1 className="text-xl font-bold text-white">Evolve Your Persona</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>Exit Evolution</Button>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <HealthBar 
          label="Impression Score" 
          value={state.personaHealth} 
          max={100} 
          color={DIFFICULTY_CONFIG[state.difficulty].color} 
          isPersona 
        />
        <HealthBar 
          label="Confidence Level" 
          value={confidence} 
          max={100} 
          color="#00F5FF" 
        />
      </div>

      {/* Main Evolution Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-8">
        <HologramAvatar active={isListening} />
        
        <GlassCard className="w-full max-w-2xl text-center border-cyan-400/30">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-mono">
                <Timer size={12} />
                <span>Incoming Question</span>
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
        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center gap-2 text-red-500 font-mono text-xs uppercase tracking-widest"
            >
              <AlertTriangle size={14} />
              <span>⚠ Confidence Drop Detected</span>
            </motion.div>
          )}
        </AnimatePresence>

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
            variant="secondary" 
            className="flex-[2] flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Submit Answer <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
