# Forge LMS

A full-featured, self-hosted Learning Management System built with Next.js 16, Prisma 7, and PostgreSQL.

## Tech Stack

- **Next.js 16** — App Router, React Server Components
- **React 19** — with TipTap rich text editor, @dnd-kit drag-and-drop
- **Prisma 7** — ORM with `@prisma/adapter-pg` driver adapter
- **PostgreSQL** — relational database
- **Jose + bcryptjs** — JWT auth with hashed passwords
- **Tailwind CSS v4** — styling
- **Radix UI** — accessible component primitives

## Prerequisites

- Node.js ≥ 20.9 (tested on 26.3.1 via `brew install node`)
- PostgreSQL running locally (tested on 17 via `brew install postgresql@17`)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
# Start postgres if needed
brew services start postgresql@17

# Create the database
psql postgres -c "CREATE DATABASE forge_lms;"
```

### 3. Configure environment

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://<your-pg-user>@localhost:5432/forge_lms"
JWT_SECRET="change-me-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

### 4. Run migrations

```bash
npx prisma migrate dev
```

### 5. Seed demo data

```bash
npm run db:seed
```

This creates:
- **Instructor**: `instructor@forge.dev` / `password123`
- **Student**: `student@forge.dev` / `password123`
- Complete example course "Introduction to Web Development" with 3 modules, 7 lessons, 2 quizzes

### 6. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Features

### Instructor

- **Course Builder** — Create and manage courses with drag-and-drop module/lesson reordering
- **Rich Text Lessons** — TipTap editor with headings, bold/italic, lists, images
- **Video Lessons** — Embed video URLs
- **Quiz Builder** — Multiple choice, true/false, and short-answer questions
- **Stats** — Enrollment counts and completion rates per course

### Student

- **Course Catalog** — Browse and enroll in published courses
- **Course Player** — Lesson sidebar with progress checkmarks, content viewer
- **Progress Tracking** — Per-lesson completion, course completion detection
- **Quizzes** — Graded attempts with pass/fail, retakes supported
- **Certificates** — Auto-issued on course completion with public verification URL

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage (redirects based on role) |
| `/login`, `/signup` | Auth pages |
| `/instructor/courses` | Instructor course list |
| `/instructor/courses/new` | Create a course |
| `/instructor/courses/[id]/builder` | Course builder |
| `/student/catalog` | Course catalog |
| `/student/courses` | Enrolled courses |
| `/student/learn/[courseId]/[lessonId]` | Course player |
| `/certificates/[code]` | Public certificate verification |

## Notes

- File uploads are stored in `./public/uploads` (local — swap `src/lib/storage.ts` for S3)
- All npm/npx commands require Node ≥ 20. If you have an older system node, prefix with `PATH="/opt/homebrew/opt/node/bin:$PATH"` or use `nvm`
- The `proxy.ts` file handles auth routing (Next.js 16 renamed `middleware.ts` to `proxy.ts`)
