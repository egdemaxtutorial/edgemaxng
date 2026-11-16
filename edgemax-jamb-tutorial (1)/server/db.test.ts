import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TUTOR_PASSWORD,
  hashPassword,
  parseCookies,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from './auth';
import { EdgeMaxDbError, createEdgeMaxDatabase } from './db';

test('scrypt password hashing and timing-safe verification', () => {
  const hashed = hashPassword(DEFAULT_TUTOR_PASSWORD);
  assert.ok(hashed.startsWith('scrypt$'));
  assert.notEqual(hashed, DEFAULT_TUTOR_PASSWORD);
  assert.equal(verifyPassword('EDGEIDPASS#', hashed), true);
  assert.equal(verifyPassword('WRONGPASS', hashed), false);
  assert.equal(verifyPassword('', hashed), false);
});

test('HMAC session token signing, verification, and cookie parsing', () => {
  const secret = 'test-secret-key-32-chars-minimum!!';
  const token = signSessionToken(
    { userType: 'student', userId: 'EDG-2027-ABCD' },
    secret
  );
  const parsed = verifySessionToken(token, secret);
  assert.equal(parsed?.userType, 'student');
  assert.equal(parsed?.userId, 'EDG-2027-ABCD');
  assert.equal(verifySessionToken(token + 'tamper', secret), null);
  assert.equal(verifySessionToken(token, 'wrong-secret'), null);

  const cookies = parseCookies(`foo=bar; edgemax_session=${encodeURIComponent(token)}`);
  assert.equal(cookies.edgemax_session, token);
});

test('auto-seeds exact 5 tutor accounts with pending email and hashed EDGEIDPASS# password', () => {
  const db = createEdgeMaxDatabase(':memory:');
  try {
    const tutors = db.listTutors();
    assert.equal(tutors.length, 5);

    const ids = tutors.map((t) => t.id).sort();
    assert.deepEqual(ids, [
      'EG-MARVY',
      'EG-TUTOR-DAVIES',
      'EG-TUTOR-ISAAC',
      'EG-TUTOR-KOLE',
      'EG-TUTOR-MAVERICK',
    ]);

    for (const tutor of tutors) {
      assert.equal(tutor.email, null);
      assert.equal(tutor.verified, true);
      const rawHash = db.getRawTutorPasswordHashForTest(tutor.id);
      assert.ok(rawHash && rawHash.startsWith('scrypt$'));
      assert.equal(verifyPassword('EDGEIDPASS#', rawHash), true);
    }

    // Login by exact Tutor ID (case-insensitive)
    const marvy = db.authenticateTutor('eg-marvy', 'EDGEIDPASS#');
    assert.ok(marvy);
    assert.equal(marvy.id, 'EG-MARVY');
    assert.equal(marvy.name, 'Marvy Jhoe');
    assert.equal(marvy.phoneNormalized, '2349157611607');
    assert.equal('passwordHash' in marvy, false);

    // Login by local Nigerian phone format
    const davies = db.authenticateTutor('08036395539', 'EDGEIDPASS#');
    assert.ok(davies);
    assert.equal(davies.id, 'EG-TUTOR-DAVIES');

    // Reject wrong password
    assert.equal(db.authenticateTutor('EG-TUTOR-KOLE', 'wrong-pass'), null);
  } finally {
    db.close();
  }
});

test('student registration enforces pre-confirmation, prevents duplicates, and supports email/phone/ID login', () => {
  const db = createEdgeMaxDatabase(':memory:');
  try {
    // Reject unconfirmed registration
    assert.throws(
      () =>
        db.registerStudent({
          fullName: 'Zainab Bello',
          email: 'zainab@example.com',
          phoneNumber: '08023456789',
          aspiringCourse: 'Medicine and Surgery',
          otherSubjects: ['Biology', 'Chemistry', 'Physics'],
          aspiringSchool: 'University of Ibadan',
          confirmedDetails: false,
        }),
      EdgeMaxDbError
    );

    const created = db.registerStudent({
      fullName: 'Zainab Bello',
      email: 'Zainab@Example.com',
      phoneNumber: '08023456789',
      aspiringCourse: 'Medicine and Surgery',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'University of Ibadan',
      otherDetails: 'Aiming 330+',
      confirmedDetails: true,
    });

    assert.match(created.id, /^EDG-2027-[A-Z2-9]{4}$/);
    assert.equal(created.verified, true);
    assert.equal(created.phoneNumber, '+234 802 345 6789');
    assert.deepEqual(created.subjects, [
      'English',
      'Biology',
      'Chemistry',
      'Physics',
    ]);

    // Passwordless lookup via Email, Phone (local or international), or EdgeMax ID
    const byEmail = db.findStudentByIdentifier('zainab@example.com');
    const byLocalPhone = db.findStudentByIdentifier('0802 345 6789');
    const byIntlPhone = db.findStudentByIdentifier('+2348023456789');
    const byId = db.findStudentByIdentifier(created.id.toLowerCase());

    assert.equal(byEmail?.id, created.id);
    assert.equal(byLocalPhone?.id, created.id);
    assert.equal(byIntlPhone?.id, created.id);
    assert.equal(byId?.id, created.id);

    // Duplicate email rejected with 409
    assert.throws(
      () =>
        db.registerStudent({
          fullName: 'Duplicate Email',
          email: 'zainab@example.com',
          phoneNumber: '08099998888',
          aspiringCourse: 'Law',
          otherSubjects: ['Mathematics', 'Biology', 'Chemistry'],
          aspiringSchool: 'OAU',
          confirmedDetails: true,
        }),
      (err: unknown) => err instanceof EdgeMaxDbError && err.status === 409
    );

    // Duplicate phone rejected with 409
    assert.throws(
      () =>
        db.registerStudent({
          fullName: 'Duplicate Phone',
          email: 'other@example.com',
          phoneNumber: '+234 802 345 6789',
          aspiringCourse: 'Law',
          otherSubjects: ['Mathematics', 'Biology', 'Chemistry'],
          aspiringSchool: 'OAU',
          confirmedDetails: true,
        }),
      (err: unknown) => err instanceof EdgeMaxDbError && err.status === 409
    );

    assert.equal(db.listStudents().length, 1);
  } finally {
    db.close();
  }
});
