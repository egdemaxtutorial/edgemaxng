import type {
  RegistrationInput,
  StudentRecord,
  TutorAccountRecord,
} from '../src/utils/tutorialData';

export interface StudentRegistrationRequest extends RegistrationInput {
  confirmedDetails: boolean;
}

export class EdgeMaxDbError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = 'EdgeMaxDbError';
    this.status = status;
  }
}

export interface EdgeMaxDataStore {
  readonly backendName: 'firestore' | 'sqlite';
  readonly firestoreDatabaseId?: string;
  registerStudent(
    input: StudentRegistrationRequest,
    nowDate?: Date
  ): Promise<StudentRecord>;
  findStudentByIdentifier(rawIdentifier: string): Promise<StudentRecord | null>;
  getStudentById(id: string): Promise<StudentRecord | null>;
  listStudents(): Promise<StudentRecord[]>;
  authenticateTutor(
    rawIdentifier: string,
    password: string
  ): Promise<TutorAccountRecord | null>;
  getTutorById(id: string): Promise<TutorAccountRecord | null>;
  listTutors(): Promise<TutorAccountRecord[]>;
}
