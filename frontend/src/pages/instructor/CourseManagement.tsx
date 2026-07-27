import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Eye, Pencil, Copy, Globe, Archive, Trash2, BookOpen, MoreVertical, Upload,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi } from '@/services/api';
import { mockInstructorProfiles } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Button, Card, StatusBadge, Modal, Input, EmptyState, LoadingState } from '@/components/ui';
import { formatDate, formatPrice, classNames } from '@/utils/helpers';
import type { Course, CourseStatus } from '@/types';

export function CourseManagement() {
  const { user } = useAuth();
  const instructorProfile = mockInstructorProfiles.find((p) => p.user_id === user?.id);

  const { data: courses, loading, refetch } = useAsync(() => courseApi.list({ instructorId: instructorProfile?.id }), [instructorProfile?.id]);
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<Course | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  const filtered = (courses || []).filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = async (course: Course, status: CourseStatus) => {
    await courseApi.updateStatus(course.id, status);
    setActionMenu(null);
    refetch();
  };

  const handleDuplicate = async (course: Course) => {
    await courseApi.duplicate(course.id);
    setActionMenu(null);
    refetch();
  };

  const handleDelete = async () => {
    if (deleteModal) {
      await courseApi.delete(deleteModal.id);
      setDeleteModal(null);
      refetch();
    }
  };

  const statusTabs: (CourseStatus | 'ALL')[] = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED', 'UNPUBLISHED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your courses, publish drafts, and track performance.</p>
        </div>
        <Link to="/instructor/courses/create">
          <Button><Plus className="h-4 w-4" /> Create Course</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={classNames(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === tab ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {tab === 'ALL' ? 'All Courses' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-64"
        />
      </div>

      {/* Course grid */}
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-12 w-12" />}
            title="No courses found"
            message="Create a new course or adjust your filters."
            action={<Link to="/instructor/courses/create"><Button><Plus className="h-4 w-4" /> Create Course</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative h-40 bg-gray-200">
                {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
                <div className="absolute right-2 top-2"><StatusBadge status={course.status} /></div>
              </div>
              <div className="p-4">
                <p className="line-clamp-1 text-base font-semibold text-gray-900">{course.title}</p>
                <p className="mt-1 text-xs text-gray-500">{course.category_name}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{course.enrollment_count} students</span>
                  <span className="font-semibold text-gray-900">{formatPrice(course.price)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">Created {formatDate(course.created_at)}</p>

                <div className="mt-4 flex items-center gap-2">
                  <Link to={`/instructor/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Eye className="h-4 w-4" /> View</Button>
                  </Link>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Pencil className="h-4 w-4" /> Edit</Button>
                  </Link>
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => setActionMenu(actionMenu === course.id ? null : course.id)}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {actionMenu === course.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <Link to={`/instructor/courses/${course.id}/builder`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Upload className="h-4 w-4" /> Course Builder
                          </Link>
                          {course.status === 'PUBLISHED' ? (
                            <button onClick={() => handleStatusChange(course, 'UNPUBLISHED')} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <Globe className="h-4 w-4" /> Unpublish
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(course, 'PUBLISHED')} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <Globe className="h-4 w-4" /> Publish
                            </button>
                          )}
                          <button onClick={() => handleStatusChange(course, 'ARCHIVED')} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Archive className="h-4 w-4" /> Archive
                          </button>
                          <button onClick={() => handleDuplicate(course)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Copy className="h-4 w-4" /> Duplicate
                          </button>
                          <button onClick={() => { setDeleteModal(course); setActionMenu(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Course"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">"{deleteModal?.title}"</span>? This action cannot be undone. All modules, lessons, materials, assignments, and quizzes associated with this course will be removed.
        </p>
      </Modal>
    </div>
  );
}
