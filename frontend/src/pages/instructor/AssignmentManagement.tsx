import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, FileText, Download, Star, MessageSquare, Eye,
} from 'lucide-react';
import { courseApi, assignmentApi, submissionApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, Table, StatusBadge, Modal, Input, Textarea, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';
import type { Assignment, AssignmentSubmission } from '@/types';

export function AssignmentManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: assignments, loading, refetch } = useAsync(() => assignmentApi.listByCourse(courseId!), [courseId]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState({ title: '', description: '', instructions: '', due_date: '', max_marks: 100 });
  const [submissionsModal, setSubmissionsModal] = useState<Assignment | null>(null);
  const [gradeModal, setGradeModal] = useState<AssignmentSubmission | null>(null);
  const [gradeForm, setGradeForm] = useState({ marks: 0, feedback: '' });
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  const openModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditing(assignment);
      setForm({ title: assignment.title, description: assignment.description || '', instructions: assignment.instructions || '', due_date: assignment.due_date.slice(0, 10), max_marks: assignment.max_marks });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', instructions: '', due_date: '', max_marks: 100 });
    }
    setModal(true);
  };

  const save = async () => {
    if (editing) {
      await assignmentApi.update(editing.id, { ...form, due_date: new Date(form.due_date).toISOString() });
    } else {
      await assignmentApi.create({ course_id: courseId!, ...form, due_date: new Date(form.due_date).toISOString() });
    }
    setModal(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await assignmentApi.delete(id);
    refetch();
  };

  const viewSubmissions = async (assignment: Assignment) => {
    const subs = await submissionApi.listByAssignment(assignment.id);
    setSubmissions(subs);
    setSubmissionsModal(assignment);
  };

  const openGradeModal = (sub: AssignmentSubmission) => {
    setGradeForm({ marks: sub.marks || 0, feedback: sub.feedback || '' });
    setGradeModal(sub);
  };

  const handleGrade = async () => {
    if (gradeModal) {
      await submissionApi.grade(gradeModal.id, gradeForm.marks, gradeForm.feedback);
      setGradeModal(null);
      if (submissionsModal) viewSubmissions(submissionsModal);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">{course?.title}</p>
        </div>
        <Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Create Assignment</Button>
      </div>

      {(!assignments || assignments.length === 0) ? (
        <Card><EmptyState icon={<FileText className="h-12 w-12" />} title="No assignments" message="Create assignments for your students to submit." action={<Button onClick={() => openModal()}><Plus className="h-4 w-4" /> Create Assignment</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{a.title}</h3>
                    {a.description && <p className="mt-1 text-sm text-gray-600">{a.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Due: {formatDate(a.due_date)}</span>
                      <span>Max Marks: {a.max_marks}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => viewSubmissions(a)}><Eye className="h-4 w-4" /> Submissions</Button>
                    <Button size="sm" variant="ghost" onClick={() => openModal(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Assignment Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Assignment' : 'Create Assignment'} size="lg" footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Assignment Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Textarea label="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={4} placeholder="Detailed instructions for students..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <Input label="Max Marks" type="number" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: parseInt(e.target.value) || 100 })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Reference Files (S3)</label>
            <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400">
              <Download className="h-6 w-6 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">Upload reference files</p>
              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { /* would upload to S3 */ } }} />
            </label>
          </div>
        </div>
      </Modal>

      {/* Submissions Modal */}
      <Modal open={!!submissionsModal} onClose={() => setSubmissionsModal(null)} title={`Submissions - ${submissionsModal?.title || ''}`} size="lg">
        {submissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No submissions yet.</p>
        ) : (
          <Table
            columns={[
              { key: 'student_name', header: 'Student', render: (s: AssignmentSubmission) => <span className="font-medium text-gray-900">{s.student_name}</span> },
              { key: 'submitted_at', header: 'Submitted', render: (s: AssignmentSubmission) => formatDate(s.submitted_at) },
              { key: 'status', header: 'Status', render: (s: AssignmentSubmission) => <StatusBadge status={s.status} /> },
              { key: 'marks', header: 'Marks', render: (s: AssignmentSubmission) => s.marks !== null ? `${s.marks}/${submissionsModal?.max_marks}` : '—' },
              {
                key: 'actions', header: 'Actions', render: (s: AssignmentSubmission) => (
                  <div className="flex items-center gap-2">
                    {s.submitted_file_url && <a href={s.submitted_file_url} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button></a>}
                    <Button size="sm" variant="outline" onClick={() => openGradeModal(s)}><Star className="h-4 w-4" /> Grade</Button>
                  </div>
                ),
              },
            ]}
            data={submissions}
          />
        )}
      </Modal>

      {/* Grade Modal */}
      <Modal open={!!gradeModal} onClose={() => setGradeModal(null)} title="Grade Submission" footer={<><Button variant="outline" onClick={() => setGradeModal(null)}>Cancel</Button><Button variant="success" onClick={handleGrade}>Save Grade</Button></>}>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900">{gradeModal?.student_name}</p>
            <p className="text-xs text-gray-500">Submitted {gradeModal ? formatDate(gradeModal.submitted_at) : ''}</p>
          </div>
          <Input label={`Marks (out of ${submissionsModal?.max_marks || 100})`} type="number" max={submissionsModal?.max_marks || 100} value={gradeForm.marks} onChange={(e) => setGradeForm({ ...gradeForm, marks: parseInt(e.target.value) || 0 })} />
          <Textarea label="Feedback" value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={4} placeholder="Provide feedback to the student..." />
        </div>
      </Modal>
    </div>
  );
}
