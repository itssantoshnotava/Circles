import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { User, Mail, GraduationCap, BookOpen, Target, LogOut, Edit2, Check, X, Calendar, Users } from 'lucide-react';
import { OnboardingData, UserProfile } from '../types';
import { getCurrentUserProfile, logoutUser, listenToFriends, getUserProfiles } from '../services/firebaseService';

interface ProfileProps {
  onboardingData: OnboardingData;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onboardingData, onLogout }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    console.log("Profile loaded");
    const profile = getCurrentUserProfile();
    setUser(profile);
    setEditedName(profile.displayName || '');

    if (profile.uid) {
      const unsub = listenToFriends(profile.uid, (friendsData) => {
        setFriends(friendsData);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    const fetchFriendProfiles = async () => {
      if (friends.length > 0) {
        const friendIds = friends.map(f => f.friendId);
        const profiles = await getUserProfiles(friendIds);
        setFriendProfiles(profiles);
      } else {
        setFriendProfiles([]);
      }
    };
    fetchFriendProfiles();
  }, [friends]);

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
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center">
                <User className="w-12 h-12 text-emerald-500/40" />
              </div>
            )}
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

      {/* Friends Section */}
      <GlassCard className="p-6 border-white/5 space-y-4">
        <div className="flex items-center gap-3 text-emerald-400">
          <Users className="w-5 h-5" />
          <span id="fr5" className="text-xs font-black uppercase tracking-widest">Friends ({friendProfiles.length})</span>
        </div>
        {friendProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friendProfiles.map(friend => (
              <div key={friend.uid} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  {friend.photoURL ? (
                    <img src={friend.photoURL} alt={friend.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight">{friend.displayName || 'Anonymous'}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">@{friend.username}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm italic">No friends yet. Go to Search to find study partners!</p>
        )}
      </GlassCard>

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
    </div>
  );
};
