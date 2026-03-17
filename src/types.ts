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
  onboardingData: OnboardingData;
  syllabus: Subject[];
}

export interface ExamDate {
  name: string;
  date: string; // ISO string
  sessions?: { name: string; date: string }[];
}
