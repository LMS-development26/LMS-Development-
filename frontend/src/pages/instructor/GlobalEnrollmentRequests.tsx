import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ClipboardList, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollmentRequestApi, authApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, Table, StatusBadge, Modal, Textarea, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { EnrollmentRequest } from '@/types';

export function GlobalEnrollmentRequests() {
  const { user } = useAuth();
  const { data: instructorProfile } = useAsync(() => user?.id ? authApi.getInstructorProfile(user.id) : Promise.resolve(null), [user?.id]);

  const { data: requests, loading, refetch } = useAsync(
    () => enrollmentRequestApi.listByInstructor(),
    []
  );

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [rejectModal, setRejectModal] = useState<EnrollmentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Get unique courses from requests
  const courses = requests ? [...new Set(requests.map(r => r.course_title))] : [];

  const filtered = (requests || []).filter((r) => {
    const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
    const courseMatch = courseFilter === 'ALL' || r.course_title === courseFilter;
    return statusMatch && courseMatch;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Manage enrollment requests across all your courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {courses.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
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
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{requests?.length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">{requests?.filter(r => r.status === 'PENDING').length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{requests?.filter(r => r.status === 'APPROVED').length || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{requests?.filter(r => r.status === 'REJECTED').length || 0}</p>
          </div>
        </Card>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-12 w-12" />}
            title="No enrollment requests"
            message="Enrollment requests will appear here when students apply to your courses."
          />
        ) : (
          <Table
            columns={[
              { key: 'student_name', header: 'Student Name', render: (r: EnrollmentRequest) => <span className="font-medium text-gray-900">{r.student_name}</span> },
              { key: 'student_email', header: 'Email' },
              { key: 'course_title', header: 'Course', render: (r: EnrollmentRequest) => (
                <Link to={`/instructor/courses/${r.course_id}`} className="text-blue-600 hover:text-blue-700">
                  {r.course_title}
                </Link>
              )},
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

      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Enrollment Request"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleReject}>Reject</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to reject the enrollment request from <span className="font-semibold">{rejectModal?.student_name}</span> for <span className="font-semibold">{rejectModal?.course_title}</span>.
          </p>
          <Textarea
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Provide a reason for rejection"
          />
        </div>
      </Modal>
    </div>
  );
}
