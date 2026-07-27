import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, Download, Clock, Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, assignmentApi, submissionApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, StatusBadge, Modal, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { Assignment, AssignmentSubmission } from '@/types';

export function StudentAssignments() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: assignments, loading } = useAsync(() => assignmentApi.listByCourse(courseId!), [courseId]);

  const [submitModal, setSubmitModal] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, AssignmentSubmission | null>>({});
  const [uploadFile, setUploadFile] = useState<string>('');

  // Load submissions for each assignment
  useEffect(() => {
    if (assignments && user) {
      assignments.forEach(async (a) => {
        const sub = await submissionApi.getByAssignmentAndStudent(a.id, user.id);
        setSubmissions((prev) => ({ ...prev, [a.id]: sub }));
      });
    }
  }, [assignments, user]);

  if (loading) return <LoadingState />;

  const handleSubmit = async () => {
    if (submitModal && uploadFile) {
      await submissionApi.submit(submitModal.id, user!.id, uploadFile);
      setSubmitModal(null);
      setUploadFile('');
      const sub = await submissionApi.getByAssignmentAndStudent(submitModal.id, user!.id);
      setSubmissions((prev) => ({ ...prev, [submitModal.id]: sub }));
    }
  };

  return (
    <div className="space-y-6">
      <Link to={`/student/courses/${courseId}/learn`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <Card><EmptyState icon={<FileText className="h-12 w-12" />} title="No assignments" message="Your instructor hasn't created any assignments yet." /></Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const sub = submissions[a.id];
            return (
              <Card key={a.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{a.title}</h3>
                        {sub && <StatusBadge status={sub.status} />}
                      </div>
                      {a.description && <p className="mt-1 text-sm text-gray-600">{a.description}</p>}
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">Instructions</p>
                        <p className="mt-1 text-sm text-gray-700">{a.instructions || 'No specific instructions provided.'}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Due: {formatDate(a.due_date)}</span>
                        <span>Max Marks: {a.max_marks}</span>
                      </div>

                      {/* Graded feedback */}
                      {sub?.status === 'GRADED' && (
                        <div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-700">Grade: {sub.marks}/{a.max_marks}</span>
                          </div>
                          {sub.feedback && (
                            <div className="flex items-start gap-2">
                              <MessageSquare className="mt-0.5 h-4 w-4 text-emerald-600" />
                              <p className="text-sm text-emerald-700">{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {!sub || sub.status === 'SUBMITTED' ? (
                        <Button onClick={() => { setSubmitModal(a); setUploadFile(''); }}>
                          {sub ? 'Resubmit' : 'Submit'} <Upload className="h-4 w-4" />
                        </Button>
                      ) : sub.status === 'GRADED' ? (
                        <div className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-5 w-5" /> Graded</div>
                      ) : null}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!submitModal} onClose={() => setSubmitModal(null)} title={`Submit - ${submitModal?.title || ''}`} footer={<><Button variant="outline" onClick={() => setSubmitModal(null)}>Cancel</Button><Button onClick={handleSubmit} disabled={!uploadFile}>Submit</Button></>}>
        <div className="space-y-4">
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">{uploadFile ? 'File selected' : 'Click to upload your submission'}</p>
            <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadFile(`https://example-s3.s3.amazonaws.com/submissions/${f.name}`); }} />
          </label>
          {uploadFile && <p className="text-xs text-gray-500">File will be uploaded to S3 and stored in assignment_submissions.submitted_file_url</p>}
        </div>
      </Modal>
    </div>
  );
}
