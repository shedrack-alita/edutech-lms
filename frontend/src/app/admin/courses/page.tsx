'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    Search,
    BookOpen,
    Edit,
    Eye,
    EyeOff,
    Trash2,
    AlertCircle,
    Filter,
    GraduationCap,
    Clock,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail?: string;
    isPublished: boolean;
    createdAt: string;
    creator: {
        firstName: string;
        lastName: string;
    };
    _count: {
        modules: number;
        enrollments: number;
    };
}

export default function CoursesListPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, searchQuery, filterStatus]);

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await adminService.getAllCoursesAdmin({
                page: 1,
                limit: 100,
            });
            setCourses(response.data);
        } catch (err: any) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses');
        } finally {
            setIsLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = [...courses];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (course) =>
                    course.title.toLowerCase().includes(query) ||
                    course.description.toLowerCase().includes(query) ||
                    course.category.toLowerCase().includes(query)
            );
        }

        if (filterStatus === 'published') {
            filtered = filtered.filter((course) => course.isPublished);
        } else if (filterStatus === 'unpublished') {
            filtered = filtered.filter((course) => !course.isPublished);
        }

        setFilteredCourses(filtered);
    };

    const handleDelete = async (courseId: string, title: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await adminService.deleteCourse(courseId);
            toast.success('Course deleted successfully');
            fetchCourses();
        } catch (err: any) {
            console.error('Error deleting course:', err);
            toast.error('Failed to delete course');
        }
    };

    const handleTogglePublish = async (course: Course) => {
        try {
            await adminService.updateCourse(course.id, {
                isPublished: !course.isPublished,
            });
            toast.success(
                `Course ${!course.isPublished ? 'published' : 'unpublished'} successfully`
            );
            fetchCourses();
        } catch (err: any) {
            console.error('Error updating course:', err);
            toast.error('Failed to update course');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9f2c0f] to-[#8a2609] border-b shadow-lg">
                <div className="px-4 md:px-8 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Manage Courses
                                </h1>
                                <p className="text-white/90 mt-1 text-sm md:text-base">
                                    View and manage all courses on your platform
                                </p>
                            </div>
                        </div>
                        <Link href="/admin/courses/create">
                            <Button className="w-full md:w-auto bg-white text-[#9f2c0f] hover:bg-gray-100 shadow-lg font-semibold">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Course
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-6">
                {/* Search and Filter */}
                <Card className="shadow-xl border-2">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <Input
                                    placeholder="Search courses by title, description, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 text-base border-2 border-gray-300 focus:border-[#9f2c0f] focus:ring-2 focus:ring-[#9f2c0f]/20"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                <Button
                                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('all')}
                                    className={
                                        filterStatus === 'all'
                                            ? 'bg-[#9f2c0f] hover:bg-[#8a2609] font-semibold border-2'
                                            : 'border-2 border-gray-300 hover:bg-gray-100 font-semibold'
                                    }
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    All
                                </Button>
                                <Button
                                    variant={filterStatus === 'published' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('published')}
                                    className={
                                        filterStatus === 'published'
                                            ? 'bg-green-600 hover:bg-green-700 font-semibold border-2'
                                            : 'border-2 border-gray-300 hover:bg-gray-100 font-semibold'
                                    }
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Published
                                </Button>
                                <Button
                                    variant={filterStatus === 'unpublished' ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus('unpublished')}
                                    className={
                                        filterStatus === 'unpublished'
                                            ? 'bg-orange-600 hover:bg-orange-700 font-semibold border-2'
                                            : 'border-2 border-gray-300 hover:bg-gray-100 font-semibold'
                                    }
                                >
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Drafts
                                </Button>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-4 text-sm font-semibold text-gray-700">
                            Showing <span className="text-[#9f2c0f]">{filteredCourses.length}</span> of{' '}
                            <span className="text-[#9f2c0f]">{courses.length}</span> courses
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden border-2">
                                <Skeleton className="h-48 w-full" />
                                <CardContent className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-20" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredCourses.length === 0 && (
                    <Card className="shadow-xl border-2">
                        <CardContent className="p-12 text-center">
                            <BookOpen className="h-20 w-20 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {searchQuery || filterStatus !== 'all'
                                    ? 'No courses found'
                                    : 'No courses yet'}
                            </h3>
                            <p className="text-gray-600 mb-6 text-base">
                                {searchQuery || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'Get started by creating your first course'}
                            </p>
                            {!searchQuery && filterStatus === 'all' && (
                                <Link href="/admin/courses/create">
                                    <Button className="bg-[#9f2c0f] hover:bg-[#8a2609] h-12 text-base font-semibold shadow-lg">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create Course
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Courses Grid */}
                {!isLoading && filteredCourses.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCourses.map((course) => (
                            <Card
                                key={course.id}
                                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-gray-200 hover:border-[#9f2c0f]"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-48 bg-gradient-to-br from-[#1b161f] to-gray-800 overflow-hidden">
                                    {course.thumbnail ? (
                                        <>
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    const placeholder = parent?.querySelector('.thumbnail-placeholder') as HTMLElement;
                                                    if (placeholder) {
                                                        placeholder.style.display = 'flex';
                                                    }
                                                }}
                                            />
                                            <div className="thumbnail-placeholder absolute inset-0 hidden items-center justify-center">
                                                <BookOpen className="h-16 w-16 text-white opacity-50" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="h-16 w-16 text-white opacity-50" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge
                                            className={
                                                course.isPublished
                                                    ? 'bg-green-500 hover:bg-green-600 font-bold shadow-lg'
                                                    : 'bg-orange-500 hover:bg-orange-600 font-bold shadow-lg'
                                            }
                                        >
                                            {course.isPublished ? (
                                                <>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Published
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Draft
                                                </>
                                            )}
                                        </Badge>
                                    </div>

                                    {/* Level Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge variant="secondary" className="bg-white/95 font-bold shadow-lg">
                                            {course.level}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content */}
                                <CardContent className="p-4 space-y-3 bg-white">
                                    {/* Title */}
                                    <h3 className="font-bold text-lg text-[#1b161f] line-clamp-2 group-hover:text-[#9f2c0f] transition-colors">
                                        {course.title}
                                    </h3>

                                    {/* Category */}
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <BookOpen className="h-4 w-4 text-[#9f2c0f]" />
                                        <span>{course.category}</span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm font-semibold text-gray-600 pt-2 border-t-2">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                            <span>{course._count.modules} modules</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <GraduationCap className="h-4 w-4 text-green-600" />
                                            <span>{course._count.enrollments} students</span>
                                        </div>
                                    </div>

                                    {/* Creator */}
                                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            By {course.creator.firstName} {course.creator.lastName}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-3 border-t-2">
                                        <Link href={`/admin/courses/${course.id}/edit`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full hover:bg-[#9f2c0f] hover:text-white transition-colors border-2 font-semibold"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTogglePublish(course)}
                                            className={
                                                course.isPublished
                                                    ? 'hover:bg-orange-500 hover:text-white border-2 font-semibold'
                                                    : 'hover:bg-green-500 hover:text-white border-2 font-semibold'
                                            }
                                        >
                                            {course.isPublished ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(course.id, course.title)}
                                            className="hover:bg-red-500 hover:text-white transition-colors border-2 font-semibold"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}