import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Express, type Request, type Response } from 'express';
import {
  SESSION_COOKIE_NAME,
  parseCookies,
  signSessionToken,
  verifySessionToken,
} from './auth';
import { EdgeMaxDbError, type EdgeMaxDataStore } from './store';

export function resolveSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) {
    return process.env.SESSION_SECRET.trim();
  }

  // Deterministic fallback derived from service account if deployed without explicit SESSION_SECRET
  const saSecretSeed =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (saSecretSeed && saSecretSeed.trim()) {
    return createHash('sha256')
      .update(`edgemax-session:${saSecretSeed}`)
      .digest('hex');
  }

  const dataDir = path.join(process.cwd(), '.data');
  const secretFile = path.join(dataDir, '.session-secret');
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(secretFile)) {
      const existing = fs.readFileSync(secretFile, 'utf8').trim();
      if (existing) return existing;
    }
    const generated = randomBytes(32).toString('hex');
    fs.writeFileSync(secretFile, generated, 'utf8');
    return generated;
  } catch {
    return randomBytes(32).toString('hex');
  }
}

export interface ApiAppOptions {
  getStore: () => Promise<EdgeMaxDataStore>;
  sessionSecret?: string;
}

export function createApiApp({
  getStore,
  sessionSecret = resolveSessionSecret(),
}: ApiAppOptions): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  // Normalize Netlify function mount path so both /api/* and /.netlify/functions/api/* resolve identically
  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      const suffix = req.url.slice('/.netlify/functions/api'.length);
      req.url = `/api${suffix.startsWith('/') || suffix === '' ? suffix : `/${suffix}`}`;
    }
    next();
  });

  function setSessionCookie(
    req: Request,
    res: Response,
    userType: 'student' | 'tutor',
    userId: string
  ) {
    const token = signSessionToken({ userType, userId }, sessionSecret);
    const isHttps =
      req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  function getAuthenticatedSession(req: Request) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    return verifySessionToken(token, sessionSecret);
  }

  app.get('/api/health', async (_req, res) => {
    try {
      const store = await getStore();
      res.json({
        ok: true,
        programYear: '2027',
        database: store.backendName,
        ...(store.backendName === 'firestore'
          ? { firestoreDatabaseId: store.firestoreDatabaseId ?? '(default)' }
          : store.firestoreDatabaseId
            ? { firestoreDatabaseId: store.firestoreDatabaseId }
            : {}),
      });
    } catch (err) {
      const status = err instanceof EdgeMaxDbError ? err.status : 503;
      res.status(status).json({
        ok: false,
        programYear: '2027',
        error:
          err instanceof Error ? err.message : 'Database connection error.',
      });
    }
  });

  app.post('/api/students/register', async (req, res) => {
    try {
      const store = await getStore();
      const student = await store.registerStudent(req.body ?? {});
      setSessionCookie(req, res, 'student', student.id);
      res.status(201).json({
        userType: 'student',
        student,
      });
    } catch (err) {
      if (err instanceof EdgeMaxDbError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('Registration endpoint error:', err);
      res.status(500).json({
        error: 'Unable to save your registration right now. Please try again.',
      });
    }
  });

  app.post('/api/auth/student-login', async (req, res) => {
    const identifier =
      typeof req.body?.identifier === 'string' ? req.body.identifier : '';
    if (!identifier.trim()) {
      res.status(400).json({
        error: 'Enter your Email, Phone Number, or EdgeMax ID to log in.',
      });
      return;
    }

    try {
      const store = await getStore();
      const student = await store.findStudentByIdentifier(identifier);
      if (!student) {
        res.status(404).json({
          error:
            'No verified student profile matches that Email, Phone Number, or EdgeMax ID.',
        });
        return;
      }

      setSessionCookie(req, res, 'student', student.id);
      res.json({
        userType: 'student',
        student,
      });
    } catch (err) {
      if (err instanceof EdgeMaxDbError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('Student login error:', err);
      res.status(500).json({
        error: 'Unable to check your profile right now. Please try again.',
      });
    }
  });

  app.post('/api/auth/tutor-login', async (req, res) => {
    const identifier =
      typeof req.body?.identifier === 'string' ? req.body.identifier : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!identifier.trim() || !password) {
      res.status(400).json({
        error: 'Enter your Tutor ID (or phone number) and password.',
      });
      return;
    }

    try {
      const store = await getStore();
      const tutor = await store.authenticateTutor(identifier, password);
      if (!tutor) {
        res.status(401).json({
          error: 'Invalid Tutor ID / phone number or password.',
        });
        return;
      }

      const students = await store.listStudents();
      setSessionCookie(req, res, 'tutor', tutor.id);
      res.json({
        userType: 'tutor',
        tutor,
        students,
      });
    } catch (err) {
      if (err instanceof EdgeMaxDbError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('Tutor login error:', err);
      res.status(500).json({
        error: 'Unable to verify tutor credentials right now. Please try again.',
      });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    const session = getAuthenticatedSession(req);
    if (!session) {
      res.json({ authenticated: false });
      return;
    }

    try {
      const store = await getStore();
      if (session.userType === 'student') {
        const student = await store.getStudentById(session.userId);
        if (!student) {
          res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
          res.json({ authenticated: false });
          return;
        }
        res.json({
          authenticated: true,
          userType: 'student',
          student,
        });
        return;
      }

      const tutor = await store.getTutorById(session.userId);
      if (!tutor) {
        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        res.json({ authenticated: false });
        return;
      }

      const students = await store.listStudents();
      res.json({
        authenticated: true,
        userType: 'tutor',
        tutor,
        students,
      });
    } catch (err) {
      console.error('Session restore error:', err);
      res.json({ authenticated: false });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  return app;
}
