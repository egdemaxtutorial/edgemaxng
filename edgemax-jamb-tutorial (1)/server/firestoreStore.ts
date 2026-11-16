import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';
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

interface FirestoreStudentDoc {
  id: string;
  fullName: string;
  email: string;
  emailLower: string;
  phoneNumber: string;
  phoneNormalized: string;
  aspiringCourse: string;
  aspiringSchool: string;
  subjects: SubjectName[];
  otherDetails?: string | null;
  verified: boolean;
  dateIssued: string;
  timeIssued: string;
  createdAt: string;
  sourceSection?: string | null;
  referralChannel?: string | null;
}

interface FirestoreTutorDoc {
  id: string;
  tutorProfileId: string;
  name: string;
  phoneDisplay: string;
  phoneNormalized: string;
  email: string | null;
  passwordHash: string;
  verified: boolean;
  createdAt: string;
}

export type ParsedServiceAccount = ServiceAccount & {
  project_id?: string;
  private_key?: string;
};

function normalizeServiceAccount(parsed: ParsedServiceAccount): ParsedServiceAccount {
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

export function parseServiceAccountFromEnv(): ParsedServiceAccount | null {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as ParsedServiceAccount;
      return normalizeServiceAccount(parsed);
    } catch {
      throw new EdgeMaxDbError(
        'Invalid FIREBASE_SERVICE_ACCOUNT_JSON: expected valid single-line JSON from Firebase Service Accounts.',
        503
      );
    }
  }

  const rawBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (rawBase64) {
    try {
      const decoded = Buffer.from(rawBase64, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded) as ParsedServiceAccount;
      return normalizeServiceAccount(parsed);
    } catch {
      throw new EdgeMaxDbError(
        'Invalid FIREBASE_SERVICE_ACCOUNT_BASE64: expected base64-encoded service account JSON.',
        503
      );
    }
  }

  return null;
}

export function resolveFirestoreProjectId(
  serviceAccount: ParsedServiceAccount | null
): string {
  const envProject = process.env.FIREBASE_PROJECT_ID?.trim();
  if (envProject) return envProject;

  const saProject =
    serviceAccount?.projectId?.trim() || serviceAccount?.project_id?.trim();
  if (saProject) return saProject;

  return firebaseConfig.projectId;
}

export function hasFirestoreAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  );
}

function getOrInitAdminApp(): App {
  const existing = getApps().find((a) => a.name === 'edgemax-admin');
  if (existing) return existing;

  const serviceAccount = parseServiceAccountFromEnv();
  const projectId = resolveFirestoreProjectId(serviceAccount);

  if (serviceAccount) {
    return initializeApp(
      {
        credential: cert(serviceAccount),
        projectId,
      },
      'edgemax-admin'
    );
  }

  return initializeApp(
    {
      credential: applicationDefault(),
      projectId,
    },
    'edgemax-admin'
  );
}

function mapStudentDoc(doc: FirestoreStudentDoc): StudentRecord {
  return {
    id: doc.id,
    fullName: doc.fullName,
    email: doc.email,
    phoneNumber: doc.phoneNumber,
    phoneNormalized: doc.phoneNormalized,
    aspiringCourse: doc.aspiringCourse,
    aspiringSchool: doc.aspiringSchool,
    subjects: Array.isArray(doc.subjects)
      ? doc.subjects
      : ['English', 'Mathematics', 'Biology', 'Chemistry'],
    otherDetails: doc.otherDetails ?? undefined,
    verified: Boolean(doc.verified),
    dateIssued: doc.dateIssued,
    timeIssued: doc.timeIssued,
    createdAt: doc.createdAt,
    sourceSection: doc.sourceSection ?? undefined,
    referralChannel: doc.referralChannel ?? null,
  };
}

function mapTutorDoc(doc: FirestoreTutorDoc): TutorAccountRecord {
  return {
    id: doc.id,
    tutorProfileId: doc.tutorProfileId,
    name: doc.name,
    phoneDisplay: doc.phoneDisplay,
    phoneNormalized: doc.phoneNormalized,
    email: doc.email ?? null,
    verified: Boolean(doc.verified),
    createdAt: doc.createdAt,
  };
}

export function resolveFirestoreDatabaseId(): string {
  return process.env.FIREBASE_DATABASE_ID?.trim() || '(default)';
}

export function createFirestoreStore(): EdgeMaxDataStore {
  const databaseId = resolveFirestoreDatabaseId();
  const app = getOrInitAdminApp();
  const db: Firestore =
    databaseId === '(default)'
      ? getFirestore(app)
      : getFirestore(app, databaseId);

  let tutorSeedPromise: Promise<void> | null = null;

  const ensureTutorSeeds = (): Promise<void> => {
    if (!tutorSeedPromise) {
      tutorSeedPromise = (async () => {
        const nowIso = new Date().toISOString();
        const col = db.collection('tutors');

        for (const tutor of TUTORS) {
          const ref = col.doc(tutor.tutorAccountId);
          const snap = await ref.get();
          if (!snap.exists) {
            const payload: FirestoreTutorDoc = {
              id: tutor.tutorAccountId,
              tutorProfileId: tutor.id,
              name: tutor.name,
              phoneDisplay: tutor.whatsappDisplay,
              phoneNormalized: tutor.whatsappRaw,
              email: null,
              passwordHash: hashPassword(DEFAULT_TUTOR_PASSWORD),
              verified: true,
              createdAt: nowIso,
            };
            await ref.set(payload);
          }
        }
      })().catch((err) => {
        tutorSeedPromise = null;
        throw err;
      });
    }
    return tutorSeedPromise;
  };

  return {
    backendName: 'firestore',
    firestoreDatabaseId: databaseId,

    async registerStudent(
      input: StudentRegistrationRequest,
      nowDate: Date = new Date()
    ): Promise<StudentRecord> {
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
      const col = db.collection('students');

      const existingEmailSnap = await col
        .where('emailLower', '==', emailLower)
        .limit(1)
        .get();
      if (!existingEmailSnap.empty) {
        const existingId = existingEmailSnap.docs[0].id;
        throw new EdgeMaxDbError(
          `An EdgeMax profile already exists for this email (${existingId}). Please log in using your email to open your verified dashboard.`,
          409
        );
      }

      const existingPhoneSnap = await col
        .where('phoneNormalized', '==', phoneNormalized)
        .limit(1)
        .get();
      if (!existingPhoneSnap.empty) {
        const existingId = existingPhoneSnap.docs[0].id;
        throw new EdgeMaxDbError(
          `An EdgeMax profile already exists for this phone number (${existingId}). Please log in using your phone number to open your verified dashboard.`,
          409
        );
      }

      let registrationId = generateRegistrationId();
      for (let attempt = 0; attempt < 10; attempt++) {
        const snap = await col.doc(registrationId).get();
        if (!snap.exists) break;
        registrationId = generateRegistrationId();
      }

      const { dateIssued, timeIssued } = formatIssuedTimestampWat(nowDate);
      const createdAt = nowDate.toISOString();
      const subjects: SubjectName[] = ['English', ...input.otherSubjects];

      const docPayload: FirestoreStudentDoc = {
        id: registrationId,
        fullName: input.fullName.trim(),
        email: cleanEmail,
        emailLower,
        phoneNumber: phoneDisplay,
        phoneNormalized,
        aspiringCourse: input.aspiringCourse.trim(),
        aspiringSchool: input.aspiringSchool.trim(),
        subjects,
        otherDetails: input.otherDetails?.trim() || null,
        verified: true,
        dateIssued,
        timeIssued,
        createdAt,
        sourceSection: input.sourceSection?.trim() || null,
        referralChannel: input.referralChannel?.trim() || null,
      };

      await col.doc(registrationId).set(docPayload);
      return mapStudentDoc(docPayload);
    },

    async findStudentByIdentifier(
      rawIdentifier: string
    ): Promise<StudentRecord | null> {
      const trimmed = rawIdentifier.trim();
      if (!trimmed) return null;

      const col = db.collection('students');

      const byIdSnap = await col.doc(trimmed.toUpperCase()).get();
      if (byIdSnap.exists) {
        return mapStudentDoc(byIdSnap.data() as FirestoreStudentDoc);
      }

      const byEmailSnap = await col
        .where('emailLower', '==', trimmed.toLowerCase())
        .limit(1)
        .get();
      if (!byEmailSnap.empty) {
        return mapStudentDoc(byEmailSnap.docs[0].data() as FirestoreStudentDoc);
      }

      const normalizedPhone = normalizePhoneNumber(trimmed);
      if (normalizedPhone.length >= 10) {
        const byPhoneSnap = await col
          .where('phoneNormalized', '==', normalizedPhone)
          .limit(1)
          .get();
        if (!byPhoneSnap.empty) {
          return mapStudentDoc(
            byPhoneSnap.docs[0].data() as FirestoreStudentDoc
          );
        }
      }

      return null;
    },

    async getStudentById(id: string): Promise<StudentRecord | null> {
      const snap = await db.collection('students').doc(id).get();
      return snap.exists ? mapStudentDoc(snap.data() as FirestoreStudentDoc) : null;
    },

    async listStudents(): Promise<StudentRecord[]> {
      const snap = await db
        .collection('students')
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map((d) => mapStudentDoc(d.data() as FirestoreStudentDoc));
    },

    async authenticateTutor(
      rawIdentifier: string,
      password: string
    ): Promise<TutorAccountRecord | null> {
      await ensureTutorSeeds();
      const trimmed = rawIdentifier.trim();
      if (!trimmed || !password) return null;

      const col = db.collection('tutors');
      let docData: FirestoreTutorDoc | null = null;

      const byIdSnap = await col.doc(trimmed.toUpperCase()).get();
      if (byIdSnap.exists) {
        docData = byIdSnap.data() as FirestoreTutorDoc;
      } else {
        const normalizedPhone = normalizePhoneNumber(trimmed);
        if (normalizedPhone.length >= 10) {
          const byPhoneSnap = await col
            .where('phoneNormalized', '==', normalizedPhone)
            .limit(1)
            .get();
          if (!byPhoneSnap.empty) {
            docData = byPhoneSnap.docs[0].data() as FirestoreTutorDoc;
          }
        }
      }

      if (!docData) return null;
      if (!verifyPassword(password, docData.passwordHash)) {
        return null;
      }
      return mapTutorDoc(docData);
    },

    async getTutorById(id: string): Promise<TutorAccountRecord | null> {
      await ensureTutorSeeds();
      const snap = await db.collection('tutors').doc(id).get();
      return snap.exists ? mapTutorDoc(snap.data() as FirestoreTutorDoc) : null;
    },

    async listTutors(): Promise<TutorAccountRecord[]> {
      await ensureTutorSeeds();
      const snap = await db.collection('tutors').orderBy('id', 'asc').get();
      return snap.docs.map((d) => mapTutorDoc(d.data() as FirestoreTutorDoc));
    },
  };
}
