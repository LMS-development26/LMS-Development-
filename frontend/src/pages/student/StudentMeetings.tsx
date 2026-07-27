import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Video, Clock, FileText, Play, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, meetingApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, StatusBadge, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

export function StudentMeetings() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: meetings, loading } = useAsync(() => meetingApi.listByCourse(courseId!), [courseId]);

  if (loading) return <LoadingState />;

  const upcoming = meetings?.filter((m) => m.status === 'SCHEDULED') || [];
  const previous = meetings?.filter((m) => m.status === 'COMPLETED') || [];

  return (
    <div className="space-y-6">
      <Link to={`/student/courses/${courseId}/learn`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
        <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Upcoming Classes</h2>
        {upcoming.length === 0 ? (
          <Card><EmptyState icon={<Calendar className="h-10 w-10" />} title="No upcoming classes" /></Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((m) => (
              <Card key={m.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{m.title}</h3>
                      {m.description && <p className="mt-1 text-sm text-gray-600">{m.description}</p>}
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(m.meeting_date)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {m.start_time} - {m.end_time}</span>
                      </div>
                    </div>
                    <a href={m.google_meet_link} target="_blank" rel="noreferrer">
                      <Button><Video className="h-4 w-4" /> Join Google Meet</Button>
                    </a>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Previous */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Previous Classes</h2>
        {previous.length === 0 ? (
          <Card><EmptyState icon={<Video className="h-10 w-10" />} title="No previous classes" /></Card>
        ) : (
          <div className="space-y-3">
            {previous.map((m) => (
              <Card key={m.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{m.title}</h3>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{formatDate(m.meeting_date)} {m.start_time}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.recording_url && (
                          <a href={m.recording_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline"><Play className="h-4 w-4" /> View Recording</Button>
                          </a>
                        )}
                        {m.notes && (
                          <div className="flex-1 rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-500">Meeting Notes</p>
                            <p className="mt-1 text-sm text-gray-700">{m.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
