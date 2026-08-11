import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, Download, ShieldCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, certificateApi, progressApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

export function StudentCertificate() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const { data: course, loading: courseLoading, error: courseError } = useAsync(
    () => (courseId ? courseApi.getById(courseId) : Promise.resolve(null)),
    [courseId],
  );

  const { data: certificate, loading: certLoading, error: certError } = useAsync(
    () => (courseId && user?.id ? certificateApi.getByCourseAndStudent(courseId, user.id) : Promise.resolve(null)),
    [courseId, user?.id],
  );

  const { data: progress } = useAsync(
    () => (courseId && user?.id ? progressApi.getByCourseAndStudent(courseId, user.id) : Promise.resolve(null)),
    [courseId, user?.id],
  );

  const loading = courseLoading || certLoading;

  if (loading) {
    return <LoadingState />;
  }

  if (courseError || certError) {
    return (
      <div className="space-y-6">
        <Link to="/student/my-courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <Card>
          <EmptyState
            icon={<Award className="h-12 w-12" />}
            title="Unable to load certificate"
            message={courseError || certError || 'Something went wrong. Please try again.'}
          />
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Link to="/student/my-courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to My Courses
        </Link>
        <Card>
          <EmptyState
            icon={<Award className="h-12 w-12" />}
            title="Course not found"
            message="The course you're looking for doesn't exist."
          />
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="space-y-6">
        <Link to={`/student/courses/${courseId}/learn`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
        <Card>
          <EmptyState
            icon={<Award className="h-12 w-12" />}
            title="No certificate yet"
            message={
              progress?.progress_percentage === 100
                ? "You've completed the course! Your certificate is being generated."
                : `Complete the course to earn your certificate. Current progress: ${progress?.progress_percentage ?? 0}%`
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/student/my-courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to My Courses
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificate of Completion</h1>
        <p className="mt-1 text-sm text-gray-500">Congratulations on completing the course!</p>
      </div>

      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-8 lg:p-12">
          <div className="absolute inset-4 rounded-xl border-4 border-double border-blue-200" />

          <div className="relative text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Certificate of Completion</p>
            <p className="mt-6 text-sm text-gray-500">This is to certify that</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{certificate.student_name}</h2>
            <p className="mt-4 text-sm text-gray-500">has successfully completed the course</p>
            <h3 className="mt-2 text-xl font-semibold text-blue-700">{course.title}</h3>

            <div className="mt-8 flex items-center justify-center gap-12">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <p className="mt-2 text-xs font-medium text-gray-600">{certificate.instructor_name}</p>
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-600">{formatDate(certificate.issued_at)}</p>
                <p className="text-xs text-gray-400">Date</p>
              </div>
            </div>

            <p className="mt-8 text-xs text-gray-400">Certificate Number: {certificate.certificate_number}</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline"><Download className="h-4 w-4" /> Download PDF</Button>
        <Button variant="outline"><ShieldCheck className="h-4 w-4" /> Verify Certificate</Button>
      </div>
    </div>
  );
}
