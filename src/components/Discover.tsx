import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Users, UserPlus, Zap } from 'lucide-react';

export const Discover: React.FC = () => {
  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Discover <span className="text-emerald-500">Community</span></h1>
        <p className="text-white/40 font-medium">Explore trending students and potential study partners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-black text-lg">Discover Users</h3>
            <p className="text-xs text-white/40 mt-1">Find students with similar study goals and interests.</p>
          </div>
          <div className="pt-4 flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white/10" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black">
              +12
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <UserPlus className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-black text-lg">Suggested Friends</h3>
            <p className="text-xs text-white/40 mt-1">Based on your stream and competitive exam choices.</p>
          </div>
          <div className="pt-4 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                  <span className="text-[10px] font-bold">User {i}</span>
                </div>
                <button className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Follow</button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-black text-lg">Recently Joined</h3>
            <p className="text-xs text-white/40 mt-1">Welcome the newest members of the Circles community.</p>
          </div>
          <div className="pt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/5" />
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="flex flex-col items-center py-12 opacity-20">
        <Users className="w-12 h-12 mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em]">Activity Feed Coming Soon</p>
      </div>
    </div>
  );
};
