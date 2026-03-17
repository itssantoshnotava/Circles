import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { User, Mail, GraduationCap, BookOpen, Target, LogOut, Edit2, Check, X, Calendar, Users, UserPlus } from 'lucide-react';
import { OnboardingData, UserProfile } from '../types';
import { getCurrentUserProfile, logoutUser, getFriends } from '../services/firebaseService';
import { StaticAvatar } from './StaticAvatar';
import { UserProfilePreview } from './UserProfilePreview';

interface ProfileProps {
  onboardingData: OnboardingData;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onboardingData, onLogout }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);

  useEffect(() => {
    console.log("Profile loaded");
    const profile = getCurrentUserProfile();
    setUser(profile);
    setEditedName(profile.displayName || '');
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user) {
        setLoadingFriends(true);
        try {
          const f = await getFriends(user.uid);
          setFriends(f);
        } catch (error) {
          console.error("Error fetching friends:", error);
        } finally {
          setLoadingFriends(false);
        }
      }
    };
    fetchFriends();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    onLogout();
  };

  const handleSaveName = () => {
    if (user) {
      setUser({ ...user, displayName: editedName });
    }
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Top Section: Profile Header */}
      <GlassCard className="p-8 border-white/5 flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
            <StaticAvatar 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-full h-full"
            />
          </div>
          {user.isGuest && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
              Guest
            </div>
          )}
        </div>

        <div className="space-y-2 w-full">
          {isEditing ? (
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-center font-black text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full"
                autoFocus
              />
              <button onClick={handleSaveName} className="p-2 hover:text-emerald-400 transition-colors">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:text-red-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter">{user.displayName || 'Anonymous User'}</h1>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-white/20 hover:text-emerald-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {user.username && (
                <span className="text-emerald-500 font-black tracking-widest text-sm uppercase">@{user.username}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white/40 font-medium">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{user.email}</span>
          </div>
        </div>
      </GlassCard>

      {/* Friends Section */}
      <GlassCard className="p-6 border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-400">
            <Users className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Friends ({friends.length})</span>
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : friends.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {friends.map(friend => (
              <button 
                key={friend.uid}
                onClick={() => setSelectedFriend(friend)}
                className="flex flex-col items-center gap-2 group flex-shrink-0"
              >
                <div className="relative">
                  <StaticAvatar 
                    src={friend.photoURL} 
                    alt={friend.displayName || 'Friend'} 
                    className="w-16 h-16 rounded-2xl border-2 border-white/5 group-hover:border-emerald-500/50 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#050505]">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                </div>
                <span className="text-[10px] font-black text-white/40 group-hover:text-emerald-500 transition-colors truncate w-16 text-center">
                  @{friend.username}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <UserPlus className="w-8 h-8 mx-auto mb-2 text-white/10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No friends yet. Start searching!</p>
          </div>
        )}
      </GlassCard>

      {/* Tag Section: Quick Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        <div className="glass px-4 py-2 rounded-full border-white/5 shadow-lg shadow-emerald-500/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Class {onboardingData.classLevel}</span>
        </div>
        <div className="glass px-4 py-2 rounded-full border-white/5 shadow-lg shadow-blue-500/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{onboardingData.stream}</span>
        </div>
        {user.dob && (
          <div className="glass px-4 py-2 rounded-full border-white/5 shadow-lg shadow-orange-500/5 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{new Date(user.dob).toLocaleDateString()}</span>
          </div>
        )}
        {onboardingData.competitiveExams.map(exam => (
          <div key={exam} className="glass px-4 py-2 rounded-full border-white/5 shadow-lg shadow-purple-500/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{exam}</span>
          </div>
        ))}
      </div>

      {/* Info Section: Detailed Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <GraduationCap className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Academic Info</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Class Level</span>
              <span className="font-bold">Class {onboardingData.classLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Stream</span>
              <span className="font-bold">{onboardingData.stream}</span>
            </div>
            {onboardingData.secondLanguage && (
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm">Second Language</span>
                <span className="font-bold">{onboardingData.secondLanguage}</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-white/5 space-y-4">
          <div className="flex items-center gap-3 text-blue-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Subjects</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onboardingData.subjects.map(subject => (
              <span key={subject} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold border border-white/5">
                {subject}
              </span>
            ))}
            {onboardingData.electives.map(elective => (
              <span key={elective} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/10">
                {elective}
              </span>
            ))}
          </div>
        </GlassCard>

        {onboardingData.preparingForCompetitive && (
          <GlassCard className="p-6 border-white/5 space-y-4 md:col-span-2">
            <div className="flex items-center gap-3 text-purple-400">
              <Target className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Competitive Exams</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {onboardingData.competitiveExams.map(exam => (
                <div key={exam} className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <span className="text-sm font-black">{exam}</span>
                </div>
              ))}
              {onboardingData.cuetSubjects.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center col-span-2">
                  <span className="text-[10px] text-white/40 block mb-1 uppercase tracking-widest">CUET Subjects</span>
                  <span className="text-xs font-bold">{onboardingData.cuetSubjects.join(', ')}</span>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-8 flex justify-center">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20 font-black uppercase tracking-widest text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout from Circles
        </button>
      </div>

      <AnimatePresence>
        {selectedFriend && user && (
          <UserProfilePreview 
            user={selectedFriend} 
            currentUser={user}
            onClose={() => setSelectedFriend(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
