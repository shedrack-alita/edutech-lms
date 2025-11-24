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
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
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
    'UI/UX Design'
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

        // Validation
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

            // Clear form after success
            resetForm();

            // Show confirmation dialog
            const addContent = window.confirm(
                'Course created! Would you like to add modules and lessons now?'
            );

            if (addContent) {
                // Redirect to edit page to add modules/lessons
                router.push(`/admin/courses/${course.id}/edit`);
            } else {
                // Stay on create page or go to courses list
                const stayHere = window.confirm(
                    'Do you want to create another course?'
                );

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
            <div className="bg-[#be3d1c] border-b">
                <div className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/courses">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#efeff0]">
                                Create New Course
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-lg">
                            <CardHeader className="border-b bg-gradient-to-r from-[#352941] to-gray-700 text-white md:p-3">
                                <CardTitle>Course Information</CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                {/* Course Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-base font-semibold">
                                        Course Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Complete Web Development Bootcamp"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-base font-semibold">
                                        Course Description <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe what students will learn in this course..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        rows={6}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Category & Level */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-base font-semibold">
                                            Category <span className="text-red-500">*</span>
                                        </Label>

                                        {!useCustomCategory ? (
                                            <div className="space-y-2">
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={handleCategoryChange}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PREDEFINED_CATEGORIES.map((cat) => (
                                                            <SelectItem key={cat} value={cat}>
                                                                {cat}
                                                            </SelectItem>
                                                        ))}
                                                        <SelectItem value="custom" className="text-[#9f2c0f] font-semibold">
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
                                                    className="h-11"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setUseCustomCategory(false);
                                                        setFormData(prev => ({ ...prev, category: '' }));
                                                    }}
                                                    className="text-xs text-[#9f2c0f] font-bold"
                                                >
                                                    ← Back to predefined categories
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Level */}
                                    <div className="space-y-2">
                                        <Label htmlFor="level" className="text-base font-semibold">
                                            Level <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={formData.level}
                                            onValueChange={(value) => handleChange('level', value)}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Thumbnail URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail" className="text-base font-semibold">
                                        Thumbnail URL (Optional)
                                    </Label>
                                    <Input
                                        id="thumbnail"
                                        type="url"
                                        placeholder="https://example.com/course-thumbnail.jpg"
                                        value={formData.thumbnail}
                                        onChange={(e) => handleChange('thumbnail', e.target.value)}
                                        disabled={isSubmitting}
                                        className="h-11"
                                    />
                                </div>

                                {/* Publish Status */}
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">
                                        Publication Status
                                    </Label>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onChange={(e) => handleChange('isPublished', e.target.checked)}
                                            disabled={isSubmitting}
                                            className="w-4 h-4 text-[#9f2c0f] rounded"
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor="isPublished"
                                                className="font-medium text-sm cursor-pointer"
                                            >
                                                Publish this course immediately
                                            </label>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Students can see and enroll in published courses. You can add modules and lessons after creation.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
                                    <Link href="/admin/courses">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                            className="w-full md:w-auto bg-[#f3d6ce]"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full md:w-auto bg-[#9f2c0f] hover:bg-[#8a2609] text-white"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Course
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </form>
                </div>
            </div>
        </div>
    );
}