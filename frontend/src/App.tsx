import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { InstructorLayout } from '@/components/layouts/InstructorLayout';
import { StudentLayout } from '@/components/layouts/StudentLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { LoadingState } from '@/components/ui';

// Instructor pages
import { InstructorDashboard } from '@/pages/instructor/InstructorDashboard';
import { CourseManagement } from '@/pages/instructor/CourseManagement';
import { CreateCourse } from '@/pages/instructor/CreateCourse';
import { CourseDetail } from '@/pages/instructor/CourseDetail';
import { CourseBuilder } from '@/pages/instructor/CourseBuilder';
import { EnrollmentManagement } from '@/pages/instructor/EnrollmentManagement';
import { EnrolledStudents } from '@/pages/instructor/EnrolledStudents';
import { AssignmentManagement } from '@/pages/instructor/AssignmentManagement';
import { QuizManagement } from '@/pages/instructor/QuizManagement';
import { MeetingManagement } from '@/pages/instructor/MeetingManagement';
import { CourseAnalytics } from '@/pages/instructor/CourseAnalytics';

// Student pages
import { CourseBrowse } from '@/pages/student/CourseBrowse';
import { CourseDetails } from '@/pages/student/CourseDetails';
import { MyCourses } from '@/pages/student/MyCourses';
import { LearningPage } from '@/pages/student/LearningPage';
import { StudentAssignments } from '@/pages/student/StudentAssignments';
import { StudentQuizzes } from '@/pages/student/StudentQuizzes';
import { StudentMeetings } from '@/pages/student/StudentMeetings';
import { StudentProgress } from '@/pages/student/StudentProgress';
import { StudentCertificate } from '@/pages/student/StudentCertificate';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminInstructors } from '@/pages/admin/AdminInstructors';
import { AdminSettings } from '@/pages/admin/AdminSettings';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingState message="Loading LMS..." />;

  const defaultRedirect = user?.role === 'ADMIN'
    ? '/admin/dashboard'
    : user?.role === 'INSTRUCTOR'
      ? '/instructor/dashboard'
      : '/student/courses';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRedirect} replace />} />

      {/* Instructor routes */}
      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="courses/create" element={<CreateCourse />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="courses/:courseId/edit" element={<CreateCourse />} />
        <Route path="courses/:courseId/builder" element={<CourseBuilder />} />
        <Route path="courses/:courseId/enrollments" element={<EnrollmentManagement />} />
        <Route path="courses/:courseId/students" element={<EnrolledStudents />} />
        <Route path="courses/:courseId/assignments" element={<AssignmentManagement />} />
        <Route path="courses/:courseId/quizzes" element={<QuizManagement />} />
        <Route path="courses/:courseId/meetings" element={<MeetingManagement />} />
        <Route path="courses/:courseId/analytics" element={<CourseAnalytics />} />
        <Route path="enrollments" element={<EnrollmentManagement />} />
        <Route path="students" element={<EnrolledStudents />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/courses" replace />} />
        <Route path="courses" element={<CourseBrowse />} />
        <Route path="courses/:courseId" element={<CourseDetails />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="courses/:courseId/learn" element={<LearningPage />} />
        <Route path="courses/:courseId/assignments" element={<StudentAssignments />} />
        <Route path="courses/:courseId/quizzes" element={<StudentQuizzes />} />
        <Route path="courses/:courseId/meetings" element={<StudentMeetings />} />
        <Route path="courses/:courseId/progress" element={<StudentProgress />} />
        <Route path="courses/:courseId/certificate" element={<StudentCertificate />} />
        <Route path="certificate" element={<MyCourses />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
