import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Upload, Users, ClipboardList, FileText, FileQuestion, Video,
  BarChart3, BookOpen, Clock, Tag as TagIcon,
} from 'lucide-react';
import { courseApi, moduleApi, assignmentApi, quizApi, meetingApi, reviewApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardHeader, CardBody, Button, StatusBadge, StarRating, LoadingState } from '@/components/ui';
import { formatDate, formatPrice, formatDuration } from '@/utils/helpers';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, loading } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: modules } = useAsync(() => moduleApi.listByCourse(courseId!), [courseId]);
  const { data: assignments } = useAsync(() => assignmentApi.listByCourse(courseId!), [courseId]);
  const { data: quizzes } = useAsync(() => quizApi.listByCourse(courseId!), [courseId]);
  const { data: meetings } = useAsync(() => meetingApi.listByCourse(courseId!), [courseId]);
  const { data: reviews } = useAsync(() => reviewApi.listByCourse(courseId!), [courseId]);

  if (loading || !course) return <LoadingState />;

  const tabs = [
    { to: `/instructor/courses/${courseId}/builder`, label: 'Course Builder', icon: <Upload className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/edit`, label: 'Edit Details', icon: <Pencil className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/enrollments`, label: 'Enrollment Requests', icon: <ClipboardList className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/students`, label: 'Enrolled Students', icon: <Users className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/assignments`, label: 'Assignments', icon: <FileText className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/quizzes`, label: 'Quizzes', icon: <FileQuestion className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/meetings`, label: 'Live Classes', icon: <Video className="h-4 w-4" /> },
    { to: `/instructor/courses/${courseId}/analytics`, label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <Link to="/instructor/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      {/* Course header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="h-48 w-full bg-gray-200 lg:h-auto lg:w-64">
            {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={course.status} />
                  <span className="text-sm text-gray-500">{course.category_name}</span>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="mt-1 text-sm text-gray-500">{course.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{formatPrice(course.price)}</p>
                <StarRating rating={course.average_rating || 0} showValue reviewCount={course.review_count || 0} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollment_count || 0} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {modules?.length || 0} modules</span>
              <span>Created {formatDate(course.created_at)}</span>
            </div>
            {course.tags && course.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                    <TagIcon className="h-3 w-3" /> {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link key={tab.to} to={tab.to}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {tab.icon} {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardBody><p className="text-sm text-gray-500">Modules</p><p className="mt-1 text-2xl font-bold text-gray-900">{modules?.length || 0}</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Assignments</p><p className="mt-1 text-2xl font-bold text-gray-900">{assignments?.length || 0}</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Quizzes</p><p className="mt-1 text-2xl font-bold text-gray-900">{quizzes?.length || 0}</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Live Classes</p><p className="mt-1 text-2xl font-bold text-gray-900">{meetings?.length || 0}</p></CardBody></Card>
      </div>

      {/* Curriculum preview */}
      <Card>
        <CardHeader title="Course Curriculum" subtitle="Modules and lessons" />
        <CardBody>
          {(!modules || modules.length === 0) ? (
            <p className="text-sm text-gray-400">No modules yet. Use the Course Builder to add content.</p>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                return (
                  <div key={mod.id} className="rounded-lg border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-900">{mod.display_order}. {mod.name}</p>
                    {mod.description && <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Reviews preview */}
      <Card>
        <CardHeader title="Course Reviews" subtitle={`${reviews?.length || 0} reviews`} />
        <CardBody>
          {(!reviews || reviews.length === 0) ? (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev.id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{rev.student_name}</p>
                    <StarRating rating={rev.rating} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
