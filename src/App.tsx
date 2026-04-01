import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout, onAuthStateChanged, db, doc, getDoc, setDoc } from './lib/firebase';
import { User } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { EvolutionDashboard } from './components/EvolutionDashboard';
import { ResumeOptimizer } from './components/ResumeOptimizer';
import { InterviewTrainer } from './components/InterviewTrainer';
import { SmartInterview } from './components/SmartInterview';
import { CodeDetector } from './components/CodeDetector';
import { Settings } from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Sparkles, ShieldCheck, Zap } from 'lucide-react';

type Screen = 'DASHBOARD' | 'RESUME' | 'INTERVIEW' | 'SMART_INTERVIEW' | 'CODE' | 'SETTINGS' | 'EVOLUTION';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date().toISOString()
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="text-blue-500 w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 max-w-md w-full text-center relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500/20 rounded-2xl">
              <ShieldCheck className="text-blue-500 w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">InterviewBoss AI</h1>
          <p className="text-white/60 mb-8">The premium suite for career evolution. Optimize, train, and debug your way to the top.</p>
          
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-6 rounded-xl hover:bg-white/90 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-white/40 uppercase tracking-widest">
            <span className="h-[1px] w-12 bg-white/10" />
            Secure Enterprise Auth
            <span className="h-[1px] w-12 bg-white/10" />
          </div>
        </motion.div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'DASHBOARD': return <Dashboard onNavigate={setCurrentScreen} />;
      case 'EVOLUTION': return (
        <EvolutionDashboard 
          analysis={{
            truth_insight: "You consistently excel in technical depth but tend to rush behavioral explanations. Slowing down by 15% will significantly improve your impression score.",
            pattern_detection: [
              "Rapid response to complex logic questions",
              "Occasional 'um' usage during behavioral transitions",
              "Strong eye contact maintenance during stress tests"
            ],
            current_analysis: {
              strengths: ["Technical Depth", "Logic", "Confidence"],
              weaknesses: ["Pacing", "Filler Words", "Structure"]
            },
            improvement_plan: [
              "Practice STAR method for behavioral questions",
              "Use deliberate pauses before answering",
              "Record and review 3 behavioral sessions"
            ],
            progress_tracking: [
              { metric: "Technical Accuracy", current: 92, previous: 88, trend: "improving" },
              { metric: "Communication Clarity", current: 78, previous: 82, trend: "declining" },
              { metric: "Stress Management", current: 85, previous: 85, trend: "stable" }
            ],
            focus_area: "Behavioral Pacing & Structure"
          }} 
          onClose={() => setCurrentScreen('DASHBOARD')} 
        />
      );
      case 'RESUME': return <ResumeOptimizer />;
      case 'INTERVIEW': return <InterviewTrainer />;
      case 'SMART_INTERVIEW': return <SmartInterview />;
      case 'CODE': return <CodeDetector />;
      case 'SETTINGS': return <Settings />;
      default: return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-[#0B0F1A] text-white overflow-hidden selection:bg-blue-500/30">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <Sidebar 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
          onLogout={logout}
          user={user}
        />
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <TopBar user={user} />
          <main className="flex-1 overflow-y-auto relative custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 lg:p-12 max-w-7xl mx-auto w-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
