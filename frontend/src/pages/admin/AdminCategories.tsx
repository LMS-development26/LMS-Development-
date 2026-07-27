import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { categoryApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, Table, Modal, Input, Textarea, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { CourseCategory } from '@/types';

export function AdminCategories() {
  const { data: categories, loading, refetch } = useAsync(() => categoryApi.list(), []);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CourseCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteModal, setDeleteModal] = useState<CourseCategory | null>(null);

  const openModal = (cat?: CourseCategory) => {
    if (cat) { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); }
    else { setEditing(null); setForm({ name: '', description: '' }); }
    setModal(true);
  };

  const save = async () => {
    if (editing) { await categoryApi.update(editing.id, form); }
    else { await categoryApi.create(form); }
    setModal(false);
    refetch();
  };

  const handleDelete = async () => {
    if (deleteModal) { await categoryApi.delete(deleteModal.id); setDeleteModal(null); refetch(); }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Categories</h1>
          <p className="mt-1 text-sm text-gray-500">Manage course categories used across the platform.</p>
        </div>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <Card>
        {(!categories || categories.length === 0) ? (
          <EmptyState icon={<FolderTree className="h-12 w-12" />} title="No categories" message="Create categories for courses to be organized into." action={<Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Add Category</Button>} />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Name', render: (c: CourseCategory) => <span className="font-medium text-gray-900">{c.name}</span> },
              { key: 'description', header: 'Description', render: (c: CourseCategory) => <span className="text-gray-600">{c.description || '—'}</span> },
              { key: 'created_at', header: 'Created', render: (c: CourseCategory) => formatDate(c.created_at) },
              {
                key: 'actions', header: 'Actions', render: (c: CourseCategory) => (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openModal(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteModal(c)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ),
              },
            ]}
            data={categories}
          />
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'} footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Web Development" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Category" footer={<><Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Delete</Button></>}>
        <p className="text-sm text-gray-600">Are you sure you want to delete <span className="font-semibold">{deleteModal?.name}</span>? Courses in this category may be affected.</p>
      </Modal>
    </div>
  );
}
