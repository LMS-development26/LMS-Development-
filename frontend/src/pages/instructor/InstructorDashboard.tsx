import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, FileEdit, Archive, Users, ClipboardList, TrendingUp, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, enrollmentRequestApi, enrollmentApi } from '@/services/api';
import { mockInstructorProfiles } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { StatCard, Card, CardHeader, CardBody, Button, StatusBadge, ProgressBar, StarRating, EmptyState } from '@/components/ui';
import { formatDate, formatPrice } from '@/utils/helpers';
import type { Course } from '@/types';

export function InstructorDashboard() {
  const { user } = useAuth();
  const instructorProfile = mockInstructorProfiles.find((p) => p.user_id === user?.id);

  const { data: courses, loading: coursesLoading } = useAsync(() => courseApi.list({ instructorId: instructorProfile?.id }), [instructorProfile?.id]);
  const { data: pendingRequests } = useAsync(() => enrollmentRequestApi.list({ instructorId: instructorProfile?.id, status: 'PENDING' }), [instructorProfile?.id]);
  const { data: enrollments } = useAsync(() => enrollmentApi.list({}), []);

  const publishedCourses = courses?.filter((c) => c.status === 'PUBLISHED') || [];
  const draftCourses = courses?.filter((c) => c.status === 'DRAFT') || [];
  const archivedCourses = courses?.filter((c) => c.status === 'ARCHIVED') || [];
  const totalEnrollments = courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0;

  const recentCourses = [...(courses || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.first_name}. Here's what's happening with your courses.</p>
        </div>
        <Link to="/instructor/courses/create">
          <Button><Plus className="h-4 w-4" /> New Course</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Courses" value={courses?.length || 0} icon={<BookOpen className="h-6 w-6" />} color="blue" />
        <StatCard label="Published" value={publishedCourses.length} icon={<CheckCircle2 className="h-6 w-6" />} color="emerald" />
        <StatCard label="Drafts" value={draftCourses.length} icon={<FileEdit className="h-6 w-6" />} color="amber" />
        <StatCard label="Archived" value={archivedCourses.length} icon={<Archive className="h-6 w-6" />} color="gray" />
        <StatCard label="Total Enrollments" value={totalEnrollments} icon={<Users className="h-6 w-6" />} color="violet" />
        <StatCard label="Pending Requests" value={pendingRequests?.length || 0} icon={<ClipboardList className="h-6 w-6" />} color="red" />
      </div>

      {/* Recently Added Courses */}
      <Card>
        <CardHeader title="Recently Added Courses" action={<Link to="/instructor/courses"><Button variant="ghost" size="sm">View all</Button></Link>} />
        <CardBody>
          {coursesLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recentCourses.length === 0 ? (
            <EmptyState icon={<BookOpen className="h-12 w-12" />} title="No courses yet" message="Create your first course to get started." action={<Link to="/instructor/courses/create"><Button size="sm"><Plus className="h-4 w-4" /> Create Course</Button></Link>} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentCourses.map((course: Course) => (
                <Link key={course.id} to={`/instructor/courses/${course.id}`}>
                  <Card hover className="overflow-hidden">
                    <div className="h-32 w-full bg-gray-200">
                      {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-900">{course.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge status={course.status} />
                        <span className="text-xs text-gray-400">{formatPrice(course.price)}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Enrollment Requests */}
        <Card>
          <CardHeader title="Pending Enrollment Requests" action={<Link to="/instructor/enrollments"><Button variant="ghost" size="sm">View all</Button></Link>} />
          <CardBody>
            {(!pendingRequests || pendingRequests.length === 0) ? (
              <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No pending requests" />
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.student_name}</p>
                      <p className="text-xs text-gray-500">{req.course_title}</p>
                      <p className="text-xs text-gray-400">{formatDate(req.requested_at)}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Course Performance */}
        <Card>
          <CardHeader title="Course Performance" />
          <CardBody>
            {(!courses || courses.length === 0) ? (
              <EmptyState icon={<TrendingUp className="h-10 w-10" />} title="No data yet" />
            ) : (
              <div className="space-y-4">
                {courses.filter((c) => c.status === 'PUBLISHED').slice(0, 5).map((course) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between">
                      <Link to={`/instructor/courses/${course.id}/analytics`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-blue-600">
                        {course.title}
                      </Link>
                      <div className="flex items-center gap-3">
                        <StarRating rating={course.average_rating || 0} showValue />
                        <span className="text-xs text-gray-400">{course.enrollment_count} students</span>
                      </div>
                    </div>
                    <ProgressBar value={(course.enrollment_count || 0) / (totalEnrollments || 1) * 100} className="mt-1.5" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Student Engagement */}
      <Card>
        <CardHeader title="Student Engagement" subtitle="Enrollment activity across your courses" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(courses || []).filter((c) => c.status === 'PUBLISHED').map((course) => (
              <div key={course.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{course.title}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{course.enrollment_count} enrolled</span>
                  <StarRating rating={course.average_rating || 0} showValue reviewCount={course.review_count} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
