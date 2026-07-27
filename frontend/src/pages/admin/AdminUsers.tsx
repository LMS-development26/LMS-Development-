import { useState } from 'react';
import { Users, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, Table, StatusBadge, Modal, Input, Select, LoadingState, EmptyState } from '@/components/ui';
import { formatDate, initials } from '@/utils/helpers';
import type { User } from '@/types';

export function AdminUsers() {
  const { data: users, loading, refetch } = useAsync(() => adminApi.listUsers(), []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [roleModal, setRoleModal] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const filtered = (users || []).filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search && !`${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async () => {
    if (deleteModal) { await adminApi.deleteUser(deleteModal.id); setDeleteModal(null); refetch(); }
  };

  const handleRoleChange = async () => {
    if (roleModal && newRole) { await adminApi.updateUserRole(roleModal.id, newRole as User['role']); setRoleModal(null); refetch(); }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
        <p className="mt-1 text-sm text-gray-500">Manage all users on the platform.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="sm:w-48">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="STUDENT">Student</option>
        </Select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={<Users className="h-12 w-12" />} title="No users found" />
        ) : (
          <Table
            columns={[
              {
                key: 'name', header: 'User', render: (u: User) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">{initials(u.first_name, u.last_name)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'role', header: 'Role', render: (u: User) => <StatusBadge status={u.role} /> },
              { key: 'created_at', header: 'Joined', render: (u: User) => formatDate(u.created_at) },
              {
                key: 'actions', header: 'Actions', render: (u: User) => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setRoleModal(u); setNewRole(u.role); }}>Change Role</Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteModal(u)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </Card>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User" footer={<><Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Delete</Button></>}>
        <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold">{deleteModal?.first_name} {deleteModal?.last_name}</span>? This action cannot be undone.</p>
      </Modal>

      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Change User Role" footer={<><Button variant="outline" onClick={() => setRoleModal(null)}>Cancel</Button><Button onClick={handleRoleChange}>Save</Button></>}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Change role for <span className="font-semibold">{roleModal?.first_name} {roleModal?.last_name}</span></p>
          <Select label="New Role" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Student</option>
          </Select>
        </div>
      </Modal>
    </div>
  );
}
