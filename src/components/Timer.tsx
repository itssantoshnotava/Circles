import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock, Hourglass } from 'lucide-react';

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
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') setTime(25 * 60);
    else if (newMode === 'stopwatch') setTime(0);
    else setTime(customTime * 60);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="w-full max-w-md p-8 flex flex-col items-center space-y-8">
      <div className="flex bg-white/5 p-1 rounded-xl w-full">
        {(['pomodoro', 'stopwatch', 'countdown'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              mode === m ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {m === 'pomodoro' && <TimerIcon className="w-3.5 h-3.5" />}
            {m === 'stopwatch' && <Clock className="w-3.5 h-3.5" />}
            {m === 'countdown' && <Hourglass className="w-3.5 h-3.5" />}
            <span className="capitalize">{m}</span>
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Progress Ring Background */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          {mode !== 'stopwatch' && (
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 120}
              initial={{ strokeDashoffset: 0 }}
              animate={{ 
                strokeDashoffset: (2 * Math.PI * 120) * (1 - time / (mode === 'pomodoro' ? 25 * 60 : customTime * 60)) 
              }}
              className="text-emerald-500"
            />
          )}
        </svg>

        <div className="text-center z-10">
          <motion.h1 
            key={time}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl font-mono font-bold tracking-tighter"
          >
            {formatTime(time)}
          </motion.h1>
          <p className="text-xs uppercase tracking-widest text-white/40 mt-2 font-medium">
            {isActive ? 'Focusing...' : 'Ready?'}
          </p>
        </div>
      </div>

      {mode === 'countdown' && !isActive && (
        <div className="flex items-center gap-4 w-full">
          <span className="text-sm text-white/60">Set Minutes:</span>
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
            className="flex-1 accent-emerald-500"
          />
          <span className="text-sm font-mono w-8">{customTime}</span>
        </div>
      )}

      <div className="flex gap-4 w-full">
        <Button 
          variant="primary" 
          size="lg" 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={toggleTimer}
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button 
          variant="secondary" 
          size="lg" 
          className="p-3.5"
          onClick={resetTimer}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </GlassCard>
  );
};
