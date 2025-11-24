'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
    Home,
    BookOpen,
    GraduationCap,
    Calendar,
    FileText,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'My Learning', href: '/my-courses', icon: GraduationCap },
    { name: 'Tasks', href: '/tasks', icon: FileText },
    { name: 'Meetings', href: '/meetings', icon: Calendar },
    { name: 'Admin', href: '/admin', icon: Users, adminOnly: true },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, _hasHydrated } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Wait for hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    const filteredNavigation = navigation.filter(item => {
        if (item.adminOnly && user?.role !== 'ADMIN') {
            return false;
        }
        return true;
    });

    // Don't render until mounted and hydrated
    if (!mounted || !_hasHydrated) {
        return null;
    }

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="bg-white shadow-lg"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-[#1e1427] text-white
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="flex items-center justify-center h-20 border-b border-gray-700">
                    <Link href="/" className="flex items-center space-x-2">
                        <GraduationCap className="h-8 w-8 text-[#9f2c0f]" />
                        <span className="text-xl font-bold">EduTech LMS</span>
                    </Link>
                </div>

                {/* User info */}
                {user && (
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-[#9f2c0f] flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-semibold text-sm">
                                    {user.firstName[0]}{user.lastName[0]}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  transition-colors duration-200
                  ${isActive
                                        ? 'bg-[#9f2c0f] text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }
                `}
                            >
                                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-200"
                    >
                        <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}