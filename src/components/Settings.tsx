import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun,
  Smartphone,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { auth } from '../lib/firebase';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const sections = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: User,
      items: [
        { label: 'Profile Information', desc: 'Update your name, email, and avatar.', icon: User },
        { label: 'Security & Password', desc: 'Manage your password and 2FA settings.', icon: Shield },
        { label: 'Email Notifications', desc: 'Control which emails you receive.', icon: Bell },
      ]
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      icon: CreditCard,
      items: [
        { label: 'Current Plan', desc: 'You are currently on the Pro Plan.', icon: Zap, badge: 'PRO' },
        { label: 'Payment Methods', desc: 'Manage your credit cards and billing info.', icon: CreditCard },
        { label: 'Billing History', desc: 'View and download your past invoices.', icon: Globe },
      ]
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      icon: Globe,
      items: [
        { label: 'Theme Mode', desc: 'Switch between light and dark mode.', icon: Moon },
        { label: 'Language', desc: 'Choose your preferred language.', icon: Globe },
        { label: 'Mobile App', desc: 'Sync your data with the mobile app.', icon: Smartphone },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: Shield,
      items: [
        { label: 'Data Privacy Note', desc: 'Read how we handle and protect your data.', icon: Shield },
        { label: 'Export Data', desc: 'Download a copy of all your data in JSON format.', icon: Zap },
        { label: 'Privacy Settings', desc: 'Manage your data sharing preferences.', icon: Lock },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
        <p className="text-white/40 text-lg">Manage your account, subscription, and app preferences.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-1.5 bg-white/5 rounded-lg text-white/40">
                <section.icon size={18} />
              </div>
              <h3 className="text-lg font-bold text-white/80">{section.title}</h3>
            </div>
            
            <div className="glass-card border-white/5 divide-y divide-white/5 overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl text-white/40 group-hover:text-blue-400 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-white/80 group-hover:text-white transition-colors">{item.label}</p>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold uppercase tracking-widest">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="glass-card p-8 border-blue-500/10 bg-blue-500/5 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Data Privacy Commitment</h4>
              <p className="text-sm text-white/60 leading-relaxed">
                At InterviewBoss AI, your privacy is our priority. We use enterprise-grade encryption to secure your data. 
                Your interview recordings and resumes are processed locally whenever possible and are never shared with third parties without your explicit consent.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 border-red-500/10 bg-red-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-red-400">Danger Zone</h4>
            <p className="text-sm text-white/40">Permanently delete your account and all associated data.</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
