import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer } from './Timer';
import { SyllabusTracker } from './SyllabusTracker';
import { AppState, OnboardingData, Subject } from '../types';
import { LayoutDashboard, Timer as TimerIcon, BookOpen, Settings, LogOut, User, Bell } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface DashboardProps {
  state: AppState;
  onUpdateSyllabus: (subjectId: string, chapterId: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onUpdateSyllabus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'syllabus'>('timer');

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-white/5 p-6 flex flex-col gap-8 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Circles</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('timer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'timer' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            <TimerIcon className="w-5 h-5" />
            <span className="font-medium">Timer</span>
          </button>
          <button 
            onClick={() => setActiveTab('syllabus')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'syllabus' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Syllabus</span>
          </button>
          <button 
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/20 cursor-not-allowed"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Stats (Soon)</span>
          </button>
        </nav>

        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-2 opacity-50 cursor-not-allowed group">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Guest User</span>
              <span className="text-[10px] text-white/40">Login Disabled</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Reset Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === 'timer' ? 'Focus Session' : 'My Syllabus'}
            </h2>
            <p className="text-white/40 text-sm mt-1">
              Class {state.onboardingData.classLevel} • {state.onboardingData.stream || 'General'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/60">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            {activeTab === 'timer' ? (
              <Timer />
            ) : (
              <SyllabusTracker 
                syllabus={state.syllabus} 
                onToggleChapter={onUpdateSyllabus} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
