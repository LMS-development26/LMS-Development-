import { Link } from 'react-router-dom';
import { BookOpen, Play, Award } from 'lucide-react';
import { enrollmentApi, progressApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, ProgressBar, LoadingState, EmptyState } from '@/components/ui';
import { formatDuration, formatDate } from '@/utils/helpers';

interface EnrolledCourse {
  id: string;
  course_id: string;
  title?: string;
  course_title?: string;
  thumbnail_url?: string;
  instructor_name?: string;
  progress_percentage?: number;
  completion_date?: string;
}

export function MyCourses() {
  const { data: enrolledCourses, loading, error } = useAsync(
    () => enrollmentApi.listMyCourses(),
    [],
  );
  const { data: progress } = useAsync(() => progressApi.getMyProgress(), []);

  const getCourseTitle = (course: EnrolledCourse) => course.title || course.course_title || 'Untitled Course';

  const getProgress = (courseId: string) => {
    const fromEnrollment = enrolledCourses?.find((c) => c.course_id === courseId);
    const fromProgress = progress?.find((p) => p.course_id === courseId);
    return {
      progress_percentage: fromProgress?.progress_percentage ?? fromEnrollment?.progress_percentage ?? 0,
      completion_date: fromProgress?.completion_date ?? fromEnrollment?.completion_date,
      completed_lessons: fromProgress?.completed_lessons ?? 0,
      total_lessons: fromProgress?.total_lessons ?? 0,
      total_learning_time: fromProgress?.total_learning_time ?? 0,
    };
  };

  const inProgress = enrolledCourses?.filter((c) => {
    const p = getProgress(c.course_id);
    return p.progress_percentage < 100;
  }) || [];

  const completed = enrolledCourses?.filter((c) => {
    const p = getProgress(c.course_id);
    return p.progress_percentage >= 100;
  }) || [];

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <Card>
          <EmptyState icon={<BookOpen className="h-12 w-12" />} title="Unable to load courses" message={error} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="mt-1 text-sm text-gray-500">Your enrolled courses only.</p>
      </div>

      {(!enrolledCourses || enrolledCourses.length === 0) ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No enrolled courses"
            message="Browse courses and enroll to start learning."
            action={<Link to="/student/courses"><Button>Browse Courses</Button></Link>}
          />
        </Card>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">In Progress</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((course) => {
                  const p = getProgress(course.course_id);
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="h-32 w-full bg-gray-200">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt={getCourseTitle(course)} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <CardBody>
                        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{getCourseTitle(course)}</h3>
                        <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{p.progress_percentage}%</span>
                          </div>
                          <ProgressBar value={p.progress_percentage} size="sm" className="mt-1" />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                          <span>{p.completed_lessons}/{p.total_lessons} lessons</span>
                          <span>{formatDuration(p.total_learning_time)}</span>
                        </div>
                        <Link to={`/student/courses/${course.course_id}/learn`}>
                          <Button size="sm" className="mt-3 w-full"><Play className="h-4 w-4" /> Continue Learning</Button>
                        </Link>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Completed</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((course) => {
                  const p = getProgress(course.course_id);
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="h-32 w-full bg-gray-200">
                        {course.thumbnail_url && (
                          <img src={course.thumbnail_url} alt={getCourseTitle(course)} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <CardBody>
                        <div className="flex items-center gap-2">
                          <h3 className="line-clamp-1 flex-1 text-base font-semibold text-gray-900">{getCourseTitle(course)}</h3>
                          <Award className="h-5 w-5 text-emerald-500" />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          Completed {p.completion_date ? formatDate(p.completion_date) : ''}
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Link to={`/student/courses/${course.course_id}/learn`} className="flex-1">
                            <Button size="sm" variant="outline" className="w-full">Review</Button>
                          </Link>
                          <Link to={`/student/courses/${course.course_id}/certificate`} className="flex-1">
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
