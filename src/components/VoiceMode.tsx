import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Sparkles, Bot, User } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { GlassCard } from './GlassCard';
import { Waveform } from './Waveform';

interface VoiceModeProps {
  onExit: () => void;
}

export const VoiceMode: React.FC<VoiceModeProps> = ({ onExit }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    startSession();
    return () => {
      stopSession();
    };
  }, []);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are PersonaOS AI Voice Assistant. You provide real-time verbal feedback and support. Be concise, professional, and slightly futuristic. Your goal is to help the user evolve their professional persona.",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            startMicrophone(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const base64Data = part.inlineData.data;
                  const binaryString = atob(base64Data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  audioQueueRef.current.push(pcmData);
                  if (!isPlayingRef.current) {
                    playNextInQueue();
                  }
                }
              }
            }
            
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
          },
          onclose: () => {
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Failed to initialize AI Voice Mode.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const startMicrophone = async (sessionPromise: Promise<any>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsListening(true);

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }

        // Use a more robust base64 conversion
        const uint8Array = new Uint8Array(pcmData.buffer);
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64Data = btoa(binary);

        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };
    } catch (err) {
      console.error("Microphone access denied:", err);
      setError("Microphone access denied. Please enable it in your browser settings.");
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.copyToChannel(floatData, 0);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center gap-12">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Voice Mode</h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Real-time Neural Link</p>
            </div>
          </div>
          <button 
            onClick={onExit}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Visualizer */}
        <div className="relative flex flex-col items-center justify-center gap-8 py-12">
          <motion.div 
            animate={isListening && !isMuted ? {
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5]
            } : { scale: 1, opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-64 h-64 rounded-full border border-cyan-500/20 bg-cyan-500/5 blur-2xl" />
          </motion.div>

          <div className="relative flex flex-col items-center gap-6">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative z-10">
                {isThinking ? (
                  <Loader2 size={48} className="text-cyan-400 animate-spin" />
                ) : (
                  <Bot size={48} className={`transition-all ${isListening && !isMuted ? 'text-cyan-400 scale-110' : 'text-white/20'}`} />
                )}
              </div>
              
              {/* Visualizer Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-all duration-500 ${isListening && !isMuted ? 'text-cyan-500/40' : 'text-white/5'}`}
                  strokeDasharray="565"
                  strokeDashoffset={isListening && !isMuted ? "0" : "565"}
                />
              </svg>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  {isConnected ? 'Neural Link Active' : 'Connecting...'}
                </span>
              </div>
              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
            </div>
          </div>

          <div className="h-12 flex items-center justify-center">
            <Waveform isAnimating={isListening && !isMuted} color="#22d3ee" />
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl border transition-all ${
              isMuted 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="px-8 py-4 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4">
            <Volume2 size={20} className="text-white/20" />
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: isPlayingRef.current ? '100%' : '0%' }}
                className="h-full bg-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center space-y-2">
          <p className="text-white/60 text-sm font-medium">
            {isMuted ? 'Microphone Muted' : isPlayingRef.current ? 'AI is speaking...' : 'Listening for your voice...'}
          </p>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
            Powered by Gemini 3.1 Flash Live
          </p>
        </div>
      </div>
    </div>
  );
};
