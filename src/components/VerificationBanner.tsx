import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export const VerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const firebaseUser = auth.currentUser;

  if (!firebaseUser || firebaseUser.emailVerified) return null;

  const handleResendVerification = async () => {
    if (!firebaseUser) return;
    setIsResending(true);
    try {
      await sendEmailVerification(firebaseUser);
      setResendStatus('success');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      setResendStatus('error');
      setTimeout(() => setResendStatus('idle'), 5000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 relative z-50"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Mail className="text-amber-500 w-5 h-5" />
        </div>
        <div className="text-left">
          <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Verify Your Email</h4>
          <p className="text-xs text-white/60">Please confirm your account to unlock full access to InterviewBoss AI features.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleResendVerification}
          disabled={isResending}
          className="px-4 py-2 bg-amber-500/20 text-amber-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          {resendStatus === 'success' ? 'Sent!' : resendStatus === 'error' ? 'Failed' : 'Resend Email'}
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/5 text-white/40 rounded-xl text-xs font-bold uppercase tracking-widest hover:text-white transition-all"
        >
          I've Verified
        </button>
      </div>
    </motion.div>
  );
};
