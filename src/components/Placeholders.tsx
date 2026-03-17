import React from 'react';
import { MessageSquare, Zap, Bell, Heart, UserPlus } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const Chat: React.FC = () => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse">
          <MessageSquare className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#050505]">
          <Zap className="w-4 h-4 text-black" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Chats <span className="text-emerald-500">Coming Soon</span></h1>
        <p className="text-white/40 font-medium max-w-xs mx-auto">We're building a powerful real-time messaging system for study groups and partners.</p>
      </div>
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="flex -space-x-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full border-4 border-[#050505] bg-white/10" />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Join the waitlist</span>
      </div>
    </div>
  );
};

export const Notifications: React.FC = () => {
  const notifications = [
    { id: 1, type: 'friend', user: 'alex_study', action: 'sent you a friend request', time: '2m ago', icon: <UserPlus className="w-4 h-4 text-blue-400" /> },
    { id: 2, type: 'like', user: 'rahul_jee', action: 'liked your study goal', time: '15m ago', icon: <Heart className="w-4 h-4 text-red-400" /> },
    { id: 3, type: 'mention', user: 'study_king', action: 'mentioned you in a chat', time: '1h ago', icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Activity <span className="text-emerald-500">Center</span></h1>
        <p className="text-white/40 font-medium">Stay updated with your study network</p>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <GlassCard key={notif.id} className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#050505] flex items-center justify-center border-2 border-white/5">
                  {notif.icon}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">
                  <span className="text-emerald-500">@{notif.user}</span> {notif.action}
                </p>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">{notif.time}</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </GlassCard>
        ))}
      </div>

      <div className="flex flex-col items-center py-12 opacity-20">
        <Bell className="w-12 h-12 mb-4" />
        <p className="text-sm font-black uppercase tracking-[0.3em]">No more notifications</p>
      </div>
    </div>
  );
};
