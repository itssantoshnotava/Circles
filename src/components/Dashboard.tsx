import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer } from './Timer';
import { SyllabusTracker } from './SyllabusTracker';
import { ExamCountdown } from './ExamCountdown';
import { Profile } from './Profile';
import { AppState } from '../types';
import { Timer as TimerIcon, BookOpen, LogOut, User } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  onUpdateSyllabus: (subjectId: string, chapterId: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onUpdateSyllabus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'syllabus' | 'profile'>('timer');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      {/* Minimal Logo */}
      <div className="fixed top-8 left-8 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="font-black text-sm text-black">C</span>
        </div>
        <span className="font-black tracking-tighter text-xl">Circles</span>
      </div>

      {/* Top Right Actions */}
      <div className="fixed top-8 right-8 flex items-center gap-4 z-50">
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
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
            activeTab === 'timer' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <TimerIcon className="w-4 h-4" />
          <span>Timer</span>
        </button>
        <button 
          onClick={() => setActiveTab('syllabus')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
            activeTab === 'syllabus' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm ${
            activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
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
            className="w-full max-w-2xl flex flex-col items-center space-y-12"
          >
            {activeTab === 'timer' && (
              <>
                <Timer />
                {state.onboardingData.preparingForCompetitive && (
                  <div className="w-full space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Exam Countdowns</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <ExamCountdown exams={state.onboardingData.competitiveExams} />
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'syllabus' && (
              <SyllabusTracker 
                syllabus={state.syllabus} 
                onToggleChapter={onUpdateSyllabus} 
              />
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
