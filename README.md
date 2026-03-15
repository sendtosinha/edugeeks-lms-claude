# 📚 EduGeeks LMS — Full-Stack EdTech Platform

A production-ready Learning Management System for Class 9–12 students preparing for **CBSE, JEE, NEET, and CUET** exams.

---

## 🏗️ Project Structure

```
edugeeks-lms/
├── frontend/                    # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx             # Homepage
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   ├── auth/
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── courses/
│   │   │   ├── page.tsx         # Course marketplace
│   │   │   └── [slug]/          # Course detail + Razorpay enroll
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Dashboard sidebar layout
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── courses/         # My enrolled courses
│   │   │   ├── tests/           # Test history & scores
│   │   │   ├── progress/        # Charts & analytics
│   │   │   ├── notes/           # Personal notes
│   │   │   └── profile/         # User profile
│   │   ├── learn/[slug]/        # Video lecture player
│   │   ├── test/[testId]/       # Test taking UI
│   │   ├── blog/                # Blog listing
│   │   │   └── [slug]/          # Blog post detail
│   │   └── admin/               # Admin panel
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # Responsive navigation
│   │   │   ├── Footer.tsx       # Footer with links
│   │   │   └── Providers.tsx    # React Query provider
│   │   ├── home/
│   │   │   ├── HeroSection.tsx  # Landing hero
│   │   │   ├── FeaturesSection  # Platform features
│   │   │   ├── PopularCourses   # Featured courses grid
│   │   │   ├── StatsSection     # Platform statistics
│   │   │   ├── ExamBanners      # JEE/NEET/CUET cards
│   │   │   ├── Testimonials     # Student reviews
│   │   │   └── CTASection       # Call-to-action
│   │   └── course/
│   │       └── CourseCard.tsx   # Reusable course card
│   └── lib/
│       ├── api.ts               # Axios client
│       └── store/authStore.ts   # Zustand auth state
│
└── backend/                     # Node.js + Express API
    ├── src/
    │   ├── index.js             # Server entry point
    │   ├── routes/              # All API routes
    │   │   ├── auth.routes.js
    │   │   ├── course.routes.js
    │   │   ├── payment.routes.js
    │   │   ├── test.routes.js
    │   │   ├── dashboard.routes.js
    │   │   ├── admin.routes.js
    │   │   ├── blog.routes.js
    │   │   ├── lecture.routes.js
    │   │   ├── enrollment.routes.js
    │   │   └── upload.routes.js
    │   ├── controllers/
    │   │   ├── auth.controller.js     # JWT + Google OAuth
    │   │   ├── course.controller.js   # Course CRUD
    │   │   ├── payment.controller.js  # Razorpay integration
    │   │   ├── test.controller.js     # Quiz & mock tests
    │   │   ├── dashboard.controller.js
    │   │   └── admin.controller.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js     # JWT auth guard
    │   │   ├── error.middleware.js    # Global error handler
    │   │   └── validate.middleware.js # Input validation
    │   ├── services/
    │   │   └── email.service.js       # Nodemailer emails
    │   └── utils/
    │       ├── appError.js
    │       └── logger.js              # Winston logging
    └── prisma/
        ├── schema.prisma             # PostgreSQL schema
        └── seed.js                   # Sample data seeder
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-org/edugeeks-lms
cd edugeeks-lms

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** — copy and edit `.env.example`:
```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL, JWT_SECRET, RAZORPAY keys, etc.
```

**Frontend** — copy and edit `.env.example`:
```bash
cd frontend
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL, NEXT_PUBLIC_RAZORPAY_KEY_ID
```

### 3. Setup Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to PostgreSQL
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open http://localhost:3000

---

## 🔐 Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edugeeks.co.in | admin123 |
| Teacher | rajesh.kumar@edugeeks.co.in | teacher123 |
| Student | student@test.com | student123 |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register with email |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/google` | Google OAuth |
| GET  | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/courses` | List courses (with filters) |
| GET  | `/api/v1/courses/:slug` | Get course details |
| POST | `/api/v1/courses` | Create course (admin/teacher) |
| PUT  | `/api/v1/courses/:id` | Update course |
| DELETE | `/api/v1/courses/:id` | Delete course (admin) |
| POST | `/api/v1/courses/:id/review` | Add review |
| GET  | `/api/v1/courses/categories` | Get categories |

### Payments (Razorpay)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-order` | Create Razorpay order |
| POST | `/api/v1/payments/verify` | Verify & complete payment |
| POST | `/api/v1/payments/webhook` | Razorpay webhook |
| GET  | `/api/v1/payments/my-orders` | Student order history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/dashboard` | Full student dashboard data |
| PATCH | `/api/v1/dashboard/progress/:lectureId` | Update lecture progress |
| GET  | `/api/v1/dashboard/notes` | Get student notes |
| POST | `/api/v1/dashboard/notes` | Save note |

### Tests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/tests/course/:courseId` | Tests for a course |
| POST | `/api/v1/tests/start/:testId` | Start a test |
| POST | `/api/v1/tests/submit/:attemptId` | Submit & auto-grade |
| GET  | `/api/v1/tests/result/:attemptId` | Get result with analysis |
| GET  | `/api/v1/tests/history` | Student test history |
| POST | `/api/v1/tests` | Create test (admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/admin/stats` | Platform statistics |
| GET  | `/api/v1/admin/users` | All users |
| GET  | `/api/v1/admin/enrollments` | All enrollments |
| GET  | `/api/v1/admin/revenue` | Revenue analytics |
| PATCH | `/api/v1/admin/courses/:id/toggle-publish` | Toggle publish |

---

## 🗄️ Database Schema

Key models:
- **User** — Students, Teachers, Admins with roles
- **Course** — With grade, subject, exam category, pricing
- **Chapter** + **Lecture** — Hierarchical curriculum
- **Enrollment** — Student-course relationships
- **LectureProgress** — Watch time & completion tracking
- **Test** + **Question** + **TestAttempt** + **Answer** — Full quiz system
- **Order** + **OrderItem** — Razorpay payment records
- **Review** — Course ratings
- **Note** — Student personal notes
- **BlogPost** — SEO blog with categories & tags

---

## 💳 Razorpay Integration

1. Create account at https://razorpay.com
2. Get test API keys from Dashboard > Settings > API Keys
3. Add to backend `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   ```
4. Add to frontend `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
   ```
5. Configure webhook URL in Razorpay Dashboard:
   `https://yourdomain.com/api/v1/payments/webhook`

---

## 🎬 Video Hosting

### Option A: Vimeo Pro
- Upload videos to Vimeo
- Store Vimeo video ID in `lecture.videoUrl`
- Set `lecture.videoProvider = 'vimeo'`

### Option B: AWS S3 + CloudFront
- Upload videos using the `/api/v1/upload/presigned` endpoint
- Store S3 key in `lecture.videoUrl`
- Set `lecture.videoProvider = 's3'`
- Configure CloudFront for CDN delivery

---

## 🔒 Security Features

- JWT authentication (7-day access token, 30-day refresh)
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min global, 10 req/15min for auth)
- Helmet.js security headers
- Input validation with express-validator + Zod
- CORS configuration
- Role-based access control (STUDENT / TEACHER / ADMIN)
- Razorpay signature verification for payment security
- Presigned S3 URLs for secure media access

---

## 📈 Scalability

The platform is designed to handle **10,000+ concurrent students**:

- PostgreSQL with proper indexes on frequently queried fields
- React Query caching on the frontend (1-5 min stale time)
- Rate limiting to prevent abuse
- Pagination on all list endpoints
- Lazy loading and code splitting in Next.js
- S3 + CloudFront for media delivery at scale
- Winston structured logging for monitoring

---

## 🚢 Deployment

### Backend (Railway / Render / EC2)
```bash
cd backend
npm install --production
npm start
```

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel with one click
```

### Database
- Use **Supabase**, **Neon**, or **Railway PostgreSQL**
- Run `npm run db:migrate` in production

---

## 📧 Email Configuration

Uses Nodemailer. For Gmail:
1. Enable 2FA on your Google account
2. Create an App Password
3. Use App Password in `SMTP_PASS`

For production, use **SendGrid**, **AWS SES**, or **Resend**.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — free to use for educational and commercial purposes.

---

Built with ❤️ in India 🇮🇳 for Indian students
