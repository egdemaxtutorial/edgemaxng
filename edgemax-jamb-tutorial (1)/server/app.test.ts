import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApiApp } from './app';
import { createSqliteStore } from './db';
import {
  parseServiceAccountFromEnv,
  resolveFirestoreDatabaseId,
  resolveFirestoreProjectId,
} from './firestoreStore';
import { EdgeMaxDbError, type EdgeMaxDataStore } from './store';

async function withServer(
  app: ReturnType<typeof createApiApp>,
  fn: (baseUrl: string) => Promise<void>
) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  }
}

test('API app handles health, student registration, session restore, and tutor auth including Netlify function paths', async () => {
  const store = createSqliteStore(':memory:');
  const app = createApiApp({
    getStore: async () => store,
    sessionSecret: 'test-session-secret-0123456789abcdef',
  });

  await withServer(app, async (baseUrl) => {
    // 1. Both /api/health and /.netlify/functions/api/health resolve cleanly
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as {
      ok: boolean;
      programYear: string;
      database: string;
    };
    assert.equal(healthJson.ok, true);
    assert.equal(healthJson.programYear, '2027');
    assert.equal(healthJson.database, 'sqlite');

    const netlifyHealthRes = await fetch(
      `${baseUrl}/.netlify/functions/api/health`
    );
    assert.equal(netlifyHealthRes.status, 200);
    const netlifyHealthJson = (await netlifyHealthRes.json()) as {
      ok: boolean;
    };
    assert.equal(netlifyHealthJson.ok, true);

    // 2. Register student through Netlify-style path and capture session cookie
    const regRes = await fetch(
      `${baseUrl}/.netlify/functions/api/students/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Adaeze Nwosu',
          email: 'adaeze@example.com',
          phoneNumber: '08055551234',
          aspiringCourse: 'Medicine and Surgery',
          otherSubjects: ['Biology', 'Chemistry', 'Physics'],
          aspiringSchool: 'UNN',
          confirmedDetails: true,
        }),
      }
    );
    assert.equal(regRes.status, 201);
    const cookieHeader = regRes.headers.get('set-cookie');
    assert.ok(cookieHeader && cookieHeader.includes('edgemax_session='));
    const sessionCookie = cookieHeader.split(';')[0];

    const regJson = (await regRes.json()) as {
      student: { id: string; verified: boolean };
    };
    assert.match(regJson.student.id, /^EDG-2027-[A-Z2-9]{4}$/);
    assert.equal(regJson.student.verified, true);

    // 3. Session restore via /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    assert.equal(meRes.status, 200);
    const meJson = (await meRes.json()) as {
      authenticated: boolean;
      userType: string;
      student: { id: string };
    };
    assert.equal(meJson.authenticated, true);
    assert.equal(meJson.userType, 'student');
    assert.equal(meJson.student.id, regJson.student.id);

    // 4. Reject wrong tutor password with 401
    const badTutorRes = await fetch(`${baseUrl}/api/auth/tutor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'EG-TUTOR-ISAAC',
        password: 'WRONG',
      }),
    });
    assert.equal(badTutorRes.status, 401);

    // 5. Accept valid tutor login with EDGEIDPASS# and return registered students
    const tutorRes = await fetch(`${baseUrl}/api/auth/tutor-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'EG-TUTOR-ISAAC',
        password: 'EDGEIDPASS#',
      }),
    });
    assert.equal(tutorRes.status, 200);
    const tutorJson = (await tutorRes.json()) as {
      tutor: { id: string; email: string | null };
      students: Array<{ id: string }>;
    };
    assert.equal(tutorJson.tutor.id, 'EG-TUTOR-ISAAC');
    assert.equal(tutorJson.tutor.email, null);
    assert.equal(tutorJson.students.length, 1);
    assert.equal(tutorJson.students[0].id, regJson.student.id);
  });
});

test('API app returns clean 503 JSON when database configuration is missing', async () => {
  const app = createApiApp({
    getStore: async () => {
      throw new EdgeMaxDbError('Missing FIREBASE_SERVICE_ACCOUNT_JSON', 503);
    },
    sessionSecret: 'test-session-secret-0123456789abcdef',
  });

  await withServer(app, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 503);
    const body = (await res.json()) as { ok: boolean; error: string };
    assert.equal(body.ok, false);
    assert.match(body.error, /FIREBASE_SERVICE_ACCOUNT_JSON/);
  });
});

test('Backend Firestore store defaults to (default) database and /api/health reports it', async () => {
  const prevDbId = process.env.FIREBASE_DATABASE_ID;
  delete process.env.FIREBASE_DATABASE_ID;
  try {
    assert.equal(resolveFirestoreDatabaseId(), '(default)');
  } finally {
    if (prevDbId !== undefined) {
      process.env.FIREBASE_DATABASE_ID = prevDbId;
    }
  }

  const sqliteBacking = createSqliteStore(':memory:');
  const mockFirestoreStore: EdgeMaxDataStore = {
    ...sqliteBacking,
    backendName: 'firestore',
    firestoreDatabaseId: '(default)',
  };

  const app = createApiApp({
    getStore: async () => mockFirestoreStore,
    sessionSecret: 'test-session-secret-0123456789abcdef',
  });

  await withServer(app, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      ok: boolean;
      database: string;
      firestoreDatabaseId: string;
    };
    assert.equal(body.ok, true);
    assert.equal(body.database, 'firestore');
    assert.equal(body.firestoreDatabaseId, '(default)');
  });
});

test('index.html includes the Google Search Console verification meta tag in <head>', () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  assert.ok(headMatch, 'Expected <head> section in index.html');
  assert.ok(
    headMatch[1].includes(
      '<meta name="google-site-verification" content="-PKx3PSthITCFmZRJnQzzdyc0eNGuYusfBL7FzSiAr0" />'
    )
  );
});

test('External Firebase service account JSON uses its own project_id and surfaces 503 on malformed JSON', () => {
  const prevProjectId = process.env.FIREBASE_PROJECT_ID;
  const prevSaJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  delete process.env.FIREBASE_PROJECT_ID;

  try {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      project_id: 'custom-edgemax-prod-project',
      client_email: 'firebase-adminsdk@custom-edgemax-prod-project.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\\nTEST\\n-----END PRIVATE KEY-----\\n',
    });

    const parsed = parseServiceAccountFromEnv();
    assert.ok(parsed);
    assert.equal(resolveFirestoreProjectId(parsed), 'custom-edgemax-prod-project');
    assert.ok(parsed.private_key?.includes('\nTEST\n'));

    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{not-valid-json';
    assert.throws(
      () => parseServiceAccountFromEnv(),
      (err: unknown) => err instanceof EdgeMaxDbError && err.status === 503
    );
  } finally {
    if (prevProjectId !== undefined) {
      process.env.FIREBASE_PROJECT_ID = prevProjectId;
    } else {
      delete process.env.FIREBASE_PROJECT_ID;
    }
    if (prevSaJson !== undefined) {
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON = prevSaJson;
    } else {
      delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    }
  }
});
