'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Plus,
    BarChart3,
    GraduationCap,
    Menu,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/admin',
        },
        {
            label: 'Courses',
            icon: BookOpen,
            href: '/admin/courses',
        },
        {
            label: 'Create Course',
            icon: Plus,
            href: '/admin/courses/create',
        },
        {
            label: 'Users',
            icon: Users,
            href: '/admin/users',
        },
        {
            label: 'Enrollments',
            icon: GraduationCap,
            href: '/admin/enrollments',
        },
        {
            label: 'Tasks',
            icon: FileText,
            href: '/admin/tasks',
        },
        {
            label: 'Meetings',
            icon: Calendar,
            href: '/admin/meetings',
        },
        {
            label: 'Analytics',
            icon: BarChart3,
            href: '/admin/analytics',
        },
    ];

    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 p-2">
                            <div className="w-8 h-8 bg-[#9f2c0f] rounded-lg flex items-center justify-center">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm">Admin Panel</h2>
                                <p className="text-xs text-gray-400">EduTech LMS</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors hidden lg:block"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>



            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 px-3 py-4 rounded-lg transition-all group',
                                    isActive
                                        ? 'bg-[#9f2c0f] text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-5 w-5 flex-shrink-0',
                                        isActive && 'text-white',
                                    )}
                                />
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.label}</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-700 space-y-2">
                {/* User Info */}
                {!isCollapsed && (
                    <div className="p-2 border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#9f2c0f] rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <Link href="/admin/settings">
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800',
                            isCollapsed && 'justify-center px-2'
                        )}
                    >
                        <Settings className="h-5 w-5" />
                        {!isCollapsed && <span className="ml-3">Settings</span>}
                    </Button>
                </Link>

                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className={cn(
                        'w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20',
                        isCollapsed && 'justify-center px-2'
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3">Logout</span>}
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1b161f] text-white rounded-lg shadow-lg"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex bg-[#1b161f] text-white transition-all duration-300 flex-col',
                    isCollapsed ? 'w-20' : 'w-64'
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 bottom-0 z-50 bg-[#1b161f] text-white transition-transform duration-300 flex flex-col w-64',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
}