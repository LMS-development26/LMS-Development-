import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, ChevronLeft, ChevronRight, Save, Globe, Upload, X, FileVideo, Image as ImageIcon, Plus, Tag as TagIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseApi, categoryApi, tagApi } from '@/services/api';
import { mockInstructorProfiles } from '@/data/mockData';
import { useAsync } from '@/hooks/useAsync';
import { Button, Input, Textarea, Select, Card } from '@/components/ui';
import { classNames, formatFileSize } from '@/utils/helpers';
import type { DifficultyLevel, CourseTag } from '@/types';

const steps = ['Basic Info', 'Course Media', 'Pricing', 'Course Details', 'Tags', 'Review'];

export function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const instructorProfile = mockInstructorProfiles.find((p) => p.user_id === user?.id);

  const { data: categories } = useAsync(() => categoryApi.list(), []);
  const { data: existingTags } = useAsync(() => tagApi.list(), []);

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', category_id: '', difficulty: 'BEGINNER' as DifficultyLevel, language: 'English',
    thumbnail_url: '', promotional_video_url: '',
    price: 0, isFree: true,
    duration_minutes: 0,
    learning_outcomes: [''] as string[],
    prerequisites: [''] as string[],
    tags: [] as CourseTag[],
  });
  const [tagSearch, setTagSearch] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ thumbnail: number; video: number }>({ thumbnail: 0, video: 0 });
  const [saving, setSaving] = useState(false);

  const updateForm = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleArrayChange = (key: 'learning_outcomes' | 'prerequisites', index: number, value: string) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].map((item, i) => (i === index ? value : item)) }));
  };

  const addArrayItem = (key: 'learning_outcomes' | 'prerequisites') => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeArrayItem = (key: 'learning_outcomes' | 'prerequisites', index: number) => {
    setForm((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const simulateUpload = (type: 'thumbnail' | 'video', file: File) => {
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev[type] + 10;
        if (next >= 100) {
          clearInterval(interval);
          const url = `https://example-s3.s3.amazonaws.com/uploads/${file.name}`;
          updateForm(type === 'thumbnail' ? 'thumbnail_url' : 'promotional_video_url', url);
          return { ...prev, [type]: 100 };
        }
        return { ...prev, [type]: next };
      });
    }, 200);
  };

  const handleFileSelect = (type: 'thumbnail' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(type, file);
  };

  const removeFile = (type: 'thumbnail' | 'video') => {
    updateForm(type === 'thumbnail' ? 'thumbnail_url' : 'promotional_video_url', '');
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
  };

  const handleTagToggle = (tag: CourseTag) => {
    setForm((prev) => {
      const exists = prev.tags.find((t) => t.id === tag.id);
      if (exists) return { ...prev, tags: prev.tags.filter((t) => t.id !== tag.id) };
      return { ...prev, tags: [...prev.tags, tag] };
    });
  };

  const handleCreateTag = async () => {
    if (!tagSearch.trim()) return;
    const existing = existingTags?.find((t) => t.name.toLowerCase() === tagSearch.toLowerCase());
    if (existing) { handleTagToggle(existing); setTagSearch(''); return; }
    const newTag = await tagApi.create(tagSearch.trim());
    handleTagToggle(newTag);
    setTagSearch('');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return form.title && form.category_id;
      case 1: return true;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return true;
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setSaving(true);
    try {
      const course = await courseApi.create({
        instructor_id: instructorProfile?.id,
        category_id: form.category_id,
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description || null,
        difficulty: form.difficulty,
        language: form.language,
        price: form.isFree ? 0 : form.price,
        thumbnail_url: form.thumbnail_url || null,
        promotional_video_url: form.promotional_video_url || null,
        duration_minutes: form.duration_minutes || null,
        learning_outcomes: form.learning_outcomes.filter((s) => s.trim()),
        prerequisites: form.prerequisites.filter((s) => s.trim()),
        tags: form.tags,
        status,
      });
      navigate(`/instructor/courses/${course.id}/builder`);
    } finally {
      setSaving(false);
    }
  };

  const filteredTags = (existingTags || []).filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-1 text-sm text-gray-500">Follow the steps to set up your course.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={classNames(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                i < currentStep ? 'border-blue-600 bg-blue-600 text-white' :
                i === currentStep ? 'border-blue-600 bg-white text-blue-600' :
                'border-gray-300 bg-white text-gray-400',
              )}>
                {i < currentStep ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span className={classNames('mt-1 text-xs font-medium', i === currentStep ? 'text-blue-600' : 'text-gray-400')}>{step}</span>
            </div>
            {i < steps.length - 1 && <div className={classNames('mx-2 h-0.5 w-8 sm:w-16', i < currentStep ? 'bg-blue-600' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <Input label="Course Title" name="title" value={form.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Complete React Developer Course" />
            <Input label="Course Subtitle" name="subtitle" value={form.subtitle} onChange={(e) => updateForm('subtitle', e.target.value)} placeholder="A brief tagline for your course" />
            <Textarea label="Course Description" name="description" value={form.description} onChange={(e) => updateForm('description', e.target.value)} rows={4} placeholder="Describe what students will learn..." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select label="Course Category" name="category_id" value={form.category_id} onChange={(e) => updateForm('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </Select>
              <Select label="Difficulty Level" name="difficulty" value={form.difficulty} onChange={(e) => updateForm('difficulty', e.target.value as DifficultyLevel)}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
              <Select label="Course Language" name="language" value={form.language} onChange={(e) => updateForm('language', e.target.value)}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Hindi">Hindi</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Course Media */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Course Media</h2>
            <p className="text-sm text-gray-500">Upload your course thumbnail and promotional video. Files are stored in Amazon S3.</p>

            {/* Thumbnail upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Thumbnail Image</label>
              {!form.thumbnail_url ? (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload thumbnail</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect('thumbnail', e)} />
                </label>
              ) : (
                <div className="relative">
                  <img src={form.thumbnail_url} alt="Thumbnail" className="h-48 w-full rounded-xl object-cover" />
                  <button onClick={() => removeFile('thumbnail')} className="absolute right-2 top-2 rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {uploadProgress.thumbnail > 0 && uploadProgress.thumbnail < 100 && (
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress.thumbnail}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Uploading... {uploadProgress.thumbnail}%</p>
                </div>
              )}
              {form.thumbnail_url && (
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('thumb-replace')?.click()}>
                    <Upload className="h-4 w-4" /> Replace
                  </Button>
                  <input id="thumb-replace" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect('thumbnail', e)} />
                  <Button variant="ghost" size="sm" onClick={() => removeFile('thumbnail')}><X className="h-4 w-4" /> Remove</Button>
                </div>
              )}
            </div>

            {/* Promotional video upload */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Promotional Video</label>
              {!form.promotional_video_url ? (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30">
                  <FileVideo className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload promotional video</p>
                  <p className="text-xs text-gray-400">MP4, MOV up to 500MB</p>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect('video', e)} />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Promotional video uploaded</p>
                      <p className="text-xs text-gray-500">{form.promotional_video_url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('vid-replace')?.click()}>
                      <Upload className="h-4 w-4" /> Replace
                    </Button>
                    <input id="vid-replace" type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect('video', e)} />
                    <Button variant="ghost" size="sm" onClick={() => removeFile('video')}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
              {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${uploadProgress.video}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Uploading... {uploadProgress.video}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => { updateForm('isFree', true); updateForm('price', 0); }}
                className={classNames('rounded-xl border-2 p-6 text-left transition-colors', form.isFree ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300')}
              >
                <div className="text-2xl font-bold text-gray-900">Free</div>
                <p className="mt-1 text-sm text-gray-500">No cost for students</p>
              </button>
              <button
                onClick={() => updateForm('isFree', false)}
                className={classNames('rounded-xl border-2 p-6 text-left transition-colors', !form.isFree ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300')}
              >
                <div className="text-2xl font-bold text-gray-900">Paid</div>
                <p className="mt-1 text-sm text-gray-500">Charge students for access</p>
              </button>
            </div>
            {!form.isFree && (
              <Input label="Price (USD)" type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateForm('price', parseFloat(e.target.value) || 0)} />
            )}
          </div>
        )}

        {/* Step 4: Course Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
            <Input label="Course Duration (minutes)" type="number" value={form.duration_minutes} onChange={(e) => updateForm('duration_minutes', parseInt(e.target.value) || 0)} hint="Estimated total duration of all lessons combined" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Learning Outcomes</label>
              <p className="mb-2 text-xs text-gray-500">What will students learn in this course?</p>
              <div className="space-y-2">
                {form.learning_outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={outcome} onChange={(e) => handleArrayChange('learning_outcomes', i, e.target.value)} placeholder={`Learning outcome ${i + 1}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('learning_outcomes', i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('learning_outcomes')}><Plus className="h-4 w-4" /> Add Outcome</Button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Prerequisites</label>
              <p className="mb-2 text-xs text-gray-500">What should students know before taking this course?</p>
              <div className="space-y-2">
                {form.prerequisites.map((prereq, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={prereq} onChange={(e) => handleArrayChange('prerequisites', i, e.target.value)} placeholder={`Prerequisite ${i + 1}`} />
                    <Button variant="ghost" size="sm" onClick={() => removeArrayItem('prerequisites', i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addArrayItem('prerequisites')}><Plus className="h-4 w-4" /> Add Prerequisite</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Tags */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Course Tags</h2>
            <p className="text-sm text-gray-500">Search and select tags to help students find your course. Tags are stored in the course_tags table and linked via course_tag_mapping.</p>

            <div className="flex gap-2">
              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleCreateTag} disabled={!tagSearch.trim()}>
                <Plus className="h-4 w-4" /> Create Tag
              </Button>
            </div>

            {form.tags.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Selected Tags</p>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                      <TagIcon className="h-3 w-3" /> {tag.name}
                      <button onClick={() => handleTagToggle(tag)} className="ml-1"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Available Tags</p>
              <div className="flex flex-wrap gap-2">
                {filteredTags.filter((t) => !form.tags.find((s) => s.id === t.id)).map((tag) => (
                  <button key={tag.id} onClick={() => handleTagToggle(tag)} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-blue-300 hover:bg-blue-50">
                    <Plus className="h-3 w-3" /> {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review & Save</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-400">Title</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{form.title || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Category</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{categories?.find((c) => c.id === form.category_id)?.name || 'Not set'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Price</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{form.isFree ? 'Free' : `$${form.price}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Difficulty</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{form.difficulty}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Language</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{form.language}</p>
                </div>
              </div>
              {form.tags.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-400">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700">{tag.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
          <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(0, s - 1))} disabled={currentStep === 0}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave('DRAFT')} disabled={saving}>
                <Save className="h-4 w-4" /> Save as Draft
              </Button>
              <Button variant="success" onClick={() => handleSave('PUBLISHED')} disabled={saving}>
                <Globe className="h-4 w-4" /> Publish
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
