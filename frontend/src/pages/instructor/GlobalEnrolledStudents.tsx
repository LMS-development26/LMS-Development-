import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, UserX, Users, Filter, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollmentApi, authApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, Table, StatusBadge, ProgressBar, Modal, LoadingState, EmptyState, Input } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { Enrollment } from '@/types';

export function GlobalEnrolledStudents() {
  const { user } = useAuth();
  const { data: instructorProfile } = useAsync(() => user?.id ? authApi.getInstructorProfile(user.id) : Promise.resolve(null), [user?.id]);

  const { data: enrollments, loading, refetch } = useAsync(
    () => enrollmentApi.listByInstructor(),
    []
  );

  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [removeModal, setRemoveModal] = useState<Enrollment | null>(null);

  // Get unique courses from enrollments
  const courses = enrollments ? [...new Set(enrollments.map(e => e.course_title))] : [];

  const filtered = (enrollments || []).filter((e) => {
    const courseMatch = courseFilter === 'ALL' || e.course_title === courseFilter;
    const searchMatch = !searchQuery || 
      e.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.student_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return courseMatch && searchMatch;
  });

  const handleRemove = async () => {
    if (removeModal) {
      await enrollmentApi.delete(removeModal.id);
      setRemoveModal(null);
      refetch();
    }
  };

  // Calculate stats
  const totalStudents = enrollments?.length || 0;
  const avgProgress = enrollments && enrollments.length > 0 
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percentage || 0), 0) / enrollments.length)
    : 0;
  const completedCount = enrollments?.filter((e) => e.progress_percentage === 100).length || 0;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
        <p className="mt-1 text-sm text-gray-500">Manage students across all your courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          {courses.length > 0 && (
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <option value="ALL">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-64"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalStudents}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Avg. Progress</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{avgProgress}%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{completedCount}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No enrolled students"
            message="Students will appear here after their enrollment requests are approved."
          />
        ) : (
          <Table
            columns={[
              { 
                key: 'student_name', 
                header: 'Student Name', 
                render: (e: Enrollment) => (
                  <div>
                    <span className="font-medium text-gray-900">{e.student_name}</span>
                    <p className="text-xs text-gray-500">{e.student_email}</p>
                  </div>
                )
              },
              { 
                key: 'course_title', 
                header: 'Course', 
                render: (e: Enrollment) => (
                  <Link to={`/instructor/courses/${e.course_id}`} className="text-blue-600 hover:text-blue-700">
                    {e.course_title}
                  </Link>
                )
              },
              { key: 'enrolled_at', header: 'Enrolled', render: (e: Enrollment) => formatDate(e.enrolled_at) },
              { 
                key: 'progress', 
                header: 'Progress', 
                render: (e: Enrollment) => (
                  <div className="w-32">
                    <ProgressBar value={e.progress_percentage || 0} size="sm" showLabel />
                  </div>
                )
              },
              { 
                key: 'status', 
                header: 'Status', 
                render: (e: Enrollment) => {
                  if (e.progress_percentage === 100) {
                    return <StatusBadge status="COMPLETED" />;
                  }
                  return <StatusBadge status="IN_PROGRESS" />;
                }
              },
              {
                key: 'actions', 
                header: 'Actions', 
                render: (e: Enrollment) => (
                  <div className="flex items-center gap-2">
                    <Link to={`/instructor/courses/${e.course_id}/students/${e.student_id}`}>
                      <Button size="sm" variant="outline"><Eye className="h-4 w-4" /> View</Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setRemoveModal(e)}
                    >
                      <UserX className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </Card>

      <Modal
        open={!!removeModal}
        onClose={() => setRemoveModal(null)}
        title="Remove Student"
        footer={
          <>
            <Button variant="outline" onClick={() => setRemoveModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRemove}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove <span className="font-semibold">{removeModal?.student_name}</span> from <span className="font-semibold">{removeModal?.course_title}</span>? 
          Their enrollment, progress, and submissions will be affected.
        </p>
      </Modal>
    </div>
  );
}
