import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { User, Camera, Calendar, AtSign, Check, Loader2 } from 'lucide-react';
import { checkUsernameUnique, saveUserProfile, uploadToCloudinary } from '../services/firebaseService';
import { auth } from '../firebase';

interface ProfileSetupProps {
  onComplete: (data: { name: string; username: string; dob: string; profilePic: string }) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(auth.currentUser?.photoURL || null);
  const [uploading, setUploading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUsernameUnique, setIsUsernameUnique] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username.length >= 3) {
        setCheckingUsername(true);
        const isUnique = await checkUsernameUnique(username);
        setIsUsernameUnique(isUnique);
        setUsernameError(isUnique ? null : 'Username already taken');
        setCheckingUsername(false);
      } else if (username.length > 0) {
        setUsernameError('Username must be at least 3 characters');
        setIsUsernameUnique(false);
      } else {
        setUsernameError(null);
        setIsUsernameUnique(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setProfilePic(url);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameUnique || !name || !dob || !profilePic) return;

    const profileData = {
      name,
      username,
      dob,
      profilePic
    };

    const userId = auth.currentUser?.uid || 'guest';
    await saveUserProfile(userId, profileData);
    onComplete(profileData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      <GlassCard className="w-full max-w-lg p-10 md:p-12 border-white/5 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-tighter">Profile <span className="text-emerald-500">Setup</span></h1>
            <p className="text-white/40 font-medium">Let's lock in your identity before we start.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 bg-white/5 flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white/20" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-black" />
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Upload JPG, PNG, or GIF</span>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                  required
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <AtSign className="w-3 h-3" /> Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="username"
                    className={`w-full bg-white/5 border ${isUsernameUnique ? 'border-emerald-500/50' : 'border-white/10'} rounded-xl pl-8 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold`}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                    ) : isUsernameUnique ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                </div>
                {usernameError && (
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{usernameError}</p>
                )}
                <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Username cannot be changed later</p>
              </div>

              {/* DOB Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-white/60"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-4 text-lg"
              disabled={!isUsernameUnique || !name || !dob || !profilePic || uploading}
            >
              Complete Profile
            </Button>
          </form>
        </motion.div>
      </GlassCard>
    </div>
  );
};
