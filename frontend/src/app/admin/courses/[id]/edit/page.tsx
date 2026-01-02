'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { coursesService } from '@/lib/coursesService';
import { adminService } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ArrowLeft,
    Save,
    Loader2,
    BookOpen,
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Video,
    FileText,
    Eye,
    EyeOff,
    AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    title: string;
    description?: string;
    contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT';
    videoUrl?: string;
    textContent?: string;
    duration?: number;
    order: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
    isPublished: boolean;
    modules: Module[];
}

const PREDEFINED_CATEGORIES = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cloud Computing',
    'Cybersecurity',
    'Design',
    'UI/UX Design',
    'Business',
    'Marketing',
    'Photography',
    'Music',
    'Language Learning',
    'Personal Development',
];

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useCustomCategory, setUseCustomCategory] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        thumbnail: '',
        isPublished: false,
    });

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await coursesService.getCourse(courseId);
            setCourse(data);

            setFormData({
                title: data.title,
                description: data.description,
                category: data.category,
                level: data.level,
                thumbnail: data.thumbnail || '',
                isPublished: data.isPublished,
            });

            if (!PREDEFINED_CATEGORIES.includes(data.category)) {
                setUseCustomCategory(true);
            }
        } catch (err: any) {
            console.error('Error fetching course:', err);
            setError('Failed to load course');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (value: string) => {
        if (value === 'custom') {
            setUseCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setUseCustomCategory(false);
            setFormData(prev => ({ ...prev, category: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Course title is required');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Course description is required');
            return;
        }

        if (!formData.category.trim()) {
            toast.error('Course category is required');
            return;
        }

        setIsSaving(true);

        try {
            await adminService.updateCourse(courseId, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category.trim(),
                level: formData.level,
                thumbnail: formData.thumbnail.trim() || undefined,
                isPublished: formData.isPublished,
            });

            toast.success('Course updated successfully!');
            fetchCourse();
        } catch (error: any) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        try {
            await adminService.updateCourse(courseId, {
                isPublished: !formData.isPublished,
            });

            setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
            toast.success(
                `Course ${!formData.isPublished ? 'published' : 'unpublished'} successfully`
            );
        } catch (error: any) {
            console.error('Error toggling publish:', error);
            toast.error('Failed to update course');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || 'Course not found'}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9f2c0f] to-[#8a2609] border-b shadow-lg">
                <div className="px-4 md:px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/courses">
                                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                        </div>
                        <Button
                            onClick={handleTogglePublish}
                            variant={formData.isPublished ? 'outline' : 'default'}
                            classN
                            className={
                                formData.isPublished
                                    ? 'bg-white text-[#9f2c0f] hover:bg-gray-100 font-semibold shadow-lg border-2'
                                    : 'bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg border-2'
                            }
                        >
                            {formData.isPublished ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                Edit Course
                            </h1>
                            <p className="text-white/90 mt-1 text-sm md:text-base">
                                Update course details, modules, and lessons
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="details" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid h-14 bg-white border-2 border-gray-300 p-1 shadow-lg">
                            <TabsTrigger
                                value="details"
                                className="gap-2 text-base font-bold h-12 data-[state=active]:bg-[#9f2c0f] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                            >
                                <BookOpen className="h-5 w-5" />
                                <span className="hidden sm:inline">Course Details</span>
                                <span className="sm:hidden">Details</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="content"
                                className="gap-2 text-base font-bold h-12 data-[state=active]:bg-[#9f2c0f] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                            >
                                <FileText className="h-5 w-5" />
                                <span className="hidden sm:inline">Modules & Lessons</span>
                                <span className="sm:hidden">Content</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                            <form onSubmit={handleSubmit}>
                                <Card className="shadow-xl border-2">
                                    <CardHeader className="md:px-4">
                                        <CardTitle className="text-xl">Course Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 md:p-8 space-y-8 bg-white">
                                        {/* Course Title */}
                                        <div className="space-y-3">
                                            <Label htmlFor="title" className="text-base font-bold text-gray-900">
                                                Course Title <span className="text-red-600">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Complete Web Development Bootcamp"
                                                value={formData.title}
                                                onChange={(e) => handleChange('title', e.target.value)}
                                                disabled={isSaving}
                                                required
                                                className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-3">
                                            <Label htmlFor="description" className="text-base font-bold text-gray-900">
                                                Course Description <span className="text-red-600">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe what students will learn..."
                                                value={formData.description}
                                                onChange={(e) => handleChange('description', e.target.value)}
                                                disabled={isSaving}
                                                required
                                                rows={6}
                                                className="resize-none text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                            />
                                        </div>

                                        {/* Category & Level */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Category */}
                                            <div className="space-y-3">
                                                <Label className="text-base font-bold text-gray-900">
                                                    Category <span className="text-red-600">*</span>
                                                </Label>
                                                {!useCustomCategory ? (
                                                    <Select
                                                        value={formData.category}
                                                        onValueChange={handleCategoryChange}
                                                        disabled={isSaving}
                                                    >
                                                        <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PREDEFINED_CATEGORIES.map((cat) => (
                                                                <SelectItem key={cat} value={cat} className="text-base">
                                                                    {cat}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="custom" className="text-[#9f2c0f] font-bold border-t-2 mt-2 pt-2">
                                                                + Enter Custom Category
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Input
                                                            placeholder="Enter custom category"
                                                            value={formData.category}
                                                            onChange={(e) => handleChange('category', e.target.value)}
                                                            disabled={isSaving}
                                                            required
                                                            className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setUseCustomCategory(false);
                                                                setFormData(prev => ({ ...prev, category: '' }));
                                                            }}
                                                            className="text-sm text-[#9f2c0f] hover:text-[#8a2609] hover:bg-red-50"
                                                        >
                                                            ← Back to predefined categories
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Level */}
                                            <div className="space-y-3">
                                                <Label className="text-base font-bold text-gray-900">
                                                    Difficulty Level <span className="text-red-600">*</span>
                                                </Label>
                                                <Select
                                                    value={formData.level}
                                                    onValueChange={(value) => handleChange('level', value)}
                                                    disabled={isSaving}
                                                >
                                                    <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="BEGINNER" className="text-base">
                                                            <span className="font-semibold">Beginner</span>
                                                        </SelectItem>
                                                        <SelectItem value="INTERMEDIATE" className="text-base">
                                                            <span className="font-semibold">Intermediate</span>
                                                        </SelectItem>
                                                        <SelectItem value="ADVANCED" className="text-base">
                                                            <span className="font-semibold">Advanced</span>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Thumbnail URL */}
                                        <div className="space-y-3">
                                            <Label htmlFor="thumbnail" className="text-base font-bold text-gray-900">
                                                Thumbnail URL (Optional)
                                            </Label>
                                            <Input
                                                id="thumbnail"
                                                type="url"
                                                placeholder="https://example.com/thumbnail.jpg"
                                                value={formData.thumbnail}
                                                onChange={(e) => handleChange('thumbnail', e.target.value)}
                                                disabled={isSaving}
                                                className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20"
                                            />
                                            {formData.thumbnail && (
                                                <div className="mt-3 p-3 border-2 border-gray-50 rounded-lg bg-gray-20">
                                                    <img
                                                        src={formData.thumbnail}
                                                        alt="Thumbnail preview"
                                                        className="w-full max-w-sm h-48 object-cover rounded-lg shadow-md"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex justify-end mt-6">
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                className="h-12 text-base bg-[#9f2c0f] hover:bg-[#8a2609] shadow-lg font-semibold text-white"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-5 w-5 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>


                            </form>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                            <ModulesAndLessons courseId={courseId} modules={course.modules} onUpdate={fetchCourse} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

// Separate component for Modules and Lessons
function ModulesAndLessons({
    courseId,
    modules,
    onUpdate
}: {
    courseId: string;
    modules: Module[];
    onUpdate: () => void;
}) {
    return (
        <div className="space-y-6">
            <Card className="shadow-xl border-2">
                <CardHeader className="md:px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Course Content</CardTitle>
                        </div>
                        <Link href={`/admin/courses/${courseId}/modules/create`}>
                            <Button className="bg-white text-[#9f2c0f] hover:bg-gray-100 shadow-lg font-semibold border-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Module
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 bg-white">
                    {modules.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                No modules yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Start organizing your course by adding modules
                            </p>
                            <Link href={`/admin/courses/${courseId}/modules/create`}>
                                <Button className="bg-[#9f2c0f] hover:bg-[#8a2609] shadow-lg font-semibold">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Module
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {modules.map((module, index) => (
                                <ModuleCard
                                    key={module.id}
                                    module={module}
                                    index={index}
                                    courseId={courseId}
                                    onUpdate={onUpdate}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Module Card Component
function ModuleCard({
    module,
    index,
    courseId,
    onUpdate
}: {
    module: Module;
    index: number;
    courseId: string;
    onUpdate: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDeleteModule = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${module.title}"? This will also delete all lessons in this module.`
        );

        if (!confirmed) return;

        try {
            await adminService.deleteModule(module.id);
            toast.success('Module deleted successfully');
            onUpdate();
        } catch (error) {
            console.error('Error deleting module:', error);
            toast.error('Failed to delete module');
        }
    };

    return (
        <Card className="border-l-4 border-l-[#9f2c0f] shadow-md hover:shadow-xl transition-all border-2">
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors p-5" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-bold text-white bg-[#9f2c0f] px-3 py-1 rounded-full">
                                Module {index + 1}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-[#1b161f]">{module.title}</h3>
                            {module.description && (
                                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                            )}
                            <p className="text-sm font-semibold text-gray-500 mt-2 flex items-center gap-1">
                                <FileText className="h-4 w-4 text-blue-600" />
                                {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/admin/courses/${courseId}/modules/${module.id}/edit`}>
                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()} className="hover:bg-blue-50 hover:text-blue-600 border-2 font-semibold">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule();
                            }}
                            className="hover:bg-red-50 hover:text-red-600 border-2 font-semibold"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="border-t-2 bg-gray-50 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-base text-gray-700">Lessons</h4>
                        <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons/create`}>
                            <Button size="sm" variant="outline" className="border-2 hover:bg-[#9f2c0f] hover:text-white hover:border-[#9f2c0f] font-semibold">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Lesson
                            </Button>
                        </Link>
                    </div>

                    {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-semibold">No lessons yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                                <LessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    index={lessonIndex}
                                    courseId={courseId}
                                    moduleId={module.id}
                                    onUpdate={onUpdate}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Lesson Item Component
function LessonItem({
    lesson,
    index,
    courseId,
    moduleId,
    onUpdate
}: {
    lesson: Lesson;
    index: number;
    courseId: string;
    moduleId: string;
    onUpdate: () => void;
}) {
    const handleDeleteLesson = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${lesson.title}"?`
        );

        if (!confirmed) return;

        try {
            await adminService.deleteLesson(lesson.id);
            toast.success('Lesson deleted successfully');
            onUpdate();
        } catch (error) {
            console.error('Error deleting lesson:', error);
            toast.error('Failed to delete lesson');
        }
    };

    const Icon = lesson.contentType === 'VIDEO' ? Video : FileText;

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#9f2c0f] transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <Icon className="h-5 w-5 text-[#9f2c0f]" />
                <div className="flex-1">
                    <p className="font-bold text-sm">
                        {index + 1}. {lesson.title}
                    </p>
                    {lesson.duration && (
                        <p className="text-xs font-semibold text-gray-500">{lesson.duration} min</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}/edit`}>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 border-2 font-semibold">
                        <Edit className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteLesson}
                    className="hover:bg-red-50 hover:text-red-600 border-2 font-semibold"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}