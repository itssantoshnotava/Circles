import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock, Hourglass } from 'lucide-react';
import { getOrCreateUserId, saveTimerMode } from '../services/firebaseService';

type TimerMode = 'pomodoro' | 'stopwatch' | 'countdown';

interface TimerProps {
  isRoomMode?: boolean;
  roomTimerState?: any;
  isHost?: boolean;
  onTimerSync?: (state: any) => void;
}

const MODE_TIMES: Record<string, number> = {
  pomodoro: 25 * 60,
  stopwatch: 0,
  countdown: 25 * 60
};

export const Timer: React.FC<TimerProps> = ({ 
  isRoomMode = false, 
  roomTimerState, 
  isHost = false, 
  onTimerSync 
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // Default 25 min
  const [customTime, setCustomTime] = useState(25);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync from room state (for participants)
  useEffect(() => {
    if (isRoomMode && !isHost && roomTimerState) {
      setTime(roomTimerState.timeLeft);
      setIsActive(roomTimerState.isRunning);
      setMode(roomTimerState.mode || 'pomodoro');
    }
  }, [isRoomMode, isHost, roomTimerState]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => {
          const newTime = mode === 'stopwatch' ? prevTime + 1 : Math.max(0, prevTime - 1);
          
          if (mode !== 'stopwatch' && newTime === 0) {
            setIsActive(false);
            console.log("Timer finished");
          }

          // Sync to room if host
          if (isRoomMode && isHost && onTimerSync) {
            onTimerSync({
              timeLeft: newTime,
              isRunning: isActive,
              mode
            });
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, isRoomMode, isHost, onTimerSync]);

  const toggleTimer = () => {
    if (isRoomMode && !isHost) return;
    const nextActive = !isActive;
    setIsActive(nextActive);
    
    if (isRoomMode && isHost && onTimerSync) {
      onTimerSync({
        timeLeft: time,
        isRunning: nextActive,
        mode
      });
    }
  };

  const resetTimer = () => {
    if (isRoomMode && !isHost) return;
    setIsActive(false);
    let newTime = MODE_TIMES[mode] || (customTime * 60);
    
    setTime(newTime);

    if (isRoomMode && isHost && onTimerSync) {
      onTimerSync({
        timeLeft: newTime,
        isRunning: false,
        mode
      });
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    if (isRoomMode && !isHost) return;
    console.log(`Switching timer mode to: ${newMode}`);
    // 1. Stop current timer
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // 2. Set new mode
    setMode(newMode);
    
    // 3. Initialize new mode state cleanly
    let newTime = MODE_TIMES[newMode] || (customTime * 60);
    
    setTime(newTime);

    // Sync to room if host
    if (isRoomMode && isHost && onTimerSync) {
      onTimerSync({
        timeLeft: newTime,
        isRunning: false,
        mode: newMode
      });
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
      
      <div className="flex bg-white/5 p-1.5 rounded-2xl w-full overflow-x-auto no-scrollbar">
        {(['pomodoro', 'stopwatch', 'countdown'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              mode === m 
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 z-10' 
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {m === 'pomodoro' && <TimerIcon className="w-3 h-3" />}
            {m === 'stopwatch' && <Clock className="w-3 h-3" />}
            {m === 'countdown' && <Hourglass className="w-3 h-3" />}
            <span>{m}</span>
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
                strokeDashoffset: (2 * Math.PI * 150) * (1 - time / (MODE_TIMES[mode] || (customTime * 60))) 
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
