import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  PlayCircle,
  Calendar,
  AlertCircle,
  Activity,
  User,
  ArrowRight,
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { studentApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, ProgressBar, LoadingState, EmptyState, StatCard } from '@/components/ui';
import { formatDuration, formatDate, timeAgo } from '@/utils/helpers';

interface DashboardData {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overallProgressPercentage: number;
  recentActivities: Array<{
    id: string;
    activity_type: string;
    message: string;
    course_title?: string;
    created_at: string;
  }>;
  upcomingDeadlines: Array<{
    type: string;
    title: string;
    due_date: string;
    course_title: string;
    course_id: string;
  }>;
}

export function StudentDashboard() {
  const { user } = useAuth();

  // Fetch dashboard data from new API
  const { data: dashboardData, loading: dashboardLoading } = useAsync<DashboardData>(
    () => studentApi.getDashboardData(),
    []
  );

  // Fetch enrolled courses for course list
  const { data: courses, loading: coursesLoading } = useAsync(
    () => studentApi.getMyCourses(),
    []
  );

  if (dashboardLoading || coursesLoading) {
    return <LoadingState />;
  }

  const stats = dashboardData || {
    totalEnrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    overallProgressPercentage: 0,
    recentActivities: [],
    upcomingDeadlines: []
  };

  // Get most recent in-progress course
  const inProgressCourses = courses?.filter((c: any) => c.progress_percentage < 100 && c.progress_percentage > 0) || [];
  const recentCourse = inProgressCourses.length > 0 ? inProgressCourses[0] : null;

  // Activity icon mapping
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ENROLLED': return <BookOpen className="h-4 w-4" />;
      case 'COMPLETED_LESSON': return <PlayCircle className="h-4 w-4" />;
      case 'COMPLETED_COURSE': return <Award className="h-4 w-4" />;
      case 'SUBMITTED_ASSIGNMENT': return <AlertCircle className="h-4 w-4" />;
      case 'COMPLETED_QUIZ': return <TrendingUp className="h-4 w-4" />;
      case 'EARNED_CERTIFICATE': return <Award className="h-4 w-4" />;
      case 'PROFILE_UPDATE': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Activity color mapping
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ENROLLED': return 'bg-blue-100 text-blue-600';
      case 'COMPLETED_LESSON': return 'bg-green-100 text-green-600';
      case 'COMPLETED_COURSE': return 'bg-purple-100 text-purple-600';
      case 'SUBMITTED_ASSIGNMENT': return 'bg-orange-100 text-orange-600';
      case 'COMPLETED_QUIZ': return 'bg-teal-100 text-teal-600';
      case 'EARNED_CERTIFICATE': return 'bg-yellow-100 text-yellow-600';
      case 'PROFILE_UPDATE': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'Student'}! 👋
        </h1>
        <p className="mt-2 text-gray-500">
          Continue your learning journey and achieve your goals.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Courses"
          value={stats.totalEnrolledCourses}
          icon={<BookOpen className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          label="Completed"
          value={stats.completedCourses}
          icon={<Award className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgressCourses}
          icon={<PlayCircle className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          label="Overall Progress"
          value={`${stats.overallProgressPercentage}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
      </div>

      {/* Continue Learning Section */}
      {recentCourse && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Continue Learning
              </h2>
              <p className="text-sm text-gray-500">
                Pick up where you left off
              </p>
            </div>
          </div>

          <Card>
            <CardBody>
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                {/* Course Thumbnail */}
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-purple-100 overflow-hidden flex-shrink-0">
                  {recentCourse.thumbnail_url ? (
                    <img src={recentCourse.thumbnail_url} alt={recentCourse.title} className="h-full w-full object-cover" />
                  ) : (
                    <PlayCircle className="h-10 w-10 text-purple-600" />
                  )}
                </div>

                {/* Course Information */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-600">
                    {recentCourse.category_name || 'Course'}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900 truncate">
                    {recentCourse.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {recentCourse.instructor_name || 'Instructor'}
                  </p>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-500">Course Progress</span>
                      <span className="font-medium text-purple-600">
                        {recentCourse.progress_percentage || 0}%
                      </span>
                    </div>
                    <ProgressBar value={recentCourse.progress_percentage || 0} size="sm" />
                  </div>
                </div>

                {/* Continue Button */}
                <Link to={`/student/courses/${recentCourse.course_id}/learn`} className="flex-shrink-0">
                  <Button>Continue</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">My Courses</h2>
                    <p className="text-sm text-gray-500">Your enrolled courses</p>
                  </div>
                </div>
                <Link to="/student/my-courses" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {courses && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.slice(0, 4).map((course: any) => (
                    <Link key={course.course_id} to={`/student/courses/${course.course_id}/learn`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* Course Thumbnail */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 overflow-hidden flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-purple-600" />
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.instructor_name}</p>
                        </div>

                        {/* Progress */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-sm font-medium text-purple-600">
                            {course.progress_percentage || 0}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<BookOpen className="h-10 w-10" />} 
                  title="No courses enrolled" 
                  message="Browse courses and request enrollment to start learning." 
                  action={<Link to="/student/courses"><Button>Browse Courses</Button></Link>}
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500">Your latest actions</p>
                </div>
              </div>

              {stats.recentActivities && stats.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        {activity.course_title && (
                          <p className="text-xs text-gray-500 truncate">{activity.course_title}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Activity className="h-10 w-10" />} 
                  title="No recent activity" 
                  message="Start learning to see your activity here." 
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-orange-100 p-3">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Upcoming Deadlines</h2>
                <p className="text-sm text-gray-500">Don't miss these important dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-orange-100 bg-orange-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 flex-shrink-0">
                    {deadline.type === 'assignment' ? (
                      <AlertCircle className="h-5 w-5 text-white" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{deadline.title}</p>
                    <p className="text-xs text-gray-500 truncate">{deadline.course_title}</p>
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      Due: {formatDate(deadline.due_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/student/courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Courses</p>
                <p className="text-xs text-gray-500">Discover new content</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/student/my-courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3">
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">My Courses</p>
                <p className="text-xs text-gray-500">Continue learning</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/student/certificate">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Certificates</p>
                <p className="text-xs text-gray-500">View achievements</p>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link to="/student/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-3">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Profile</p>
                <p className="text-xs text-gray-500">Manage account</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}