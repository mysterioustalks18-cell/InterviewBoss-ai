import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  value: string;
  onChange: (value: string) => void;
  onParse: (file: File) => Promise<string>;
  placeholder?: string;
  accept?: string;
}

export const FileUpload = ({ 
  label, 
  icon, 
  accentColor, 
  value, 
  onChange, 
  onParse,
  placeholder = "Paste text here...",
  accept = ".pdf,.docx,.txt"
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setError(null);
    setSuccess(false);
    
    try {
      const text = await onParse(file);
      onChange(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('File parsing error:', err);
      setError('Failed to parse file. Try manual paste.');
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 text-xs font-mono uppercase tracking-widest", accentColor)}>
          {icon}
          <span>{label}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] text-green-400 font-mono uppercase"
              >
                <CheckCircle2 size={12} />
                <span>Parsed</span>
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] text-red-400 font-mono uppercase"
              >
                <AlertCircle size={12} />
                <span>Error</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors uppercase font-mono"
            disabled={isParsing}
          >
            {isParsing ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {isParsing ? 'Parsing...' : 'Upload'}
          </button>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }} 
          className="hidden" 
          accept={accept}
        />
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative group transition-all duration-300",
          isDragging ? "scale-[1.02]" : "scale-100"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-32 bg-black/40 border rounded-xl p-4 text-xs text-white/70 placeholder:text-white/20 focus:outline-none transition-all resize-none font-mono",
            isDragging ? "border-cyan-400 bg-cyan-400/5" : "border-white/10",
            isParsing ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
        />
        
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-400/10 backdrop-blur-[2px] rounded-xl border-2 border-dashed border-cyan-400 pointer-events-none"
            >
              <Upload className="text-cyan-400 mb-2 animate-bounce" size={24} />
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-bold">Drop to Upload</span>
            </motion.div>
          )}
          
          {isParsing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-xl pointer-events-none"
            >
              <Loader2 className="text-cyan-400 mb-2 animate-spin" size={24} />
              <span className="text-[10px] text-white/70 font-mono uppercase tracking-widest">Processing File...</span>
              <div className="w-32 h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-400"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
