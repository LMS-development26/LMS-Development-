import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Users, Clock, BookOpen } from 'lucide-react';
import { courseApi, categoryApi, tagApi } from '@/services/api';
import { mockInstructorProfiles } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Card, Input, Select, StarRating, LoadingState, EmptyState, Button } from '@/components/ui';
import { formatPrice, formatDuration, classNames } from '@/utils/helpers';

export function CourseBrowse() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [language, setLanguage] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [priceType, setPriceType] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'newest' | 'rating' | 'price_low' | 'price_high'>('popularity');
  const [showFilters, setShowFilters] = useState(false);

  const { data: courses, loading } = useAsync(() => courseApi.list({
    search, categoryId: categoryId || undefined, language: language || undefined,
    priceType, tagIds: selectedTags.length > 0 ? selectedTags : undefined, sortBy,
  }), [search, categoryId, language, priceType, selectedTags, sortBy]);

  const { data: categories } = useAsync(() => categoryApi.list(), []);
  const { data: tags } = useAsync(() => tagApi.list(), []);

  const publishedCourses = courses?.filter((c) => c.status === 'PUBLISHED') || [];

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Courses</h1>
        <p className="mt-1 text-sm text-gray-500">Discover courses from expert instructors.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All Categories</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Hindi">Hindi</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
            </Select>
            <Select label="Instructor" value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
              <option value="">All Instructors</option>
              {mockInstructorProfiles.map((i) => <option key={i.id} value={i.id}>{i.user_id === 'u-instr-1' ? 'John Doe' : 'Emily Chen'}</option>)}
            </Select>
            <Select label="Price" value={priceType} onChange={(e) => setPriceType(e.target.value as 'all' | 'free' | 'paid')}>
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </Select>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={classNames(
                    'rounded-full px-3 py-1 text-sm transition-colors',
                    selectedTags.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </Select>
          </div>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <LoadingState />
      ) : publishedCourses.length === 0 ? (
        <Card><EmptyState icon={<BookOpen className="h-12 w-12" />} title="No courses found" message="Try adjusting your search or filters." /></Card>
      ) : (
        <>
          <p className="text-sm text-gray-500">{publishedCourses.length} courses found</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publishedCourses.map((course) => (
              <Link key={course.id} to={`/student/courses/${course.id}`}>
                <Card hover className="overflow-hidden">
                  <div className="h-40 w-full bg-gray-200">
                    {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-blue-600">{course.category_name}</p>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{course.instructor_name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating rating={course.average_rating || 0} showValue />
                      <span className="text-xs text-gray-400">({course.review_count})</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrollment_count}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDuration(course.duration_minutes)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{formatPrice(course.price)}</span>
                      <span className={classNames('rounded-full px-2 py-0.5 text-xs', course.difficulty === 'BEGINNER' ? 'bg-emerald-100 text-emerald-700' : course.difficulty === 'INTERMEDIATE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                        {course.difficulty}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
