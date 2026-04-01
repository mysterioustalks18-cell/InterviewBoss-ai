import React from 'react';
import { User } from '../types';
import { motion } from 'motion/react';
import { Bell, Search, Moon, Sun, ChevronDown } from 'lucide-react';

interface TopBarProps {
  user?: User | null;
}

export const TopBar: React.FC<TopBarProps> = ({ user }) => {
  if (!user) return null;

  return (
    <header className="h-16 border-b border-white/5 bg-[#0B0F1A]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input 
            type="text" 
            placeholder="Search features, history, or settings..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Sun size={18} />
          </button>
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Bell size={18} />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        <button className="flex items-center gap-3 pl-2 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">{user.displayName || 'User'}</p>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">{user.plan} Member</p>
          </div>
          <div className="relative">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              className="w-9 h-9 rounded-full border border-white/10 group-hover:border-blue-500/50 transition-all" 
              alt="User" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B0F1A] rounded-full" />
          </div>
          <ChevronDown size={14} className="text-white/20 group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};
