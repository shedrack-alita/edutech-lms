'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { coursesService } from '@/lib/coursesService';
import { enrollmentService } from '@/lib/enrollmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    BookOpen,
    Users,
    Clock,
    CheckCircle,
    PlayCircle,
    ArrowLeft,
    AlertCircle,
    GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const courseId = params.id as string;

    const [course, setCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
            if (isAuthenticated) {
                checkEnrollmentStatus();
            }
        }
    }, [courseId, isAuthenticated]);

    const fetchCourseDetails = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await coursesService.getCourseById(courseId);
            setCourse(data);
        } catch (err: any) {
            console.error('Error fetching course:', err);
            setError('Failed to load course details. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        try {
            const enrollments = await enrollmentService.getMyEnrollments();
            const enrollment = enrollments.find((e: any) => e.course.id === courseId);
            if (enrollment) {
                setIsEnrolled(true);
                setEnrollmentId(enrollment.id);
            }
        } catch (err) {
            console.error('Error checking enrollment:', err);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll in this course');
            router.push('/login');
            return;
        }

        setIsEnrolling(true);

        try {
            await enrollmentService.enrollInCourse(courseId);
            toast.success('Successfully enrolled in the course!');
            setIsEnrolled(true);
            await checkEnrollmentStatus();
        } catch (err: any) {
            console.error('Enrollment error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to enroll. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleStartLearning = () => {
        router.push(`/learn/${courseId}`);
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'BEGINNER':
                return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE':
                return 'bg-blue-100 text-blue-800';
            case 'ADVANCED':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatLevel = (level: string) => {
        return level.charAt(0) + level.slice(1).toLowerCase();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-[#1b161f] text-white py-12">
                    <div className="container mx-auto px-4">
                        <Skeleton className="h-10 w-3/4 bg-gray-700 mb-4" />
                        <Skeleton className="h-6 w-1/2 bg-gray-700" />
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-96 w-full" />
                        </div>
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
                            <Link href="/courses">
                                <Button variant="outline">Back to Courses</Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const totalModules = course.modules?.length || 0;
    const totalLessons = course.modules?.reduce(
        (sum: number, module: any) => sum + (module.lessons?.length || 0),
        0
    ) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#1b161f] text-white py-12">
                <div className="container mx-auto px-4">
                    <Link href="/courses">
                        <Button variant="ghost" className="text-white hover:bg-gray-800 mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Courses
                        </Button>
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant="outline" className="border-white text-white">
                                    {course.category}
                                </Badge>
                                <Badge className={getLevelColor(course.level)}>
                                    {formatLevel(course.level)}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {course.title}
                            </h1>

                            <p className="text-lg text-gray-300 mb-6">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    <span>
                                        Created by {course.creator.firstName} {course.creator.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <span>{course._count?.enrollments || 0} students enrolled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    <span>{course._count?.modules || 0} modules</span>
                                </div>
                            </div>
                        </div>

                        {/* Enrollment Card - Desktop */}
                        <div className="hidden lg:block w-80">
                            <EnrollmentCard
                                isEnrolled={isEnrolled}
                                isEnrolling={isEnrolling}
                                onEnroll={handleEnroll}
                                onStartLearning={handleStartLearning}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Course Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* What You'll Learn */}
                        <Card>
                            <CardHeader>
                                <CardTitle>What You'll Learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Master the fundamentals and advanced concepts</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Build real-world projects from scratch</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Get hands-on experience with industry tools</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">Receive certificate upon completion</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Course Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <p className="text-sm text-gray-600">
                                    {totalModules} module{totalModules !== 1 ? 's' : ''} • {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                                </p>
                            </CardHeader>
                            <CardContent>
                                {course.modules && course.modules.length > 0 ? (
                                    <div className="space-y-3">
                                        {course.modules
                                            .sort((a: any, b: any) => a.order - b.order)
                                            .map((module: any, index: number) => (
                                                <div
                                                    key={module.id}
                                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-[#1b161f] mb-1">
                                                                Module {index + 1}: {module.title}
                                                            </h3>
                                                            {module.description && (
                                                                <p className="text-sm text-gray-600 mb-2">
                                                                    {module.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <PlayCircle className="h-4 w-4" />
                                                                    {module._count?.lessons || 0} lessons
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600 text-center py-8">
                                        No modules available yet. Check back soon!
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li>• Basic computer skills</li>
                                    <li>• Access to a computer with internet connection</li>
                                    <li>• Willingness to learn and practice</li>
                                    <li>• No prior experience required</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Instructor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Instructor</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#9f2c0f] rounded-full flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">
                                            {course.creator.firstName[0]}{course.creator.lastName[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {course.creator.firstName} {course.creator.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-600">{course.creator.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Enrollment Card (Mobile) */}
                    <div className="lg:hidden">
                        <EnrollmentCard
                            isEnrolled={isEnrolled}
                            isEnrolling={isEnrolling}
                            onEnroll={handleEnroll}
                            onStartLearning={handleStartLearning}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Enrollment Card Component
function EnrollmentCard({
    isEnrolled,
    isEnrolling,
    onEnroll,
    onStartLearning,
}: {
    isEnrolled: boolean;
    isEnrolling: boolean;
    onEnroll: () => void;
    onStartLearning: () => void;
}) {
    return (
        <Card className="sticky top-4 shadow-xl">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#1b161f] mb-2">Free</p>
                        <p className="text-sm text-gray-600">Full lifetime access</p>
                    </div>

                    {isEnrolled ? (
                        <Button
                            onClick={onStartLearning}
                            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
                        >
                            <PlayCircle className="h-5 w-5 mr-2" />
                            Continue Learning
                        </Button>
                    ) : (
                        <Button
                            onClick={onEnroll}
                            disabled={isEnrolling}
                            className="w-full bg-[#9f2c0f] hover:bg-[#8a2609] text-white h-12 text-base"
                        >
                            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </Button>
                    )}

                    <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">This course includes:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Video lessons
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Downloadable resources
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Lifetime access
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Certificate of completion
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Mobile and desktop access
                            </li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}