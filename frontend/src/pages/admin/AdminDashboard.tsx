import { Link } from 'react-router-dom';
import {
  Users, BookOpen, GraduationCap, DollarSign, FolderTree, TrendingUp, Award,
} from 'lucide-react';
import { adminApi, categoryApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { StatCard, Card, CardHeader, CardBody, Button, LoadingState } from '@/components/ui';
import { formatPrice } from '@/utils/helpers';

export function AdminDashboard() {
  const { data: stats, loading } = useAsync(() => adminApi.getPlatformStats(), []);
  const { data: categories } = useAsync(() => categoryApi.list(), []);

  if (loading || !stats) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide overview and statistics.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} color="blue" />
        <StatCard label="Instructors" value={stats.totalInstructors} icon={<GraduationCap className="h-6 w-6" />} color="emerald" />
        <StatCard label="Students" value={stats.totalStudents} icon={<Users className="h-6 w-6" />} color="violet" />
        <StatCard label="Total Courses" value={stats.totalCourses} icon={<BookOpen className="h-6 w-6" />} color="amber" />
        <StatCard label="Published" value={stats.publishedCourses} icon={<TrendingUp className="h-6 w-6" />} color="emerald" />
        <StatCard label="Revenue" value={formatPrice(stats.totalRevenue)} icon={<DollarSign className="h-6 w-6" />} color="emerald" />
      </div>

      {/* Categories overview */}
      <Card>
        <CardHeader title="Course Categories" action={<Link to="/admin/categories"><Button variant="ghost" size="sm">Manage</Button></Link>} />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((cat) => (
              <div key={cat.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                </div>
                {cat.description && <p className="mt-1 text-xs text-gray-500">{cat.description}</p>}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/users">
          <Card hover className="p-5">
            <Users className="h-8 w-8 text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-gray-900">Manage Users</p>
            <p className="text-xs text-gray-500">View and manage all platform users</p>
          </Card>
        </Link>
        <Link to="/admin/instructors">
          <Card hover className="p-5">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-gray-900">Instructors</p>
            <p className="text-xs text-gray-500">Manage instructor accounts</p>
          </Card>
        </Link>
        <Link to="/admin/categories">
          <Card hover className="p-5">
            <FolderTree className="h-8 w-8 text-amber-600" />
            <p className="mt-3 text-sm font-semibold text-gray-900">Categories</p>
            <p className="text-xs text-gray-500">Manage course categories</p>
          </Card>
        </Link>
        <Link to="/admin/settings">
          <Card hover className="p-5">
            <Award className="h-8 w-8 text-violet-600" />
            <p className="mt-3 text-sm font-semibold text-gray-900">Settings</p>
            <p className="text-xs text-gray-500">Platform configuration</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
