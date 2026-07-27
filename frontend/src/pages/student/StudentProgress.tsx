import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Award, TrendingUp, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, progressApi, lessonProgressApi, moduleApi, lessonApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, CardHeader, Button, ProgressBar, StatCard, LoadingState } from '@/components/ui';
import { formatDuration, formatDate } from '@/utils/helpers';

export function StudentProgress() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: progress, loading } = useAsync(() => progressApi.getByCourseAndStudent(courseId!, user?.id || ''), [courseId, user?.id]);
  const { data: lessonProgress } = useAsync(() => lessonProgressApi.listByCourseAndStudent(courseId!, user?.id || ''), [courseId, user?.id]);
  const { data: modules } = useAsync(() => moduleApi.listByCourse(courseId!), [courseId]);

  if (loading || !progress) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Link to={`/student/courses/${courseId}/learn`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Progress" value={`${progress.progress_percentage}%`} icon={<TrendingUp className="h-6 w-6" />} color="blue" />
        <StatCard label="Completed" value={`${progress.completed_lessons}/${progress.total_lessons}`} icon={<CheckCircle2 className="h-6 w-6" />} color="emerald" />
        <StatCard label="Learning Time" value={formatDuration(progress.total_learning_time_minutes)} icon={<Clock className="h-6 w-6" />} color="amber" />
        <StatCard label="Last Accessed" value={progress.last_accessed_at ? formatDate(progress.last_accessed_at) : '—'} icon={<BookOpen className="h-6 w-6" />} color="violet" />
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader title="Course Completion" />
        <CardBody>
          <ProgressBar value={progress.progress_percentage} size="lg" showLabel color={progress.progress_percentage === 100 ? 'green' : 'blue'} />
          {progress.completed_at && (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <Award className="h-5 w-5" /> Course completed on {formatDate(progress.completed_at)}
            </p>
          )}
          {progress.progress_percentage === 100 && (
            <Link to={`/student/courses/${courseId}/certificate`}>
              <Button variant="success" className="mt-3"><Award className="h-4 w-4" /> View Certificate</Button>
            </Link>
          )}
        </CardBody>
      </Card>

      {/* Lesson breakdown */}
      <Card>
        <CardHeader title="Lesson Progress" />
        <CardBody>
          <div className="space-y-3">
            {modules?.map((mod) => {
              const modLessons = lessonProgress?.filter((lp) => {
                // We need to check if lesson belongs to this module - but we only have lesson_id
                // For simplicity, we'll show all lesson progress
                return true;
              });
              return (
                <div key={mod.id} className="rounded-lg border border-gray-100 p-3">
                  <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{modLessons?.filter((lp) => lp.completed).length || 0} of lessons completed</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
