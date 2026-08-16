import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
//import { useParams, Link, useNavigate } from 'react-router-dom';
// import {
//   ArrowLeft, Plus, Pencil, Trash2, FileQuestion, ChevronDown, ChevronRight,
//   Check, X, ArrowUp, ArrowDown, Save,
// } from 'lucide-react';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Save,
  BarChart3,
  Users,
  Trophy,
  Clock,
  Target,
} from 'lucide-react';

import { courseApi, quizApi, questionApi, optionApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, Modal, Input, Textarea, Select, LoadingState, EmptyState } from '@/components/ui';
import { classNames } from '@/utils/helpers';
import type { Quiz, Question, QuestionOption, QuestionType } from '@/types';

export function QuizManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  //const navigate = useNavigate();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: quizzes, loading, refetch } = useAsync(() => quizApi.listByCourse(courseId!), [courseId]);

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [quizModal, setQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [analyticsQuiz, setAnalyticsQuiz] = useState<Quiz | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [quizForm, setQuizForm] = useState({ title: '', description: '', passing_percentage: 70, time_limit_minutes: 30, attempt_limit: 3 });

  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({ question_text: '', question_type: 'MCQ' as QuestionType });
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [newOptionText, setNewOptionText] = useState('');

  const [questionsByQuiz, setQuestionsByQuiz] = useState<Record<string, Question[]>>({});
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, QuestionOption[]>>({});

  const loadQuizData = useCallback(async () => {
    const qs = await quizApi.listByCourse(courseId!);
    for (const quiz of qs) {
      const questions = await questionApi.listByQuiz(quiz.id);
      setQuestionsByQuiz((prev) => ({ ...prev, [quiz.id]: questions }));
      for (const q of questions) {
        const opts = await optionApi.listByQuestion(q.id);
        setOptionsByQuestion((prev) => ({ ...prev, [q.id]: opts }));
      }
    }
  }, [courseId]);

  useEffect(() => { if (courseId) loadQuizData(); }, [courseId, loadQuizData]);

  const openQuizModal = (quiz?: Quiz) => {
    if (quiz) { setEditingQuiz(quiz); setQuizForm({ title: quiz.title, description: quiz.description || '', passing_percentage: quiz.passing_percentage, time_limit_minutes: quiz.time_limit_minutes || 30, attempt_limit: quiz.attempt_limit }); }
    else { setEditingQuiz(null); setQuizForm({ title: '', description: '', passing_percentage: 70, time_limit_minutes: 30, attempt_limit: 3 }); }
    setQuizModal(true);
  };

  const openAnalyticsModal = async (quiz: Quiz) => {
  setAnalyticsQuiz(quiz);
  setAnalyticsModal(true);
  setAnalyticsLoading(true);
  setAnalyticsData(null);

  try {
    const data = await quizApi.getAnalytics(quiz.id);
    setAnalyticsData(data);
  } catch (error) {
    console.error('Failed to load quiz analytics:', error);
    setAnalyticsData(null);
  } finally {
    setAnalyticsLoading(false);
  }
};

  const saveQuiz = async () => {
    if (editingQuiz) {
      await quizApi.update(editingQuiz.id, { ...quizForm, time_limit_minutes: quizForm.time_limit_minutes || null });
    } else {
      await quizApi.create({ course_id: courseId!, ...quizForm, time_limit_minutes: quizForm.time_limit_minutes || null });
    }
    setQuizModal(false);
    refetch();
    loadQuizData();
  };

  const deleteQuiz = async (id: string) => {
    await quizApi.delete(id);
    refetch();
    loadQuizData();
  };

  const openQuestionModal = (quizId: string, question?: Question) => {
    setActiveQuizId(quizId);
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({ question_text: question.question_text, question_type: question.question_type });
      const opts = optionsByQuestion[question.id] || [];
      setOptions(opts);
    } else {
      setEditingQuestion(null);
      setQuestionForm({ question_text: '', question_type: 'MCQ' });
      setOptions([]);
    }
    setQuestionModal(true);
  };

  const addOption = () => {
    if (!newOptionText.trim()) return;
    setOptions([...options, { id: `temp-${Date.now()}`, question_id: '', option_text: newOptionText, is_correct: false }]);
    setNewOptionText('');
  };

  const toggleCorrect = (idx: number) => {
    setOptions(options.map((o, i) => {
      if (questionForm.question_type === 'MCQ') return { ...o, is_correct: i === idx ? !o.is_correct : false };
      return i === idx ? { ...o, is_correct: !o.is_correct } : o;
    }));
  };

  const removeOption = (idx: number) => setOptions(options.filter((_, i) => i !== idx));

  const saveQuestion = async () => {
    if (!activeQuizId) {
      alert('No quiz selected');
      return;
    }
    
    console.log('Saving question with activeQuizId:', activeQuizId);
    console.log('Question form:', questionForm);
    
    let questionId: string;
    if (editingQuestion) {
      await questionApi.update(editingQuestion.id, { question_text: questionForm.question_text, question_type: questionForm.question_type });
      questionId = editingQuestion.id;
      // Delete existing options and recreate
      const existing = await optionApi.listByQuestion(questionId);
      for (const opt of existing) await optionApi.delete(opt.id);
    } else {
      const q = await questionApi.create({ quiz_id: activeQuizId, question_text: questionForm.question_text, question_type: questionForm.question_type, question_order: 1 });
      questionId = q.id;
    }
    for (let i = 0; i < options.length; i++) {
      await optionApi.create({ question_id: questionId, option_text: options[i].option_text, is_correct: options[i].is_correct });
    }
    setQuestionModal(false);
    loadQuizData();
    refetch();
  };

  const deleteQuestion = async (id: string) => {
    await questionApi.delete(id);
    loadQuizData();
    refetch();
  };

  const moveQuestion = async (quizId: string, index: number, direction: 'up' | 'down') => {
    const qs = questionsByQuiz[quizId] || [];
    const newOrder = [...qs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setQuestionsByQuiz((prev) => ({ ...prev, [quizId]: newOrder }));
    //await questionApi.reorder(newOrder.map((q) => q.id));
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
        </div>
        <Button onClick={() => openQuizModal()}><Plus className="h-4 w-4" /> Create Quiz</Button>
      </div>

      {(!quizzes || quizzes.length === 0) ? (
        <Card><EmptyState icon={<FileQuestion className="h-12 w-12" />} title="No quizzes" message="Create quizzes to test your students' knowledge." action={<Button onClick={() => openQuizModal()}><Plus className="h-4 w-4" /> Create Quiz</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const questions = questionsByQuiz[quiz.id] || [];
            const isExpanded = expandedQuiz === quiz.id;
            return (
              <Card key={quiz.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)} className="text-gray-400">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{quiz.title}</p>
                      {quiz.description && <p className="text-xs text-gray-500">{quiz.description}</p>}
                      <div className="mt-1 flex gap-3 text-xs text-gray-400">
                        <span>Pass: {quiz.passing_percentage}%</span>
                        <span>Timer: {quiz.time_limit_minutes || 'No limit'}min</span>
                        <span>Attempts: {quiz.attempt_limit}</span>
                        <span>{questions.length} questions</span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openQuestionModal(quiz.id)}><Plus className="h-4 w-4" /> Question</Button>
                    <Button size="sm" variant="ghost" onClick={() => openQuizModal(quiz)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteQuiz(quiz.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div> */}
                  <div className="flex items-center gap-1">
                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openQuestionModal(quiz.id)}
                    >
                    <Plus className="h-4 w-4" />
                    Question
                    </Button>

                    {/* <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/instructor/quizzes/${quiz.id}/analytics`)}
                    >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                    </Button> */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openAnalyticsModal(quiz)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>

                    <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openQuizModal(quiz)}
                    >
                    <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    {questions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-400">No questions yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {questions.map((q, qIdx) => {
                          const opts = optionsByQuestion[q.id] || [];
                          return (
                            <div key={q.id} className="rounded-lg border border-gray-100 p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                  <div className="flex flex-col">
                                    <button onClick={() => moveQuestion(quiz.id, qIdx, 'up')} disabled={qIdx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                                    <button onClick={() => moveQuestion(quiz.id, qIdx, 'down')} disabled={qIdx === questions.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{q.question_order}. {q.question_text}</p>
                                    <span className="text-xs text-gray-400">{q.question_type === 'MCQ' ? 'Multiple Choice' : 'Multiple Correct'}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => openQuestionModal(quiz.id, q)}><Pencil className="h-4 w-4" /></Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteQuestion(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                              </div>
                              {opts.length > 0 && (
                                <div className="mt-2 space-y-1 pl-8">
                                  {opts.map((opt) => (
                                    <div key={opt.id} className="flex items-center gap-2 text-sm">
                                      <span className={classNames('flex h-5 w-5 items-center justify-center rounded-full', opt.is_correct ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                                        {opt.is_correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                      </span>
                                      <span className={opt.is_correct ? 'text-gray-900 font-medium' : 'text-gray-600'}>{opt.option_text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Quiz Modal */}
      <Modal open={quizModal} onClose={() => setQuizModal(false)} title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'} footer={<><Button variant="outline" onClick={() => setQuizModal(false)}>Cancel</Button><Button onClick={saveQuiz}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Quiz Title" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} />
          <Textarea label="Description" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Passing %" type="number" min="0" max="100" value={quizForm.passing_percentage} onChange={(e) => setQuizForm({ ...quizForm, passing_percentage: parseInt(e.target.value) || 70 })} />
            <Input label="Timer (min)" type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) || 0 })} />
            <Input label="Attempt Limit" type="number" value={quizForm.attempt_limit} onChange={(e) => setQuizForm({ ...quizForm, attempt_limit: parseInt(e.target.value) || 1 })} />
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
<Modal
  open={analyticsModal}
  onClose={() => setAnalyticsModal(false)}
  title={`Quiz Analytics${
    analyticsQuiz ? ` - ${analyticsQuiz.title}` : ''
  }`}
  size="lg"
  footer={
    <Button
      variant="outline"
      onClick={() => setAnalyticsModal(false)}
    >
      Close
    </Button>
  }
>
  {analyticsLoading ? (
    <LoadingState />
  ) : !analyticsData ? (
    <div className="py-8 text-center text-sm text-gray-500">
      No analytics data available.
    </div>
  ) : (
    <div className="space-y-6">

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

        {/* Total Students */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium">
              Total Students
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {analyticsData.total_students || 0}
          </p>
        </div>

        {/* Attempted */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Target className="h-4 w-4" />
            <span className="text-xs font-medium">
              Attempted
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {analyticsData.attempted || 0}
          </p>
        </div>

        {/* Average Score */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium">
              Average Score
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {analyticsData.average_score || 0}%
          </p>
        </div>

        {/* Pass Rate */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-medium">
              Pass Rate
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {analyticsData.pass_rate || 0}%
          </p>
        </div>

      </div>


      {/* Pass / Fail Section */}
      <div className="rounded-lg border border-gray-200 p-5">

        <h3 className="text-sm font-semibold text-gray-900">
          Student Performance
        </h3>

        <div className="mt-4 space-y-4">

          {/* Passed */}
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">
                Passed
              </span>

              <span className="font-medium text-gray-900">
                {analyticsData.passed || 0}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    analyticsData.attempted > 0
                      ? (Number(analyticsData.passed) /
                          Number(analyticsData.attempted)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>


          {/* Failed */}
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-600">
                Failed
              </span>

              <span className="font-medium text-gray-900">
                {analyticsData.failed || 0}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${
                    analyticsData.attempted > 0
                      ? (Number(analyticsData.failed) /
                          Number(analyticsData.attempted)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>


      {/* Score Statistics */}
      <div className="rounded-lg border border-gray-200 p-5">

        <h3 className="text-sm font-semibold text-gray-900">
          Score Statistics
        </h3>

        <div className="mt-4 grid grid-cols-3 gap-4">

          <div>
            <p className="text-xs text-gray-500">
              Highest Score
            </p>

            <p className="mt-1 text-xl font-semibold text-gray-900">
              {analyticsData.highest_score || 0}%
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Average Score
            </p>

            <p className="mt-1 text-xl font-semibold text-gray-900">
              {analyticsData.average_score || 0}%
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Lowest Score
            </p>

            <p className="mt-1 text-xl font-semibold text-gray-900">
              {analyticsData.lowest_score || 0}%
            </p>
          </div>

        </div>
      </div>


      {/* Time Statistics */}
      <div className="rounded-lg border border-gray-200 p-5">

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />

          <h3 className="text-sm font-semibold text-gray-900">
            Time Statistics
          </h3>
        </div>

        <div className="mt-3">

          <p className="text-xs text-gray-500">
            Average Completion Time
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900">
            {analyticsData.average_time || 0} minutes
          </p>

        </div>
      </div>

    </div>
  )}
</Modal>

      {/* Question Modal */}
      <Modal open={questionModal} onClose={() => setQuestionModal(false)} title={editingQuestion ? 'Edit Question' : 'Add Question'} size="lg" footer={<><Button variant="outline" onClick={() => setQuestionModal(false)}>Cancel</Button><Button onClick={saveQuestion}><Save className="h-4 w-4" /> Save Question</Button></>}>
        <div className="space-y-4">
          <Textarea label="Question Text" value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} rows={3} />
          <Select label="Question Type" value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value as QuestionType })}>
            <option value="MCQ">Multiple Choice (single correct)</option>
            <option value="MULTIPLE_CORRECT">Multiple Correct Answers</option>
          </Select>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Options</label>
            <p className="mb-2 text-xs text-gray-500">{questionForm.question_type === 'MCQ' ? 'Select one correct answer' : 'Select all correct answers'}</p>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button onClick={() => toggleCorrect(idx)} className={classNames('flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors', opt.is_correct ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-300 text-transparent')}>
                    <Check className="h-3 w-3" />
                  </button>
                  <Input value={opt.option_text} onChange={(e) => setOptions(options.map((o, i) => i === idx ? { ...o, option_text: e.target.value } : o))} className="flex-1" />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(idx)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input value={newOptionText} onChange={(e) => setNewOptionText(e.target.value)} placeholder="Add option..." className="flex-1" />
              <Button variant="outline" size="sm" onClick={addOption}><Plus className="h-4 w-4" /> Add</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
