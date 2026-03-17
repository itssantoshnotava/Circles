import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Users, Plus, LogIn, ArrowRight } from 'lucide-react';
import { createRoom, joinRoom } from '../services/firebaseService';

interface RoomsProps {
  userId: string;
  onEnterRoom: (roomId: string) => void;
}

export const Rooms: React.FC<RoomsProps> = ({ userId, onEnterRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError(null);
    try {
      const roomId = await createRoom(userId);
      onEnterRoom(roomId);
    } catch (err) {
      setError("Failed to create room. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length !== 5) {
      setError("Room code must be 5 digits");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await joinRoom(userId, roomCode);
      onEnterRoom(roomCode);
    } catch (err: any) {
      setError(err.message || "Failed to join room. Check the code.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Study <span className="text-emerald-500">Rooms</span></h1>
        <p className="text-white/40 font-medium">Create a private space to study with your friends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Room */}
        <GlassCard className="p-8 border-white/5 flex flex-col items-center text-center space-y-6 hover:bg-white/[0.05] transition-all">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Plus className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Create Room</h3>
            <p className="text-sm text-white/40">Start a new session and invite others with a unique code.</p>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Generate Code"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </GlassCard>

        {/* Join Room */}
        <GlassCard className="p-8 border-white/5 flex flex-col items-center text-center space-y-6 hover:bg-white/[0.05] transition-all">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <LogIn className="w-10 h-10 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Join Room</h3>
            <p className="text-sm text-white/40">Enter a 5-digit code to join an existing study session.</p>
          </div>
          <form onSubmit={handleJoinRoom} className="w-full space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Enter 5-digit code"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              disabled={loading || roomCode.length !== 5}
              className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Session"}
              <LogIn className="w-5 h-5" />
            </button>
          </form>
        </GlassCard>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center"
        >
          {error}
        </motion.div>
      )}

      <div className="flex flex-col items-center py-12 opacity-20">
        <Users className="w-12 h-12 mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em]">Collaborative Study</p>
      </div>
    </div>
  );
};
