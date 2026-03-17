import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { AccessGate } from './components/AccessGate';
import { ProfileSetup } from './components/ProfileSetup';
import { AppState, OnboardingData, Subject, UserProfile } from './types';
import { getInitialSyllabus } from './data/syllabus';
import { 
  getOrCreateUserId, 
  saveOnboardingData, 
  updateChapterProgress, 
  isAccessGranted, 
  getAuthUser, 
  seedAccessCodes,
  logoutUser,
  getCurrentUserProfile,
  checkUserProfileExists
} from './services/firebaseService';

const STORAGE_KEY = 'circles_app_state';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const init = async () => {
      // Seed codes for testing (only runs if empty)
      await seedAccessCodes();

      const id = getOrCreateUserId();
      setUserId(id);

      const authUser = getAuthUser();
      setIsAuthenticated(!!authUser);
      
      if (authUser) {
        // Check if profile exists in Firestore to prevent repeat setup
        await checkUserProfileExists(authUser);
        const profile = getCurrentUserProfile();
        setUserProfile(profile);
      }

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setState(parsed);
        } catch (e) {
          console.error('Failed to parse saved state', e);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const handleAccessGranted = async () => {
    setIsAuthenticated(true);
    const authUser = getAuthUser();
    if (authUser) {
      await checkUserProfileExists(authUser);
    }
    const profile = getCurrentUserProfile();
    setUserProfile(profile);
  };

  const handleProfileSetupComplete = (data: { name: string; username: string; dob: string; profilePic: string }) => {
    const profile = getCurrentUserProfile();
    setUserProfile(profile);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const initialSyllabus = getInitialSyllabus(
      data.classLevel!,
      data.stream,
      data.subjects,
      data.electives,
      data.secondLanguage,
      data.competitiveExams,
      data.cuetSubjects
    );

    const newState: AppState = {
      onboardingComplete: true,
      profileSetupComplete: true,
      onboardingData: data,
      userProfile: userProfile,
      syllabus: initialSyllabus,
    };

    setState(newState);
    
    // Silent Firebase sync
    await saveOnboardingData(userId, data);
  };

  const handleUpdateSyllabus = async (subjectId: string, chapterId: string) => {
    if (!state) return;

    let updatedSubject: Subject | null = null;

    const newSyllabus = [...state.syllabus].map(subject => {
      if (subject.id === subjectId) {
        const newChapters = subject.chapters.map(chapter => {
          if (chapter.id === chapterId) {
            return { ...chapter, completed: !chapter.completed };
          }
          return chapter;
        });
        
        updatedSubject = { ...subject, chapters: newChapters };
        return updatedSubject;
      }
      return subject;
    });

    setState({ ...state, syllabus: newSyllabus });

    // Silent Firebase sync for progress
    if (updatedSubject) {
      const sub = updatedSubject as Subject;
      const completedIds = sub.chapters.filter(ch => ch.completed).map(ch => ch.id);
      await updateChapterProgress(
        userId, 
        sub.parentExam || 'CBSE', 
        sub.name, 
        completedIds
      );
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('circles_username');
    localStorage.removeItem('circles_dob');
    localStorage.removeItem('circles_profile_pic');
    localStorage.removeItem('circles_profile_setup_complete');
    setState(null);
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessGate onAccessGranted={handleAccessGranted} />;
  }

  if (!userProfile?.profileSetupComplete && !userProfile?.isGuest) {
    return <ProfileSetup onComplete={handleProfileSetupComplete} />;
  }

  if (!state || !state.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Dashboard 
      state={state} 
      onUpdateSyllabus={handleUpdateSyllabus} 
      onLogout={handleLogout}
    />
  );
}
