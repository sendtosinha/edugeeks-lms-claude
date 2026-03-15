import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import PopularCourses from '@/components/home/PopularCourses';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ExamBanners from '@/components/home/ExamBanners';
import CTASection from '@/components/home/CTASection';

export const metadata: Metadata = {
  title: 'EduGeeks — Smart Learning for Class 9–12 | CBSE, JEE, NEET, CUET',
  description: 'Affordable HD video courses, revision notes, and test series for CBSE. Expert teachers for JEE, NEET, CUET preparation.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ExamBanners />
        <PopularCourses />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
