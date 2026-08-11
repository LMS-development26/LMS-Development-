import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, FileQuestion, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  Award, RefreshCw, Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, quizApi, questionApi, optionApi, quizAttemptApi, quizResultApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, StatusBadge, LoadingState, EmptyState, ProgressBar } from '@/components/ui';
import { classNames } from '@/utils/helpers';
import type { Quiz, Question, QuestionOption, QuizAttempt } from '@/types';

export function StudentQuizzes() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: quizzes, loading } = useAsync(() => quizApi.listByCourse(courseId!), [courseId]);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, QuestionOption[]>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [result, setResult] = useState<{ score: number; passed: boolean; percentage: number } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [existingResults, setExistingResults] = useState<Record<string, { passed: boolean; bestScore: number; attempts: number } | null>>({});

  useEffect(() => {
    if (quizzes && user) {
      quizzes.forEach(async (q) => {
        const r = await quizResultApi.getByQuizAndStudent(q.id, user.id);
        setExistingResults((prev) => ({ ...prev, [q.id]: r ? { passed: r.passed, bestScore: r.best_score_percentage, attempts: r.attempts_used } : null }));
      });
    }
  }, [quizzes, user]);

  const handleSubmit = useCallback(async () => {
    if (!activeQuiz || !attempt) return;
    let correct = 0;
    for (const q of questions) {
      const opts = optionsByQuestion[q.id] || [];
      const correctOpts = opts.filter((o) => o.is_correct).map((o) => o.id);
      const selected = answers[q.id] || [];
      const isCorrect = correctOpts.length === selected.length && correctOpts.every((c) => selected.includes(c));
      if (isCorrect) correct++;
    }
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= activeQuiz.passing_percentage;
    await quizAttemptApi.complete(attempt.id, percentage, passed);
    setResult({ score: correct, passed, percentage });
  }, [activeQuiz, attempt, questions, optionsByQuestion, answers]);

  // Timer
  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeQuiz, timeLeft, handleSubmit]);

  if (loading) return <LoadingState />;

  const startQuiz = async (quiz: Quiz) => {
    const qs = await questionApi.listByQuiz(quiz.id);
    const optMap: Record<string, QuestionOption[]> = {};
    for (const q of qs) {
      const opts = await optionApi.listByQuestion(q.id);
      optMap[q.id] = opts;
    }
    setQuestions(qs);
    setOptionsByQuestion(optMap);
    setAnswers({});
    setCurrentQuestionIdx(0);
    setTimeLeft((quiz.time_limit_minutes || 0) * 60);
    setResult(null);
    setShowReview(false);
    const att = await quizAttemptApi.start(quiz.id, user!.id);
    setAttempt(att);
    setActiveQuiz(quiz);
  };

  const selectAnswer = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        return { ...prev, [questionId]: current.includes(optionId) ? current.filter((o) => o !== optionId) : [...current, optionId] };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Quiz taking screen
  if (activeQuiz && !result) {
    const currentQ = questions[currentQuestionIdx];
    const currentOpts = currentQ ? optionsByQuestion[currentQ.id] || [] : [];
    const isMultiple = currentQ?.question_type === 'MULTIPLE_CORRECT';

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{activeQuiz.title}</h1>
            <p className="text-sm text-gray-500">Question {currentQuestionIdx + 1} of {questions.length}</p>
          </div>
          {activeQuiz.time_limit_minutes && (
            <div className={classNames('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold', timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <ProgressBar value={((currentQuestionIdx + 1) / questions.length) * 100} size="sm" />

        {/* Question navigation */}
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIdx(i)}
              className={classNames(
                'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                i === currentQuestionIdx ? 'bg-blue-600 text-white' :
                answers[q.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900">{currentQ?.question_text}</h2>
            <p className="mt-1 text-xs text-gray-500">{isMultiple ? 'Select all correct answers' : 'Select one answer'}</p>

            <div className="mt-4 space-y-2">
              {currentOpts.map((opt) => {
                const selected = (answers[currentQ.id] || []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(currentQ.id, opt.id, isMultiple)}
                    className={classNames(
                      'flex w-full items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <div className={classNames(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300',
                    )}>
                      {selected && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-900">{opt.option_text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))} disabled={currentQuestionIdx === 0}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {currentQuestionIdx < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIdx((i) => i + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button variant="success" onClick={handleSubmit}>Submit Quiz</Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Quiz result screen
  if (activeQuiz && result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className={classNames('mx-auto flex h-20 w-20 items-center justify-center rounded-full', result.passed ? 'bg-emerald-100' : 'bg-red-100')}>
                {result.passed ? <Award className="h-10 w-10 text-emerald-600" /> : <XCircle className="h-10 w-10 text-red-600" />}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">{result.passed ? 'Congratulations!' : 'Keep Practicing'}</h1>
              <p className="mt-1 text-sm text-gray-500">{activeQuiz.title}</p>
              <div className="mt-4 flex justify-center gap-8">
                <div><p className="text-3xl font-bold text-gray-900">{result.percentage}%</p><p className="text-xs text-gray-500">Score</p></div>
                <div><p className="text-3xl font-bold text-gray-900">{result.score}/{questions.length}</p><p className="text-xs text-gray-500">Correct</p></div>
                <div><p className="text-3xl font-bold text-gray-900">{attempt?.attempt_number || 1}</p><p className="text-xs text-gray-500">Attempt</p></div>
              </div>
              <div className="mt-4">
                <StatusBadge status={result.passed ? 'PASSED' : 'FAILED'} />
              </div>
            </div>
          </CardBody>
        </Card>

        {showReview && (
          <Card>
            <CardBody>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Answer Review</h2>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const opts = optionsByQuestion[q.id] || [];
                  const selected = answers[q.id] || [];
                  return (
                    <div key={q.id} className="rounded-lg border border-gray-100 p-4">
                      <p className="text-sm font-medium text-gray-900">{idx + 1}. {q.question_text}</p>
                      <div className="mt-2 space-y-1">
                        {opts.map((opt) => {
                          const isCorrect = opt.is_correct;
                          const isSelected = selected.includes(opt.id);
                          return (
                            <div key={opt.id} className={classNames('flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
                              isCorrect ? 'bg-emerald-50 text-emerald-700' : isSelected ? 'bg-red-50 text-red-700' : 'text-gray-600')}>
                              {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : isSelected ? <XCircle className="h-4 w-4" /> : <div className="h-4 w-4" />}
                              {opt.option_text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="flex justify-center gap-3">
          {!showReview && <Button variant="outline" onClick={() => setShowReview(true)}><Eye className="h-4 w-4" /> Review Answers</Button>}
          <Button variant="outline" onClick={() => startQuiz(activeQuiz)}><RefreshCw className="h-4 w-4" /> Retry Quiz</Button>
          <Link to={`/student/courses/${courseId}/quizzes`}><Button variant="outline">Back to Quizzes</Button></Link>
        </div>
      </div>
    );
  }

  // Quiz list
  return (
    <div className="space-y-6">
      <Link to={`/student/courses/${courseId}/learn`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
      </div>

      {(!quizzes || quizzes.length === 0) ? (
        <Card><EmptyState icon={<FileQuestion className="h-12 w-12" />} title="No quizzes" message="Your instructor hasn't created any quizzes yet." /></Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const exResult = existingResults[quiz.id];
            return (
              <Card key={quiz.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{quiz.title}</h3>
                      {quiz.description && <p className="mt-1 text-sm text-gray-600">{quiz.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Pass: {quiz.passing_percentage}%</span>
                        <span>Timer: {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}min` : 'No limit'}</span>
                        <span>Attempts: {quiz.attempt_limit}</span>
                        <span>{quiz.question_count || 0} questions</span>
                      </div>
                      {exResult && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-gray-500">Best Score: <span className="font-semibold text-gray-900">{exResult.bestScore}%</span></span>
                          {exResult.passed ? <StatusBadge status="PASSED" /> : <StatusBadge status="FAILED" />}
                        </div>
                      )}
                    </div>
                    <Button onClick={() => startQuiz(quiz)}>Start Quiz</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
