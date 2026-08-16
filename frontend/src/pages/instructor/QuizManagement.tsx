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
} from 'lucide-react';

import {
  courseApi,
  quizApi,
  questionApi,
  optionApi,
} from '@/services/api';

import { useAsync } from '@/hooks/useAsync';

import {
  Card,
  Button,
  Modal,
  Input,
  Textarea,
  Select,
  LoadingState,
  EmptyState,
} from '@/components/ui';

import { classNames } from '@/utils/helpers';

import type {
  Quiz,
  Question,
  QuestionOption,
  QuestionType,
} from '@/types';

export function QuizManagement() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course } = useAsync(
    () => courseApi.getById(courseId!),
    [courseId]
  );

  const {
    data: quizzes,
    loading,
    refetch,
  } = useAsync(
    () => quizApi.listByCourse(courseId!),
    [courseId]
  );

  console.log("COURSE ID:", courseId);
  console.log("QUIZZES:", quizzes);
  console.log("QUIZ LOADING:", loading);
  // --------------------------------------------------
  // Quiz state
  // --------------------------------------------------

  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  const [quizModal, setQuizModal] = useState(false);

  const [editingQuiz, setEditingQuiz] =
    useState<Quiz | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passing_percentage: 70,
    time_limit_minutes: 30,
    attempt_limit: 3,
  });

  // --------------------------------------------------
  // Question state
  // --------------------------------------------------

  const [questionModal, setQuestionModal] =
    useState(false);

  const [editingQuestion, setEditingQuestion] =
    useState<Question | null>(null);

  const [activeQuizId, setActiveQuizId] =
    useState<string | null>(null);

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'MCQ' as QuestionType,
  });

  const [options, setOptions] =
    useState<QuestionOption[]>([]);

  const [newOptionText, setNewOptionText] =
    useState('');

  // --------------------------------------------------
  // Loaded quiz/question data
  // --------------------------------------------------

  const [questionsByQuiz, setQuestionsByQuiz] =
    useState<Record<string, Question[]>>({});

  const [optionsByQuestion, setOptionsByQuestion] =
    useState<Record<string, QuestionOption[]>>({});

  // --------------------------------------------------
  // Analytics
  // --------------------------------------------------

  const [analyticsQuiz, setAnalyticsQuiz] =
    useState<Quiz | null>(null);

  const [analytics, setAnalytics] =
    useState<any>(null);

  const [analyticsLoading, setAnalyticsLoading] =
    useState(false);

  // ==================================================
  // LOAD QUESTIONS AND OPTIONS
  // ==================================================

  const loadQuizData = useCallback(async () => {
    if (!courseId) return;

    try {
      const qs = await quizApi.listByCourse(courseId);

      const questionMap: Record<string, Question[]> = {};
      const optionMap: Record<string, QuestionOption[]> = {};

      for (const quiz of qs) {
        const questions =
          await questionApi.listByQuiz(quiz.id);

        questionMap[quiz.id] = questions;

        for (const question of questions) {
          const opts =
            await optionApi.listByQuestion(question.id);

          optionMap[question.id] = opts;
        }
      }

      setQuestionsByQuiz(questionMap);
      setOptionsByQuestion(optionMap);
    } catch (error) {
      console.error(
        'Failed to load quiz data:',
        error
      );
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadQuizData();
    }
  }, [courseId, loadQuizData]);

  // ==================================================
  // QUIZ MODAL
  // ==================================================

  const openQuizModal = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);

      setQuizForm({
        title: quiz.title,
        description: quiz.description || '',
        passing_percentage:
          quiz.passing_percentage,
        time_limit_minutes:
          quiz.time_limit_minutes || 30,
        attempt_limit:
          quiz.attempt_limit,
      });
    } else {
      setEditingQuiz(null);

      setQuizForm({
        title: '',
        description: '',
        passing_percentage: 70,
        time_limit_minutes: 30,
        attempt_limit: 3,
      });
    }

    setQuizModal(true);
  };

  // ==================================================
  // SAVE QUIZ
  // ==================================================

  const saveQuiz = async () => {
    try {
      if (!quizForm.title.trim()) {
        alert('Please enter quiz title');
        return;
      }

      if (editingQuiz) {
        await quizApi.update(
          editingQuiz.id,
          {
            ...quizForm,
            time_limit_minutes:
              quizForm.time_limit_minutes || null,
          }
        );
      } else {
        await quizApi.create({
          course_id: courseId!,
          ...quizForm,
          time_limit_minutes:
            quizForm.time_limit_minutes || null,
        });
      }

      setQuizModal(false);

      await refetch();
      await loadQuizData();
    } catch (error) {
      console.error(
        'Failed to save quiz:',
        error
      );

      alert('Failed to save quiz');
    }
  };

  // ==================================================
  // DELETE QUIZ
  // ==================================================

  const deleteQuiz = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this quiz?'
    );

    if (!confirmed) return;

    try {
      await quizApi.delete(id);

      await refetch();
      await loadQuizData();
    } catch (error) {
      console.error(
        'Failed to delete quiz:',
        error
      );

      alert('Failed to delete quiz');
    }
  };

  // ==================================================
  // ANALYTICS
  // ==================================================

  const openAnalytics = async (quiz: Quiz) => {
    try {
      setAnalyticsQuiz(quiz);
      setAnalytics(null);
      setAnalyticsLoading(true);

      const data =
        await quizApi.getAnalytics(quiz.id);

      setAnalytics(data);
    } catch (error) {
      console.error(
        'Failed to load quiz analytics:',
        error
      );

      alert('Failed to load quiz analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ==================================================
  // QUESTION MODAL
  // ==================================================

  const openQuestionModal = (
    quizId: string,
    question?: Question
  ) => {
    setActiveQuizId(quizId);
    setNewOptionText('');

    if (question) {
      setEditingQuestion(question);

      setQuestionForm({
        question_text:
          question.question_text,
        question_type:
          question.question_type,
      });

      const opts =
        optionsByQuestion[question.id] || [];

      setOptions([...opts]);
    } else {
      setEditingQuestion(null);

      setQuestionForm({
        question_text: '',
        question_type: 'MCQ',
      });

      setOptions([]);
    }

    setQuestionModal(true);
  };

  // ==================================================
  // ADD OPTION
  // ==================================================

  const addOption = () => {
    const text = newOptionText.trim();

    if (!text) return;

    const newOption: QuestionOption = {
      id: `temp-${Date.now()}`,
      question_id: '',
      option_text: text,
      is_correct: false,
    };

    setOptions((prev) => [
      ...prev,
      newOption,
    ]);

    setNewOptionText('');
  };

  // ==================================================
  // TOGGLE CORRECT ANSWER
  // ==================================================

  const toggleCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((option, i) => {
        // Single correct answer
        if (
          questionForm.question_type === 'MCQ'
        ) {
          return {
            ...option,
            is_correct:
              i === index
                ? !option.is_correct
                : false,
          };
        }

        // Multiple correct answers
        return i === index
          ? {
              ...option,
              is_correct:
                !option.is_correct,
            }
          : option;
      })
    );
  };

  // ==================================================
  // REMOVE OPTION
  // ==================================================

  const removeOption = (index: number) => {
    setOptions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==================================================
  // SAVE QUESTION
  // ==================================================

  const saveQuestion = async () => {
    if (!activeQuizId) {
      alert('No quiz selected');
      return;
    }

    if (!questionForm.question_text.trim()) {
      alert('Please enter question text');
      return;
    }

    if (options.length === 0) {
      alert('Please add at least one option');
      return;
    }

    const hasCorrectAnswer =
      options.some(
        (option) => option.is_correct
      );

    if (!hasCorrectAnswer) {
      alert(
        'Please select at least one correct answer'
      );
      return;
    }

    if (
      questionForm.question_type === 'MCQ' &&
      options.filter(
        (option) => option.is_correct
      ).length > 1
    ) {
      alert(
        'MCQ can have only one correct answer'
      );
      return;
    }

    try {
      let questionId: string;

      if (editingQuestion) {
        // Update question
        await questionApi.update(
          editingQuestion.id,
          {
            question_text:
              questionForm.question_text,
            question_type:
              questionForm.question_type,
          }
        );

        questionId = editingQuestion.id;

        // Delete old options
        const existing =
          await optionApi.listByQuestion(
            questionId
          );

        for (const option of existing) {
          await optionApi.delete(option.id);
        }
      } else {
        // Determine next question order
        const existingQuestions =
          questionsByQuiz[activeQuizId] || [];

        const nextOrder =
          existingQuestions.length + 1;

        // Create question
        const question =
          await questionApi.create({
            quiz_id: activeQuizId,
            question_text:
              questionForm.question_text,
            question_type:
              questionForm.question_type,
            question_order: nextOrder,
          });

        questionId = question.id;
      }

      // Create options
      for (const option of options) {
        await optionApi.create({
          question_id: questionId,
          option_text: option.option_text,
          is_correct: option.is_correct,
        });
      }

      setQuestionModal(false);

      setEditingQuestion(null);
      setActiveQuizId(null);
      setOptions([]);
      setNewOptionText('');

      await loadQuizData();
      await refetch();
    } catch (error) {
      console.error(
        'Failed to save question:',
        error
      );

      alert('Failed to save question');
    }
  };

  // ==================================================
  // DELETE QUESTION
  // ==================================================

  const deleteQuestion = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this question?'
    );

    if (!confirmed) return;

    try {
      await questionApi.delete(id);

      await loadQuizData();
      await refetch();
    } catch (error) {
      console.error(
        'Failed to delete question:',
        error
      );

      alert('Failed to delete question');
    }
  };

  // ==================================================
  // MOVE QUESTION
  // ==================================================

  const moveQuestion = async (
    quizId: string,
    index: number,
    direction: 'up' | 'down'
  ) => {
    const questions =
      questionsByQuiz[quizId] || [];

    const swapIndex =
      direction === 'up'
        ? index - 1
        : index + 1;

    if (
      swapIndex < 0 ||
      swapIndex >= questions.length
    ) {
      return;
    }

    const newOrder = [...questions];

    [
      newOrder[index],
      newOrder[swapIndex],
    ] = [
      newOrder[swapIndex],
      newOrder[index],
    ];

    // Update question_order locally
    const updatedQuestions =
      newOrder.map((question, i) => ({
        ...question,
        question_order: i + 1,
      }));

    setQuestionsByQuiz((prev) => ({
      ...prev,
      [quizId]: updatedQuestions,
    }));

    // Save order to backend
    try {
      for (
        let i = 0;
        i < updatedQuestions.length;
        i++
      ) {
        await questionApi.update(
          updatedQuestions[i].id,
          {
            question_order: i + 1,
          }
        );
      }

      await loadQuizData();
    } catch (error) {
      console.error(
        'Failed to update question order:',
        error
      );

      alert(
        'Failed to save question order'
      );

      await loadQuizData();
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return <LoadingState />;
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="space-y-6">

      {/* Back */}
      <Link
        to={`/instructor/courses/${courseId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quizzes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {course?.title}
          </p>
        </div>

        <Button
          onClick={() => openQuizModal()}
        >
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      {/* Quiz List */}
      {!quizzes ||
      quizzes.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <FileQuestion className="h-12 w-12" />
            }
            title="No quizzes"
            message="Create quizzes to test your students' knowledge."
            action={
              <Button
                onClick={() =>
                  openQuizModal()
                }
              >
                <Plus className="h-4 w-4" />
                Create Quiz
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">

          {quizzes.map((quiz) => {
            const questions =
              questionsByQuiz[quiz.id] || [];

            const isExpanded =
              expandedQuiz === quiz.id;

            return (
              <Card key={quiz.id}>

                {/* ================================= */}
                {/* QUIZ HEADER */}
                {/* ================================= */}

                <div className="flex items-center justify-between p-4">

                  <div className="flex items-center gap-3">

                    {/* Expand */}
                    <button
                      onClick={() =>
                        setExpandedQuiz(
                          isExpanded
                            ? null
                            : quiz.id
                        )
                      }
                      className="text-gray-400"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>

                    {/* Quiz information */}
                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {quiz.title}
                      </p>

                      {quiz.description && (
                        <p className="text-xs text-gray-500">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-1 flex gap-3 text-xs text-gray-400">

                        <span>
                          Pass:{' '}
                          {quiz.passing_percentage}%
                        </span>

                        <span>
                          Timer:{' '}
                          {quiz.time_limit_minutes
                            ? `${quiz.time_limit_minutes} min`
                            : 'No limit'}
                        </span>

                        <span>
                          Attempts:{' '}
                          {quiz.attempt_limit}
                        </span>

                        <span>
                          {questions.length}{' '}
                          questions
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Quiz actions */}
                  <div className="flex items-center gap-1">

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        openQuestionModal(
                          quiz.id
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Question
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        openAnalytics(quiz)
                      }
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        openQuizModal(quiz)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        deleteQuiz(quiz.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>

                  </div>
                </div>

                {/* ================================= */}
                {/* QUESTIONS */}
                {/* ================================= */}

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">

                    {questions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-400">
                        No questions yet.
                      </p>
                    ) : (
                      <div className="space-y-2">

                        {questions.map(
                          (question, qIdx) => {

                            const opts =
                              optionsByQuestion[
                                question.id
                              ] || [];

                            return (
                              <div
                                key={question.id}
                                className="rounded-lg border border-gray-100 p-3"
                              >

                                {/* Question row */}
                                <div className="flex items-start justify-between">

                                  <div className="flex items-start gap-2">

                                    {/* Move buttons */}
                                    <div className="flex flex-col">

                                      <button
                                        onClick={() =>
                                          moveQuestion(
                                            quiz.id,
                                            qIdx,
                                            'up'
                                          )
                                        }
                                        disabled={
                                          qIdx === 0
                                        }
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </button>

                                      <button
                                        onClick={() =>
                                          moveQuestion(
                                            quiz.id,
                                            qIdx,
                                            'down'
                                          )
                                        }
                                        disabled={
                                          qIdx ===
                                          questions.length -
                                            1
                                        }
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </button>

                                    </div>

                                    {/* Question text */}
                                    <div>

                                      <p className="text-sm font-medium text-gray-900">
                                        {question.question_order}.{' '}
                                        {question.question_text}
                                      </p>

                                      <span className="text-xs text-gray-400">
                                        {question.question_type ===
                                        'MCQ'
                                          ? 'Multiple Choice'
                                          : 'Multiple Correct'}
                                      </span>

                                    </div>

                                  </div>

                                  {/* Question actions */}
                                  <div className="flex items-center gap-1">

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        openQuestionModal(
                                          quiz.id,
                                          question
                                        )
                                      }
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        deleteQuestion(
                                          question.id
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>

                                  </div>

                                </div>

                                {/* ================================= */}
                                {/* OPTIONS */}
                                {/* ================================= */}

                                {opts.length > 0 && (
                                  <div className="mt-2 space-y-1 pl-8">

                                    {opts.map(
                                      (option) => (
                                        <div
                                          key={
                                            option.id
                                          }
                                          className="flex items-center gap-2 text-sm"
                                        >

                                          <span
                                            className={classNames(
                                              'flex h-5 w-5 items-center justify-center rounded-full',
                                              option.is_correct
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-100 text-gray-400'
                                            )}
                                          >
                                            {option.is_correct ? (
                                              <Check className="h-3 w-3" />
                                            ) : (
                                              <X className="h-3 w-3" />
                                            )}
                                          </span>

                                          <span
                                            className={
                                              option.is_correct
                                                ? 'font-medium text-gray-900'
                                                : 'text-gray-600'
                                            }
                                          >
                                            {
                                              option.option_text
                                            }
                                          </span>

                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>
                )}

              </Card>
            );
          })}

        </div>
      )}

      {/* ================================================= */}
      {/* QUIZ MODAL */}
      {/* ================================================= */}

      <Modal
        open={quizModal}
        onClose={() =>
          setQuizModal(false)
        }
        title={
          editingQuiz
            ? 'Edit Quiz'
            : 'Create Quiz'
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setQuizModal(false)
              }
            >
              Cancel
            </Button>

            <Button onClick={saveQuiz}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">

          <Input
            label="Quiz Title"
            value={quizForm.title}
            onChange={(e) =>
              setQuizForm({
                ...quizForm,
                title: e.target.value,
              })
            }
          />

          <Textarea
            label="Description"
            value={quizForm.description}
            onChange={(e) =>
              setQuizForm({
                ...quizForm,
                description:
                  e.target.value,
              })
            }
            rows={2}
          />

          <div className="grid grid-cols-3 gap-4">

            <Input
              label="Passing %"
              type="number"
              min="0"
              max="100"
              value={
                quizForm.passing_percentage
              }
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  passing_percentage:
                    parseInt(
                      e.target.value
                    ) || 70,
                })
              }
            />

            <Input
              label="Timer (min)"
              type="number"
              min="1"
              value={
                quizForm.time_limit_minutes
              }
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  time_limit_minutes:
                    parseInt(e.target.value) || 1,
                })
              }
            />

            <Input
              label="Attempt Limit"
              type="number"
              min="1"
              value={
                quizForm.attempt_limit
              }
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  attempt_limit:
                    parseInt(
                      e.target.value
                    ) || 1,
                })
              }
            />

          </div>

        </div>
      </Modal>

      {/* ================================================= */}
      {/* QUESTION MODAL */}
      {/* ================================================= */}

      <Modal
        open={questionModal}
        onClose={() =>
          setQuestionModal(false)
        }
        title={
          editingQuestion
            ? 'Edit Question'
            : 'Add Question'
        }
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setQuestionModal(false)
              }
            >
              Cancel
            </Button>

            <Button onClick={saveQuestion}>
              <Save className="h-4 w-4" />
              Save Question
            </Button>
          </>
        }
      >
        <div className="space-y-4">

          <Textarea
            label="Question Text"
            value={
              questionForm.question_text
            }
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                question_text:
                  e.target.value,
              })
            }
            rows={3}
          />

          <Select
            label="Question Type"
            value={
              questionForm.question_type
            }
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                question_type:
                  e.target.value as QuestionType,
              })
            }
          >
            <option value="MCQ">
              Multiple Choice (single correct)
            </option>

            <option value="MULTIPLE_CORRECT">
              Multiple Correct Answers
            </option>
          </Select>

          {/* Options */}
          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Options
            </label>

            <p className="mb-2 text-xs text-gray-500">
              {questionForm.question_type ===
              'MCQ'
                ? 'Select one correct answer'
                : 'Select all correct answers'}
            </p>

            <div className="space-y-2">

              {options.map(
                (option, index) => (
                  <div
                    key={option.id || index}
                    className="flex items-center gap-2"
                  >

                    {/* Correct button */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleCorrect(
                          index
                        )
                      }
                      className={classNames(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                        option.is_correct
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                          : 'border-gray-300 text-transparent'
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </button>

                    {/* Option text */}
                    <Input
                      value={
                        option.option_text
                      }
                      onChange={(e) =>
                        setOptions(
                          options.map(
                            (item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    option_text:
                                      e.target
                                        .value,
                                  }
                                : item
                          )
                        )
                      }
                      className="flex-1"
                    />

                    {/* Delete option */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeOption(
                          index
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>

                  </div>
                )
              )}

            </div>

            {/* Add option */}
            <div className="mt-2 flex gap-2">

              <Input
                value={newOptionText}
                onChange={(e) =>
                  setNewOptionText(
                    e.target.value
                  )
                }
                placeholder="Add option..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>

            </div>

          </div>

        </div>
      </Modal>

      {/* ================================================= */}
      {/* ANALYTICS MODAL */}
      {/* ================================================= */}

      <Modal
        open={!!analyticsQuiz}
        onClose={() => {
          setAnalyticsQuiz(null);
          setAnalytics(null);
        }}
        title={`Quiz Analytics - ${
          analyticsQuiz?.title || ''
        }`}
        size="lg"
      >
        {analyticsLoading ? (
          <LoadingState />
        ) : analytics ? (

          <div className="space-y-6">

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">

              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Total Attempts
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {analytics.total_attempts ??
                      0}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Average Score
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {analytics.average_score ??
                      0}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    Pass Percentage
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {analytics.pass_percentage ??
                      0}
                    %
                  </p>
                </div>
              </Card>

            </div>

            {/* Raw analytics */}
            <div>

              <h3 className="mb-3 text-lg font-semibold">
                Analytics Details
              </h3>

              <pre className="max-h-96 overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
                {JSON.stringify(
                  analytics,
                  null,
                  2
                )}
              </pre>

            </div>

          </div>

        ) : (

          <p className="text-center text-gray-500">
            No analytics available.
          </p>

        )}
      </Modal>

    </div>
  );
}