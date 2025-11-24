'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            toast.error('Please login to access admin panel');
            router.push('/login');
            return;
        }

        if (user?.role !== 'ADMIN') {
            toast.error('Access denied. Admin only.');
            router.push('/dashboard');
        }
    }, [_hasHydrated, isAuthenticated, user, router]);

    if (!_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9f2c0f] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Toaster position="top-right" />
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}