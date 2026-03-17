import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Subject, Chapter } from '../types';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, BookOpen, Trophy } from 'lucide-react';

interface SyllabusTrackerProps {
  syllabus: Subject[];
  onToggleChapter: (subjectId: string, chapterId: string) => void;
}

export const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({ syllabus, onToggleChapter }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const calculateProgress = (subject: Subject) => {
    const completed = subject.chapters.filter(ch => ch.completed).length;
    return (completed / subject.chapters.length) * 100;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="text-emerald-400 w-6 h-6" />
          Syllabus Tracker
        </h2>
        <div className="flex items-center gap-2 text-xs font-medium text-white/40">
          <Trophy className="w-4 h-4" />
          <span>Total Progress: {Math.round(syllabus.reduce((acc, sub) => acc + calculateProgress(sub), 0) / syllabus.length)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {syllabus.map((subject) => (
          <GlassCard 
            key={subject.id} 
            className={`p-0 overflow-hidden border-white/5 transition-all duration-300 ${expandedId === subject.id ? 'ring-1 ring-emerald-500/30' : ''}`}
          >
            <button 
              onClick={() => toggleExpand(subject.id)}
              className="w-full p-5 flex items-center justify-between group"
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{subject.name}</span>
                  {subject.isElective && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full uppercase font-bold tracking-wider">Elective</span>}
                  {subject.isCompetitive && <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-full uppercase font-bold tracking-wider">Competitive</span>}
                </div>
                <div className="flex items-center gap-4 w-64">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(subject)}%` }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                  <span className="text-xs font-mono text-white/40">{Math.round(calculateProgress(subject))}%</span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                {expandedId === subject.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedId === subject.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5 bg-black/20"
                >
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subject.chapters.map((chapter) => (
                      <button 
                        key={chapter.id}
                        onClick={() => onToggleChapter(subject.id, chapter.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                          chapter.completed 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-white/5 border border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {chapter.completed ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Circle className="w-5 h-5 shrink-0" />}
                        <span className="text-sm font-medium line-clamp-1">{chapter.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
