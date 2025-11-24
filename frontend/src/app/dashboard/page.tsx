'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
    const { user, _hasHydrated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !_hasHydrated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f2c0f] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1427]">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your learning journey today.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    icon={<BookOpen className="h-6 sm:h-8 w-6 sm:w-8 text-[#9f2c0f]" />}
                    title="Active Courses"
                    value="3"
                />
                <StatCard
                    icon={<Clock className="h-6 sm:h-8 w-6 sm:w-8 text-[#9f2c0f]" />}
                    title="Hours Learned"
                    value="24"
                />
                <StatCard
                    icon={<Award className="h-6 sm:h-8 w-6 sm:w-8 text-[#9f2c0f]" />}
                    title="Certificates"
                    value="2"
                />
                <StatCard
                    icon={<TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-[#9f2c0f]" />}
                    title="Progress"
                    value="68%"
                />
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">Your recent learning activity will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
    return (
        <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#1e1427]">{value}</p>
                    </div>
                    <div>{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}