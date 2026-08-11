import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Compass, BookOpen, Award, Bell, Menu, X, GraduationCap, LogOut,
  ChevronDown, User, Users, Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { initials, classNames, timeAgo } from '@/utils/helpers';
import { StatusBadge } from '@/components/ui/Badge';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: <Compass className="h-5 w-5" />, end: true },
  { to: '/student/courses', label: 'Browse Courses', icon: <BookOpen className="h-5 w-5" /> },
  { to: '/student/my-courses', label: 'My Courses', icon: <BookOpen className="h-5 w-5" /> },
  { to: '/student/certificate', label: 'Certificates', icon: <Award className="h-5 w-5" /> },
  { to: '/student/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: notifications } = useAsync(() => notificationApi.listByUser(user?.id || ''), [user?.id]);
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="min-h-screen bg-purple-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-purple-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={classNames(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-purple-200 transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-purple-200 px-6">
          <GraduationCap className="h-7 w-7 text-purple-600" />
          <span className="text-lg font-bold text-gray-900">LMS Learn</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => classNames(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-purple-50 hover:text-gray-900',
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-purple-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative rounded-lg p-2 text-gray-600 hover:bg-purple-100"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-purple-200 bg-white shadow-lg">
                    <div className="border-b border-purple-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications?.map((n) => (
                        <div key={n.id} className={classNames('border-b border-purple-50 px-4 py-3', !n.read && 'bg-purple-50/50')}>
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{n.message}</p>
                          <p className="mt-1 text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                        </div>
                      ))}
                      {(!notifications || notifications.length === 0) && (
                        <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-purple-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                  {user ? initials(user.first_name, user.last_name) : ''}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 lg:block">{user?.first_name} {user?.last_name}</span>
                <ChevronDown className="hidden h-4 w-4 text-gray-400 lg:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-purple-200 bg-white shadow-lg">
                    <div className="border-b border-purple-100 px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="mt-2"><StatusBadge status="STUDENT" /></div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { 
                          logout();
                          navigate('/instructor/login');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-purple-50"
                      >
                        <Users className="h-4 w-4" /> Switch to Instructor
                      </button>
                      <button
                        onClick={() => { 
                          logout();
                          navigate('/admin/login');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-purple-50"
                      >
                        <GraduationCap className="h-4 w-4" /> Switch to Admin
                      </button>
                      <hr className="my-2 border-purple-200" />
                      <button
                        onClick={() => { 
                          logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
