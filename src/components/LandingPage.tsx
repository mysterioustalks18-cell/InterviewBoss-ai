import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Target, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Star,
  Users,
  Brain,
  MessageSquareWarning,
  BarChart3,
  Lock,
  Sparkles,
  X,
  Share2,
  TrendingUp,
  Award,
  FileText
} from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';
import { GlassCard } from './GlassCard';

interface LandingPageProps {
  onGetStarted: (feature?: string) => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [showDemo, setShowDemo] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 200]);
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 500]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <main>
        {/* Hero Section */}
        <section id="hero" className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden scroll-mt-20">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div 
              style={{ y: blob1Y }}
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full animate-bg-move" 
            />
            <motion.div 
              style={{ y: blob2Y }}
              className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full animate-bg-move" 
            />
          </div>

          <motion.div 
            style={{ y: heroY, opacity }}
            className="max-w-7xl mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-mono mb-10"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>Full Level Access Unlocked</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[100px] font-bold tracking-tighter mb-10 leading-[0.9] bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent"
            >
              Stop Guessing.<br />Start Winning.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto mb-14 leading-relaxed font-light"
            >
              Crack your next tech interview with the world's most advanced AI simulation engine. Get real-time feedback, detect hidden mistakes, and boost your hireability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
            >
              {[
                { 
                  title: "AI Interview Elite", 
                  desc: "Master the Persona", 
                  icon: <Target className="text-cyan-400" />, 
                  action: () => onGetStarted('INTERVIEW'),
                  accent: "border-cyan-500/20 hover:border-cyan-500/50"
                },
                { 
                  title: "Security Audit Elite", 
                  desc: "Full-Spectrum Scan", 
                  icon: <ShieldCheck className="text-red-400" />, 
                  action: () => onGetStarted('SECURITY_AUDIT'),
                  accent: "border-red-500/20 hover:border-red-500/50"
                },
                { 
                  title: "Resume Studio Pro", 
                  desc: "Architecture Optimization", 
                  icon: <FileText className="text-purple-400" />, 
                  action: () => onGetStarted('RESUME'),
                  accent: "border-purple-500/20 hover:border-purple-500/50"
                }
              ].map((card, i) => (
                <GlassCard 
                  key={i} 
                  className={`p-8 flex flex-col items-center gap-4 cursor-pointer transition-all group ${card.accent}`}
                  onClick={card.action}
                >
                  <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                    {React.cloneElement(card.icon as React.ReactElement<any>, { size: 32 })}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{card.title}</h3>
                    <p className="text-sm text-white/40">{card.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto px-16 h-16 text-xl animate-pulse-glow" 
                onClick={() => onGetStarted()}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-16 h-16 text-xl group"
                onClick={() => setShowDemo(true)}
              >
                <Play size={20} className="mr-2 fill-current group-hover:scale-110 transition-transform" /> Watch Demo
              </Button>
            </motion.div>

            {/* Hero Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-32 relative max-w-5xl mx-auto group cursor-pointer"
              onClick={() => setShowDemo(true)}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <GlassCard className="p-0 overflow-hidden border-white/10 aspect-video flex items-center justify-center bg-black/40 relative z-10 group-hover:border-cyan-500/50 transition-colors">
                <div className="flex flex-col items-center gap-6 text-white/10 group-hover:text-cyan-400/50 transition-colors">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Play size={120} strokeWidth={0.5} />
                  </motion.div>
                  <span className="text-sm font-mono uppercase tracking-[0.5em]">Click to Watch Demo</span>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-40 px-6 relative overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.5em] text-cyan-400 mb-6">The Problem</h2>
              <h3 className="text-5xl md:text-7xl font-bold tracking-tight">Why you're not<br />getting the offer.</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <AlertCircle className="text-red-400" />,
                  title: "Lack of Confidence",
                  desc: "Your body language and tone betray your nerves, even if your words are perfect. We detect the micro-hesitations that kill deals."
                },
                {
                  icon: <MessageSquareWarning className="text-orange-400" />,
                  title: "Generic Answers",
                  desc: "You sound like every other candidate. AI-generated fluff doesn't impress real personas. We help you find your unique edge."
                },
                {
                  icon: <Target className="text-purple-400" />,
                  title: "Hidden Mistakes",
                  desc: "Small verbal tics and structural flaws that you don't even notice are killing your chances. Our AI catches what humans miss."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="flex flex-col gap-8 p-10 h-full hover:border-white/30 transition-all duration-500 hover:-translate-y-2 group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                    </div>
                    <h4 className="text-2xl font-bold">{item.title}</h4>
                    <p className="text-white/50 leading-relaxed text-lg">{item.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-40 px-6 bg-white/[0.01] scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.5em] text-cyan-400 mb-6">Features</h2>
              <h3 className="text-5xl md:text-7xl font-bold tracking-tight">Everything you need<br />to master the interview.</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Brain className="text-cyan-400" />,
                  title: "Real-time EQ Analysis",
                  desc: "Our AI analyzes your tone, pace, and hesitation in real-time to detect confidence levels.",
                  color: "cyan"
                },
                {
                  icon: <Zap className="text-yellow-400" />,
                  title: "Savage Mode Feedback",
                  desc: "Get the brutal truth. No sugar-coating, just the feedback you need to actually improve.",
                  color: "yellow"
                },
                {
                  icon: <Target className="text-purple-400" />,
                  title: "Role-Specific Personas",
                  desc: "Face AI interviewers tailored to your specific industry, from Big Tech to Startups.",
                  color: "purple"
                },
                {
                  icon: <ShieldCheck className="text-green-400" />,
                  title: "Resume & JD Parsing",
                  desc: "Upload your resume and job description for a hyper-personalized interview experience.",
                  color: "green"
                },
                {
                  icon: <Lock className="text-blue-400" />,
                  title: "Stealth Copilot",
                  desc: "Get real-time suggestions and talking points during your actual video interviews.",
                  color: "blue"
                },
                {
                  icon: <Trophy className="text-orange-400" />,
                  title: "Gamified Progress",
                  desc: "Level up your 'Hire Score' and track your improvement over time with detailed analytics.",
                  color: "orange"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-8 h-full flex flex-col gap-6 hover:border-white/20 transition-all group cursor-default hover:bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                      {React.cloneElement(feature.icon as React.ReactElement<any>, { size: 24 })}
                    </div>
                    <h4 className="text-xl font-bold group-hover:text-white transition-colors">{feature.title}</h4>
                    <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{feature.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solution" className="py-40 px-6 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1"
              >
                <h2 className="text-sm font-mono uppercase tracking-[0.5em] text-purple-400 mb-6">The Solution</h2>
                <h3 className="text-5xl md:text-7xl font-bold tracking-tight mb-10 leading-[1.1]">Meet your new<br />PersonaOS.</h3>
                <p className="text-2xl text-white/60 mb-14 leading-relaxed font-light">
                  The only platform that combines real-time speech analysis with industry-specific AI personalities to simulate the pressure of a real interview.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {[
                    { title: "Mock Interviews", desc: "Face different AI personas from HR Directors to visionary CEOs." },
                    { title: "AI Analysis", desc: "Get deep insights into your EQ, clarity, and technical depth." },
                    { title: "Savage Feedback", desc: "No sugar-coating. Get the brutal truth about your performance." },
                    { title: "Stealth Copilot", desc: "Real-time suggestions during your actual interviews." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="mt-1">
                        <CheckCircle2 className="text-cyan-400" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                        <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1 w-full"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  <GlassCard className="relative z-10 p-10 border-white/10 bg-black/80 shadow-2xl">
                    <div className="flex flex-col gap-8">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-mono uppercase tracking-widest text-white/40">Live Analysis</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Savage Mode</span>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-white/40">Confidence Score</span>
                            <span className="text-cyan-400">28%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "28%" }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-red-500 to-cyan-400" 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                            <span className="text-white/40">Technical Depth</span>
                            <span className="text-purple-400">84%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "84%" }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                              className="h-full bg-purple-400" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-white/80 leading-relaxed relative">
                        <span className="absolute -top-3 left-6 px-2 bg-[#0a0a0a] text-[10px] font-mono text-white/30 uppercase tracking-widest">Persona Feedback</span>
                        "You sound like you're reading from a script. Your technical depth is there, but your delivery is as exciting as a spreadsheet. Wake up."
                      </div>
                      
                      <div className="flex items-center gap-4 pt-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                          <Brain size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase tracking-widest">AI Feedback Engine</span>
                          <span className="text-[10px] text-white/30 font-mono">v4.2.0-PRO</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-40 px-6 relative scroll-mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.5em] text-cyan-400 mb-6">Process</h2>
              <h3 className="text-5xl md:text-7xl font-bold tracking-tight mb-24">Three steps to mastery.</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />
              
              {[
                { step: "01", title: "Initiate Simulation", desc: "Face the elite AI personas. Our system listens to every nuance.", icon: <TrendingUp size={24} /> },
                { step: "02", title: "Full Level Analysis", desc: "Gemini 3.1 Pro performing deep-spectrum neural processing.", icon: <Brain size={24} /> },
                { step: "03", title: "Elite Hire Score", desc: "Receive a comprehensive breakdown and a brutal 'Hire Probability'.", icon: <Award size={24} /> }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative z-10 flex flex-col items-center gap-8 group"
                >
                  <div className="w-24 h-24 rounded-3xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-2xl font-bold text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:border-cyan-400/50 transition-all duration-500 group-hover:scale-110">
                    {item.step}
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-2xl font-bold">{item.title}</h4>
                    <p className="text-white/50 max-w-[280px] mx-auto leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Viral Section */}
        <section className="py-40 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto relative">
            <div className="absolute inset-0 bg-purple-500/5 blur-[150px] rounded-full" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="relative z-10 p-16 text-center border-purple-500/20 bg-purple-500/5 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                
                <div className="flex flex-col items-center gap-10">
                  <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.6em] text-purple-400">
                    <Share2 size={14} className="animate-bounce" />
                    <span>Join 50,000+ Candidates</span>
                  </div>
                  
                  <h3 className="text-5xl md:text-7xl font-bold tracking-tight">Don't let the AI<br />roast you alone.</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-3xl mt-8">
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <div className="text-8xl md:text-[140px] font-black text-white tracking-tighter leading-none">38%</div>
                      <div className="text-sm font-mono uppercase tracking-[0.4em] text-red-500 font-bold">Hire Score</div>
                    </div>
                    
                    <div className="text-left flex flex-col gap-6">
                      <p className="text-xl text-white/70 italic leading-relaxed font-light">
                        "I thought I was ready. PersonaOS told me I had a 38% chance of being hired. It was the wake-up call I needed to actually land my dream job at Google."
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Alex Chen</span>
                          <span className="text-xs text-white/40">Software Engineer @ Google</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 items-center">
                    <div className="flex -space-x-4">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-white/10" />
                      ))}
                    </div>
                    <span className="text-sm text-white/40 font-mono uppercase tracking-widest">Join the evolution today</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-40 px-6 relative scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-24"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.5em] text-cyan-400 mb-6">Pricing</h2>
              <h3 className="text-5xl md:text-7xl font-bold tracking-tight">Invest in your career.</h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-12 flex flex-col gap-10 border-white/5 h-full hover:border-white/20 transition-all duration-500">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-3xl font-bold">Free</h4>
                    <p className="text-white/50 text-base font-light">For casual practice and exploration.</p>
                  </div>
                  <div className="text-6xl font-bold tracking-tighter">$0<span className="text-lg text-white/20 font-normal tracking-normal ml-2">/mo</span></div>
                  <div className="flex flex-col gap-5">
                    {["10 Evolutions per day", "Advanced AI Feedback", "Elite Personas", "Priority Support"].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-white/70">
                        <CheckCircle2 size={20} className="text-cyan-400" />
                        <span className="text-base">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="lg" className="w-full mt-auto" onClick={() => onGetStarted()}>Get Started</Button>
                </GlassCard>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-12 flex flex-col gap-10 border-cyan-500/30 bg-cyan-500/5 relative overflow-hidden h-full shadow-[0_0_50px_rgba(34,211,238,0.1)] hover:shadow-[0_0_70px_rgba(34,211,238,0.2)] transition-all duration-500">
                  <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-cyan-400 text-[#0a0a0a] text-[10px] font-bold uppercase tracking-[0.2em]">Full Level</div>
                  <div className="flex flex-col gap-3">
                    <h4 className="text-3xl font-bold">Pro+</h4>
                    <p className="text-white/50 text-base font-light">For elite candidates who demand perfection.</p>
                  </div>
                  <div className="text-6xl font-bold tracking-tighter">$29<span className="text-lg text-white/20 font-normal tracking-normal ml-2">/mo</span></div>
                  <div className="flex flex-col gap-5">
                    {[
                      "Unlimited Evolutions", 
                      "Savage AI Feedback", 
                      "All Persona Personalities", 
                      "Stealth Copilot Access", 
                      "Full Architecture Optimization", 
                      "Elite 24/7 Support"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-white/90">
                        <CheckCircle2 size={20} className="text-cyan-400" />
                        <span className="text-base font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="primary" size="lg" className="w-full mt-auto shadow-[0_0_30px_rgba(108,92,231,0.4)]" onClick={() => onGetStarted()}>Go Pro Now</Button>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-60 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-cyan-500/10" />
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h2 className="text-7xl md:text-[100px] font-bold tracking-tighter mb-12 leading-[0.9]">Ready to find out<br />the truth?</h2>
            <p className="text-2xl text-white/60 mb-16 font-light max-w-2xl mx-auto">
              Join thousands of candidates who stopped guessing and started winning. Your dream offer is one evolution away.
            </p>
            <Button variant="primary" size="lg" className="px-20 h-20 text-2xl shadow-[0_0_50px_rgba(34,211,238,0.4)] animate-pulse-glow" onClick={() => onGetStarted()}>
              Start Evolution Now <ArrowRight size={24} className="ml-3" />
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5 relative z-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 flex flex-col gap-8 items-center md:items-start">
              <Logo />
              <p className="text-lg text-white/40 max-w-sm leading-relaxed text-center md:text-left">
                The AI-powered interview simulation platform that prepares you for the toughest personas in the industry.
              </p>
            </div>
            <div className="flex flex-col gap-6 items-center md:items-start">
              <span className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-bold">Product</span>
              <a href="#features" className="text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-white/60 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Personas</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Copilot</a>
            </div>
            <div className="flex flex-col gap-6 items-center md:items-start">
              <span className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-bold">Company</span>
              <a href="#" className="text-white/60 hover:text-white transition-colors">About</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/20">© 2026 PersonaOS. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-white/20 hover:text-white transition-colors"><Share2 size={20} /></a>
              <a href="#" className="text-white/20 hover:text-white transition-colors"><TrendingUp size={20} /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,245,255,0.3)]"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-6 right-6 z-10 p-3 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-black/80 transition-all backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </button>
              
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/HG68Ymazo18?autoplay=1" 
                title="PersonaOS Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

