import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

const COOKIE_NAME = "forge_session";

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await getSessionFromRequest(request);

  const isInstructorRoute = pathname.startsWith("/instructor");
  const isStudentRoute =
    pathname.startsWith("/student") ||
    pathname.startsWith("/catalog") ||
    pathname.startsWith("/learn");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthRoute && session) {
    const redirectPath =
      session.role === "INSTRUCTOR" ? "/instructor/dashboard" : "/student/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if ((isInstructorRoute || isStudentRoute) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isInstructorRoute && session?.role !== "INSTRUCTOR") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  if (isStudentRoute && session?.role === "INSTRUCTOR") {
    return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/instructor/:path*",
    "/student/:path*",
    "/catalog/:path*",
    "/learn/:path*",
    "/login",
    "/signup",
  ],
};
