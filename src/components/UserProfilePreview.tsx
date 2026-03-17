import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, UserCheck, Clock, UserMinus, Check, XCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StaticAvatar } from './StaticAvatar';
import { UserProfile } from '../types';
import { getFriendshipStatus, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getPendingRequests } from '../services/firebaseService';

interface UserProfilePreviewProps {
  user: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
}

export const UserProfilePreview: React.FC<UserProfilePreviewProps> = ({ user, currentUser, onClose }) => {
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none');
  const [loading, setLoading] = useState(true);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      const s = await getFriendshipStatus(currentUser.uid, user.uid);
      setStatus(s);
      
      if (s === 'pending_received') {
        const requests = await getPendingRequests(currentUser.uid);
        const req = requests.find(r => r.fromUserId === user.uid);
        if (req) setPendingRequestId(req.id);
      }
      
      setLoading(false);
    };
    fetchStatus();
  }, [user.uid, currentUser.uid]);

  const handleAddFriend = async () => {
    if (loading) return;
    setLoading(true);
    await sendFriendRequest(currentUser.uid, user.uid, currentUser.username || 'User');
    setStatus('pending_sent');
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!pendingRequestId || loading) return;
    setLoading(true);
    await acceptFriendRequest(pendingRequestId, user.uid, currentUser.uid);
    setStatus('friends');
    setLoading(false);
  };

  const handleReject = async () => {
    if (!pendingRequestId || loading) return;
    setLoading(true);
    await rejectFriendRequest(pendingRequestId);
    setStatus('none');
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="overflow-hidden border-white/10 shadow-2xl">
          {/* Header/Cover */}
          <div className="h-24 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-8 -mt-12 flex flex-col items-center text-center">
            <div className="relative">
              <StaticAvatar 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-24 h-24 rounded-3xl border-4 border-[#050505] shadow-xl"
              />
              {status === 'friends' && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#050505]">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-2xl font-black tracking-tighter">{user.displayName || 'Anonymous User'}</h2>
              <p className="text-emerald-500 font-black text-sm uppercase tracking-widest">@{user.username || 'user'}</p>
            </div>

            <div className="mt-8 w-full space-y-3">
              {loading ? (
                <div className="w-full py-4 bg-white/5 rounded-2xl animate-pulse" />
              ) : (
                <>
                  {status === 'none' && (
                    <button 
                      onClick={handleAddFriend}
                      className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </button>
                  )}

                  {status === 'pending_sent' && (
                    <button 
                      disabled
                      className="w-full py-4 bg-white/5 text-white/40 font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2 border border-white/5"
                    >
                      <Clock className="w-5 h-5" />
                      Requested
                    </button>
                  )}

                  {status === 'pending_received' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleAccept}
                        className="flex-1 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Accept
                      </button>
                      <button 
                        onClick={handleReject}
                        className="flex-1 py-4 bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-500/20"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  )}

                  {status === 'friends' && (
                    <button 
                      disabled
                      className="w-full py-4 bg-emerald-500/10 text-emerald-500 font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                      <UserCheck className="w-5 h-5" />
                      Friends
                    </button>
                  )}
                </>
              )}
            </div>

            <p className="mt-6 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
              Member since {new Date().getFullYear()}
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
