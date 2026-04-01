import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Code, 
  Settings, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  User as UserIcon,
  BrainCircuit,
  CreditCard
} from 'lucide-react';
import { User, Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  user?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, onLogout, user }) => {
  const menuItems = [
    { id: 'HOME', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'SMART_INTERVIEW', label: 'AI Smart Interview', icon: BrainCircuit, badge: 'NEW' },
    { id: 'RESUME_HOME', label: 'Resume Optimizer', icon: FileText, badge: 'PRO' },
    { id: 'INTERVIEW', label: 'Interview Trainer', icon: MessageSquare, badge: 'PRO' },
    { id: 'CODE', label: 'Code Error Detector', icon: Code, badge: 'PRO' },
    { id: 'PRICING', label: 'Pricing & Plans', icon: CreditCard },
  ];

  if (!user) return null;

  return (
    <aside className="w-72 border-r border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl flex flex-col h-screen p-6 relative z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-blue-500/20 rounded-xl">
          <ShieldCheck className="text-blue-500 w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">InterviewBoss</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Enterprise AI</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group relative ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60'} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'
                }`}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <button
          onClick={() => onNavigate('SETTINGS')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            currentScreen === 'SETTINGS' ? 'bg-white/5 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings size={20} className="text-white/40" />
          <span className="font-medium text-sm">Settings</span>
        </button>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              className="w-10 h-10 rounded-full border border-white/10" 
              alt="User" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.displayName || 'User'}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
