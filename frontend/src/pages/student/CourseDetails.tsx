import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Clock, Tag as TagIcon, CheckCircle2, BookOpen,
  Globe, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, moduleApi, enrollmentApi, reviewApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, CardHeader, Button, StarRating, LoadingState, EmptyState, Modal } from '@/components/ui';
import { formatPrice, formatDuration, formatDate } from '@/utils/helpers';

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed as T : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const { data: course, loading: courseLoading, error: courseError } = useAsync(
    () => (courseId ? courseApi.getById(courseId) : Promise.resolve(null)),
    [courseId],
  );
  const { data: modules, loading: modulesLoading } = useAsync(
    () => (courseId ? moduleApi.listByCourse(courseId) : Promise.resolve([])),
    [courseId],
  );
  const { data: reviews, refetch: refetchReviews } = useAsync(
    () => (courseId ? reviewApi.listByCourse(courseId) : Promise.resolve([])),
    [courseId],
  );
  const { data: myEnrollments, refetch: refetchEnrollments } = useAsync(
    () => enrollmentApi.listMyCourses(),
    [user?.id],
  );
  const { data: existingReview, refetch: refetchExistingReview } = useAsync(
    () => (courseId && user?.id ? reviewApi.getByStudent(courseId, user.id) : Promise.resolve(null)),
    [courseId, user?.id],
  );

  const [enrollModal, setEnrollModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loading = courseLoading || modulesLoading;

  if (loading) return <LoadingState />;

  if (courseError) {
    return (
      <div className="space-y-6">
        <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
        <Card>
          <EmptyState title="Unable to load course" message={courseError} />
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
        <Card>
          <EmptyState title="Course not found" message="The course you're looking for doesn't exist or has been removed." />
        </Card>
      </div>
    );
  }

  const learningOutcomes = parseJsonField<string[]>(course.learning_outcomes, []);
  const prerequisites = parseJsonField<string[]>(course.prerequisites, []);
  const durationMinutes = course.duration_minutes ?? (course.duration_hours ? course.duration_hours * 60 : 0);

  const isEnrolled = myEnrollments?.some((e) => e.course_id === courseId) ?? false;

  const handleEnroll = async () => {
    setActionError(null);
    setSubmitting(true);
    try {
      await enrollmentApi.create(courseId!);
      setEnrollModal(false);
      refetchEnrollments();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Enrollment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    setActionError(null);
    setSubmitting(true);
    try {
      await reviewApi.create({
        course_id: courseId!,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      refetchReviews();
      refetchExistingReview();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/student/courses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

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
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrollment_count || 0} students</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {course.language}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(durationMinutes)}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                {course.instructor_name?.charAt(0) || 'I'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{course.instructor_name || 'Instructor'}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
              {isEnrolled ? (
                <Link to={`/student/courses/${courseId}/learn`}>
                  <Button size="lg" variant="success"><GraduationCap className="h-5 w-5" /> Start Learning</Button>
                </Link>
              ) : (
                <Button size="lg" onClick={() => setEnrollModal(true)}>Enroll Now</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="About This Course" />
            <CardBody>
              <p className="text-sm text-gray-600">{course.description}</p>
            </CardBody>
          </Card>

          {learningOutcomes.length > 0 && (
            <Card>
              <CardHeader title="Learning Outcomes" />
              <CardBody>
                <ul className="space-y-2">
                  {learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {outcome}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {prerequisites.length > 0 && (
            <Card>
              <CardHeader title="Prerequisites" />
              <CardBody>
                <ul className="space-y-2">
                  {prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" /> {prereq}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Course Curriculum" subtitle={`${modules?.length || 0} modules`} />
            <CardBody>
              {(!modules || modules.length === 0) ? (
                <p className="text-sm text-gray-400">No curriculum available.</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div key={mod.id} className="rounded-lg border border-gray-100 p-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {mod.display_order || mod.module_order || ''}. {mod.module_name || mod.name}
                      </p>
                      {mod.description && <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

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
                <div className="flex items-center justify-between"><span className="text-gray-500">Duration</span><span className="font-medium text-gray-900">{formatDuration(durationMinutes)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Students</span><span className="font-medium text-gray-900">{course.enrollment_count || 0}</span></div>
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

      <Modal
        open={enrollModal}
        onClose={() => setEnrollModal(false)}
        title="Enroll in Course"
        footer={
          <>
            <Button variant="outline" onClick={() => setEnrollModal(false)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={submitting}>{submitting ? 'Enrolling...' : 'Confirm Enrollment'}</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          You are about to enroll in <span className="font-semibold">"{course.title}"</span>.
          You will gain immediate access to all course content.
        </p>
      </Modal>

      <Modal
        open={reviewModal}
        onClose={() => setReviewModal(false)}
        title="Write a Review"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button variant="success" onClick={handleReviewSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
            <StarRating rating={reviewForm.rating} size="lg" interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
          </div>
          <textarea
            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={4}
            placeholder="Share your experience..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}
