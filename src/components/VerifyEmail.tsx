import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from './Button';
import { api } from '../services/api';
import { Screen } from '../types';

interface VerifyEmailProps {
  onNavigate: (screen: Screen) => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onNavigate }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    const verify = async () => {
      try {
        const response = await api.get<{ message: string }>(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
            <h2 className="text-2xl font-bold">Verifying Email...</h2>
            <p className="text-white/60">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold">Email Verified!</h2>
            <p className="text-white/60">{message}</p>
            <div className="mt-6 w-full">
              <Button className="w-full" onClick={() => onNavigate('LOGIN')}>
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold">Verification Failed</h2>
            <p className="text-white/60">{message}</p>
            <div className="mt-6 flex flex-col gap-3 w-full">
              <Button className="w-full" onClick={() => onNavigate('LOGIN')}>
                Back to Login
              </Button>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">
                Need help? Contact support@personaos.com
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
