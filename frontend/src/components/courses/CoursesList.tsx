'use client'

import { useState, useEffect } from 'react';
import CourseCard from './CourseCard';
import { Course } from '@/types';
import { coursesService } from '@/lib/coursesService';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen } from 'lucide-react';

interface CoursesListProps {
    filters?: {
        category?: string;
        level?: string;
        search?: string;
    };
}

export default function CoursesList({ filters }: CoursesListProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, [filters]);

    const fetchCourses = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await coursesService.getAllCourses({
                ...filters,
                limit: 100,
            });

            const publishedCourses = response.data.filter(course => course.isPublished);
            setCourses(publishedCourses);
        } catch (err: any) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No courses found
                </h3>
                <p className="text-gray-600">
                    {filters?.search || filters?.category || filters?.level
                        ? 'Try adjusting your filters'
                        : 'Check back later for new courses'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}