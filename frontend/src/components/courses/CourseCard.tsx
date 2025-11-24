import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';
import { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-[#9f2c0f] to-[#1b161f] overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={getLevelColor(course.level)}>
            {formatLevel(course.level)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardHeader className="flex-grow">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <h3 className="font-bold text-lg line-clamp-2 text-[#1b161f]">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {course.description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{course._count?.modules || 0} modules</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{course._count?.enrollments || 0} students</span>
          </div>
        </div>

        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span className="font-medium">
            By {course.creator.firstName} {course.creator.lastName}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full bg-[#9f2c0f] hover:bg-[#8a2609] text-white">
            View Course
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}