import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import { getCurrentUserProfile, listenToFriendRequests, listenToNotifications, acceptFriendRequest, rejectFriendRequest, getUserProfiles } from '../services/firebaseService';
import { UserProfile } from '../types';

export const Notifications: React.FC = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Record<string, UserProfile>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const currentUser = getCurrentUserProfile();

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubRequests = listenToFriendRequests(currentUser.uid, async (requests) => {
      setFriendRequests(requests);
      
      // Fetch profiles for the requests
      const fromIds = requests.map(r => r.fromUserId);
      if (fromIds.length > 0) {
        const profiles = await getUserProfiles(fromIds);
        const profileMap: Record<string, UserProfile> = {};
        profiles.forEach(p => {
          if (p.uid) profileMap[p.uid] = p;
        });
        setRequestProfiles(profileMap);
      }
    });

    const unsubNotifs = listenToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
    });

    return () => {
      unsubRequests();
      unsubNotifs();
    };
  }, [currentUser?.uid]);

  const handleAccept = async (requestId: string, fromUserId: string) => {
    if (!currentUser?.uid) return;
    try {
      await acceptFriendRequest(requestId, fromUserId, currentUser.uid);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Activity <span className="text-emerald-500">Center</span></h1>
        <p className="text-white/40 font-medium">Stay updated with your study network</p>
      </div>

      <div className="space-y-4">
        {friendRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400">Friend Requests</h2>
            {friendRequests.map((request) => {
              const profile = requestProfiles[request.fromUserId];
              return (
                <GlassCard key={request.id} className="p-4 border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt={profile.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">
                        <span className="text-emerald-500">@{profile?.username || 'user'}</span> wants to be friends
                      </p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {profile?.displayName || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(request.id, request.fromUserId)}
                      className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="space-y-4 mt-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">Notifications</h2>
            {notifications.map((notif) => (
              <GlassCard key={notif.id} className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{notif.message}</p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {friendRequests.length === 0 && notifications.length === 0 && (
          <div className="flex flex-col items-center py-12 opacity-20">
            <Bell className="w-12 h-12 mb-4" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
