import { Subject } from '../types';

export const CLASS_10_SUBJECTS = ['Maths', 'Science', 'Social Science', 'English'];
export const CLASS_10_LANGUAGES = ['Hindi (Course A)', 'Hindi (Course B)', 'Telugu', 'Tamil', 'Malayalam', 'Punjabi', 'Sanskrit', 'French'];

export const STREAMS = {
  PCM: ['Physics', 'Chemistry', 'Maths'],
  PCB: ['Physics', 'Chemistry', 'Biology'],
  'Commerce (MEC)': ['Maths', 'Economics', 'Commerce'],
  'Commerce (CEC)': ['Civics', 'Economics', 'Commerce'],
};

export const ELECTIVES = ['Computer Science (CS)', 'Information Practices (IP)', 'Physical Education', 'Painting'];

export const COMPETITIVE_EXAMS = ['JEE', 'BITSAT', 'NEET', 'KVPY', 'IISER'];

const generateChapters = (subjectName: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${subjectName.toLowerCase().replace(/\s/g, '-')}-ch-${i + 1}`,
    name: `Chapter ${i + 1}: ${subjectName} Basics ${i + 1}`,
    completed: false,
  }));
};

export const getInitialSyllabus = (
  classLevel: string,
  stream: string | null,
  subjects: string[],
  electives: string[],
  secondLanguage: string | null,
  competitiveExams: string[]
): Subject[] => {
  const allSubjects: Subject[] = [];

  // Add core subjects
  subjects.forEach(sub => {
    allSubjects.push({
      id: sub.toLowerCase().replace(/\s/g, '-'),
      name: sub,
      chapters: generateChapters(sub, 12),
    });
  });

  // Add second language for class 10
  if (classLevel === '10' && secondLanguage) {
    allSubjects.push({
      id: 'second-language',
      name: `Language: ${secondLanguage}`,
      chapters: generateChapters(secondLanguage, 10),
    });
  }

  // Add electives for 11/12
  if (['11', '12'].includes(classLevel)) {
    electives.forEach(el => {
      allSubjects.push({
        id: el.toLowerCase().replace(/\s/g, '-'),
        name: el,
        chapters: generateChapters(el, 8),
        isElective: true,
      });
    });
  }

  // Add competitive exam content
  if (competitiveExams.length > 0) {
    competitiveExams.forEach(exam => {
      // In a real app, we'd append exam-specific chapters to existing subjects
      // For now, we'll just mark them as competitive
      allSubjects.forEach(sub => {
        if (['Physics', 'Chemistry', 'Maths', 'Biology'].includes(sub.name)) {
          sub.chapters = [
            ...sub.chapters,
            ...generateChapters(`${exam} - ${sub.name}`, 5).map(ch => ({
              ...ch,
              name: `[${exam}] ${ch.name}`
            }))
          ];
        }
      });

      if (exam === 'BITSAT') {
        allSubjects.push({
          id: 'bitsat-lr-eng',
          name: 'BITSAT: LR & English',
          chapters: generateChapters('Logical Reasoning', 6),
          isCompetitive: true,
        });
      }
    });
  }

  return allSubjects;
};
