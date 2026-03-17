export type ClassLevel = '10' | '11' | '12';

export type Stream = 'PCM' | 'PCB' | 'Commerce (MEC)' | 'Commerce (CEC)';

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  isElective?: boolean;
  isCompetitive?: boolean;
  parentExam?: string; // e.g., 'CBSE', 'JEE Main', 'BITSAT', 'CUET'
  category?: string; // For CUET: 'Domain', 'Language', 'General'
}

export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
  tags?: string[];
}

export interface OnboardingData {
  classLevel: ClassLevel | null;
  stream: Stream | null;
  subjects: string[];
  electives: string[];
  secondLanguage: string | null;
  preparingForCompetitive: boolean;
  competitiveExams: string[];
  cuetSubjects: string[];
}

export interface AppState {
  onboardingComplete: boolean;
  profileSetupComplete: boolean;
  onboardingData: OnboardingData;
  userProfile: UserProfile | null;
  syllabus: Subject[];
}

export interface ExamDate {
  name: string;
  date: string; // ISO string
  sessions?: { name: string; date: string }[];
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  username: string | null;
  email: string | null;
  photoURL: string | null;
  dob: string | null;
  isGuest: boolean;
  profileSetupComplete: boolean;
}

export interface Room {
  roomId: string;
  hostId: string;
  participants: string[];
  createdAt: any;
  active: boolean;
  timerState?: {
    timeLeft: number;
    isRunning: boolean;
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    lastUpdated: any;
  };
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  profilePic: string;
  message: string;
  createdAt: any;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  fromUsername?: string;
  fromProfilePic?: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  createdAt: any;
  friendProfile?: UserProfile;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'system';
  fromUserId?: string;
  toUserId: string;
  message: string;
  createdAt: any;
  read: boolean;
}
