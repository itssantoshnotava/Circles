import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer } from './Timer';
import { SyllabusTracker } from './SyllabusTracker';
import { ExamCountdown } from './ExamCountdown';
import { Profile } from './Profile';
import { StaticAvatar } from './StaticAvatar';
import { AppState } from '../types';
import { Timer as TimerIcon, BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import { getCurrentUserProfile } from '../services/firebaseService';

interface DashboardProps {
  state: AppState;
  onUpdateSyllabus: (subjectId: string, chapterId: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onUpdateSyllabus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());

  useEffect(() => {
    console.log("Dashboard loaded");
    console.log("Timer active");
    console.log("Syllabus loaded");
    
    // Refresh profile data periodically or on mount
    setUserProfile(getCurrentUserProfile());
  }, [activeTab]);

  const scrollToSection = (id: string) => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      // Wait for transition
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      {/* Minimal Logo */}
      <div className="fixed top-8 left-8 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity z-50">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="font-black text-sm text-black">C</span>
        </div>
        <span className="font-black tracking-tighter text-xl hidden sm:block">Circles</span>
      </div>

      {/* Top Right Actions */}
      <div className="fixed top-8 right-8 flex items-center gap-4 z-50">
        <StaticAvatar 
          src={userProfile.photoURL}
          alt={userProfile.displayName || 'User'}
          className="w-10 h-10 rounded-full border-2 border-white/10 shadow-lg shadow-emerald-500/10 hover:border-emerald-500/50 hover:scale-110 transition-all active:scale-95"
          onClick={() => setActiveTab('profile')}
        />
        <button 
          onClick={onLogout}
          className="glass p-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all border-white/5"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Minimal Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-4 py-2 flex items-center gap-2 z-50 border-white/10 shadow-2xl">
        <button 
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`p-3.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
          }`}
          title="Timer"
        >
          <TimerIcon className="w-6 h-6" />
        </button>
        <button 
          onClick={() => scrollToSection('syllabus-section')}
          className={`p-3.5 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-white/40 hover:text-white/60' : 'text-white/40'
          }`}
          title="Syllabus"
        >
          <BookOpen className="w-6 h-6" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-32 px-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full max-w-7xl flex flex-col items-center space-y-12"
          >
            {activeTab === 'dashboard' && (
              <div className="w-full space-y-12">
                {/* Top Section: Timer */}
                <div id="timer-section" className="flex flex-col items-center">
                  <Timer />
                </div>

                {/* Bottom Section: Split Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
                  {/* Left Column: Exam Countdown (30%) */}
                  <div className="lg:col-span-3 space-y-6">
                    {state.onboardingData.preparingForCompetitive && (
                      <>
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Exams</span>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <ExamCountdown exams={state.onboardingData.competitiveExams} />
                      </>
                    )}
                  </div>

                  {/* Right Column: Syllabus Tracker (70%) */}
                  <div id="syllabus-section" className="lg:col-span-7">
                    <SyllabusTracker 
                      syllabus={state.syllabus} 
                      onToggleChapter={onUpdateSyllabus} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <Profile 
                onboardingData={state.onboardingData} 
                onLogout={onLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
