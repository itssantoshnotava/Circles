import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { User, X } from 'lucide-react';
import { UserProfile } from '../types';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '../services/firebaseService';

interface UserProfilePreviewProps {
  user: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
  friendStatus: 'none' | 'sent' | 'received' | 'friends';
  requestId?: string;
}

export const UserProfilePreview: React.FC<UserProfilePreviewProps> = ({ user, currentUser, onClose, friendStatus, requestId }) => {
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(currentUser.uid, user.uid, currentUser.username || 'user');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      await acceptFriendRequest(requestId, user.uid, currentUser.uid);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      await rejectFriendRequest(requestId);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-8 border-white/10 flex flex-col items-center text-center space-y-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center">
                <User className="w-10 h-10 text-emerald-500/40" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter">{user.displayName || 'Anonymous'}</h2>
            {user.username && (
              <p className="text-emerald-500 font-black tracking-widest text-xs uppercase">@{user.username}</p>
            )}
          </div>

          <div className="w-full pt-4">
            {friendStatus === 'none' && (
              <button
                id="fr1"
                onClick={handleAddFriend}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                [ Add Friend ]
              </button>
            )}
            {friendStatus === 'sent' && (
              <button
                id="fr2"
                disabled
                className="w-full py-3 bg-white/5 text-white/40 rounded-xl font-black uppercase tracking-widest border border-white/5"
              >
                [ Requested ]
              </button>
            )}
            {friendStatus === 'received' && (
              <div id="fr3" className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  [ Accept ]
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  [ Reject ]
                </button>
              </div>
            )}
            {friendStatus === 'friends' && (
              <button
                id="fr4"
                disabled
                className="w-full py-3 bg-emerald-500/10 text-emerald-500 rounded-xl font-black uppercase tracking-widest border border-emerald-500/20"
              >
                [ Friends ]
              </button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
