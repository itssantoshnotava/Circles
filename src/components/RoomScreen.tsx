import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Timer } from './Timer';
import { 
  Users, 
  MessageSquare, 
  Send, 
  LogOut, 
  Crown, 
  User, 
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  UserMinus
} from 'lucide-react';
import { 
  listenToRoom, 
  listenToRoomMessages, 
  sendRoomMessage, 
  leaveRoom, 
  getUserProfiles,
  syncRoomTimer,
  kickUser
} from '../services/firebaseService';
import { Room, RoomMessage, UserProfile } from '../types';
import { StaticAvatar } from './StaticAvatar';

interface RoomScreenProps {
  roomId: string;
  userId: string;
  userProfile: any;
  onLeave: () => void;
}

export const RoomScreen: React.FC<RoomScreenProps> = ({ roomId, userId, userProfile, onLeave }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeRoom = listenToRoom(roomId, (updatedRoom) => {
      // If user is no longer in participants, they were kicked
      if (updatedRoom && !updatedRoom.participants.includes(userId)) {
        onLeave();
        return;
      }
      setRoom(updatedRoom);
    });

    const unsubscribeMessages = listenToRoomMessages(roomId, (updatedMessages) => {
      setMessages(updatedMessages);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [roomId]);

  useEffect(() => {
    if (room?.participants) {
      getUserProfiles(room.participants).then(setParticipants);
    }
  }, [room?.participants]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendRoomMessage(
        roomId, 
        userId, 
        userProfile.username || 'User', 
        userProfile.photoURL || '', 
        newMessage.trim()
      );
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(userId, roomId);
      onLeave();
    } catch (err) {
      console.error("Failed to leave room", err);
    }
  };

  const handleTimerSync = async (timerState: any) => {
    if (room?.hostId === userId) {
      await syncRoomTimer(roomId, timerState);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKickUser = async (targetUserId: string) => {
    if (window.confirm("Are you sure you want to kick this user?")) {
      try {
        await kickUser(roomId, targetUserId);
      } catch (err) {
        console.error("Failed to kick user", err);
      }
    }
  };

  if (!room) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  const isHost = room.hostId === userId;

  return (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Section: Timer & Participants */}
      <div className="flex-1 space-y-8 w-full">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tighter">Room <span className="text-emerald-500">#{roomId}</span></h2>
                <button 
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-emerald-500"
                  title="Copy Room Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{room.participants.length} Students Studying</p>
            </div>
          </div>
          <button 
            onClick={handleLeaveRoom}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Leave Room
          </button>
        </div>

        <div className="flex flex-col items-center">
          <Timer 
            isRoomMode={true}
            roomTimerState={room.timerState}
            isHost={isHost}
            onTimerSync={handleTimerSync}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Participants</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {participants.map((p) => (
              <GlassCard key={p.uid} className={`p-4 border-white/5 flex flex-col items-center text-center space-y-3 relative group ${p.uid === room.hostId ? 'border-emerald-500/30' : ''}`}>
                {p.uid === room.hostId && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-black p-1 rounded-lg shadow-lg shadow-emerald-500/20">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
                <div className="relative">
                  <StaticAvatar 
                    src={p.photoURL} 
                    alt={p.username || 'User'} 
                    className="w-12 h-12 rounded-2xl border-2 border-white/10"
                  />
                  {p.uid === room.hostId && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/50 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-tight truncate max-w-[100px]">@{p.username}</h4>
                  <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-0.5">
                    {p.uid === room.hostId ? 'Host' : 'Student'}
                  </p>
                </div>
                {isHost && p.uid !== userId && (
                  <button 
                    onClick={() => handleKickUser(p.uid)}
                    className="absolute bottom-2 right-2 p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Kick User"
                  >
                    <UserMinus className="w-3 h-3" />
                  </button>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section: Chat */}
      <div className={`fixed lg:relative top-0 right-0 h-full lg:h-auto w-80 lg:w-96 bg-[#050505] lg:bg-transparent z-50 transition-transform duration-300 ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <GlassCard className="h-full lg:h-[600px] border-white/5 flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="font-black text-lg tracking-tight">Room Chat</h3>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="lg:hidden p-2 text-white/40 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.userId === userId ? 'flex-row-reverse' : ''}`}>
                <StaticAvatar 
                  src={msg.profilePic} 
                  alt={msg.username} 
                  className="w-8 h-8 rounded-xl flex-shrink-0"
                />
                <div className={`space-y-1 max-w-[80%] flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/40">@{msg.username}</span>
                    {msg.userId === room.hostId && <Crown className="w-2 h-2 text-emerald-500" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm font-medium ${msg.userId === userId ? 'bg-emerald-500 text-black rounded-tr-none' : 'bg-white/5 border border-white/5 rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white/[0.02]">
            <div className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </GlassCard>
      </div>

      {/* Mobile Chat Toggle */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-black rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
