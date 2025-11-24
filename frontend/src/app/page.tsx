import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  GraduationCap,
  TrendingUp,
  Shield,
  HeadphonesIcon
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-6 sm:h-8 w-6 sm:w-8 text-[#9f2c0f]" />
              <span className="text-lg sm:text-xl font-bold text-[#1e1427]">EduTech LMS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-[#1e1427]">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#9f2c0f] hover:bg-[#8a2609] text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[#1e1427]">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#9f2c0f] hover:bg-[#8a2609] text-white">
                  Start
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#1e1427] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Transform Your Learning Journey
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Access world-class courses, track your progress, and achieve your goals
              with our comprehensive Learning Management System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#9f2c0f] hover:bg-[#8a2609] text-white w-full sm:w-auto">
                  Start Learning Today
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#1e1427] w-full sm:w-auto"
                >
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10,000+" label="Active Students" />
            <StatCard number="500+" label="Courses Available" />
            <StatCard number="95%" label="Completion Rate" />
            <StatCard number="50+" label="Expert Instructors" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e1427] mb-4">
              Why Choose EduTech LMS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey, all in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="h-12 w-12 text-[#9f2c0f]" />}
              title="Rich Course Content"
              description="Access video lessons, interactive quizzes, reading materials, and hands-on projects designed by industry experts."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-[#9f2c0f]" />}
              title="Expert Instructors"
              description="Learn from industry professionals and experienced educators with real-world expertise."
            />
            <FeatureCard
              icon={<Award className="h-12 w-12 text-[#9f2c0f]" />}
              title="Earn Certificates"
              description="Get recognized for your achievements with industry-recognized certificates upon course completion."
            />
            <FeatureCard
              icon={<Calendar className="h-12 w-12 text-[#9f2c0f]" />}
              title="Live Sessions"
              description="Join scheduled live classes, webinars, and Q&A sessions to interact directly with instructors."
            />
            <FeatureCard
              icon={<TrendingUp className="h-12 w-12 text-[#9f2c0f]" />}
              title="Progress Tracking"
              description="Monitor your learning journey with detailed analytics and personalized insights."
            />
            <FeatureCard
              icon={<Clock className="h-12 w-12 text-[#9f2c0f]" />}
              title="Learn at Your Pace"
              description="Self-paced courses that fit your schedule. Learn anytime, anywhere, on any device."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1e1427] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number="1"
              title="Create Your Account"
              description="Sign up for free and set up your personalized learning profile in minutes."
            />
            <StepCard
              number="2"
              title="Choose Your Courses"
              description="Browse our extensive catalog and enroll in courses that match your goals."
            />
            <StepCard
              number="3"
              title="Start Learning"
              description="Access course materials, complete assignments, and track your progress."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#1e1427] mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform is designed to provide you with all the tools and
                resources necessary to achieve your learning goals.
              </p>
              <div className="space-y-4">
                <BenefitItem
                  icon={<CheckCircle className="h-6 w-6 text-[#9f2c0f]" />}
                  text="Lifetime access to course materials"
                />
                <BenefitItem
                  icon={<CheckCircle className="h-6 w-6 text-[#9f2c0f]" />}
                  text="Mobile-friendly learning experience"
                />
                <BenefitItem
                  icon={<CheckCircle className="h-6 w-6 text-[#9f2c0f]" />}
                  text="Community support and discussion forums"
                />
                <BenefitItem
                  icon={<CheckCircle className="h-6 w-6 text-[#9f2c0f]" />}
                  text="Regular content updates and improvements"
                />
                <BenefitItem
                  icon={<CheckCircle className="h-6 w-6 text-[#9f2c0f]" />}
                  text="Personalized learning recommendations"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <IconCard icon={<Globe />} title="Global Access" />
              <IconCard icon={<Zap />} title="Fast Learning" />
              <IconCard icon={<Shield />} title="Secure Platform" />
              <IconCard icon={<HeadphonesIcon />} title="24/7 Support" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1e1427] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of learners already transforming their careers and
            achieving their goals with EduTech LMS.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-[#9f2c0f] hover:bg-[#8a2609] text-white text-lg px-8"
            >
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e1427] text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-[#9f2c0f]" />
                <span className="text-lg font-bold">EduTech LMS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering learners worldwide with quality education.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/courses" className="hover:text-white">Browse Courses</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2024 EduTech LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-[#9f2c0f] mb-2">{number}</div>
      <div className="text-sm md:text-base text-gray-600">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-[#1e1427] mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-[#9f2c0f] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-[#1e1427] mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center space-x-3">
      {icon}
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

function IconCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-3 text-[#9f2c0f]">
          {React.cloneElement(icon as React.ReactElement, { className: 'h-10 w-10' })}
        </div>
        <h4 className="font-semibold text-[#1e1427]">{title}</h4>
      </CardContent>
    </Card>
  );
}