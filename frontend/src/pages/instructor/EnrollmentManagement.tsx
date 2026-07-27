import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollmentRequestApi, courseApi } from '@/services/api';
import { mockInstructorProfiles } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, Table, StatusBadge, Modal, Textarea, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { EnrollmentRequest } from '@/types';

export function EnrollmentManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const instructorProfile = mockInstructorProfiles.find((p) => p.user_id === user?.id);

  const { data: requests, loading, refetch } = useAsync(
    () => enrollmentRequestApi.list({ instructorId: instructorProfile?.id, courseId }),
    [instructorProfile?.id, courseId],
  );
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectModal, setRejectModal] = useState<EnrollmentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = (requests || []).filter((r) => statusFilter === 'ALL' || r.status === statusFilter);

  const handleApprove = async (id: string) => {
    await enrollmentRequestApi.approve(id);
    refetch();
  };

  const handleReject = async () => {
    if (rejectModal) {
      await enrollmentRequestApi.reject(rejectModal.id, rejectReason);
      setRejectModal(null);
      setRejectReason('');
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
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Requests</h1>
        <p className="mt-1 text-sm text-gray-500">{course ? course.title : 'All your courses'}</p>
      </div>

      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No enrollment requests" message="Enrollment requests will appear here when students apply." />
        ) : (
          <Table
            columns={[
              { key: 'student_name', header: 'Student Name', render: (r: EnrollmentRequest) => <span className="font-medium text-gray-900">{r.student_name}</span> },
              { key: 'student_email', header: 'Email' },
              { key: 'course_title', header: 'Course' },
              { key: 'requested_at', header: 'Request Date', render: (r: EnrollmentRequest) => formatDate(r.requested_at) },
              { key: 'status', header: 'Status', render: (r: EnrollmentRequest) => <StatusBadge status={r.status} /> },
              {
                key: 'actions', header: 'Actions', render: (r: EnrollmentRequest) => (
                  <div className="flex items-center gap-2">
                    {r.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleApprove(r.id)}><Check className="h-4 w-4" /> Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setRejectModal(r); setRejectReason(''); }}><X className="h-4 w-4" /> Reject</Button>
                      </>
                    )}
                    {r.status === 'REJECTED' && r.rejection_reason && (
                      <span className="text-xs text-gray-500">{r.rejection_reason}</span>
                    )}
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </Card>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Enrollment Request" footer={<><Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button><Button variant="danger" onClick={handleReject}>Reject</Button></>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">You are about to reject the enrollment request from <span className="font-semibold">{rejectModal?.student_name}</span> for <span className="font-semibold">{rejectModal?.course_title}</span>.</p>
          <Textarea label="Rejection Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Provide a reason for rejection (stored in enrollment_requests.rejection_reason)" />
        </div>
      </Modal>
    </div>
  );
}
