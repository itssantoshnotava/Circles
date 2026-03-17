import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { ClassLevel, OnboardingData, Stream } from '../types';
import { CLASS_10_LANGUAGES, STREAMS, ELECTIVES, COMPETITIVE_EXAMS, CUET_DOMAINS, CUET_LANGUAGES, CUET_GENERAL } from '../data/syllabus';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const initialData: OnboardingData = {
  classLevel: null,
  stream: null,
  subjects: [],
  electives: [],
  secondLanguage: null,
  preparingForCompetitive: false,
  competitiveExams: [],
  cuetSubjects: [],
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleClassSelect = (level: ClassLevel) => {
    setData({ ...data, classLevel: level });
    nextStep();
  };

  const handleStreamSelect = (stream: Stream) => {
    const streamSubjects = STREAMS[stream as keyof typeof STREAMS] || [];
    setData({ 
      ...data, 
      stream, 
      subjects: streamSubjects
    });
    nextStep();
  };

  const toggleElective = (elective: string) => {
    const electives = data.electives.includes(elective)
      ? data.electives.filter(e => e !== elective)
      : [...data.electives, elective];
    setData({ ...data, electives });
  };

  const toggleCompetitiveExam = (exam: string) => {
    const exams = data.competitiveExams.includes(exam)
      ? data.competitiveExams.filter(e => e !== exam)
      : [...data.competitiveExams, exam];
    setData({ ...data, competitiveExams: exams });
  };

  const toggleCuetSubject = (subject: string) => {
    const subjects = data.cuetSubjects.includes(subject)
      ? data.cuetSubjects.filter(s => s !== subject)
      : data.cuetSubjects.length < 5 
        ? [...data.cuetSubjects, subject]
        : data.cuetSubjects;
    setData({ ...data, cuetSubjects: subjects });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to <span className="text-emerald-400">Circles</span></h1>
              <p className="text-white/60">Let's set up your study foundation.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {(['10', '11', '12'] as ClassLevel[]).map((level) => (
                <Button 
                  key={level}
                  variant="secondary"
                  size="lg"
                  className="w-full text-left flex justify-between items-center group"
                  onClick={() => handleClassSelect(level)}
                >
                  <span>Class {level}</span>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        if (data.classLevel === '10') {
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Select Second Language</h2>
                <p className="text-white/60">Choose your regional language for CBSE Class 10.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {CLASS_10_LANGUAGES.map((lang) => (
                  <Button 
                    key={lang}
                    variant={data.secondLanguage === lang ? 'primary' : 'secondary'}
                    className="w-full text-sm"
                    onClick={() => setData({ ...data, secondLanguage: lang })}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    const subjects = ['Maths', 'Science', 'Social Science', 'English'];
                    onComplete({ ...data, subjects });
                  }} 
                  className="flex-1"
                  disabled={!data.secondLanguage}
                >
                  Complete Setup
                </Button>
              </div>
            </motion.div>
          );
        } else {
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Choose Your Stream</h2>
                <p className="text-white/60">Select your academic path for Class {data.classLevel}.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.keys(STREAMS).map((stream) => (
                  <Button 
                    key={stream}
                    variant={data.stream === stream ? 'primary' : 'secondary'}
                    className="w-full text-left flex flex-col items-start p-4 h-auto"
                    onClick={() => handleStreamSelect(stream as Stream)}
                  >
                    <span className="font-semibold">{stream}</span>
                    <span className="text-xs opacity-60">
                      {STREAMS[stream as keyof typeof STREAMS].join(', ')}
                    </span>
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={prevStep} className="w-full">Back</Button>
            </motion.div>
          );
        }

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Select Electives</h2>
              <p className="text-white/60">Multi-select your optional subjects.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {ELECTIVES.map((elective) => (
                <Button 
                  key={elective}
                  variant={data.electives.includes(elective) ? 'primary' : 'secondary'}
                  className="w-full justify-between"
                  onClick={() => toggleElective(elective)}
                >
                  <span>{elective}</span>
                  {data.electives.includes(elective) && <CheckCircle2 className="w-4 h-4" />}
                </Button>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  nextStep();
                }} 
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Competitive Exams</h2>
              <p className="text-white/60">Are you preparing for any entrance exams?</p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant={data.preparingForCompetitive ? 'primary' : 'secondary'}
                className="flex-1"
                onClick={() => setData({ ...data, preparingForCompetitive: true })}
              >
                Yes
              </Button>
              <Button 
                variant={!data.preparingForCompetitive ? 'primary' : 'secondary'}
                className="flex-1"
                onClick={() => setData({ ...data, preparingForCompetitive: false, competitiveExams: [] })}
              >
                No
              </Button>
            </div>

            {data.preparingForCompetitive && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 gap-3 pt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {COMPETITIVE_EXAMS.map((exam) => (
                  <Button 
                    key={exam}
                    variant={data.competitiveExams.includes(exam) ? 'primary' : 'secondary'}
                    className="w-full justify-between"
                    onClick={() => toggleCompetitiveExam(exam)}
                  >
                    <span>{exam}</span>
                    {data.competitiveExams.includes(exam) && <CheckCircle2 className="w-4 h-4" />}
                  </Button>
                ))}
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (data.competitiveExams.includes('CUET')) {
                    nextStep();
                  } else {
                    onComplete(data);
                  }
                }} 
                className="flex-1"
              >
                {data.competitiveExams.includes('CUET') ? 'Next' : 'Finish'}
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">CUET Subjects</h2>
              <p className="text-white/60">Select up to 5 subjects for CUET.</p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <AlertCircle className="w-3 h-3" />
                <span>{data.cuetSubjects.length} / 5 selected</span>
              </div>
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Domain Subjects</h3>
                <div className="grid grid-cols-1 gap-2">
                  {CUET_DOMAINS.map(sub => (
                    <Button 
                      key={sub}
                      variant={data.cuetSubjects.includes(sub) ? 'primary' : 'secondary'}
                      className="w-full justify-between py-2 text-sm"
                      onClick={() => toggleCuetSubject(sub)}
                      disabled={!data.cuetSubjects.includes(sub) && data.cuetSubjects.length >= 5}
                    >
                      <span>{sub}</span>
                      {data.cuetSubjects.includes(sub) && <CheckCircle2 className="w-3 h-3" />}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Language</h3>
                <div className="grid grid-cols-1 gap-2">
                  {CUET_LANGUAGES.map(sub => (
                    <Button 
                      key={sub}
                      variant={data.cuetSubjects.includes(sub) ? 'primary' : 'secondary'}
                      className="w-full justify-between py-2 text-sm"
                      onClick={() => toggleCuetSubject(sub)}
                      disabled={!data.cuetSubjects.includes(sub) && data.cuetSubjects.length >= 5}
                    >
                      <span>{sub}</span>
                      {data.cuetSubjects.includes(sub) && <CheckCircle2 className="w-3 h-3" />}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/40">General Test</h3>
                <div className="grid grid-cols-1 gap-2">
                  {CUET_GENERAL.map(sub => (
                    <Button 
                      key={sub}
                      variant={data.cuetSubjects.includes(sub) ? 'primary' : 'secondary'}
                      className="w-full justify-between py-2 text-sm"
                      onClick={() => toggleCuetSubject(sub)}
                      disabled={!data.cuetSubjects.includes(sub) && data.cuetSubjects.length >= 5}
                    >
                      <span>{sub}</span>
                      {data.cuetSubjects.includes(sub) && <CheckCircle2 className="w-3 h-3" />}
                    </Button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
              <Button 
                variant="primary" 
                onClick={() => onComplete(data)} 
                className="flex-1"
                disabled={data.cuetSubjects.length === 0}
              >
                Finish
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      <GlassCard className="w-full max-w-lg p-10 md:p-12 border-white/5 shadow-2xl">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};
