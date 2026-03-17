import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { AppState, OnboardingData, Subject } from './types';
import { getInitialSyllabus } from './data/syllabus';

const STORAGE_KEY = 'circles_app_state';

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        setState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const initialSyllabus = getInitialSyllabus(
      data.classLevel!,
      data.stream,
      data.subjects,
      data.electives,
      data.secondLanguage,
      data.competitiveExams
    );

    setState({
      onboardingComplete: true,
      onboardingData: data,
      syllabus: initialSyllabus,
    });
  };

  const handleUpdateSyllabus = (subjectId: string, chapterId: string) => {
    if (!state) return;

    const newSyllabus = state.syllabus.map(subject => {
      if (subject.id === subjectId) {
        return {
          ...subject,
          chapters: subject.chapters.map(chapter => {
            if (chapter.id === chapterId) {
              return { ...chapter, completed: !chapter.completed };
            }
            return chapter;
          })
        };
      }
      return subject;
    });

    setState({ ...state, syllabus: newSyllabus });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to reset all data? This will clear your progress.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
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
