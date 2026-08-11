import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { certificateApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

export function StudentCertificates() {
  const { data: certificates, loading, error } = useAsync(
    () => certificateApi.getMyCertificates(),
    [],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <Card>
          <EmptyState
            icon={<Award className="h-12 w-12" />}
            title="Unable to load certificates"
            message={error}
          />
        </Card>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="mt-1 text-sm text-gray-500">View certificates earned from completed courses.</p>
        </div>
        <Card>
          <EmptyState
            icon={<Award className="h-12 w-12" />}
            title="No certificates available"
            message="Complete a course to earn your first certificate."
            action={
              <Link to="/student/my-courses">
                <Button>Go to My Courses</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => (
          <Card key={cert.id} className="overflow-hidden">
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
              <Award className="h-10 w-10 text-blue-600" />
            </div>
            <CardBody>
              <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                {cert.course_title || 'Course Certificate'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{cert.instructor_name}</p>
              <p className="mt-2 text-xs text-gray-400">Issued {formatDate(cert.issued_at)}</p>
              <p className="mt-1 text-xs text-gray-400">#{cert.certificate_number}</p>
              <Link to={`/student/courses/${cert.course_id}/certificate`} className="mt-3 block">
                <Button size="sm" variant="outline" className="w-full">
                  <Award className="h-4 w-4" /> View Certificate
                </Button>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
