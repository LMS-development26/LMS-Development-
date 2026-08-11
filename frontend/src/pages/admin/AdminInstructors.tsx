import { GraduationCap, BadgeCheck, Mail } from 'lucide-react';
import { adminApi } from '@/services/api';
import { mockUsers } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Card, Table, StatusBadge, LoadingState, EmptyState } from '@/components/ui';
import type { InstructorProfile } from '@/types';

export function AdminInstructors() {
  const { data: instructors, loading } = useAsync(() => adminApi.listInstructors(), []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
        <p className="mt-1 text-sm text-gray-500">Manage instructor accounts and approvals.</p>
      </div>

      <Card>
        {(!instructors || instructors.length === 0) ? (
          <EmptyState icon={<GraduationCap className="h-12 w-12" />} title="No instructors" />
        ) : (
          <Table
            columns={[
              {
                key: 'name', header: 'Instructor', render: (i: InstructorProfile) => {
                  const user = mockUsers.find((u) => u.id === i.user_id);
                  return (
                    <div className="flex items-center gap-3">
                      {i.avatar_url && <img src={i.avatar_url} alt={user?.first_name} className="h-10 w-10 rounded-full" />}
                      <div>
                        <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                        <p className="flex items-center gap-1 text-xs text-gray-500"><Mail className="h-3 w-3" /> {user?.email}</p>
                      </div>
                    </div>
                  );
                },
              },
              { key: 'expertise', header: 'Expertise', render: (i: InstructorProfile) => <span className="text-gray-600">{i.expertise || '—'}</span> },
              { key: 'bio', header: 'Bio', render: (i: InstructorProfile) => <span className="line-clamp-1 text-gray-600">{i.bio || '—'}</span> },
              {
                key: 'verified', header: 'Status', render: (i: InstructorProfile) => (
                  <span className="flex items-center gap-1">
                    {i.verified ? <><BadgeCheck className="h-4 w-4 text-emerald-500" /> <span className="text-sm text-emerald-600">Verified</span></> : <StatusBadge status="PENDING" />}
                  </span>
                ),
              },
            ]}
            data={instructors}
          />
        )}
      </Card>
    </div>
  );
}
