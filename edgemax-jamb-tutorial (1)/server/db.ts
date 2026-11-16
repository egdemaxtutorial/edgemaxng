import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  StudentRecord,
  SubjectName,
  TUTORS,
  TutorAccountRecord,
  formatIssuedTimestampWat,
  formatPhoneDisplay,
  generateRegistrationId,
  normalizePhoneNumber,
  validateRegistrationForm,
} from '../src/utils/tutorialData';
import {
  DEFAULT_TUTOR_PASSWORD,
  hashPassword,
  verifyPassword,
} from './auth';
import {
  EdgeMaxDbError,
  type EdgeMaxDataStore,
  type StudentRegistrationRequest,
} from './store';

export { EdgeMaxDbError, type StudentRegistrationRequest };

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  email_lower: string;
  phone_display: string;
  phone_normalized: string;
  aspiring_course: string;
  aspiring_school: string;
  subjects_json: string;
  other_details: string | null;
  verified: number;
  date_issued: string;
  time_issued: string;
  created_at: string;
  source_section: string | null;
  referral_channel: string | null;
}

interface TutorRow {
  id: string;
  tutor_profile_id: string;
  name: string;
  phone_display: string;
  phone_normalized: string;
  email: string | null;
  password_hash: string;
  verified: number;
  created_at: string;
}

function mapStudentRow(row: StudentRow): StudentRecord {
  let subjects: SubjectName[] = ['English', 'Mathematics', 'Biology', 'Chemistry'];
  try {
    const parsed = JSON.parse(row.subjects_json);
    if (Array.isArray(parsed)) {
      subjects = parsed as SubjectName[];
    }
  } catch {
    // fallback preserved
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_display,
    phoneNormalized: row.phone_normalized,
    aspiringCourse: row.aspiring_course,
    aspiringSchool: row.aspiring_school,
    subjects,
    otherDetails: row.other_details ?? undefined,
    verified: row.verified === 1,
    dateIssued: row.date_issued,
    timeIssued: row.time_issued,
    createdAt: row.created_at,
    sourceSection: row.source_section ?? undefined,
    referralChannel: row.referral_channel ?? null,
  };
}

function mapTutorRow(row: TutorRow): TutorAccountRecord {
  return {
    id: row.id,
    tutorProfileId: row.tutor_profile_id,
    name: row.name,
    phoneDisplay: row.phone_display,
    phoneNormalized: row.phone_normalized,
    email: row.email,
    verified: row.verified === 1,
    createdAt: row.created_at,
  };
}

export function createEdgeMaxDatabase(
  dbPath: string = path.join(process.cwd(), '.data', 'edgemax.sqlite')
) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      email_lower TEXT NOT NULL UNIQUE,
      phone_display TEXT NOT NULL,
      phone_normalized TEXT NOT NULL UNIQUE,
      aspiring_course TEXT NOT NULL,
      aspiring_school TEXT NOT NULL,
      subjects_json TEXT NOT NULL,
      other_details TEXT,
      verified INTEGER NOT NULL DEFAULT 1,
      date_issued TEXT NOT NULL,
      time_issued TEXT NOT NULL,
      created_at TEXT NOT NULL,
      source_section TEXT,
      referral_channel TEXT
    );

    CREATE TABLE IF NOT EXISTS tutors (
      id TEXT PRIMARY KEY,
      tutor_profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_display TEXT NOT NULL,
      phone_normalized TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  const ensureTutorSeeds = () => {
    const findExisting = db.prepare('SELECT id FROM tutors WHERE id = ?');
    const insertTutor = db.prepare(`
      INSERT INTO tutors (
        id, tutor_profile_id, name, phone_display, phone_normalized, email, password_hash, verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    const updateTutorMeta = db.prepare(`
      UPDATE tutors
      SET tutor_profile_id = ?, name = ?, phone_display = ?, phone_normalized = ?
      WHERE id = ?
    `);

    const nowIso = new Date().toISOString();

    for (const tutor of TUTORS) {
      const existing = findExisting.get(tutor.tutorAccountId) as
        | { id: string }
        | undefined;
      if (!existing) {
        const hashed = hashPassword(DEFAULT_TUTOR_PASSWORD);
        insertTutor.run(
          tutor.tutorAccountId,
          tutor.id,
          tutor.name,
          tutor.whatsappDisplay,
          tutor.whatsappRaw,
          null,
          hashed,
          nowIso
        );
      } else {
        updateTutorMeta.run(
          tutor.id,
          tutor.name,
          tutor.whatsappDisplay,
          tutor.whatsappRaw,
          tutor.tutorAccountId
        );
      }
    }
  };

  ensureTutorSeeds();

  const registerStudent = (
    input: StudentRegistrationRequest,
    nowDate: Date = new Date()
  ): StudentRecord => {
    if (!input.confirmedDetails) {
      throw new EdgeMaxDbError(
        'Please reverify and confirm all your details before completing registration. Profiles cannot be edited after registration.',
        400
      );
    }

    const validation = validateRegistrationForm(input);
    if (!validation.valid) {
      throw new EdgeMaxDbError(
        validation.error ?? 'Invalid registration details.',
        400
      );
    }

    const cleanEmail = input.email.trim();
    const emailLower = cleanEmail.toLowerCase();
    const phoneNormalized = normalizePhoneNumber(input.phoneNumber);
    const phoneDisplay = formatPhoneDisplay(input.phoneNumber);

    const existingEmail = db
      .prepare('SELECT id FROM students WHERE email_lower = ?')
      .get(emailLower) as { id: string } | undefined;
    if (existingEmail) {
      throw new EdgeMaxDbError(
        `An EdgeMax profile already exists for this email (${existingEmail.id}). Please log in using your email to open your verified dashboard.`,
        409
      );
    }

    const existingPhone = db
      .prepare('SELECT id FROM students WHERE phone_normalized = ?')
      .get(phoneNormalized) as { id: string } | undefined;
    if (existingPhone) {
      throw new EdgeMaxDbError(
        `An EdgeMax profile already exists for this phone number (${existingPhone.id}). Please log in using your phone number to open your verified dashboard.`,
        409
      );
    }

    const checkId = db.prepare('SELECT id FROM students WHERE id = ?');
    let registrationId = generateRegistrationId();
    for (let attempt = 0; attempt < 10; attempt++) {
      if (!checkId.get(registrationId)) break;
      registrationId = generateRegistrationId();
    }

    const { dateIssued, timeIssued } = formatIssuedTimestampWat(nowDate);
    const createdAt = nowDate.toISOString();
    const subjects: SubjectName[] = ['English', ...input.otherSubjects];

    db.prepare(`
      INSERT INTO students (
        id, full_name, email, email_lower, phone_display, phone_normalized,
        aspiring_course, aspiring_school, subjects_json, other_details,
        verified, date_issued, time_issued, created_at, source_section, referral_channel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `).run(
      registrationId,
      input.fullName.trim(),
      cleanEmail,
      emailLower,
      phoneDisplay,
      phoneNormalized,
      input.aspiringCourse.trim(),
      input.aspiringSchool.trim(),
      JSON.stringify(subjects),
      input.otherDetails?.trim() || null,
      dateIssued,
      timeIssued,
      createdAt,
      input.sourceSection?.trim() || null,
      input.referralChannel?.trim() || null
    );

    const inserted = db
      .prepare('SELECT * FROM students WHERE id = ?')
      .get(registrationId) as StudentRow | undefined;

    if (!inserted) {
      throw new EdgeMaxDbError('Failed to retrieve saved student profile.', 500);
    }

    return mapStudentRow(inserted);
  };

  const findStudentByIdentifier = (
    rawIdentifier: string
  ): StudentRecord | null => {
    const trimmed = rawIdentifier.trim();
    if (!trimmed) return null;

    // 1. Direct EdgeMax ID lookup (case-insensitive)
    const upperId = trimmed.toUpperCase();
    const byId = db
      .prepare('SELECT * FROM students WHERE UPPER(id) = ?')
      .get(upperId) as StudentRow | undefined;
    if (byId) return mapStudentRow(byId);

    // 2. Email lookup (case-insensitive)
    const lowerEmail = trimmed.toLowerCase();
    const byEmail = db
      .prepare('SELECT * FROM students WHERE email_lower = ?')
      .get(lowerEmail) as StudentRow | undefined;
    if (byEmail) return mapStudentRow(byEmail);

    // 3. Phone lookup (normalized digits)
    const normalizedPhone = normalizePhoneNumber(trimmed);
    if (normalizedPhone.length >= 10) {
      const byPhone = db
        .prepare('SELECT * FROM students WHERE phone_normalized = ?')
        .get(normalizedPhone) as StudentRow | undefined;
      if (byPhone) return mapStudentRow(byPhone);
    }

    return null;
  };

  const getStudentById = (id: string): StudentRecord | null => {
    const row = db
      .prepare('SELECT * FROM students WHERE id = ?')
      .get(id) as StudentRow | undefined;
    return row ? mapStudentRow(row) : null;
  };

  const listStudents = (): StudentRecord[] => {
    const rows = db
      .prepare('SELECT * FROM students ORDER BY created_at DESC')
      .all() as unknown as StudentRow[];
    return rows.map(mapStudentRow);
  };

  const authenticateTutor = (
    rawIdentifier: string,
    password: string
  ): TutorAccountRecord | null => {
    const trimmed = rawIdentifier.trim();
    if (!trimmed || !password) return null;

    const upperId = trimmed.toUpperCase();
    let row = db
      .prepare('SELECT * FROM tutors WHERE UPPER(id) = ?')
      .get(upperId) as TutorRow | undefined;

    if (!row) {
      const normalizedPhone = normalizePhoneNumber(trimmed);
      if (normalizedPhone.length >= 10) {
        row = db
          .prepare('SELECT * FROM tutors WHERE phone_normalized = ?')
          .get(normalizedPhone) as TutorRow | undefined;
      }
    }

    if (!row) return null;
    if (!verifyPassword(password, row.password_hash)) {
      return null;
    }

    return mapTutorRow(row);
  };

  const getTutorById = (id: string): TutorAccountRecord | null => {
    const row = db
      .prepare('SELECT * FROM tutors WHERE id = ?')
      .get(id) as TutorRow | undefined;
    return row ? mapTutorRow(row) : null;
  };

  const listTutors = (): TutorAccountRecord[] => {
    const rows = db
      .prepare('SELECT * FROM tutors ORDER BY id ASC')
      .all() as unknown as TutorRow[];
    return rows.map(mapTutorRow);
  };

  const getRawTutorPasswordHashForTest = (id: string): string | null => {
    const row = db
      .prepare('SELECT password_hash FROM tutors WHERE id = ?')
      .get(id) as { password_hash: string } | undefined;
    return row?.password_hash ?? null;
  };

  const close = () => {
    db.close();
  };

  return {
    registerStudent,
    findStudentByIdentifier,
    getStudentById,
    listStudents,
    authenticateTutor,
    getTutorById,
    listTutors,
    getRawTutorPasswordHashForTest,
    close,
  };
}

export function createSqliteStore(dbPath?: string): EdgeMaxDataStore {
  const db = createEdgeMaxDatabase(dbPath);
  return {
    backendName: 'sqlite',
    async registerStudent(input, nowDate) {
      return db.registerStudent(input, nowDate);
    },
    async findStudentByIdentifier(rawIdentifier) {
      return db.findStudentByIdentifier(rawIdentifier);
    },
    async getStudentById(id) {
      return db.getStudentById(id);
    },
    async listStudents() {
      return db.listStudents();
    },
    async authenticateTutor(rawIdentifier, password) {
      return db.authenticateTutor(rawIdentifier, password);
    },
    async getTutorById(id) {
      return db.getTutorById(id);
    },
    async listTutors() {
      return db.listTutors();
    },
  };
}
