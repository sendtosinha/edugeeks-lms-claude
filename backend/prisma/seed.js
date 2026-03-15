const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edugeeks.co.in' },
    update: {},
    create: {
      name: 'EduGeeks Admin',
      email: 'admin@edugeeks.co.in',
      password: adminPass,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ─── Teacher Users ────────────────────────────────────────────────────────
  const teacherPass = await bcrypt.hash('teacher123', 12);
  const teacher1 = await prisma.user.upsert({
    where: { email: 'rajesh.kumar@edugeeks.co.in' },
    update: {},
    create: {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@edugeeks.co.in',
      password: teacherPass,
      role: 'TEACHER',
      isVerified: true,
    },
  });
  const teacher2 = await prisma.user.upsert({
    where: { email: 'priya.verma@edugeeks.co.in' },
    update: {},
    create: {
      name: 'Dr. Priya Verma',
      email: 'priya.verma@edugeeks.co.in',
      password: teacherPass,
      role: 'TEACHER',
      isVerified: true,
    },
  });
  console.log('✅ Teachers created');

  // ─── Sample Student ───────────────────────────────────────────────────────
  const studentPass = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@test.com',
      password: studentPass,
      role: 'STUDENT',
      grade: 'CLASS_10',
      isVerified: true,
    },
  });
  console.log('✅ Sample student created');

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { name: 'Science', slug: 'science', icon: '🔬', color: '#3B82F6' },
    { name: 'Mathematics', slug: 'mathematics', icon: '📐', color: '#8B5CF6' },
    { name: 'Physics', slug: 'physics', icon: '⚡', color: '#06B6D4' },
    { name: 'Chemistry', slug: 'chemistry', icon: '⚗️', color: '#10B981' },
    { name: 'Biology', slug: 'biology', icon: '🧬', color: '#22C55E' },
    { name: 'English', slug: 'english', icon: '📖', color: '#F59E0B' },
    { name: 'Social Science', slug: 'social-science', icon: '🌍', color: '#EC4899' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories created');

  // ─── Courses ──────────────────────────────────────────────────────────────
  const scienceCat = await prisma.category.findUnique({ where: { slug: 'science' } });
  const mathsCat = await prisma.category.findUnique({ where: { slug: 'mathematics' } });
  const physicsCat = await prisma.category.findUnique({ where: { slug: 'physics' } });

  const course1 = await prisma.course.upsert({
    where: { slug: 'class-10-science-complete-course' },
    update: {},
    create: {
      title: 'Class 10 Science — Complete Board Preparation',
      slug: 'class-10-science-complete-course',
      description: 'Comprehensive Class 10 Science course covering all NCERT chapters in Physics, Chemistry and Biology. HD video lectures, downloadable notes, and chapter-wise tests.',
      shortDesc: 'Master Class 10 Science with HD videos, notes & tests. Score 95+ in boards.',
      price: 1299,
      discountPrice: 649,
      grade: 'CLASS_10',
      subject: 'Science',
      examCategory: ['CBSE'],
      language: 'Hindi/English',
      totalLectures: 45,
      isPublished: true,
      isFeatured: true,
      instructorId: teacher2.id,
      categoryId: scienceCat.id,
      metaTitle: 'Class 10 Science Complete Course | CBSE Board 2025',
      metaDescription: 'Best Class 10 Science online course for CBSE board exams. Expert teachers, HD videos, downloadable notes.',
    },
  });

  // Add chapters and lectures
  const chapter1 = await prisma.chapter.create({
    data: {
      title: 'Chapter 1: Chemical Reactions and Equations',
      position: 1,
      isPublished: true,
      isFree: false,
      courseId: course1.id,
    },
  });

  await prisma.lecture.createMany({
    data: [
      {
        title: 'Introduction to Chemical Reactions',
        position: 1,
        videoDuration: 1200,
        isFree: true,
        isPublished: true,
        chapterId: chapter1.id,
        videoProvider: 'vimeo',
      },
      {
        title: 'Types of Chemical Reactions',
        position: 2,
        videoDuration: 1800,
        isFree: false,
        isPublished: true,
        chapterId: chapter1.id,
        videoProvider: 'vimeo',
      },
      {
        title: 'Balancing Chemical Equations',
        position: 3,
        videoDuration: 1500,
        isFree: false,
        isPublished: true,
        chapterId: chapter1.id,
        videoProvider: 'vimeo',
      },
    ],
    skipDuplicates: true,
  });

  const chapter2 = await prisma.chapter.create({
    data: {
      title: 'Chapter 2: Acids, Bases and Salts',
      position: 2,
      isPublished: true,
      courseId: course1.id,
    },
  });

  await prisma.lecture.createMany({
    data: [
      {
        title: 'Introduction to Acids and Bases',
        position: 1,
        videoDuration: 1350,
        isFree: false,
        isPublished: true,
        chapterId: chapter2.id,
      },
      {
        title: 'pH Scale and Indicators',
        position: 2,
        videoDuration: 1620,
        isFree: false,
        isPublished: true,
        chapterId: chapter2.id,
      },
    ],
    skipDuplicates: true,
  });

  // ─── Test for Course ──────────────────────────────────────────────────────
  const test1 = await prisma.test.create({
    data: {
      title: 'Chapter 1: Chemical Reactions — Chapter Test',
      description: 'Test your understanding of chemical reactions and equations',
      duration: 30,
      totalMarks: 20,
      passingMarks: 12,
      isPublished: true,
      courseId: course1.id,
      questions: {
        create: [
          {
            text: 'Which of the following is an example of a combination reaction?',
            type: 'MCQ',
            options: ['2H₂ + O₂ → 2H₂O', 'CaCO₃ → CaO + CO₂', 'Fe + CuSO₄ → FeSO₄ + Cu', 'Zn + H₂SO₄ → ZnSO₄ + H₂'],
            correctAnswer: '2H₂ + O₂ → 2H₂O',
            explanation: 'Combination reaction is when two or more substances combine to form a single product.',
            marks: 2,
            negativeMarks: 0.5,
          },
          {
            text: 'The chemical formula of rust is:',
            type: 'MCQ',
            options: ['Fe₂O₃', 'Fe₂O₃·xH₂O', 'FeO', 'Fe₃O₄'],
            correctAnswer: 'Fe₂O₃·xH₂O',
            explanation: 'Rust is hydrated iron(III) oxide with formula Fe₂O₃·xH₂O.',
            marks: 2,
            negativeMarks: 0.5,
          },
          {
            text: 'Which gas is produced when zinc reacts with dilute hydrochloric acid?',
            type: 'MCQ',
            options: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Nitrogen'],
            correctAnswer: 'Hydrogen',
            explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas is produced.',
            marks: 2,
            negativeMarks: 0.5,
          },
          {
            text: 'A decomposition reaction requires energy. True or False?',
            type: 'TRUE_FALSE',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Decomposition reactions generally require heat, light, or electricity.',
            marks: 1,
            negativeMarks: 0,
          },
          {
            text: 'In the reaction CuO + H₂ → Cu + H₂O, copper oxide is:',
            type: 'MCQ',
            options: ['Oxidized', 'Reduced', 'Neither oxidized nor reduced', 'Both oxidized and reduced'],
            correctAnswer: 'Reduced',
            explanation: 'CuO loses oxygen to become Cu, so it is reduced. This is a reduction reaction.',
            marks: 2,
            negativeMarks: 0.5,
          },
        ],
      },
    },
  });

  // ─── Another Course ───────────────────────────────────────────────────────
  await prisma.course.upsert({
    where: { slug: 'class-11-physics-jee-foundation' },
    update: {},
    create: {
      title: 'Class 11 Physics — JEE Foundation',
      slug: 'class-11-physics-jee-foundation',
      description: 'Build a rock-solid foundation in Class 11 Physics for JEE Main and Advanced. Covers all NCERT topics with JEE-level problem solving.',
      shortDesc: 'Expert JEE Physics preparation with 500+ problems and mock tests.',
      price: 1999,
      discountPrice: 999,
      grade: 'CLASS_11',
      subject: 'Physics',
      examCategory: ['JEE', 'CBSE'],
      language: 'Hindi/English',
      totalLectures: 68,
      isPublished: true,
      isFeatured: true,
      instructorId: teacher1.id,
      categoryId: physicsCat.id,
    },
  });

  await prisma.course.upsert({
    where: { slug: 'class-9-maths-complete' },
    update: {},
    create: {
      title: 'Class 9 Mathematics — Complete Course',
      slug: 'class-9-maths-complete',
      description: 'Master Class 9 Maths with step-by-step explanations. Perfect for CBSE board preparation.',
      shortDesc: 'Clear all your Class 9 Maths concepts with expert guidance.',
      price: 999,
      discountPrice: 499,
      grade: 'CLASS_9',
      subject: 'Maths',
      examCategory: ['CBSE'],
      language: 'Hindi/English',
      totalLectures: 38,
      isPublished: true,
      isFeatured: true,
      instructorId: teacher1.id,
      categoryId: mathsCat.id,
    },
  });

  // ─── Enrollment ───────────────────────────────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course1.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course1.id,
      status: 'ACTIVE',
    },
  });

  // ─── Blog Posts ───────────────────────────────────────────────────────────
  await prisma.blogPost.upsert({
    where: { slug: 'career-options-after-class-10' },
    update: {},
    create: {
      title: 'Career Options After Class 10 — Complete Guide 2025',
      slug: 'career-options-after-class-10',
      excerpt: 'Confused about what to do after 10th? Explore all pathways.',
      content: 'Full article content here...',
      category: 'Career guidance',
      tags: ['career', 'class 10', 'guidance'],
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'neet-last-30-days-strategy' },
    update: {},
    create: {
      title: 'NEET Last 30 Days Strategy — Score 640+ with This Plan',
      slug: 'neet-last-30-days-strategy',
      excerpt: 'Day-by-day revision plan to maximize your NEET score.',
      content: 'Full NEET strategy content...',
      category: 'NEET',
      tags: ['NEET', 'strategy', 'preparation'],
      isPublished: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:   admin@edugeeks.co.in / admin123');
  console.log('  Teacher: rajesh.kumar@edugeeks.co.in / teacher123');
  console.log('  Student: student@test.com / student123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
