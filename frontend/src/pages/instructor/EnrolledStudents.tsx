import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, UserX, Users } from 'lucide-react';
import { courseApi, enrollmentApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, Table, StatusBadge, ProgressBar, Modal, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { Enrollment } from '@/types';

export function EnrolledStudents() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: enrollments, loading, refetch } = useAsync(() => enrollmentApi.list({ courseId }), [courseId]);
  const [removeModal, setRemoveModal] = useState<Enrollment | null>(null);

  const handleRemove = async () => {
    if (removeModal) {
      await enrollmentApi.remove(removeModal.id);
      setRemoveModal(null);
      refetch();
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Link to={courseId ? `/instructor/courses/${courseId}` : '/instructor/dashboard'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
        <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardBody><p className="text-sm text-gray-500">Total Students</p><p className="mt-1 text-2xl font-bold text-gray-900">{enrollments?.length || 0}</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Avg. Progress</p><p className="mt-1 text-2xl font-bold text-gray-900">{enrollments && enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (e.progress_percentage || 0), 0) / enrollments.length) : 0}%</p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-gray-500">Certificates Issued</p><p className="mt-1 text-2xl font-bold text-gray-900">{enrollments?.filter((e) => e.certificate_status === 'ISSUED').length || 0}</p></CardBody></Card>
      </div>

      <Card>
        {(!enrollments || enrollments.length === 0) ? (
          <EmptyState icon={<Users className="h-12 w-12" />} title="No enrolled students" message="Students will appear here after their enrollment requests are approved." />
        ) : (
          <Table
            columns={[
              { key: 'student_name', header: 'Student Name', render: (e: Enrollment) => <span className="font-medium text-gray-900">{e.student_name}</span> },
              { key: 'enrolled_at', header: 'Enrollment Date', render: (e: Enrollment) => formatDate(e.enrolled_at) },
              { key: 'progress', header: 'Progress', render: (e: Enrollment) => <ProgressBar value={e.progress_percentage || 0} size="sm" showLabel className="w-32" /> },
              { key: 'assignment_status', header: 'Assignment', render: (e: Enrollment) => <StatusBadge status={e.assignment_status || 'NOT_SUBMITTED'} /> },
              { key: 'quiz_score', header: 'Quiz Score', render: (e: Enrollment) => e.quiz_score !== null && e.quiz_score !== undefined ? `${e.quiz_score}%` : '—' },
              { key: 'certificate_status', header: 'Certificate', render: (e: Enrollment) => <StatusBadge status={e.certificate_status || 'NOT_ELIGIBLE'} /> },
              {
                key: 'actions', header: 'Actions', render: (e: Enrollment) => (
                  <div className="flex items-center gap-2">
                    <Link to={`/instructor/courses/${courseId}/students/${e.student_id}`}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /> View</Button></Link>
                    <Button size="sm" variant="ghost" onClick={() => setRemoveModal(e)}><UserX className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ),
              },
            ]}
            data={enrollments}
          />
        )}
      </Card>

      <Modal open={!!removeModal} onClose={() => setRemoveModal(null)} title="Remove Student" footer={<><Button variant="outline" onClick={() => setRemoveModal(null)}>Cancel</Button><Button variant="danger" onClick={handleRemove}>Remove</Button></>}>
        <p className="text-sm text-gray-600">Are you sure you want to remove <span className="font-semibold">{removeModal?.student_name}</span> from this course? Their enrollment, progress, and submissions will be affected.</p>
      </Modal>
    </div>
  );
}
