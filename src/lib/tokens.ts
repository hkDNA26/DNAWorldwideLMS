import crypto from "crypto";

/**
 * Cryptographically random token for anything a stranger must not be able to guess.
 *
 * The Prisma schema defaults these columns to cuid(), which is built for collision
 * resistance rather than unpredictability — it encodes a timestamp, a counter and a
 * machine fingerprint around a small random tail. Someone who can mint their own
 * token (by requesting a password reset for their own account) learns most of that
 * structure, which makes another user's token far cheaper to guess than it looks.
 * Always pass one of these explicitly rather than relying on the column default.
 */
export function secureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
