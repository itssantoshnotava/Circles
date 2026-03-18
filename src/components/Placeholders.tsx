import React, { useState, useEffect } from 'react';
import { MessageSquare, Zap, Bell, Heart, UserPlus, Check, X, Loader2, UserCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { listenToNotifications, acceptFriendRequest, rejectFriendRequest, getPendingRequests, getUserProfiles, getCurrentUserProfile } from '../services/firebaseService';
import { Notification, FriendRequest, UserProfile } from '../types';
import { StaticAvatar } from './StaticAvatar';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUserProfile();

  useEffect(() => {
    if (!currentUser.uid) return;

    const unsubscribe = listenToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
    });

    const fetchPending = async () => {
      try {
        const requests = await getPendingRequests(currentUser.uid);
        setPendingRequests(requests);
        
        const fromIds = requests.map(r => r.fromUserId);
        if (fromIds.length > 0) {
          const profiles = await getUserProfiles(fromIds);
          const profileMap: Record<string, UserProfile> = {};
          profiles.forEach(p => profileMap[p.uid] = p);
          setRequestProfiles(profileMap);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleAccept = async (request: FriendRequest) => {
    try {
      await acceptFriendRequest(request.id, request.fromUserId, currentUser.uid);
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleReject = async (request: FriendRequest) => {
    try {
      await rejectFriendRequest(request.id);
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Activity <span className="text-emerald-500">Center</span></h1>
        <p className="text-white/40 font-medium">Stay updated with your study network</p>
      </div>

      <div className="space-y-6">
        {/* Friend Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 px-2">Pending Friend Requests</h4>
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const profile = requestProfiles[req.fromUserId];
                return (
                  <GlassCard key={req.id} className="p-4 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <StaticAvatar 
                        src={profile?.photoURL} 
                        alt={profile?.displayName || 'User'} 
                        className="w-12 h-12 rounded-2xl border border-emerald-500/20"
                      />
                      <div>
                        <p className="text-sm font-bold tracking-tight">
                          <span className="text-emerald-500">@{profile?.username || 'user'}</span> sent a request
                        </p>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Just now</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(req)}
                        className="p-2.5 rounded-xl bg-emerald-500 text-black hover:scale-110 transition-all"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(req)}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Notifications */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2">Recent Activity</h4>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <GlassCard key={notif.id} className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center relative">
                      <div className="w-6 h-6 rounded-full bg-white/10" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#050505] flex items-center justify-center border-2 border-white/5">
                        {notif.type === 'friend_request' ? <UserPlus className="w-3 h-3 text-emerald-500" /> : <Bell className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium tracking-tight text-white/80">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">
                        {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                </GlassCard>
              ))
            ) : !loading && pendingRequests.length === 0 && (
              <div className="flex flex-col items-center py-12 opacity-20">
                <Bell className="w-12 h-12 mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.3em]">No activity yet</p>
              </div>
            )}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
