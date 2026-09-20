import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable must be set in production");
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

const COOKIE_NAME = "forge_session";

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "STAFF" | "TENDER";
  name: string;
  email: string;
};

/**
 * Cutoff to store in sessionsValidFrom when revoking sessions.
 *
 * A JWT's `iat` is whole seconds, so using the raw millisecond clock would reject
 * a token minted in the same second as the revocation — including the fresh one
 * we hand back to the user who just changed their own password. Flooring to the
 * start of the second keeps that token valid while still rejecting every token
 * from any earlier second.
 */
export function sessionRevocationCutoff(): Date {
  return new Date(Math.floor(Date.now() / 1000) * 1000);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Resolves the current session against the database rather than trusting the JWT
 * alone. The token is only a claim: it's valid for 7 days and says nothing about
 * whether the account still exists, still holds that role, or has since had its
 * password changed. Without this, deleting or demoting someone left them with
 * their old access until the token happened to expire.
 *
 * Memoised with React's cache() so a render pass that calls this repeatedly costs
 * a single query (see the Next.js authentication guide's Data Access Layer).
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWT_SECRET));
  } catch {
    return null;
  }

  const claim = payload as unknown as SessionPayload;
  if (!claim?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: claim.userId },
    select: { id: true, name: true, email: true, role: true, sessionsValidFrom: true },
  });
  if (!user) return null; // deleted account — the token is worthless immediately

  // Tokens minted before a password change or an explicit revocation are rejected.
  if (user.sessionsValidFrom && typeof payload.iat === "number") {
    if (payload.iat * 1000 < user.sessionsValidFrom.getTime()) return null;
  }

  // Role comes from the database, never the token, so a demotion is instant.
  return { userId: user.id, role: user.role, name: user.name, email: user.email };
});

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

type AuthRole = "ADMIN" | "STAFF" | "TENDER";

export async function requireAuth(requiredRole?: AuthRole | AuthRole[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(session.role)) {
      throw new Error("FORBIDDEN");
    }
  }
  return session;
}

export async function getUserFromDb(userId: string) {
  return db.user.findUnique({ where: { id: userId } });
}
