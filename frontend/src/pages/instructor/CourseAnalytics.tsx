import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, TrendingUp, Star, Award, FileText, FileQuestion, Video, BarChart3,
} from 'lucide-react';
import { courseApi, enrollmentApi, assignmentApi, quizApi, meetingApi, reviewApi, quizResultApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardHeader, CardBody, StatCard, ProgressBar, StarRating, LoadingState } from '@/components/ui';
import { formatPrice } from '@/utils/helpers';

export function CourseAnalytics() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, loading } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: enrollments } = useAsync(() => enrollmentApi.list({ courseId }), [courseId]);
  const { data: assignments } = useAsync(() => assignmentApi.listByCourse(courseId!), [courseId]);
  const { data: quizzes } = useAsync(() => quizApi.listByCourse(courseId!), [courseId]);
  const { data: meetings } = useAsync(() => meetingApi.listByCourse(courseId!), [courseId]);
  const { data: reviews } = useAsync(() => reviewApi.listByCourse(courseId!), [courseId]);

  if (loading || !course) return <LoadingState />;

  const totalEnrollments = enrollments?.length || 0;
  const avgProgress = totalEnrollments > 0 ? Math.round(enrollments!.reduce((s, e) => s + (e.progress_percentage || 0), 0) / totalEnrollments) : 0;
  const completedCount = enrollments?.filter((e) => (e.progress_percentage || 0) === 100).length || 0;
  const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;
  const revenue = totalEnrollments * course.price;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews?.filter((r) => r.rating === star).length || 0,
  }));

  return (
    <div className="space-y-6">
      <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">{course.title}</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={totalEnrollments} icon={<Users className="h-6 w-6" />} color="blue" />
        <StatCard label="Avg. Progress" value={`${avgProgress}%`} icon={<TrendingUp className="h-6 w-6" />} color="emerald" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={<Award className="h-6 w-6" />} color="violet" />
        <StatCard label="Revenue" value={formatPrice(revenue)} icon={<BarChart3 className="h-6 w-6" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progress distribution */}
        <Card>
          <CardHeader title="Student Progress Distribution" />
          <CardBody>
            <div className="space-y-3">
              {[
                { label: '0-25%', count: enrollments?.filter((e) => (e.progress_percentage || 0) <= 25).length || 0, color: 'bg-red-500' },
                { label: '26-50%', count: enrollments?.filter((e) => (e.progress_percentage || 0) > 25 && (e.progress_percentage || 0) <= 50).length || 0, color: 'bg-amber-500' },
                { label: '51-75%', count: enrollments?.filter((e) => (e.progress_percentage || 0) > 50 && (e.progress_percentage || 0) <= 75).length || 0, color: 'bg-blue-500' },
                { label: '76-99%', count: enrollments?.filter((e) => (e.progress_percentage || 0) > 75 && (e.progress_percentage || 0) < 100).length || 0, color: 'bg-emerald-500' },
                { label: '100%', count: completedCount, color: 'bg-emerald-600' },
              ].map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{bucket.label}</span>
                    <span className="font-medium text-gray-900">{bucket.count} students</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                    <div className={`h-2 rounded-full ${bucket.color} transition-all`} style={{ width: `${totalEnrollments > 0 ? (bucket.count / totalEnrollments) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Rating distribution */}
        <Card>
          <CardHeader title="Rating Distribution" subtitle={`${reviews?.length || 0} reviews`} />
          <CardBody>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{course.average_rating?.toFixed(1) || '0.0'}</p>
                <StarRating rating={course.average_rating || 0} size="md" />
                <p className="mt-1 text-xs text-gray-500">{reviews?.length || 0} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDistribution.map((r) => (
                  <div key={r.star} className="flex items-center gap-2">
                    <span className="w-12 text-sm text-gray-500">{r.star} star</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${reviews?.length ? (r.count / reviews.length) * 100 : 0}%` }} />
                    </div>
                    <span className="w-8 text-sm text-gray-600">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Content overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assignments" value={assignments?.length || 0} icon={<FileText className="h-6 w-6" />} color="blue" />
        <StatCard label="Quizzes" value={quizzes?.length || 0} icon={<FileQuestion className="h-6 w-6" />} color="amber" />
        <StatCard label="Live Classes" value={meetings?.length || 0} icon={<Video className="h-6 w-6" />} color="violet" />
        <StatCard label="Certificates Issued" value={enrollments?.filter((e) => e.certificate_status === 'ISSUED').length || 0} icon={<Award className="h-6 w-6" />} color="emerald" />
      </div>

      {/* Assignment performance */}
      {assignments && assignments.length > 0 && (
        <Card>
          <CardHeader title="Assignment Performance" />
          <CardBody>
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-500">Max marks: {a.max_marks}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Submissions: {enrollments?.filter((e) => e.assignment_status !== 'NOT_SUBMITTED').length || 0}</span>
                    <span className="text-gray-500">Graded: {enrollments?.filter((e) => e.assignment_status === 'GRADED').length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quiz performance */}
      {quizzes && quizzes.length > 0 && (
        <Card>
          <CardHeader title="Quiz Performance" />
          <CardBody>
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{q.title}</p>
                    <p className="text-xs text-gray-500">Pass: {q.passing_percentage}% | {q.question_count || 0} questions</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Attempts: {q.attempt_limit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
