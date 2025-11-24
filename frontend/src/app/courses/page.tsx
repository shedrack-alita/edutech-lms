'use client'

import { useState } from 'react';
import CoursesList from '@/components/courses/CoursesList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<string>('all');
  const [appliedFilters, setAppliedFilters] = useState<{
    search?: string;
    category?: string;
    level?: string;
  }>({});

  const handleSearch = () => {
    setAppliedFilters({
      search: search || undefined,
      category: category && category !== 'all' ? category : undefined,
      level: level && level !== 'all' ? level : undefined,
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setLevel('all');
    setAppliedFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1b161f] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Explore Courses
              </h1>
              <p className="text-gray-300">
                Discover and enroll in courses to advance your skills
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1b161f]">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                className="bg-[#9f2c0f] hover:bg-[#8a2609] text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="container mx-auto px-4 py-8">
        <CoursesList filters={appliedFilters} />
      </div>
    </div>
  );
}