import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Crown, Star, Loader2, ChevronLeft, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../lib/firebase';

interface PricingProps {
  onBack?: () => void;
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free Starter',
    price: '₹0',
    description: 'Perfect for getting started with AI-powered job search.',
    features: [
      '3 Resume Optimizations / day',
      '2 AI Interviews / day',
      '5 Code Audits / day',
      'Basic AI Feedback',
      'Community Support'
    ],
    icon: Star,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    id: 'BASIC',
    name: 'Career Pro',
    price: '₹299',
    period: '/month',
    description: 'For serious job seekers who want a competitive edge.',
    features: [
      '15 Resume Optimizations / day',
      '10 AI Interviews / day',
      '25 Code Audits / day',
      'Advanced AI Feedback',
      'Priority Support',
      'Custom Interview Personas'
    ],
    icon: Zap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    popular: false
  },
  {
    id: 'PRO',
    name: 'Enterprise Elite',
    price: '₹499',
    period: '/month',
    description: 'The ultimate career toolkit for high-growth professionals.',
    features: [
      'Unlimited Resume Optimizations',
      'Unlimited AI Interviews',
      'Unlimited Code Audits',
      'Expert AI Career Coaching',
      '24/7 VIP Support',
      'Early Access to New Features',
      'Personalized Learning Paths'
    ],
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    popular: true
  }
];

export const Pricing: React.FC<PricingProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    if (user.plan === planId) return;
    if (planId === 'FREE') return;

    setLoadingPlan(planId);

    // Razorpay Integration
    const options = {
      key: "rzp_test_placeholder", // In a real app, this would be an env var
      amount: planId === 'BASIC' ? 29900 : 49900, // Amount in paise
      currency: "INR",
      name: "InterviewBoss AI",
      description: `${planId} Plan Subscription`,
      image: "https://picsum.photos/seed/boss/200/200",
      handler: async function (response: any) {
        const path = `users/${user.uid}`;
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            plan: planId,
            'usage.lastReset': new Date().toISOString()
          });
          // Success handling would typically involve a toast or redirect
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        } finally {
          setLoadingPlan(null);
        }
      },
      prefill: {
        name: user.displayName || "",
        email: user.email || "",
      },
      theme: {
        color: "#3b82f6",
      },
      modal: {
        ondismiss: function() {
          setLoadingPlan(null);
        }
      }
    };

    if (!(window as any).Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet connection.");
      setLoadingPlan(null);
      return;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Crown size={24} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          </div>
          <p className="text-white/40 text-lg">Scale your career with our premium AI-powered toolkits.</p>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="glass-card px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center gap-2 hover:bg-white/5"
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-card p-8 border-white/5 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all ${
              plan.popular ? 'ring-1 ring-blue-500/30 border-blue-500/20' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className={`w-14 h-14 rounded-2xl ${plan.bg} flex items-center justify-center ${plan.color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <plan.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
              </div>
              <p className="text-white/40 text-sm leading-relaxed">{plan.description}</p>
            </div>

            <div className="flex-grow space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 p-0.5 bg-emerald-500/20 rounded-full">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-white/60 text-xs leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <button
              disabled={user?.plan === plan.id || loadingPlan === plan.id}
              onClick={() => handleUpgrade(plan.id)}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                user?.plan === plan.id 
                  ? 'bg-white/5 text-white/20 cursor-default' 
                  : plan.popular
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 active:scale-95 border border-white/10'
              }`}
            >
              {loadingPlan === plan.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : user?.plan === plan.id ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} /> Current Plan
                </div>
              ) : (
                <>
                  <Zap size={14} /> {plan.id === 'FREE' ? 'Free Forever' : `Upgrade to ${plan.id}`}
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-10 border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 w-fit">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-bold">Secure Payments</h4>
            <p className="text-xs text-white/40 leading-relaxed">All transactions are encrypted and processed securely via Razorpay.</p>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit">
              <TrendingUp size={24} />
            </div>
            <h4 className="font-bold">Career Growth</h4>
            <p className="text-xs text-white/40 leading-relaxed">Our PRO users are 3x more likely to land interviews at top tech companies.</p>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold">AI Precision</h4>
            <p className="text-xs text-white/40 leading-relaxed">Leverage the latest Gemini 1.5 Pro models for hyper-personalized feedback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
