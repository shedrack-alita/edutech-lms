'use client'

import { useEffect, useState } from 'react';
import { adminService } from '@/lib/adminService';
import StatsCard from '@/components/admin/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    BookOpen,
    Users,
    GraduationCap,
    TrendingUp,
    FileText,
    Video,
    AlertCircle,
    BarChart3,
    Clock,
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (err: any) {
            console.error('Error fetching stats:', err);
            setError('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-8">
                <Skeleton className="h-10 w-48 md:w-64" />
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8">
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
            <div className="bg-[#9f2c0f] border-b">
                <div className="px-4 md:px-8 py-4 md:py-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-300 mt-1 text-sm md:text-base">
                            Monitor your platform's performance and key metrics
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                {/* Main Statistics */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Courses"
                        value={stats?.totalCourses || 0}
                        description={`${stats?.publishedCourses || 0} published`}
                        icon={BookOpen}
                    />
                    <StatsCard
                        title="Total Students"
                        value={stats?.totalStudents || 0}
                        description="Active learners"
                        icon={Users}
                    />
                    <StatsCard
                        title="Enrollments"
                        value={stats?.totalEnrollments || 0}
                        description={`${stats?.recentEnrollments || 0} this month`}
                        icon={GraduationCap}
                    />
                    <StatsCard
                        title="Avg. per Course"
                        value={stats?.averageEnrollmentsPerCourse || 0}
                        description="Enrollment rate"
                        icon={TrendingUp}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
                    {/* Content Overview */}
                    <Card className="lg:col-span-2 shadow-lg">
                        <CardHeader className="border-b bg-gradient-to-r from-[#1b161f] to-gray-800 text-white p-3 md:p-4">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                                Content Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                                <div className="text-center p-3 md:p-4 bg-blue-200 rounded-lg">
                                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-[#1b161f]">
                                        {stats?.totalModules || 0}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">Modules</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-green-200 rounded-lg">
                                    <Video className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-[#1b161f]">
                                        {stats?.totalLessons || 0}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">Lessons</p>
                                </div>
                                <div className="text-center p-3 md:p-4 bg-orange-200 rounded-lg">
                                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto mb-2" />
                                    <div className="text-xl md:text-2xl font-bold text-[#1b161f]">
                                        {stats?.unpublishedCourses || 0}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-600 mt-1">Drafts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="shadow-lg">
                        <CardHeader className="border-b bg-gradient-to-r from-[#9f2c0f] to-[#8a2609] text-white p-3 md:p-4">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                            <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs md:text-sm text-gray-600">Published</span>
                                <span className="font-bold text-green-600 text-sm md:text-base">
                                    {stats?.publishedCourses || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs md:text-sm text-gray-600">Unpublished</span>
                                <span className="font-bold text-orange-600 text-sm md:text-base">
                                    {stats?.unpublishedCourses || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs md:text-sm text-gray-600">New Students</span>
                                <span className="font-bold text-blue-600 text-sm md:text-base">
                                    {stats?.recentEnrollments || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}