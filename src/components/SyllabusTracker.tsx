import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Subject, Chapter } from '../types';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, BookOpen, Trophy, GraduationCap, Target } from 'lucide-react';

interface SyllabusTrackerProps {
  syllabus: Subject[];
  onToggleChapter: (subjectId: string, chapterId: string) => void;
}

export const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ syllabus, onToggleChapter }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bitsatSession, setBitsatSession] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<string>('CBSE');

  const calculateProgress = (subject: Subject) => {
    const completed = subject.chapters.filter(ch => ch.completed).length;
    return (completed / subject.chapters.length) * 100;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group subjects by parentExam
  const capsules = syllabus.reduce((acc, sub) => {
    const key = sub.parentExam || 'CBSE';
    if (!acc[key]) acc[key] = [];
    acc[key].push(sub);
    return acc;
  }, {} as Record<string, Subject[]>);

  const tabs = Object.keys(capsules).sort((a, b) => {
    if (a === 'CBSE') return -1;
    if (b === 'CBSE') return 1;
    return a.localeCompare(b);
  });

  const activeSubjects = capsules[activeTab] || [];
  const tabProgress = activeSubjects.length > 0 
    ? Math.round(activeSubjects.reduce((acc, sub) => acc + calculateProgress(sub), 0) / activeSubjects.length)
    : 0;
  const chaptersLeft = activeSubjects.reduce((acc, sub) => acc + sub.chapters.filter(ch => !ch.completed).length, 0);

  const renderSubject = (subject: Subject) => {
    const progress = calculateProgress(subject);
    const isExpanded = expandedId === subject.id;

    return (
      <GlassCard 
        key={subject.id} 
        className={`p-0 overflow-hidden border-white/5 transition-all duration-500 ${isExpanded ? 'ring-2 ring-emerald-500/20 bg-white/[0.05]' : ''}`}
      >
        <button 
          onClick={() => toggleExpand(subject.id)}
          className="w-full p-6 text-left space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">{subject.name}</h3>
                {subject.isElective && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                    Elective
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 font-medium">
                {subject.chapters.filter(ch => ch.completed).length} / {subject.chapters.length} Chapters Complete
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">{Math.round(progress)}%</span>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 opacity-40" /> : <ChevronDown className="w-5 h-5 opacity-40" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            />
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-white/[0.02]"
            >
              <div className="p-6 grid grid-cols-1 gap-2">
                {subject.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => onToggleChapter(subject.id, chapter.id)}
                    className={`group flex items-center justify-between p-4 rounded-2xl transition-all border ${
                      chapter.completed 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {chapter.completed ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 shrink-0 opacity-20 group-hover:opacity-40" />
                      )}
                      <div className="text-left">
                        <span className="text-sm font-bold tracking-tight block">{chapter.name}</span>
                        <div className="flex gap-2 mt-1">
                          {chapter.tags.map(tag => (
                            <span 
                              key={tag} 
                              className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                tag === 'Important' ? 'bg-red-500/20 text-red-400' : 
                                tag === 'Exam Level' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-white/10 text-white/40'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    );
  };

  const renderTabContent = () => {
    const subjects = activeSubjects;
    const title = activeTab;
    const icon = title === 'CBSE' ? <GraduationCap className="w-5 h-5 text-emerald-400" /> : <Target className="w-5 h-5 text-emerald-400" />;

    if (title === 'CUET') {
      const categories = ['Domain', 'Language', 'General'];
      return (
        <motion.div 
          key={title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6 w-full"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">{title} <span className="text-emerald-500">Capsule</span></h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Competitive Preparation</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {categories.map(cat => {
              const catSubjects = subjects.filter(s => s.category === cat);
              if (catSubjects.length === 0) return null;
              return (
                <div key={cat} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">{cat} Subjects</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {catSubjects.map(renderSubject)}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        key={title}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6 w-full"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">{title} <span className="text-emerald-500">Capsule</span></h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                {title === 'CBSE' ? 'Academic Foundation' : 'Competitive Preparation'}
              </p>
            </div>
          </div>

          {title === 'BITSAT' && (
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setBitsatSession(s as 1 | 2)}
                  className={`text-[9px] px-3 py-1.5 rounded-lg transition-all font-black uppercase tracking-widest ${
                    bitsatSession === s ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  S{s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subjects.map(renderSubject)}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 w-full max-w-2xl">
      {/* Overall Progress Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-black tracking-tighter">Syllabus <span className="text-emerald-500">Tracker</span></h1>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedId(null);
              }}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
                activeTab === tab 
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-105 z-10' 
                  : 'text-white/30 border-white/5 hover:text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-8 pt-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{activeTab} Progress</p>
            <p className="text-3xl font-black text-emerald-400">{tabProgress}%</p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Chapters Left</p>
            <p className="text-3xl font-black">{chaptersLeft}</p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};
