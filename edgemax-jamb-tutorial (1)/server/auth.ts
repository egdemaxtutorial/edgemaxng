import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const DEFAULT_TUTOR_PASSWORD = 'EDGEIDPASS#';
export const SESSION_COOKIE_NAME = 'edgemax_session';

export interface SessionPayload {
  userType: 'student' | 'tutor';
  userId: string;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  try {
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function signSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  secret: string,
  ttlMs: number = 7 * 24 * 60 * 60 * 1000
): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + ttlMs,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString(
    'base64url'
  );
  const sig = createHmac('sha256', secret)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(
  token: string,
  secret: string
): SessionPayload | null {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  try {
    const expectedSig = createHmac('sha256', secret)
      .update(encoded)
      .digest('base64url');
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as SessionPayload;

    if (
      (parsed.userType !== 'student' && parsed.userType !== 'tutor') ||
      typeof parsed.userId !== 'string' ||
      !parsed.userId ||
      typeof parsed.exp !== 'number' ||
      parsed.exp < Date.now()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = part.slice(0, eqIndex).trim();
    const val = part.slice(eqIndex + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}
