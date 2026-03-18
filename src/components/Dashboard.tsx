import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer } from './Timer';
import { SyllabusTracker } from './SyllabusTracker';
import { ExamCountdown } from './ExamCountdown';
import { Profile } from './Profile';
import { Discover } from './Discover';
import { Search } from './Search';
import { Rooms } from './Rooms';
import { RoomScreen } from './RoomScreen';
import { Chat } from './Placeholders';
import { Notifications } from './Notifications';
import { StaticAvatar } from './StaticAvatar';
import { AppState } from '../types';
import { Timer as TimerIcon, BookOpen, LogOut, Home, Search as SearchIcon, MessageSquare, Bell, User, Users } from 'lucide-react';
import { getCurrentUserProfile, listenToFriendRequests, listenToNotifications } from '../services/firebaseService';

interface DashboardProps {
  state: AppState;
  onUpdateSyllabus: (subjectId: string, chapterId: string) => void;
  onLogout: () => void;
}

type Tab = 'dashboard' | 'discover' | 'search' | 'chat' | 'notifications' | 'profile' | 'rooms';

export const Dashboard: React.FC<DashboardProps> = ({ state, onUpdateSyllabus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [userProfile, setUserProfile] = useState(getCurrentUserProfile());
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Dashboard loaded");
    
    // Refresh profile data periodically or on mount
    setUserProfile(getCurrentUserProfile());
    console.log("Profile loaded");
  }, [activeTab]);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubRequests = listenToFriendRequests(userProfile.uid, (requests) => {
      if (requests.length > 0 && activeTab !== 'notifications') {
        setHasNewNotifications(true);
      }
    });

    const unsubNotifs = listenToNotifications(userProfile.uid, (notifs) => {
      if (notifs.length > 0 && activeTab !== 'notifications') {
        setHasNewNotifications(true);
      }
    });

    return () => {
      unsubRequests();
      unsubNotifs();
    };
  }, [userProfile?.uid, activeTab]);

  const handleEnterRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setActiveTab('rooms');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setActiveTab('rooms');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      {/* Minimal Logo - Clickable to go back to Dashboard */}
      <button 
        onClick={() => {
          setActiveTab('dashboard');
          setCurrentRoomId(null);
        }}
        className="fixed top-8 left-8 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity z-50 group"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="font-black text-sm text-black">C</span>
        </div>
        <span className="font-black tracking-tighter text-xl hidden sm:block">Circles</span>
      </button>

      {/* Top Right Actions */}
      <div className="fixed top-8 right-8 flex items-center gap-4 z-50">
        <button 
          onClick={onLogout}
          className="glass p-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all border-white/5"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Minimal Navigation - Icon Only */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-3 flex items-center gap-6 z-50 border-white/10 shadow-2xl rounded-3xl">
        <button 
          onClick={() => {
            setActiveTab('dashboard');
            setCurrentRoomId(null);
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'dashboard' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Dashboard"
        >
          <TimerIcon className="w-7 h-7" />
          {activeTab === 'dashboard' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('discover');
            setCurrentRoomId(null);
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'discover' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Discover"
        >
          <Home className="w-7 h-7" />
          {activeTab === 'discover' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('search');
            setCurrentRoomId(null);
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'search' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Search"
        >
          <SearchIcon className="w-7 h-7" />
          {activeTab === 'search' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('rooms');
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'rooms' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Rooms"
        >
          <Users className="w-7 h-7" />
          {activeTab === 'rooms' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('chat');
            setCurrentRoomId(null);
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'chat' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Chat"
        >
          <MessageSquare className="w-7 h-7" />
          {activeTab === 'chat' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('notifications');
            setHasNewNotifications(false);
            setCurrentRoomId(null);
          }}
          className={`relative p-2 transition-all hover:scale-110 active:scale-95 ${
            activeTab === 'notifications' ? 'text-emerald-500' : 'text-white/30 hover:text-white/60'
          }`}
          title="Notifications"
        >
          <Bell className="w-7 h-7" />
          {hasNewNotifications && (
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          )}
          {activeTab === 'notifications' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('profile');
            setCurrentRoomId(null);
          }}
          className={`relative p-0.5 transition-all hover:scale-110 active:scale-95 rounded-full border-2 ${
            activeTab === 'profile' ? 'border-emerald-500' : 'border-transparent'
          }`}
          title="Profile"
        >
          <StaticAvatar 
            src={userProfile.photoURL}
            alt={userProfile.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
          {activeTab === 'profile' && (
            <motion.div layoutId="nav-glow" className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full -z-10" />
          )}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-32 px-6 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full max-w-7xl flex flex-col items-center space-y-12"
          >
            {activeTab === 'dashboard' && (
              <div className="w-full space-y-12">
                {/* Top Section: Timer */}
                <div id="timer-section" className="flex flex-col items-center">
                  <Timer />
                </div>

                {/* Bottom Section: Split Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
                  {/* Left Column: Exam Countdown (30%) */}
                  <div className="lg:col-span-3 space-y-6">
                    {state.onboardingData.preparingForCompetitive && (
                      <>
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Exams</span>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                        <ExamCountdown exams={state.onboardingData.competitiveExams} />
                      </>
                    )}
                  </div>

                  {/* Right Column: Syllabus Tracker (70%) */}
                  <div id="syllabus-section" className="lg:col-span-7">
                    <SyllabusTracker 
                      syllabus={state.syllabus} 
                      onToggleChapter={onUpdateSyllabus} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'discover' && <Discover />}
            {activeTab === 'search' && <Search currentUser={userProfile} />}
            {activeTab === 'rooms' && (
              currentRoomId ? (
                <RoomScreen 
                  roomId={currentRoomId} 
                  userId={userProfile.uid} 
                  userProfile={userProfile}
                  onLeave={handleLeaveRoom}
                />
              ) : (
                <Rooms userId={userProfile.uid} onEnterRoom={handleEnterRoom} />
              )
            )}
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'notifications' && <Notifications />}

            {activeTab === 'profile' && (
              <Profile 
                onboardingData={state.onboardingData} 
                onLogout={onLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
