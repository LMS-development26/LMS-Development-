import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, ChevronDown, ChevronRight, GripVertical,
  FileVideo, FileText, File as FileIcon, Link as LinkIcon, Code, Download, Upload,
  X, ArrowUp, ArrowDown,
} from 'lucide-react';
import { courseApi, moduleApi, lessonApi, materialApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, Button, Modal, Input, Textarea, Select, LoadingState, EmptyState } from '@/components/ui';
import { formatFileSize, classNames } from '@/utils/helpers';
import type { CourseModule, Lesson, LearningMaterial, MaterialType } from '@/types';

const materialTypes: { value: MaterialType; label: string; icon: React.ReactNode }[] = [
  { value: 'VIDEO', label: 'Video', icon: <FileVideo className="h-4 w-4" /> },
  { value: 'PDF', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
  { value: 'PPT', label: 'Presentation', icon: <FileText className="h-4 w-4" /> },
  { value: 'NOTES', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
  { value: 'EXTERNAL_LINK', label: 'External Link', icon: <LinkIcon className="h-4 w-4" /> },
  { value: 'SOURCE_CODE', label: 'Source Code', icon: <Code className="h-4 w-4" /> },
  { value: 'DOWNLOADABLE_RESOURCE', label: 'Downloadable Resource', icon: <Download className="h-4 w-4" /> },
];

const materialIcon = (type: MaterialType) => materialTypes.find((t) => t.value === type)?.icon || <FileIcon className="h-4 w-4" />;

export function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, loading: courseLoading } = useAsync(() => courseApi.getById(courseId!), [courseId]);

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleModal, setModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [lessonModal, setLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [materialModal, setMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [materialsByLesson, setMaterialsByLesson] = useState<Record<string, LearningMaterial[]>>({});

  // Module form
  const [moduleForm, setModuleForm] = useState({ name: '', description: '' });
  // Lesson form
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', duration_minutes: 0 });
  // Material form
  const [materialForm, setMaterialForm] = useState({
    type: 'VIDEO' as MaterialType, title: '', description: '', s3_url: '', external_url: '', file_size_bytes: 0, file_type: '',
  });

  const loadModules = async () => {
    const mods = await moduleApi.listByCourse(courseId!);
    setModules(mods);
    for (const mod of mods) {
      const lessons = await lessonApi.listByModule(mod.id);
      setLessonsByModule((prev) => ({ ...prev, [mod.id]: lessons }));
      for (const lesson of lessons) {
        const mats = await materialApi.listByLesson(lesson.id);
        setMaterialsByLesson((prev) => ({ ...prev, [lesson.id]: mats }));
      }
    }
  };

  useEffect(() => {
    if (courseId) loadModules();
  }, [courseId]);

  if (courseLoading || !course) return <LoadingState />;

  const openModuleModal = (mod?: CourseModule) => {
    if (mod) { setEditingModule(mod); setModuleForm({ name: mod.name, description: mod.description || '' }); }
    else { setEditingModule(null); setModuleForm({ name: '', description: '' }); }
    setModuleModal(true);
  };

  const saveModule = async () => {
    if (editingModule) {
      await moduleApi.update(editingModule.id, { name: moduleForm.name, description: moduleForm.description || null });
    } else {
      await moduleApi.create({ course_id: courseId!, name: moduleForm.name, description: moduleForm.description || null });
    }
    setModuleModal(false);
    loadModules();
  };

  const deleteModule = async (id: string) => {
    await moduleApi.delete(id);
    loadModules();
  };

  const moveModule = async (index: number, direction: 'up' | 'down') => {
    const newOrder = [...modules];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setModules(newOrder);
    await moduleApi.reorder(newOrder.map((m) => m.id));
  };

  const openLessonModal = (moduleId: string, lesson?: Lesson) => {
    setActiveModuleId(moduleId);
    if (lesson) { setEditingLesson(lesson); setLessonForm({ title: lesson.title, description: lesson.description || '', duration_minutes: lesson.duration_minutes || 0 }); }
    else { setEditingLesson(null); setLessonForm({ title: '', description: '', duration_minutes: 0 }); }
    setLessonModal(true);
  };

  const saveLesson = async () => {
    if (editingLesson) {
      await lessonApi.update(editingLesson.id, { title: lessonForm.title, description: lessonForm.description || null, duration_minutes: lessonForm.duration_minutes || null });
    } else {
      await lessonApi.create({ module_id: activeModuleId!, title: lessonForm.title, description: lessonForm.description || null, duration_minutes: lessonForm.duration_minutes || null });
    }
    setLessonModal(false);
    loadModules();
  };

  const deleteLesson = async (id: string) => {
    await lessonApi.delete(id);
    loadModules();
  };

  const moveLesson = async (moduleId: string, index: number, direction: 'up' | 'down') => {
    const lessons = lessonsByModule[moduleId] || [];
    const newOrder = [...lessons];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    setLessonsByModule((prev) => ({ ...prev, [moduleId]: newOrder }));
    await lessonApi.reorder(newOrder.map((l) => l.id));
  };

  const openMaterialModal = (lessonId: string, material?: LearningMaterial) => {
    setActiveLessonId(lessonId);
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({
        type: material.type, title: material.title, description: material.description || '',
        s3_url: material.s3_url || '', external_url: material.external_url || '',
        file_size_bytes: material.file_size_bytes || 0, file_type: material.file_type || '',
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({ type: 'VIDEO', title: '', description: '', s3_url: '', external_url: '', file_size_bytes: 0, file_type: '' });
    }
    setMaterialModal(true);
  };

  const saveMaterial = async () => {
    const isExternal = materialForm.type === 'EXTERNAL_LINK';
    if (editingMaterial) {
      await materialApi.update(editingMaterial.id, {
        type: materialForm.type, title: materialForm.title, description: materialForm.description || null,
        s3_url: isExternal ? null : materialForm.s3_url || null,
        external_url: isExternal ? materialForm.external_url : null,
        file_size_bytes: materialForm.file_size_bytes || null, file_type: materialForm.file_type || null,
      });
    } else {
      await materialApi.create({
        lesson_id: activeLessonId!, type: materialForm.type, title: materialForm.title,
        description: materialForm.description || null,
        s3_url: isExternal ? null : materialForm.s3_url || null,
        external_url: isExternal ? materialForm.external_url : null,
        file_size_bytes: materialForm.file_size_bytes || null, file_type: materialForm.file_type || null,
      });
    }
    setMaterialModal(false);
    loadModules();
  };

  const deleteMaterial = async (id: string) => {
    await materialApi.delete(id);
    loadModules();
  };

  return (
    <div className="space-y-6">
      <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Course
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Builder</h1>
          <p className="mt-1 text-sm text-gray-500">{course.title}</p>
        </div>
        <Button onClick={() => openModuleModal()}><Plus className="h-4 w-4" /> Add Module</Button>
      </div>

      {/* Modules */}
      {modules.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Upload className="h-12 w-12" />}
            title="No modules yet"
            message="Start building your course by adding the first module."
            action={<Button onClick={() => openModuleModal()}><Plus className="h-4 w-4" /> Add Module</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIndex) => {
            const lessons = lessonsByModule[mod.id] || [];
            const isExpanded = expandedModule === mod.id;
            return (
              <Card key={mod.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <button onClick={() => moveModule(modIndex, 'up')} disabled={modIndex === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button onClick={() => moveModule(modIndex, 'down')} disabled={modIndex === modules.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => setExpandedModule(isExpanded ? null : mod.id)} className="text-gray-400">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Module {mod.display_order}: {mod.name}</p>
                      {mod.description && <p className="text-xs text-gray-500">{mod.description}</p>}
                      <p className="mt-0.5 text-xs text-gray-400">{lessons.length} lessons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openLessonModal(mod.id)}><Plus className="h-4 w-4" /> Add Lesson</Button>
                    <Button variant="ghost" size="sm" onClick={() => openModuleModal(mod)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteModule(mod.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    {lessons.length === 0 ? (
                      <p className="py-4 text-center text-sm text-gray-400">No lessons in this module yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {lessons.map((lesson, lessonIndex) => {
                          const materials = materialsByLesson[lesson.id] || [];
                          return (
                            <div key={lesson.id} className="rounded-lg border border-gray-100 p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col">
                                    <button onClick={() => moveLesson(mod.id, lessonIndex, 'up')} disabled={lessonIndex === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                      <ArrowUp className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => moveLesson(mod.id, lessonIndex, 'down')} disabled={lessonIndex === lessons.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                      <ArrowDown className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{lesson.display_order}. {lesson.title}</p>
                                    {lesson.description && <p className="text-xs text-gray-500">{lesson.description}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openMaterialModal(lesson.id)}><Plus className="h-4 w-4" /> Material</Button>
                                  <Button variant="ghost" size="sm" onClick={() => openLessonModal(mod.id, lesson)}><Pencil className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                              </div>
                              {materials.length > 0 && (
                                <div className="mt-3 space-y-1.5 pl-8">
                                  {materials.map((mat) => (
                                    <div key={mat.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{materialIcon(mat.type)}</span>
                                        <span className="text-sm text-gray-700">{mat.title}</span>
                                        <span className="text-xs text-gray-400">{mat.type.replace(/_/g, ' ')}</span>
                                        {mat.file_size_bytes ? <span className="text-xs text-gray-400">{formatFileSize(mat.file_size_bytes)}</span> : null}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => openMaterialModal(lesson.id, mat)} className="p-1 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => deleteMaterial(mat.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Module Modal */}
      <Modal open={moduleModal} onClose={() => setModuleModal(false)} title={editingModule ? 'Edit Module' : 'Add Module'} footer={<><Button variant="outline" onClick={() => setModuleModal(false)}>Cancel</Button><Button onClick={saveModule}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Module Name" value={moduleForm.name} onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })} placeholder="e.g. React Fundamentals" />
          <Textarea label="Description" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} rows={3} placeholder="What this module covers" />
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} footer={<><Button variant="outline" onClick={() => setLessonModal(false)}>Cancel</Button><Button onClick={saveLesson}>Save</Button></>}>
        <div className="space-y-4">
          <Input label="Lesson Title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="e.g. Introduction to React" />
          <Textarea label="Description" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={3} placeholder="What this lesson covers" />
          <Input label="Duration (minutes)" type="number" value={lessonForm.duration_minutes} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })} />
        </div>
      </Modal>

      {/* Material Modal */}
      <Modal open={materialModal} onClose={() => setMaterialModal(false)} title={editingMaterial ? 'Edit Learning Material' : 'Add Learning Material'} size="lg" footer={<><Button variant="outline" onClick={() => setMaterialModal(false)}>Cancel</Button><Button onClick={saveMaterial}>Save</Button></>}>
        <div className="space-y-4">
          <Select label="Material Type" value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value as MaterialType })}>
            {materialTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input label="Title" value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} placeholder="e.g. Intro Video" />
          <Textarea label="Description" value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} rows={2} />

          {materialForm.type === 'EXTERNAL_LINK' ? (
            <Input label="External URL" value={materialForm.external_url} onChange={(e) => setMaterialForm({ ...materialForm, external_url: e.target.value })} placeholder="https://..." />
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload File (S3)</label>
              {!materialForm.s3_url ? (
                <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload</p>
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMaterialForm({
                        ...materialForm,
                        s3_url: `https://example-s3.s3.amazonaws.com/materials/${file.name}`,
                        file_size_bytes: file.size,
                        file_type: file.type,
                      });
                    }
                  }} />
                </label>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    {materialIcon(materialForm.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">File uploaded</p>
                      <p className="text-xs text-gray-500">{formatFileSize(materialForm.file_size_bytes)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setMaterialForm({ ...materialForm, s3_url: '', file_size_bytes: 0, file_type: '' })}><X className="h-4 w-4" /></Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
