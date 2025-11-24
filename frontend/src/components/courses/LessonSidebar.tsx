'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, PlayCircle, FileText, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

interface Lesson {
    id: string;
    title: string;
    contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT';
    duration?: number;
    order: number;
}

interface LessonSidebarProps {
    modules: Module[];
    currentLessonId: string | null;
    completedLessons: string[];
    onLessonSelect: (lessonId: string) => void;
}

export default function LessonSidebar({
    modules,
    currentLessonId,
    completedLessons,
    onLessonSelect,
}: LessonSidebarProps) {
    const getLessonIcon = (lesson: Lesson) => {
        if (completedLessons.includes(lesson.id)) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        }

        switch (lesson.contentType) {
            case 'VIDEO':
                return <PlayCircle className="h-4 w-4 text-gray-400" />;
            case 'TEXT':
                return <FileText className="h-4 w-4 text-gray-400" />;
            case 'DOCUMENT':
                return <FileText className="h-4 w-4 text-gray-400" />;
            default:
                return <Circle className="h-4 w-4 text-gray-400" />;
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        return `${minutes} min`;
    };

    return (
        <Card className="h-full overflow-hidden flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="text-lg">Course Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="divide-y">
                    {modules
                        .sort((a, b) => a.order - b.order)
                        .map((module, moduleIndex) => (
                            <div key={module.id}>
                                {/* Module Header */}
                                <div className="px-4 py-3 bg-gray-50 border-b">
                                    <h3 className="font-semibold text-sm text-[#1b161f]">
                                        Module {moduleIndex + 1}: {module.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* Lessons */}
                                <div>
                                    {module.lessons
                                        .sort((a, b) => a.order - b.order)
                                        .map((lesson, lessonIndex) => {
                                            const isActive = lesson.id === currentLessonId;
                                            const isCompleted = completedLessons.includes(lesson.id);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => onLessonSelect(lesson.id)}
                                                    className={cn(
                                                        "w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left",
                                                        isActive && "bg-blue-50 border-l-4 border-[#9f2c0f]"
                                                    )}
                                                >
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {getLessonIcon(lesson)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={cn(
                                                                "text-sm font-medium line-clamp-2",
                                                                isActive ? "text-[#9f2c0f]" : "text-gray-900",
                                                                isCompleted && "text-gray-600"
                                                            )}
                                                        >
                                                            {lessonIndex + 1}. {lesson.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs px-1.5 py-0"
                                                            >
                                                                {lesson.contentType}
                                                            </Badge>
                                                            {lesson.duration && (
                                                                <span className="text-xs text-gray-500">
                                                                    {formatDuration(lesson.duration)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}