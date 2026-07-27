import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Users, Clock, Star, Tag as TagIcon, CheckCircle2, BookOpen,
  Award, Globe, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, moduleApi, lessonApi, enrollmentRequestApi, enrollmentApi, reviewApi } from '@/services/api';
import { mockInstructorProfiles, mockUsers } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, CardHeader, Button, StarRating, StatusBadge, LoadingState, Modal } from '@/components/ui';
import { formatPrice, formatDuration, formatDate } from '@/utils/helpers';

export function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: course, loading } = useAsync(() => courseApi.getById(courseId!), [courseId]);
  const { data: modules } = useAsync(() => moduleApi.listByCourse(courseId!), [courseId]);
  const { data: reviews } = useAsync(() => reviewApi.listByCourse(courseId!), [courseId]);
  const { data: enrollmentRequest } = useAsync(() => enrollmentRequestApi.list({ courseId, status: 'PENDING' }), [courseId]);
  const { data: enrollment } = useAsync(() => enrollmentApi.list({ courseId, studentId: user?.id }), [courseId, user?.id]);

  const [enrollModal, setEnrollModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { data: existingReview } = useAsync(() => reviewApi.getByStudent(courseId!, user?.id || ''), [courseId, user?.id]);

  if (loading || !course) return <LoadingState />;

  const instructorProfile = mockInstructorProfiles.find((p) => p.id === course.instructor_id);
  const instructorUser = mockUsers.find((u) => u.id === instructorProfile?.user_id);

  const isEnrolled = enrollment && enrollment.length > 0;
  const hasPendingRequest = enrollmentRequest && enrollmentRequest.length > 0;

  const handleEnroll = async () => {
    await enrollmentRequestApi.create(courseId!, user!.id);
    setEnrollModal(false);
  };

  const handleReviewSubmit = async () => {
    await reviewApi.create(courseId!, user!.id, reviewForm.rating, reviewForm.comment);
    setReviewModal(false);
  };

  return (
    <div className="space-y-6">
      <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      {/* Course Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="h-56 w-full bg-gray-200 lg:h-auto lg:w-96">
            {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600">{course.category_name}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{course.difficulty}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-1 text-base text-gray-600">{course.subtitle}</p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><StarRating rating={course.average_rating || 0} showValue /></span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollment_count} students</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {course.language}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {instructorProfile?.avatar_url && <img src={instructorProfile.avatar_url} alt={instructorUser?.first_name} className="h-10 w-10 rounded-full" />}
              <div>
                <p className="text-sm font-medium text-gray-900">{instructorUser?.first_name} {instructorUser?.last_name}</p>
                <p className="text-xs text-gray-500">{instructorProfile?.expertise}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
              {isEnrolled ? (
                <Link to={`/student/courses/${courseId}/learn`}><Button size="lg" variant="success"><GraduationCap className="h-5 w-5" /> Start Learning</Button></Link>
              ) : hasPendingRequest ? (
                <Button size="lg" disabled><StatusBadge status="PENDING" /> Enrollment Request Pending</Button>
              ) : (
                <Button size="lg" onClick={() => setEnrollModal(true)}>Request Enrollment</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card>
            <CardHeader title="About This Course" />
            <CardBody>
              <p className="text-sm text-gray-600">{course.description}</p>
            </CardBody>
          </Card>

          {/* Learning Outcomes */}
          {course.learning_outcomes.length > 0 && (
            <Card>
              <CardHeader title="Learning Outcomes" />
              <CardBody>
                <ul className="space-y-2">
                  {course.learning_outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {outcome}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Prerequisites */}
          {course.prerequisites.length > 0 && (
            <Card>
              <CardHeader title="Prerequisites" />
              <CardBody>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" /> {prereq}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Curriculum */}
          <Card>
            <CardHeader title="Course Curriculum" subtitle={`${modules?.length || 0} modules`} />
            <CardBody>
              {(!modules || modules.length === 0) ? (
                <p className="text-sm text-gray-400">No curriculum available.</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div key={mod.id} className="rounded-lg border border-gray-100 p-3">
                      <p className="text-sm font-semibold text-gray-900">{mod.display_order}. {mod.name}</p>
                      {mod.description && <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader
              title="Student Reviews"
              subtitle={`${reviews?.length || 0} reviews`}
              action={isEnrolled && !existingReview ? <Button size="sm" variant="outline" onClick={() => setReviewModal(true)}>Write a Review</Button> : undefined}
            />
            <CardBody>
              {(!reviews || reviews.length === 0) ? (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            {rev.student_name?.charAt(0) || 'S'}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{rev.student_name}</p>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{rev.comment}</p>
                      <p className="mt-1 text-xs text-gray-400">{formatDate(rev.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Price</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(course.price)}</span>
                </div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Difficulty</span><span className="font-medium text-gray-900">{course.difficulty}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Language</span><span className="font-medium text-gray-900">{course.language}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Duration</span><span className="font-medium text-gray-900">{formatDuration(course.duration_minutes)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Students</span><span className="font-medium text-gray-900">{course.enrollment_count}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Rating</span><StarRating rating={course.average_rating || 0} showValue /></div>
              </div>
              {course.tags && course.tags.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                        <TagIcon className="h-3 w-3" /> {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal open={enrollModal} onClose={() => setEnrollModal(false)} title="Request Enrollment" footer={<><Button variant="outline" onClick={() => setEnrollModal(false)}>Cancel</Button><Button onClick={handleEnroll}>Submit Request</Button></>}>
        <p className="text-sm text-gray-600">You are about to request enrollment for <span className="font-semibold">"{course.title}"</span>. The instructor will review your request and you'll be notified when it's approved.</p>
      </Modal>

      {/* Review Modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review" footer={<><Button variant="outline" onClick={() => setReviewModal(false)}>Cancel</Button><Button variant="success" onClick={handleReviewSubmit}>Submit Review</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
            <StarRating rating={reviewForm.rating} size="lg" interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
          </div>
          <textarea className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" rows={4} placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
