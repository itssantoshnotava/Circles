export type ClassLevel = '10' | '11' | '12';

export type Stream = 'PCM' | 'PCB' | 'Commerce (MEC)' | 'Commerce (CEC)';

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  isElective?: boolean;
  isCompetitive?: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
}

export interface OnboardingData {
  classLevel: ClassLevel | null;
  stream: Stream | null;
  subjects: string[];
  electives: string[];
  secondLanguage: string | null;
  preparingForCompetitive: boolean;
  competitiveExams: string[];
}

export interface AppState {
  onboardingComplete: boolean;
  onboardingData: OnboardingData;
  syllabus: Subject[];
}
