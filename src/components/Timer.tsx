import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock, Hourglass } from 'lucide-react';
import { getOrCreateUserId, saveTimerMode } from '../services/firebaseService';

type TimerMode = 'pomodoro' | 'stopwatch' | 'countdown';

export const Timer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // Default 25 min
  const [customTime, setCustomTime] = useState(25);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (mode === 'stopwatch') return prevTime + 1;
          if (prevTime <= 0) {
            setIsActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setTime(25 * 60);
    else if (mode === 'stopwatch') setTime(0);
    else setTime(customTime * 60);
  };

  const handleModeChange = (newMode: TimerMode) => {
    // 1. Stop current timer
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // 2. Set new mode
    setMode(newMode);
    
    // 3. Initialize new mode state cleanly
    if (newMode === 'pomodoro') {
      setTime(25 * 60);
    } else if (newMode === 'stopwatch') {
      setTime(0);
    } else {
      setTime(customTime * 60);
    }

    // Silent Firebase sync
    const userId = getOrCreateUserId();
    saveTimerMode(userId, newMode);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="w-full max-w-lg p-10 flex flex-col items-center space-y-10 border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700" />
      
      <div className="flex bg-white/5 p-1.5 rounded-2xl w-full">
        {(['pomodoro', 'stopwatch', 'countdown'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === m 
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 z-10' 
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {m === 'pomodoro' && <TimerIcon className="w-4 h-4" />}
            {m === 'stopwatch' && <Clock className="w-4 h-4" />}
            {m === 'countdown' && <Hourglass className="w-4 h-4" />}
            <span className="capitalize">{m}</span>
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-80 h-80">
        {/* Progress Ring Background */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="12"
          />
          {mode !== 'stopwatch' && (
            <motion.circle
              cx="160"
              cy="160"
              r="150"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 150}
              initial={{ strokeDashoffset: 0 }}
              animate={{ 
                strokeDashoffset: (2 * Math.PI * 150) * (1 - time / (mode === 'pomodoro' ? 25 * 60 : (customTime || 1) * 60)) 
              }}
              className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            />
          )}
        </svg>

        <div className="text-center z-10">
          <motion.h1 
            key={time}
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-8xl font-mono font-black tracking-tighter text-white drop-shadow-2xl"
          >
            {formatTime(time)}
          </motion.h1>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40 mt-4 font-bold">
            {isActive ? 'Focusing...' : 'Ready?'}
          </p>
        </div>
      </div>

      {mode === 'countdown' && !isActive && (
        <div className="flex items-center gap-6 w-full px-4">
          <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Set Time:</span>
          <input 
            type="range" 
            min="1" 
            max="120" 
            value={customTime} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setCustomTime(val);
              setTime(val * 60);
            }}
            className="flex-1 accent-emerald-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-lg font-mono font-bold w-10 text-emerald-400">{customTime}m</span>
        </div>
      )}

      <div className="flex gap-6 w-full">
        <Button 
          variant="primary" 
          size="lg" 
          className="flex-1 flex items-center justify-center gap-3 h-16 text-lg font-black uppercase tracking-widest"
          onClick={toggleTimer}
        >
          {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          className="p-5 h-16 w-16 flex items-center justify-center"
          onClick={resetTimer}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>
    </GlassCard>
  );
};
