import React, { useState } from 'react';
import { COMPILER_LESSONS, CompilerLesson, QuizQuestion } from '../lib/compilerLessons';
import { BookOpen, CheckCircle2, HelpCircle, ArrowRight, ArrowLeft, Layers, Cpu, Award, RotateCcw } from 'lucide-react';

export const LearnCompiler: React.FC = () => {
  const [activeLessonId, setActiveLessonId] = useState<string>(COMPILER_LESSONS[0].id);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<Record<string, boolean>>({});
  const [activePipelinePhase, setActivePipelinePhase] = useState<number>(0);

  const lesson: CompilerLesson =
    COMPILER_LESSONS.find((l) => l.id === activeLessonId) || COMPILER_LESSONS[0];

  const currentIndex = COMPILER_LESSONS.findIndex((l) => l.id === activeLessonId);

  // Compiler Phases data for pipeline explorer
  const COMPILER_PHASES = [
    {
      phaseNumber: 1,
      name: 'Lexical Analysis (Scanner)',
      status: 'Implemented in LexiScan',
      input: 'Source Code Character Stream',
      output: 'Token Stream (Token ID, Lexeme, Type, Coordinates)',
      responsibility: 'Recognizes words/numbers/symbols, strips whitespace & comments, verifies lexical vocabulary.'
    },
    {
      phaseNumber: 2,
      name: 'Syntax Analysis (Parser)',
      status: 'Phase 2 Downstream',
      input: 'Token Stream',
      output: 'Parse Tree / Abstract Syntax Tree (AST)',
      responsibility: 'Enforces Context-Free Grammar (CFG), validates statement order, constructs hierarchical tree.'
    },
    {
      phaseNumber: 3,
      name: 'Semantic Analysis',
      status: 'Phase 3 Downstream',
      input: 'Abstract Syntax Tree (AST)',
      output: 'Decorated / Annotated AST',
      responsibility: 'Checks type consistency, verifies variable declarations before use, resolves scoping rules.'
    },
    {
      phaseNumber: 4,
      name: 'Intermediate Code Generation',
      status: 'Phase 4 Downstream',
      input: 'Decorated AST',
      output: 'Intermediate Representation (Three-Address Code / Bytecode)',
      responsibility: 'Translates high-level language constructs into architecture-independent linear instructions.'
    },
    {
      phaseNumber: 5,
      name: 'Code Optimization',
      status: 'Phase 5 Downstream',
      input: 'Raw Intermediate Code',
      output: 'Optimized Intermediate Code',
      responsibility: 'Eliminates dead code, folds constants, unrolls loops, optimizes register allocations.'
    },
    {
      phaseNumber: 6,
      name: 'Target Code Generation',
      status: 'Phase 6 Downstream',
      input: 'Optimized IR',
      output: 'Target Machine Code / Assembly (x86_64, ARM64, WASM)',
      responsibility: 'Emits relocatable binary instructions or assembly matching specific target CPU registers.'
    }
  ];

  // Calculate overall quiz score
  const totalQuestions = COMPILER_LESSONS.reduce((acc, l) => acc + l.quiz.length, 0);
  const answeredQuestions = Object.keys(submittedQuiz).length;
  const correctCount = Object.entries(submittedQuiz).filter(([qId, isSubmitted]) => {
    if (!isSubmitted) return false;
    for (const l of COMPILER_LESSONS) {
      const foundQ = l.quiz.find((q) => q.id === qId);
      if (foundQ && quizAnswers[qId] === foundQ.correctIndex) return true;
    }
    return false;
  }).length;

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedQuiz[questionId]) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitQuestion = (questionId: string) => {
    setSubmittedQuiz((prev) => ({
      ...prev,
      [questionId]: true
    }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setSubmittedQuiz({});
  };

  const handleNextLesson = () => {
    if (currentIndex < COMPILER_LESSONS.length - 1) {
      setActiveLessonId(COMPILER_LESSONS[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setActiveLessonId(COMPILER_LESSONS[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Architecture Pipeline Explorer Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Interactive Compiler Architecture Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any phase in the compiler chain to explore its inputs, outputs, and responsibilities.
            </p>
          </div>

          {/* Quiz Score Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-semibold">
              <Award className="w-4 h-4 text-blue-600" />
              <span>
                Assessment Score: {correctCount} / {totalQuestions}
              </span>
            </div>
            {answeredQuestions > 0 && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                title="Reset all quiz questions"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {COMPILER_PHASES.map((p, idx) => {
            const isSelected = activePipelinePhase === idx;
            return (
              <button
                key={p.phaseNumber}
                type="button"
                onClick={() => setActivePipelinePhase(idx)}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    Phase {p.phaseNumber}
                  </div>
                  <div className="text-xs font-bold leading-tight">
                    {p.name}
                  </div>
                </div>
                <div className={`text-[10px] mt-2 font-medium ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                  {p.status}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Phase Detail Drawer */}
        <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Phase {COMPILER_PHASES[activePipelinePhase].phaseNumber}: {COMPILER_PHASES[activePipelinePhase].name}</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              {COMPILER_PHASES[activePipelinePhase].status}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {COMPILER_PHASES[activePipelinePhase].responsibility}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-slate-500 font-sans block text-[10px] uppercase">Input:</strong>
              {COMPILER_PHASES[activePipelinePhase].input}
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-slate-500 font-sans block text-[10px] uppercase">Output:</strong>
              {COMPILER_PHASES[activePipelinePhase].output}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chapter Content Split: Sidebar + Textbook */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs sticky top-20">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Course Curriculum</span>
            </div>

            <nav className="space-y-1">
              {COMPILER_LESSONS.map((l) => {
                const isActive = l.id === activeLessonId;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveLessonId(l.id);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-mono text-[11px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {l.chapterNumber}.
                    </span>
                    <span className="leading-snug">{l.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Detailed Textbook Sections & Quiz */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Lesson Hero Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest mb-1">
              Chapter {lesson.chapterNumber}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {lesson.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
              {lesson.tagline}
            </p>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed">
              <strong>Core Concept:</strong> {lesson.summary}
            </div>
          </div>

          {/* Detailed Textbook Sections */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
            {lesson.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  {section.heading}
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {section.content}
                </p>

                {section.keyPoints && section.keyPoints.length > 0 && (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <div className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wider">
                      Key Academic Takeaways:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {section.keyPoints.map((kp, kIdx) => (
                        <li key={kIdx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold mt-0.5">•</span>
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.codeExample && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-slate-500 mb-1">
                      Formal Example / Code Walkthrough:
                    </div>
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                      <code>{section.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Knowledge Check Quiz */}
          {lesson.quiz.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-900">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Chapter Knowledge Check & Assessment</span>
              </div>

              <div className="space-y-6">
                {lesson.quiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[q.id];
                  const isSubmitted = submittedQuiz[q.id];
                  const isCorrect = isSubmitted && selectedOpt === q.correctIndex;

                  return (
                    <div key={q.id} className="p-5 border border-slate-200 rounded-xl space-y-3 bg-slate-50/40">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Question {qIdx + 1} of {lesson.quiz.length}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {q.question}
                      </div>

                      {/* Options list */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isChosen = selectedOpt === optIdx;
                          let optionStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                          if (isSubmitted) {
                            if (optIdx === q.correctIndex) {
                              optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isChosen && !isCorrect) {
                              optionStyle = 'bg-red-50 border-red-300 text-red-900';
                            } else {
                              optionStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                            }
                          } else if (isChosen) {
                            optionStyle = 'bg-blue-50 border-blue-400 text-blue-900 font-semibold ring-1 ring-blue-300';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isSubmitted}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                            >
                              <span>{opt}</span>
                              {isSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit Question Action */}
                      {!isSubmitted && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            disabled={selectedOpt === undefined}
                            onClick={() => handleSubmitQuestion(q.id)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-xs"
                          >
                            Check Answer
                          </button>
                        </div>
                      )}

                      {/* Feedback & Explanation */}
                      {isSubmitted && (
                        <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50/80 border-amber-200 text-amber-900'
                        }`}>
                          <strong>{isCorrect ? 'Correct!' : 'Incorrect.'}</strong>{' '}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Pagination Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevLesson}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>

            <button
              type="button"
              disabled={currentIndex === COMPILER_LESSONS.length - 1}
              onClick={handleNextLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Next Chapter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
