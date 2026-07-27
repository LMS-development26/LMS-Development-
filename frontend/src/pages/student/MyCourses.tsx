import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, Play, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollmentApi, progressApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, ProgressBar, StarRating, LoadingState, EmptyState } from '@/components/ui';
import { formatDuration, formatDate } from '@/utils/helpers';

export function MyCourses() {
  const { user } = useAuth();

  const { data: enrolledCourses, loading } = useAsync(() => enrollmentApi.getStudentCourses(user?.id || ''), [user?.id]);
  const { data: progress } = useAsync(() => progressApi.listByStudent(user?.id || ''), [user?.id]);

  const getProgress = (courseId: string) => progress?.find((p) => p.course_id === courseId);

  const inProgress = enrolledCourses?.filter((c) => {
    const p = getProgress(c.id);
    return p && p.progress_percentage < 100;
  }) || [];
  const completed = enrolledCourses?.filter((c) => {
    const p = getProgress(c.id);
    return p && p.progress_percentage === 100;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-500">Continue where you left off or explore new content.</p>
      </div>

      {loading ? (
        <LoadingState />
      ) : (!enrolledCourses || enrolledCourses.length === 0) ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No enrolled courses"
            message="Browse courses and request enrollment to start learning."
            action={<Link to="/student/courses"><Button>Browse Courses</Button></Link>}
          />
        </Card>
      ) : (
        <>
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">In Progress</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((course) => {
                  const p = getProgress(course.id);
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="h-32 w-full bg-gray-200">
                        {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
                      </div>
                      <CardBody>
                        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{course.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{p?.progress_percentage || 0}%</span>
                          </div>
                          <ProgressBar value={p?.progress_percentage || 0} size="sm" className="mt-1" />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                          <span>{p?.completed_lessons || 0}/{p?.total_lessons || 0} lessons</span>
                          <span>{formatDuration(p?.total_learning_time_minutes)}</span>
                        </div>
                        <Link to={`/student/courses/${course.id}/learn`}>
                          <Button size="sm" className="mt-3 w-full"><Play className="h-4 w-4" /> Continue Learning</Button>
                        </Link>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Completed</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((course) => {
                  const p = getProgress(course.id);
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="h-32 w-full bg-gray-200">
                        {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
                      </div>
                      <CardBody>
                        <div className="flex items-center gap-2">
                          <h3 className="line-clamp-1 flex-1 text-base font-semibold text-gray-900">{course.title}</h3>
                          <Award className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
                        <p className="mt-2 text-xs text-gray-400">Completed {p?.completed_at ? formatDate(p.completed_at) : ''}</p>
                        <div className="mt-3 flex gap-2">
                          <Link to={`/student/courses/${course.id}/learn`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">Review</Button>
                          </Link>
                          <Link to={`/student/courses/${course.id}/certificate`} className="flex-1">
                            <Button size="sm" variant="success" className="w-full"><Award className="h-4 w-4" /> Certificate</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
