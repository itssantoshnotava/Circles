import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { EXAM_DATES } from '../data/syllabus';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface CountdownProps {
  exams: string[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft | null => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl font-mono font-bold tracking-tighter">{value.toString().padStart(2, '0')}</span>
    <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black">{label}</span>
  </div>
);

export const ExamCountdown: React.FC<CountdownProps> = ({ exams }) => {
  const [selectedSessions, setSelectedSessions] = useState<Record<string, number>>({});
  const [timeUpdates, setTimeUpdates] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUpdates(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!exams || exams.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      {exams.map((examName) => {
        const exam = EXAM_DATES[examName];
        if (!exam) return null;

        const sessionIndex = selectedSessions[examName] || 0;
        const targetDate = exam.sessions ? exam.sessions[sessionIndex].date : exam.date;
        const timeLeft = calculateTimeLeft(targetDate);

        return (
          <GlassCard key={examName} className="p-6 border-white/5 relative overflow-hidden group">
            {/* Subtle Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full group-hover:bg-emerald-500/10 transition-all" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Countdown</span>
                <span className="font-black text-lg tracking-tight">{exam.name}</span>
              </div>
              {exam.sessions && (
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                  {exam.sessions.map((s, idx) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSessions(prev => ({ ...prev, [examName]: idx }))}
                      className={`text-[9px] px-3 py-1.5 rounded-lg transition-all font-black uppercase tracking-widest ${
                        sessionIndex === idx ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      S{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {timeLeft ? (
              <div className="flex justify-between items-center px-1">
                <CountdownItem label="Days" value={timeLeft.days} />
                <span className="text-white/10 font-mono text-xl mb-4">:</span>
                <CountdownItem label="Hrs" value={timeLeft.hours} />
                <span className="text-white/10 font-mono text-xl mb-4">:</span>
                <CountdownItem label="Min" value={timeLeft.minutes} />
                <span className="text-white/10 font-mono text-xl mb-4">:</span>
                <CountdownItem label="Sec" value={timeLeft.seconds} />
              </div>
            ) : (
              <div className="text-center py-2 text-white/20 font-black text-xs uppercase tracking-widest">
                Exam Concluded
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
};
