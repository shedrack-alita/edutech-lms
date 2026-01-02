'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminService } from '@/lib/adminService';
import { coursesService } from '@/lib/coursesService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateModulePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [moduleCount, setModuleCount] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        order: 1,
    });

    useEffect(() => {
        fetchCourseInfo();
    }, [courseId]);

    const fetchCourseInfo = async () => {
        try {
            const course = await coursesService.getCourse(courseId);
            setCourseTitle(course.title);
            setModuleCount(course.modules?.length || 0);
            setFormData(prev => ({ ...prev, order: (course.modules?.length || 0) + 1 }));
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course information');
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Module title is required');
            return;
        }

        if (formData.order < 1) {
            toast.error('Order must be at least 1');
            return;
        }

        setIsSubmitting(true);

        try {
            await adminService.createModule(courseId, {
                title: formData.title.trim(),
                description: formData.description.trim(),
                order: formData.order,
            });

            toast.success('Module created successfully!');
            router.push(`/admin/courses/${courseId}/edit?tab=content`);
        } catch (error: any) {
            console.error('Error creating module:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create module';
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
                        <Link href={`/admin/courses/${courseId}/edit?tab=content`}>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Course
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Layers className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                Add New Module
                            </h1>
                            <p className="text-white/90 mt-1 text-sm md:text-base">
                                {courseTitle || 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-xl border-2">
                            <CardHeader className="border-b-2 bg-gradient-to-r from-[#1b161f] to-gray-800 text-white p-6">
                                <CardTitle className="text-xl">Module Information</CardTitle>
                                <CardDescription className="text-gray-300">
                                    Organize your course content into modules
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8 space-y-8 bg-white">
                                {/* Module Title */}
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-base font-bold text-gray-900">
                                        Module Title <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Introduction to React Hooks"
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        disabled={isSubmitting}
                                        required
                                        className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Choose a descriptive title for this module
                                    </p>
                                </div>

                                {/* Module Description */}
                                <div className="space-y-3">
                                    <Label htmlFor="description" className="text-base font-bold text-gray-900">
                                        Module Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief overview of what this module covers..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        disabled={isSubmitting}
                                        rows={5}
                                        className="resize-none text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Provide context about the topics covered in this module
                                    </p>
                                </div>

                                {/* Module Order */}
                                <div className="space-y-3">
                                    <Label htmlFor="order" className="text-base font-bold text-gray-900">
                                        Module Order <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        min="1"
                                        value={formData.order}
                                        onChange={(e) => handleChange('order', parseInt(e.target.value))}
                                        disabled={isSubmitting}
                                        required
                                        className="h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20 transition-all"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Current course has {moduleCount} module{moduleCount !== 1 ? 's' : ''}.
                                        This will be module #{formData.order}.
                                    </p>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                    <div className="flex gap-3">
                                        <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 mb-1">Next Step</h4>
                                            <p className="text-sm text-blue-800">
                                                After creating this module, you can add lessons (videos, text content, documents) to it.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-6">
                            <Link href={`/admin/courses/${courseId}/edit?tab=content`}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto h-12 text-base border-2 hover:bg-gray-100 font-semibold"
                                >
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto h-12 text-base bg-[#9f2c0f] hover:bg-[#8a2609] shadow-lg font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Create Module
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