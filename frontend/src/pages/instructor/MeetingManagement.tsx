import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Video, Upload, FileText, Users, Clock, XCircle,
} from 'lucide-react';
import { courseApi, meetingApi, attendanceApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, StatusBadge, Modal, Input, Textarea, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { Meeting, MeetingAttendance } from '@/types';

export function MeetingManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: meetings, loading, refetch } = useAsync(() => meetingApi.listByCourse(courseId!), [courseId]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);
  const [form, setForm] = useState({ title: '', description: '', meeting_date: '', start_time: '10:00', end_time: '11:00', google_meet_link: '' });
  const [recordingModal, setRecordingModal] = useState<Meeting | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [notesModal, setNotesModal] = useState<Meeting | null>(null);
  const [notes, setNotes] = useState('');
  const [attendanceModal, setAttendanceModal] = useState<Meeting | null>(null);
  const [attendance, setAttendance] = useState<MeetingAttendance[]>([]);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const openModal = (meeting?: Meeting) => {
    setSaveError('');
    if (meeting) { setEditing(meeting); setForm({ title: meeting.title, description: meeting.description || '', meeting_date: meeting.meeting_date, start_time: meeting.start_time, end_time: meeting.end_time, google_meet_link: meeting.google_meet_link }); }
    else { setEditing(null); setForm({ title: '', description: '', meeting_date: '', start_time: '10:00', end_time: '11:00', google_meet_link: '' }); }
    setModal(true);
  };

  const save = async () => {
    if (!form.title || !form.meeting_date || !form.start_time || !form.end_time) {
      setSaveError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      if (editing) {
        await meetingApi.update(editing.id, form);
      } else {
        await meetingApi.create({ course_id: courseId!, ...form });
      }
      setModal(false);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save live class. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => { await meetingApi.cancel(id); refetch(); };

  const openRecording = (m: Meeting) => { setRecordingModal(m); setRecordingUrl(m.recording_url || ''); setSaveError(''); };
  const saveRecording = async () => {
    if (!recordingModal) return;
    setSaving(true);
    setSaveError('');
    try {
      await meetingApi.uploadRecording(recordingModal.id, recordingUrl);
      setRecordingModal(null);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to upload recording. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openNotes = (m: Meeting) => { setNotesModal(m); setNotes(m.notes || ''); setSaveError(''); };
  const saveNotes = async () => {
    if (!notesModal) return;
    setSaving(true);
    setSaveError('');
    try {
      await meetingApi.uploadNotes(notesModal.id, notes);
      setNotesModal(null);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const viewAttendance = async (m: Meeting) => {
    const att = await attendanceApi.listByMeeting(m.id);
    setAttendance(att);
    setAttendanceModal(m);
  };

  if (loading) return <LoadingState />;

  const upcoming = meetings?.filter((m) => m.status === 'SCHEDULED') || [];
  const previous = meetings?.filter((m) => m.status === 'COMPLETED') || [];

  return (
    <div className="space-y-6">
      <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
        </div>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Schedule Class</Button>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Upcoming Classes</h2>
        {upcoming.length === 0 ? (
          <Card><EmptyState icon={<Video className="h-10 w-10" />} title="No upcoming classes" /></Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((m) => (
              <Card key={m.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{m.title}</h3>
                      {m.description && <p className="mt-1 text-sm text-gray-600">{m.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDate(m.meeting_date)} {m.start_time} - {m.end_time}</span>
                      </div>
                      <a href={m.google_meet_link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                        <Video className="h-4 w-4" /> Join Google Meet
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openModal(m)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => cancel(m.id)}><XCircle className="h-4 w-4 text-red-500" /></Button>
                    </div>
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
                      {m.recording_url && <a href={m.recording_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"><Video className="h-4 w-4" /> View Recording</a>}
                      {m.notes && <div className="mt-2 rounded-lg bg-gray-50 p-3"><p className="text-sm text-gray-600">{m.notes}</p></div>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openRecording(m)}><Upload className="h-4 w-4" /> Recording</Button>
                      <Button size="sm" variant="ghost" onClick={() => openNotes(m)}><FileText className="h-4 w-4" /> Notes</Button>
                      <Button size="sm" variant="ghost" onClick={() => viewAttendance(m)}><Users className="h-4 w-4" /> Attendance</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Live Class' : 'Schedule Live Class'} footer={<><Button variant="outline" onClick={() => setModal(false)} disabled={saving}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></>}>
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}
          <Input label="Meeting Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Input label="Date" type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <Input label="End Time" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <Input label="Google Meet Link" value={form.google_meet_link} onChange={(e) => setForm({ ...form, google_meet_link: e.target.value })} placeholder="https://meet.google.com/..." />
        </div>
      </Modal>

      {/* Recording Modal */}
      <Modal open={!!recordingModal} onClose={() => setRecordingModal(null)} title="Upload Recording" footer={<><Button variant="outline" onClick={() => setRecordingModal(null)} disabled={saving}>Cancel</Button><Button onClick={saveRecording} disabled={saving}>{saving ? 'Uploading...' : 'Save'}</Button></>}>
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}
          <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400">
            <Upload className="h-6 w-6 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">Upload recording to S3</p>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setRecordingUrl(`https://example-s3.s3.amazonaws.com/recordings/${f.name}`); }} />
          </label>
          <Input label="Or enter S3 URL" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)} placeholder="https://..." />
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal open={!!notesModal} onClose={() => setNotesModal(null)} title="Meeting Notes" footer={<><Button variant="outline" onClick={() => setNotesModal(null)} disabled={saving}>Cancel</Button><Button onClick={saveNotes} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></>}>
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}
          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Meeting notes for students..." />
        </div>
      </Modal>

      {/* Attendance Modal */}
      <Modal open={!!attendanceModal} onClose={() => setAttendanceModal(null)} title={`Attendance - ${attendanceModal?.title || ''}`} size="lg">
        {attendance.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No attendance records.</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{attendance.length}</p>
                <p className="text-xs text-gray-500">Total Attendees</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{attendance.filter((a) => a.duration_minutes && a.duration_minutes > 0).length}</p>
                <p className="text-xs text-gray-500">Present</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {attendance.length > 0 ? Math.round(attendance.reduce((s, a) => s + (a.duration_minutes || 0), 0) / attendance.length) : 0}m
                </p>
                <p className="text-xs text-gray-500">Avg Duration</p>
              </div>
            </div>
            <div className="space-y-2">
              {attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.student_name}</p>
                    <p className="text-xs text-gray-500">{a.student_email}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Joined: {a.joined_at ? new Date(a.joined_at).toLocaleTimeString() : '—'}</p>
                    <p>Duration: {a.duration_minutes || 0}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
