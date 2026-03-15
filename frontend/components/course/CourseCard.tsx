import Link from 'next/link';
import Image from 'next/image';
import { Star, Users, Clock, BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    subject: string;
    grade: string;
    price: number;
    discountPrice?: number | null;
    thumbnail?: string | null;
    instructor: { name: string; avatar?: string | null };
    _count: { enrollments: number };
    avgRating?: string | null;
    totalLectures?: number;
    duration?: number | null;
  };
}

const GRADE_LABEL: Record<string, string> = {
  CLASS_9: 'Class 9', CLASS_10: 'Class 10',
  CLASS_11: 'Class 11', CLASS_12: 'Class 12',
};

const SUBJECT_COLORS: Record<string, string> = {
  Science: 'badge-blue', Maths: 'badge-orange',
  Physics: 'badge-blue', Chemistry: 'badge-green',
  Biology: 'badge-green', English: 'badge-gray',
  History: 'badge-gray', default: 'badge-gray',
};

export default function CourseCard({ course }: CourseCardProps) {
  const discount = course.discountPrice && course.price > course.discountPrice
    ? Math.round((1 - course.discountPrice / course.price) * 100)
    : null;

  const badgeClass = SUBJECT_COLORS[course.subject] || SUBJECT_COLORS.default;

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="card-hover group cursor-pointer overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-44 bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
          {course.thumbnail ? (
            <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <BookOpen className="w-16 h-16 text-brand-200 mb-2" />
              <span className="text-brand-400 font-semibold text-sm">{course.subject}</span>
            </div>
          )}

          {/* Grade badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
              {GRADE_LABEL[course.grade] || course.grade}
            </span>
          </div>

          {/* Discount badge */}
          {discount && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {discount}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Subject badge */}
          <div className="mb-2">
            <span className={badgeClass}>{course.subject}</span>
          </div>

          <h3 className="font-display font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-slate-500 text-xs mb-3">by {course.instructor.name}</p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            {course.avgRating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{course.avgRating}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course._count.enrollments.toLocaleString()}
            </span>
            {course.totalLectures && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {course.totalLectures} lectures
              </span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-lg text-slate-900">
                ₹{(course.discountPrice || course.price).toLocaleString()}
              </span>
              {discount && (
                <span className="text-sm text-slate-400 line-through">₹{course.price.toLocaleString()}</span>
              )}
            </div>
            <button className="btn-primary text-xs py-2 px-4">Enroll Now</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
