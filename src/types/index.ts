export type Role = "ADMIN" | "STAFF";
export type CourseStatus = "DRAFT" | "PUBLISHED";
export type CourseType = "STANDARD" | "SCORM";
export type ContentType = "TEXT" | "VIDEO" | "QUIZ";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
export type ScormVersion = "SCORM_12" | "SCORM_2004";

export interface ScormPackage {
  id: string;
  courseId: string;
  version: ScormVersion;
  entryPoint: string;
  extractedPath: string;
  originalFilename: string;
  manifestTitle: string | null;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  status: CourseStatus;
  type: CourseType;
  instructorId: string;
  instructor?: { name: string; email: string };
  createdAt: Date;
  updatedAt: Date;
  modules?: Module[];
  scormPackage?: ScormPackage | null;
  _count?: {
    enrollments: number;
    modules: number;
  };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  contentType: ContentType;
  content: string | null;
  videoUrl: string | null;
  videoThumbnail?: string | null;
  quiz: Quiz | null;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  type: QuestionType;
  orderIndex: number;
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt: Date | null;
  course?: Course;
  lessonProgress?: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completedAt: Date;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  passed: boolean;
  submittedAt: Date;
  answers?: AttemptAnswer[];
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerOptionId: string | null;
  textAnswer: string | null;
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issuedAt: Date;
  verificationCode: string;
  student?: { name: string };
  course?: { title: string; instructor?: { name: string } };
}

export type ApiResponse<T = unknown> =
  | { data: T; error?: never }
  | { data?: never; error: string };
