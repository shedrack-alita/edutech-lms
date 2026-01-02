'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Info, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';
import Link from 'next/link';

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

export default function CreateCoursePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [useCustomCategory, setUseCustomCategory] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        thumbnail: '',
        isPublished: false,
    });

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

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            level: 'BEGINNER',
            thumbnail: '',
            isPublished: false,
        });
        setUseCustomCategory(false);
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

        setIsSubmitting(true);

        try {
            const course = await adminService.createCourse({
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category.trim(),
                level: formData.level,
                thumbnail: formData.thumbnail.trim() || undefined,
                isPublished: formData.isPublished,
            });

            toast.success('Course created successfully!');
            resetForm();

            const addContent = window.confirm(
                'Course created! Would you like to add modules and lessons now?'
            );

            if (addContent) {
                router.push(`/admin/courses/${course.id}/edit`);
            } else {
                const stayHere = window.confirm('Do you want to create another course?');
                if (!stayHere) {
                    router.push('/admin/courses');
                }
            }
        } catch (error: any) {
            console.error('Error creating course:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create course';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9f2c0f] to-[#8a2609] border-b shadow-lg">
                <div className="px-4 md:px-8 py-6 md:py-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/courses">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                Create New Course
                            </h1>
                            <p className="text-white/90 mt-1 text-sm md:text-base">
                                Fill in the details below to create a new course
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Info Alert */}
                    <Alert className="bg-blue-50 border-blue-300 shadow-md">
                        <Info className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            <strong className="font-semibold">Course Creation Process:</strong>
                            <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                                <li>Create the course (this step) - Basic information</li>
                                <li>Add modules to organize content</li>
                                <li>Add lessons (videos/text) to each module</li>
                                <li>Publish when ready for students</li>
                            </ol>
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-xl border-2">
                            <CardHeader className="border-b-2 bg-gradient-to-r from-[#1b161f] to-gray-800 text-white p-6">
                                <CardTitle className="text-xl">Course Information</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Basic details about your course
                                </CardDescription>
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
                                        disabled={isSubmitting}
                                        required
                                        className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Choose a clear, descriptive title for your course
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-bold text-gray-900">
                                        Course Description <span className="text-red-600">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what students will learn in this course..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        rows={6}
                                        className="resize-none text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Provide a detailed description of the course content and objectives
                                    </p>
                                </div>

                                {/* Category & Level */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-bold text-gray-900">
                                            Category <span className="text-red-600">*</span>
                                        </Label>

                                        {!useCustomCategory ? (
                                            <div className="space-y-2">
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={handleCategoryChange}
                                                    disabled={isSubmitting}
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
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Input
                                                    id="customCategory"
                                                    placeholder="Enter custom category"
                                                    value={formData.category}
                                                    onChange={(e) => handleChange('category', e.target.value)}
                                                    disabled={isSubmitting}
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

                                        <p className="text-sm text-gray-600">
                                            Main subject area of the course
                                        </p>
                                    </div>

                                    {/* Level */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-bold text-gray-900">
                                            Difficulty Level <span className="text-red-600">*</span>
                                        </Label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(value) => handleChange('level', value)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BEGINNER" className="text-base">
                                                    <span className="font-semibold">Beginner</span> - No prior experience needed
                                                </SelectItem>
                                                <SelectItem value="INTERMEDIATE" className="text-base">
                                                    <span className="font-semibold">Intermediate</span> - Some experience required
                                                </SelectItem>
                                                <SelectItem value="ADVANCED" className="text-base">
                                                    <span className="font-semibold">Advanced</span> - Expert level content
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-600">
                                            Target skill level for students
                                        </p>
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
                                        placeholder="https://example.com/course-thumbnail.jpg"
                                        value={formData.thumbnail}
                                        onChange={(e) => handleChange('thumbnail', e.target.value)}
                                        disabled={isSubmitting}
                                        className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Add a thumbnail image URL for your course
                                    </p>
                                    {formData.thumbnail && (
                                        <div className="mt-3 p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
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

                                {/* Publish Status */}
                                <div className="space-y-3">
                                    <Label className="text-base font-bold text-gray-900">
                                        Publication Status
                                    </Label>
                                    <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onChange={(e) => handleChange('isPublished', e.target.checked)}
                                            disabled={isSubmitting}
                                            className="w-5 h-5 mt-0.5 text-[#9f2c0f] rounded border-2 border-gray-400 focus:ring-2 focus:ring-[#9f2c0f] cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor="isPublished"
                                                className="font-bold text-base cursor-pointer text-gray-900"
                                            >
                                                Publish this course immediately
                                            </label>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Students can see and enroll in published courses. You can add modules and lessons after creation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
                            <Link href="/admin/courses">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto h-12 text-base border-2 hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto h-12 text-base bg-[#9f2c0f] hover:bg-[#8a2609] shadow-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Create Course
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}