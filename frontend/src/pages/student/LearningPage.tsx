import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, CheckCircle2, Circle, FileVideo, FileText, Link as LinkIcon,
  Code, Download, ChevronDown, ChevronRight, ChevronLeft, Clock, Award, Menu,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  courseApi, moduleApi, lessonApi, materialApi, lessonProgressApi, progressApi,
} from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, ProgressBar, LoadingState } from '@/components/ui';
import { formatFileSize, classNames, formatDuration } from '@/utils/helpers';
import type { CourseModule, Lesson, LearningMaterial, LessonProgress } from '@/types';

const materialIcon = (type: string) => {
  switch (type) {
    case 'VIDEO': return <FileVideo className="h-4 w-4" />;
    case 'PDF': case 'PPT': case 'NOTES': return <FileText className="h-4 w-4" />;
    case 'EXTERNAL_LINK': return <LinkIcon className="h-4 w-4" />;
    case 'SOURCE_CODE': return <Code className="h-4 w-4" />;
    case 'DOWNLOADABLE_RESOURCE': return <Download className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

export function LearningPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const { data: course, loading: courseLoading } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: courseProgress } = useAsync(() => progressApi.getByCourseAndStudent(courseId!, user?.id || ''), [courseId, user?.id]);

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [materialsByLesson, setMaterialsByLesson] = useState<Record<string, LearningMaterial[]>>({});
  const [progressByLesson, setProgressByLesson] = useState<LessonProgress[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    const mods = await moduleApi.listByCourse(courseId!);
    setModules(mods);
    const lMap: Record<string, Lesson[]> = {};
    const mMap: Record<string, LearningMaterial[]> = {};
    for (const mod of mods) {
      const lessons = await lessonApi.listByModule(mod.id);
      lMap[mod.id] = lessons;
      for (const lesson of lessons) {
        const mats = await materialApi.listByLesson(lesson.id);
        mMap[lesson.id] = mats;
      }
    }
    setLessonsByModule(lMap);
    setMaterialsByLesson(mMap);
    const lp = await lessonProgressApi.listByCourseAndStudent(courseId!, user?.id || '');
    setProgressByLesson(lp);
    // Set first lesson as current
    if (mods.length > 0 && lMap[mods[0].id]?.length > 0 && !currentLessonId) {
      setCurrentLessonId(lMap[mods[0].id][0].id);
      setExpandedModules(new Set([mods[0].id]));
    }
  }, [courseId, user?.id, currentLessonId]);

  useEffect(() => { if (courseId && user) loadData(); }, [courseId, user, loadData]);

  if (courseLoading || !course) return <LoadingState />;

  const allLessons = modules.flatMap((m) => lessonsByModule[m.id] || []);
  const currentLesson = allLessons.find((l) => l.id === currentLessonId);
  const currentMaterials = currentLessonId ? materialsByLesson[currentLessonId] || [] : [];
  const currentProgress = progressByLesson.find((p) => p.lesson_id === currentLessonId);
  const currentModule = modules.find((m) => m.id === currentLesson?.module_id);

  const completedLessons = progressByLesson.filter((p) => p.completed).length;
  const totalLessons = allLessons.length;

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => { const next = new Set(prev); if (next.has(modId)) next.delete(modId); else next.add(modId); return next; });
  };

  const handleMarkComplete = async () => {
    if (currentLessonId) {
      await lessonProgressApi.markComplete(currentLessonId, user!.id);
      loadData();
    }
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    const idx = allLessons.findIndex((l) => l.id === currentLessonId);
    if (direction === 'prev' && idx > 0) setCurrentLessonId(allLessons[idx - 1].id);
    if (direction === 'next' && idx < allLessons.length - 1) setCurrentLessonId(allLessons[idx + 1].id);
  };

  const currentIdx = allLessons.findIndex((l) => l.id === currentLessonId);
  const isCompleted = (lessonId: string) => progressByLesson.some((p) => p.lesson_id === lessonId && p.completed);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={classNames(
        'fixed inset-y-0 left-0 z-40 w-80 overflow-y-auto border-r border-gray-200 bg-white lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="border-b border-gray-100 p-4">
          <Link to="/student/my-courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" /> My Courses
          </Link>
          <h2 className="mt-2 line-clamp-2 text-sm font-bold text-gray-900">{course.title}</h2>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{completedLessons}/{totalLessons} lessons</span>
              <span>{courseProgress?.progress_percentage || 0}%</span>
            </div>
            <ProgressBar value={courseProgress?.progress_percentage || 0} size="sm" className="mt-1" />
          </div>
        </div>

        <div className="p-2">
          {modules.map((mod) => {
            const lessons = lessonsByModule[mod.id] || [];
            const isExpanded = expandedModules.has(mod.id);
            return (
              <div key={mod.id} className="mb-2">
                <button onClick={() => toggleModule(mod.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <span className="flex-1 text-sm font-semibold text-gray-900">{mod.name}</span>
                  <span className="text-xs text-gray-400">{lessons.length}</span>
                </button>
                {isExpanded && (
                  <div className="ml-4 space-y-0.5">
                    {lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => { setCurrentLessonId(lesson.id); setSidebarOpen(false); }}
                        className={classNames(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          lesson.id === currentLessonId ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50',
                        )}
                      >
                        {isCompleted(lesson.id) ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 flex-shrink-0 text-gray-300" />}
                        <span className="flex-1 line-clamp-1">{lesson.title}</span>
                        {lesson.duration_minutes && <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">{currentModule?.name} / {currentLesson?.title}</p>
            <p className="text-xs text-gray-500">Lesson {currentIdx + 1} of {totalLessons}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => navigateLesson('prev')} disabled={currentIdx <= 0}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigateLesson('next')} disabled={currentIdx >= totalLessons - 1}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {currentLesson && (
            <div className="mx-auto max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                {currentLesson.description && <p className="mt-2 text-sm text-gray-600">{currentLesson.description}</p>}
                <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(currentLesson.duration_minutes)}</span>
                  {currentProgress?.completed && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Completed</span>}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Learning Materials</h2>
                {currentMaterials.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-gray-400">No materials for this lesson yet.</Card>
                ) : (
                  currentMaterials.map((mat) => (
                    <Card key={mat.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            {materialIcon(mat.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{mat.title}</p>
                            {mat.description && <p className="text-xs text-gray-500">{mat.description}</p>}
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <span className="rounded bg-gray-100 px-1.5 py-0.5">{mat.type.replace(/_/g, ' ')}</span>
                              {mat.file_size_bytes ? <span>{formatFileSize(mat.file_size_bytes)}</span> : null}
                            </div>
                          </div>
                        </div>
                        <div>
                          {mat.type === 'EXTERNAL_LINK' ? (
                            <a href={mat.external_url || '#'} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline"><LinkIcon className="h-4 w-4" /> Open Link</Button>
                            </a>
                          ) : mat.type === 'VIDEO' ? (
                            <Button size="sm"><Play className="h-4 w-4" /> Play</Button>
                          ) : (
                            <a href={mat.s3_url || '#'} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="outline"><Download className="h-4 w-4" /> Download</Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Mark as complete */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <Button
                  variant={currentProgress?.completed ? 'outline' : 'success'}
                  onClick={handleMarkComplete}
                  disabled={currentProgress?.completed}
                >
                  <CheckCircle2 className="h-4 w-4" /> {currentProgress?.completed ? 'Completed' : 'Mark as Complete'}
                </Button>
                {courseProgress?.progress_percentage === 100 && (
                  <Link to={`/student/courses/${courseId}/certificate`}>
                    <Button variant="outline"><Award className="h-4 w-4" /> View Certificate</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
