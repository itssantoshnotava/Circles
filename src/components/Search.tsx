import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Search as SearchIcon, User, UserPlus, Users } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Search <span className="text-emerald-500">Users</span></h1>
        <p className="text-white/40 font-medium">Find study partners by their username</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter username (e.g. alex, studyking)"
          className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-2xl"
        />
        <div className="absolute inset-y-0 right-6 flex items-center">
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black text-white/20 uppercase tracking-widest">
            Username Only
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Discover People</h4>
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500">See All</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <User className="w-6 h-6 text-white/20" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">@user_{i}</h3>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Class 12 • PCM</p>
                  </div>
                </div>
                <button className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">
                  <UserPlus className="w-4 h-4" />
                </button>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Suggested People</h4>
            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Refresh</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[4, 5, 6, 7].map((i) => (
              <GlassCard key={i} className="p-6 border-white/5 flex flex-col items-center text-center space-y-4 hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center">
                  <User className="w-8 h-8 text-white/20" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">@user_{i}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">BITSAT • JEE</p>
                </div>
                <button className="w-full py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                  Follow
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
