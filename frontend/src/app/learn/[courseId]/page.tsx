'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { coursesService } from '@/lib/coursesService';
import { progressService } from '@/lib/progressService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import VideoPlayer from '@/components/courses/VideoPlayer';
import TextContent from '@/components/courses/TextContent';
import LessonSidebar from '@/components/courses/LessonSidebar';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    BookOpen,
    Menu,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please login to access this page');
            router.push('/login');
            return;
        }

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId, isAuthenticated]);

    const fetchCourseData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch course details with modules and lessons
            const courseData = await coursesService.getCourseById(courseId);
            setCourse(courseData);

            // Fetch progress
            const progressData = await progressService.getLessonsProgress(courseId);
            const completed = progressData
                .filter((p: any) => p.isCompleted)
                .map((p: any) => p.lessonId);
            setCompletedLessons(completed);

            // Set first lesson as current if none selected
            if (courseData.modules && courseData.modules.length > 0) {
                const firstModule = courseData.modules.sort((a: any, b: any) => a.order - b.order)[0];
                if (firstModule.lessons && firstModule.lessons.length > 0) {
                    const firstLesson = firstModule.lessons.sort((a: any, b: any) => a.order - b.order)[0];
                    setCurrentLesson(firstLesson);
                }
            }
        } catch (err: any) {
            console.error('Error fetching course:', err);
            setError('Failed to load course. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLessonSelect = (lessonId: string) => {
        // Find the lesson in modules
        const lesson = course.modules
            .flatMap((m: any) => m.lessons)
            .find((l: any) => l.id === lessonId);

        if (lesson) {
            setCurrentLesson(lesson);
            setIsSidebarOpen(false); // Close sidebar on mobile
        }
    };

    // ONLY THIS FUNCTION MARKS LESSONS AS COMPLETE
    const handleMarkComplete = async () => {
        if (!currentLesson) return;

        setIsMarkingComplete(true);

        try {
            const isCompleted = completedLessons.includes(currentLesson.id);

            if (isCompleted) {
                // Unmark as complete
                await progressService.markLessonIncomplete(currentLesson.id);
                setCompletedLessons(prev => prev.filter(id => id !== currentLesson.id));
                toast.success('Lesson marked as incomplete');
            } else {
                // Mark as complete
                await progressService.completLesson(currentLesson.id);
                setCompletedLessons(prev => [...prev, currentLesson.id]);
                toast.success('Lesson completed! 🎉');
            }
        } catch (err: any) {
            console.error('Error updating progress:', err);
            toast.error('Failed to update progress');
        } finally {
            setIsMarkingComplete(false);
        }
    };

    // NEXT BUTTON - ONLY NAVIGATES, DOESN'T MARK COMPLETE
    const handleNextLesson = () => {
        if (!course || !currentLesson) return;

        const allLessons = course.modules
            .sort((a: any, b: any) => a.order - b.order)
            .flatMap((m: any) =>
                m.lessons.sort((a: any, b: any) => a.order - b.order)
            );

        const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson.id);

        if (currentIndex < allLessons.length - 1) {
            // Just navigate to next lesson
            setCurrentLesson(allLessons[currentIndex + 1]);
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Last lesson
            toast('This is the last lesson in the course', {
                icon: 'ℹ️',
            });
        }
    };

    // PREVIOUS BUTTON - ONLY NAVIGATES
    const handlePreviousLesson = () => {
        if (!course || !currentLesson) return;

        const allLessons = course.modules
            .sort((a: any, b: any) => a.order - b.order)
            .flatMap((m: any) =>
                m.lessons.sort((a: any, b: any) => a.order - b.order)
            );

        const currentIndex = allLessons.findIndex((l: any) => l.id === currentLesson.id);

        if (currentIndex > 0) {
            // Just navigate to previous lesson
            setCurrentLesson(allLessons[currentIndex - 1]);
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // First lesson
            toast('This is the first lesson in the course', {
                icon: 'ℹ️',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3">
                            <Skeleton className="aspect-video w-full" />
                            <Skeleton className="h-24 w-full mt-4" />
                        </div>
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Course not found'}
                        <div className="mt-4">
                            <Link href="/dashboard">
                                <Button variant="outline">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const isLessonCompleted = currentLesson && completedLessons.includes(currentLesson.id);

    // Calculate progress
    const totalLessons = course.modules
        .flatMap((m: any) => m.lessons).length;
    const progressPercentage = totalLessons > 0
        ? Math.round((completedLessons.length / totalLessons) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/courses/${courseId}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="hidden md:block">
                                <h1 className="font-semibold text-lg text-[#1b161f]">
                                    {course.title}
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {progressPercentage}% Complete • {completedLessons.length} of {totalLessons} lessons
                                </p>
                            </div>
                        </div>

                        {/* Mobile Sidebar Toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {currentLesson ? (
                            <>
                                {/* Video/Text Content */}
                                {currentLesson.contentType === 'VIDEO' && currentLesson.videoUrl ? (
                                    <VideoPlayer
                                        videoUrl={currentLesson.videoUrl}
                                        title={currentLesson.title}
                                    />
                                ) : currentLesson.contentType === 'TEXT' && currentLesson.textContent ? (
                                    <TextContent content={currentLesson.textContent} />
                                ) : (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600">
                                                Content not available for this lesson
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lesson Info */}
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-[#1b161f] mb-2">
                                                    {currentLesson.title}
                                                </h2>
                                                {currentLesson.description && (
                                                    <p className="text-gray-600">
                                                        {currentLesson.description}
                                                    </p>
                                                )}
                                            </div>
                                            {/* ONLY THIS BUTTON MARKS AS COMPLETE */}
                                            <Button
                                                onClick={handleMarkComplete}
                                                disabled={isMarkingComplete}
                                                variant={isLessonCompleted ? "outline" : "default"}
                                                className={isLessonCompleted ? "" : "bg-green-600 hover:bg-green-700"}
                                            >
                                                {isMarkingComplete ? (
                                                    'Updating...'
                                                ) : isLessonCompleted ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Completed
                                                    </>
                                                ) : (
                                                    'Mark as Complete'
                                                )}
                                            </Button>
                                        </div>

                                        {/* Navigation - THESE ONLY NAVIGATE */}
                                        <div className="flex justify-between pt-4 border-t">
                                            <Button
                                                onClick={handlePreviousLesson}
                                                variant="outline"
                                            >
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Previous
                                            </Button>
                                            <Button
                                                onClick={handleNextLesson}
                                                className="bg-[#9f2c0f] hover:bg-[#8a2609]"
                                            >
                                                Next
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">
                                        Select a lesson from the sidebar to begin
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block">
                        <LessonSidebar
                            modules={course.modules || []}
                            currentLessonId={currentLesson?.id || null}
                            completedLessons={completedLessons}
                            onLessonSelect={handleLessonSelect}
                        />
                    </div>

                    {/* Sidebar - Mobile */}
                    {isSidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black bg-opacity-50"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                                <LessonSidebar
                                    modules={course.modules || []}
                                    currentLessonId={currentLesson?.id || null}
                                    completedLessons={completedLessons}
                                    onLessonSelect={handleLessonSelect}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}