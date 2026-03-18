import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Search as SearchIcon, User, UserPlus, Users } from 'lucide-react';
import { searchUsers, listenToFriends, listenToSentFriendRequests, listenToFriendRequests } from '../services/firebaseService';
import { UserProfile } from '../types';
import { UserProfilePreview } from './UserProfilePreview';

interface SearchProps {
  currentUser: UserProfile;
}

export const Search: React.FC<SearchProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [friends, setFriends] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const unsubFriends = listenToFriends(currentUser.uid, setFriends);
    const unsubSent = listenToSentFriendRequests(currentUser.uid, setSentRequests);
    const unsubReceived = listenToFriendRequests(currentUser.uid, setReceivedRequests);

    return () => {
      unsubFriends();
      unsubSent();
      unsubReceived();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setLoading(true);
        try {
          const results = await searchUsers(searchQuery);
          // Filter out current user
          setSearchResults(results.filter(u => u.uid !== currentUser.uid));
        } catch (error) {
          console.error("Search error:", error);
        }
        setLoading(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser.uid]);

  const getFriendStatus = (userId: string) => {
    if (friends.some(f => f.friendId === userId)) return 'friends';
    if (sentRequests.some(r => r.toUserId === userId)) return 'sent';
    if (receivedRequests.some(r => r.fromUserId === userId)) return 'received';
    return 'none';
  };

  const getRequestId = (userId: string) => {
    const req = receivedRequests.find(r => r.fromUserId === userId);
    return req ? req.id : undefined;
  };

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
        {searchQuery.trim().length >= 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Search Results</h4>
              {loading && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">Searching...</span>}
            </div>
            
            {searchResults.length === 0 && !loading ? (
              <div className="text-center py-8 text-white/40 font-medium">No users found</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((user) => (
                  <GlassCard 
                    key={user.uid} 
                    onClick={() => setSelectedUser(user)}
                    className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-6 h-6 text-white/20" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-sm tracking-tight">{user.displayName || 'Anonymous'}</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">@{user.username}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserProfilePreview
            user={selectedUser}
            currentUser={currentUser}
            onClose={() => setSelectedUser(null)}
            friendStatus={getFriendStatus(selectedUser.uid)}
            requestId={getRequestId(selectedUser.uid)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
