import { Subject, Chapter, ExamDate } from '../types';

export const CLASS_10_LANGUAGES = ['Hindi (Course A)', 'Hindi (Course B)', 'Telugu', 'Tamil', 'Malayalam', 'Punjabi', 'Sanskrit', 'French'];

export const STREAMS = {
  PCM: ['Physics', 'Chemistry', 'Maths'],
  PCB: ['Physics', 'Chemistry', 'Biology'],
  'Commerce (MEC)': ['Maths', 'Economics', 'Commerce'],
  'Commerce (CEC)': ['Civics', 'Economics', 'Commerce'],
};

export const ELECTIVES = ['Computer Science (CS)', 'Information Practices (IP)', 'Physical Education', 'Painting'];

export const COMPETITIVE_EXAMS = ['JEE Main', 'BITSAT', 'NEET', 'IISER Aptitude Test (IAT)', 'MHT-CET', 'WBJEE', 'CUET'];

export const CUET_DOMAINS = ['Physics', 'Chemistry', 'Maths', 'Biology', 'Economics', 'Business Studies', 'Accountancy', 'Commerce', 'Civics'];
export const CUET_LANGUAGES = ['English'];
export const CUET_GENERAL = ['General Aptitude Test (GAT)'];

// Real Exam Dates (Estimated for 2026 based on patterns)
export const EXAM_DATES: Record<string, ExamDate> = {
  'JEE Main': {
    name: 'JEE Main',
    date: '2026-04-01T09:00:00Z',
  },
  'BITSAT': {
    name: 'BITSAT',
    date: '2026-05-20T09:00:00Z',
    sessions: [
      { name: 'Session 1', date: '2026-05-20T09:00:00Z' },
      { name: 'Session 2', date: '2026-06-24T09:00:00Z' },
    ]
  },
  'NEET': {
    name: 'NEET',
    date: '2026-05-03T14:00:00Z',
  },
  'IISER Aptitude Test (IAT)': {
    name: 'IAT',
    date: '2026-06-15T09:00:00Z',
  },
  'MHT-CET': {
    name: 'MHT-CET',
    date: '2026-04-15T09:00:00Z',
  },
  'WBJEE': {
    name: 'WBJEE',
    date: '2026-04-28T09:00:00Z',
  },
  'CUET': {
    name: 'CUET',
    date: '2026-05-15T09:00:00Z',
  }
};

const CHAPTER_DATA: Record<string, string[]> = {
  'Maths_10': [
    'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 
    'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 
    'Coordinate Geometry', 'Introduction to Trigonometry', 'Some Applications of Trigonometry', 
    'Circles', 'Constructions', 'Surface Areas & Volumes', 'Statistics', 'Probability'
  ],
  'Science_10': [
    'Chemical Reactions and Equations', 'Acids Bases and Salts', 'Metals and Non-metals', 
    'Carbon and its Compounds', 'Life Processes', 'Control and Coordination', 
    'How do Organisms Reproduce?', 'Heredity and Evolution', 'Light - Reflection and Refraction', 
    'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current', 
    'Sources of Energy', 'Our Environment'
  ],
  'Physics_11-12': [
    'Units & Measurements', 'Kinematics', 'Laws of Motion', 'Work Energy Power', 
    'Thermodynamics', 'Oscillations', 'Waves', 'Electrostatics', 
    'Current Electricity', 'Magnetism', 'Optics', 'Modern Physics'
  ],
  'Chemistry_11-12': [
    'Some Basic Concepts', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 
    'Equilibrium', 'Organic Chemistry Basics', 'Hydrocarbons', 'Biomolecules', 'Polymers'
  ],
  'Maths_11-12': [
    'Sets & Relations', 'Functions', 'Trigonometry', 'Limits & Derivatives', 
    'Integrals', 'Differential Equations', 'Matrices & Determinants', 
    'Vectors', '3D Geometry', 'Probability'
  ]
};

const generateChapters = (subjectName: string, classLevel: string, parentExam: string): Chapter[] => {
  const key = `${subjectName}_${classLevel === '10' ? '10' : '11-12'}`;
  const names = CHAPTER_DATA[key] || [`${subjectName} Basics`];
  
  return names.map((name, i) => {
    const tags = [parentExam === 'CBSE' ? 'CBSE' : parentExam];
    
    // Add "Important" tag to some chapters randomly for demo
    if (i % 3 === 0) tags.push('Important');
    
    if (parentExam !== 'CBSE') {
      tags.push('Exam Level');
    }
    
    return {
      id: `${parentExam.toLowerCase().replace(/\s/g, '-')}-${subjectName.toLowerCase().replace(/\s/g, '-')}-ch-${i + 1}`,
      name,
      completed: false,
      tags
    };
  });
};

export const getInitialSyllabus = (
  classLevel: string,
  stream: string | null,
  subjects: string[],
  electives: string[],
  secondLanguage: string | null,
  competitiveExams: string[],
  cuetSubjects: string[]
): Subject[] => {
  const allSubjects: Subject[] = [];

  // 1. CBSE Capsule Subjects (STRICTLY CBSE)
  subjects.forEach(sub => {
    allSubjects.push({
      id: `cbse-${sub.toLowerCase().replace(/\s/g, '-')}`,
      name: sub,
      chapters: generateChapters(sub, classLevel, 'CBSE'),
      parentExam: 'CBSE'
    });
  });

  // Add second language for class 10 to CBSE
  if (classLevel === '10' && secondLanguage) {
    allSubjects.push({
      id: 'cbse-second-language',
      name: `Language: ${secondLanguage}`,
      chapters: generateChapters(secondLanguage, classLevel, 'CBSE'),
      parentExam: 'CBSE'
    });
  }

  // Add electives for 11/12 to CBSE
  if (['11', '12'].includes(classLevel)) {
    electives.forEach(el => {
      allSubjects.push({
        id: `cbse-${el.toLowerCase().replace(/\s/g, '-')}`,
        name: el,
        chapters: generateChapters(el, classLevel, 'CBSE'),
        isElective: true,
        parentExam: 'CBSE'
      });
    });
  }

  // 2. Competitive Exam Capsules (STRICTLY EXAM DATA)
  competitiveExams.forEach(exam => {
    if (exam === 'CUET') {
      cuetSubjects.forEach(sub => {
        let category = 'Domain';
        if (CUET_LANGUAGES.includes(sub)) category = 'Language';
        if (CUET_GENERAL.includes(sub)) category = 'General';

        allSubjects.push({
          id: `cuet-${sub.toLowerCase().replace(/\s/g, '-')}`,
          name: sub,
          chapters: generateChapters(sub, classLevel, 'CUET'),
          isCompetitive: true,
          parentExam: 'CUET',
          category
        });
      });
    } else if (exam === 'BITSAT') {
      // BITSAT Core Subjects
      ['Physics', 'Chemistry', 'Maths'].forEach(sub => {
        allSubjects.push({
          id: `bitsat-${sub.toLowerCase().replace(/\s/g, '-')}`,
          name: sub,
          chapters: generateChapters(sub, classLevel, 'BITSAT'),
          isCompetitive: true,
          parentExam: 'BITSAT'
        });
      });
      // BITSAT Specific
      allSubjects.push({
        id: 'bitsat-english',
        name: 'English Proficiency',
        chapters: [
          { id: 'bitsat-eng-1', name: 'Grammar & Vocabulary', completed: false, tags: ['BITSAT', 'Important'] },
          { id: 'bitsat-eng-2', name: 'Reading Comprehension', completed: false, tags: ['BITSAT', 'Important'] }
        ],
        isCompetitive: true,
        parentExam: 'BITSAT'
      });
      allSubjects.push({
        id: 'bitsat-lr',
        name: 'Logical Reasoning',
        chapters: [
          { id: 'bitsat-lr-1', name: 'Verbal Reasoning', completed: false, tags: ['BITSAT', 'Important'] },
          { id: 'bitsat-lr-2', name: 'Non-Verbal Reasoning', completed: false, tags: ['BITSAT', 'Important'] }
        ],
        isCompetitive: true,
        parentExam: 'BITSAT'
      });
    } else {
      // Other exams like JEE, NEET, WBJEE, MHT-CET, IAT
      let relevantSubjects: string[] = [];
      if (exam === 'JEE Main') relevantSubjects = ['Physics', 'Chemistry', 'Maths'];
      if (exam === 'NEET') relevantSubjects = ['Physics', 'Chemistry', 'Biology'];
      if (exam === 'IISER Aptitude Test (IAT)') relevantSubjects = ['Physics', 'Chemistry', 'Maths', 'Biology'];
      if (exam === 'WBJEE') relevantSubjects = ['Physics', 'Chemistry', 'Maths'];
      if (exam === 'MHT-CET') {
        relevantSubjects = stream === 'PCM' ? ['Physics', 'Chemistry', 'Maths'] : ['Physics', 'Chemistry', 'Biology'];
      }

      relevantSubjects.forEach(sub => {
        allSubjects.push({
          id: `${exam.toLowerCase().replace(/\s/g, '-')}-${sub.toLowerCase().replace(/\s/g, '-')}`,
          name: sub,
          chapters: generateChapters(sub, classLevel, exam),
          isCompetitive: true,
          parentExam: exam
        });
      });
    }
  });

  return allSubjects;
};
