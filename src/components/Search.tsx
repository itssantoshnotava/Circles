import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Search as SearchIcon, User, UserPlus, Users, Loader2 } from 'lucide-react';
import { searchUsers } from '../services/firebaseService';
import { UserProfile } from '../types';
import { StaticAvatar } from './StaticAvatar';
import { UserProfilePreview } from './UserProfilePreview';

interface SearchProps {
  currentUser: UserProfile;
}

export const Search: React.FC<SearchProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setLoading(true);
        try {
          const users = await searchUsers(searchQuery);
          // Filter out current user
          setResults(users.filter(u => u.uid !== currentUser.uid));
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser.uid]);

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Search <span className="text-emerald-500">Users</span></h1>
        <p className="text-white/40 font-medium">Find study partners by their username</p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          ) : (
            <SearchIcon className="w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter username (e.g. alex, studyking)"
          className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg font-bold placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-2xl"
        />
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              {searchQuery ? 'Search Results' : 'Suggested People'}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((user) => (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <GlassCard 
                      onClick={() => setSelectedUser(user)}
                      className="p-4 border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <StaticAvatar 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-12 h-12 rounded-2xl border border-white/10"
                        />
                        <div>
                          <h3 className="font-black text-sm tracking-tight">{user.displayName || 'Anonymous User'}</h3>
                          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">@{user.username}</p>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <UserPlus className="w-4 h-4" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              ) : searchQuery.length >= 2 && !loading ? (
                <div className="text-center py-12 opacity-20">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">No users found</p>
                </div>
              ) : !searchQuery && (
                <div className="text-center py-12 opacity-20">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">Start typing to search</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserProfilePreview 
            user={selectedUser} 
            currentUser={currentUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
