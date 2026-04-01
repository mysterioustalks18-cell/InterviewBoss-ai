import React from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Screen } from '../types';
import { LogOut, User, LayoutDashboard, LogIn } from 'lucide-react';

interface NavbarProps {
  onNavigate: (screen: Screen) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      scrolled ? "bg-[#0B0F1A]/80 backdrop-blur-lg border-b border-white/10 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('LANDING')}
        >
          <Logo />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">{user?.displayName || user?.email}</span>
                {user && !user.isVerified && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[8px] font-bold uppercase tracking-widest border border-amber-500/30">
                    Unverified
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex gap-2"
                onClick={() => onNavigate('HOME')}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => {
                  logout();
                  onNavigate('LANDING');
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex gap-2"
                onClick={() => onNavigate('LOGIN')}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onNavigate('SIGNUP')}
              >
                Get Started
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </nav>
  );
};
