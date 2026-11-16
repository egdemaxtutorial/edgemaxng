import { useEffect, useState, type FormEvent } from 'react';
import {
  BadgeCheck,
  BookOpen,
  Clock,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  Mail,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  EDGEMAX_INFO,
  StudentRecord,
  TUTORS,
  TutorAccountRecord,
  WEEKLY_SCHEDULE,
  buildStudentIdQrPayload,
  formatPad2,
  getNextClassForSubject,
  studentRecordToCardData,
} from '../utils/tutorialData';
import { generateStudentIdCardDataUrl } from '../utils/idCardGenerator';
import { parseApiResponse } from '../utils/apiClient';

export type AuthSessionState =
  | {
      userType: 'student';
      student: StudentRecord;
    }
  | {
      userType: 'tutor';
      tutor: TutorAccountRecord;
      students: StudentRecord[];
    }
  | null;

interface PortalModalProps {
  isOpen: boolean;
  initialTab?: 'student' | 'tutor';
  session: AuthSessionState;
  onClose: () => void;
  onAuthenticated: (nextSession: Exclude<AuthSessionState, null>) => void;
  onLogout: () => Promise<void>;
}

export function PortalModal({
  isOpen,
  initialTab = 'student',
  session,
  onClose,
  onAuthenticated,
  onLogout,
}: PortalModalProps) {
  const [loginTab, setLoginTab] = useState<'student' | 'tutor'>(initialTab);
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [tutorIdentifier, setTutorIdentifier] = useState('');
  const [tutorPassword, setTutorPassword] = useState('');
  const [showTutorPassword, setShowTutorPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setLoginTab(initialTab);
    setLoginError(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !session || session.userType !== 'student') return;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, session]);

  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !session || session.userType !== 'student') {
      return;
    }

    const cardData = studentRecordToCardData(session.student);
    setCardLoading(true);
    generateStudentIdCardDataUrl(cardData)
      .then((url) => {
        if (!cancelled) {
          setCardImageUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCardImageUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCardLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleStudentLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!studentIdentifier.trim()) {
      setLoginError('Enter your Email, Phone Number, or EdgeMax ID.');
      return;
    }

    setLoginError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: studentIdentifier.trim() }),
      });
      const data = await parseApiResponse<{ student?: StudentRecord }>(res);
      if (!res.ok || !data.student) {
        setLoginError(
          data.error || 'Could not find a matching student profile.'
        );
        return;
      }
      setStudentIdentifier('');
      onAuthenticated({ userType: 'student', student: data.student });
    } catch {
      setLoginError(
        'Network error while checking your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTutorLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tutorIdentifier.trim() || !tutorPassword) {
      setLoginError('Enter your Tutor ID (or phone number) and password.');
      return;
    }

    setLoginError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/tutor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: tutorIdentifier.trim(),
          password: tutorPassword,
        }),
      });
      const data = await parseApiResponse<{
        tutor?: TutorAccountRecord;
        students?: StudentRecord[];
      }>(res);
      if (!res.ok || !data.tutor) {
        setLoginError(data.error || 'Invalid tutor credentials.');
        return;
      }
      setTutorPassword('');
      onAuthenticated({
        userType: 'tutor',
        tutor: data.tutor,
        students: Array.isArray(data.students) ? data.students : [],
      });
    } catch {
      setLoginError('Network error while signing in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToRegister = () => {
    onClose();
    const el = document.getElementById('register');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-dialog-title"
      data-testid="portal-dialog"
    >
      <div className="my-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
        {/* Top Portal Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck
              className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2
                id="portal-dialog-title"
                className="font-display text-base font-bold text-slate-950 dark:text-white sm:text-lg"
              >
                {session?.userType === 'student'
                  ? 'Verified Student Profile Dashboard'
                  : session?.userType === 'tutor'
                    ? 'Verified Tutor Portal Dashboard'
                    : 'EdgeMax JAMB 2027 Portal Login'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {session
                  ? 'Read-only verified record saved in EdgeMax database'
                  : 'Sign in as a registered student or EdgeMax tutor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session && (
              <button
                type="button"
                onClick={onLogout}
                data-testid="portal-logout-btn"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Log out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close portal and return to website"
              data-testid="portal-close-btn"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Back to Website</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7">
          {!session ? (
            <div className="mx-auto max-w-lg space-y-5">
              {/* Role Tabs */}
              <div
                role="tablist"
                aria-label="Choose account type"
                className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginTab === 'student'}
                  onClick={() => {
                    setLoginTab('student');
                    setLoginError(null);
                  }}
                  data-testid="tab-student-login"
                  className={`min-h-[42px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    loginTab === 'student'
                      ? 'bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={loginTab === 'tutor'}
                  onClick={() => {
                    setLoginTab('tutor');
                    setLoginError(null);
                  }}
                  data-testid="tab-tutor-login"
                  className={`min-h-[42px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    loginTab === 'tutor'
                      ? 'bg-white dark:bg-slate-950 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Tutor Login
                </button>
              </div>

              {loginTab === 'student' ? (
                <form
                  onSubmit={handleStudentLogin}
                  noValidate
                  className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 sm:p-6"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white">
                      Access Your Verified Student Profile
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Log in using only your registered <strong>Email</strong>,{' '}
                      <strong>Phone Number</strong>, or{' '}
                      <strong>EdgeMax ID</strong> (e.g.{' '}
                      <span className="font-mono">EDG-2027-XXXX</span>). No
                      password required.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="student-login-identifier"
                      className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Email, Phone Number, or EdgeMax ID
                    </label>
                    <input
                      id="student-login-identifier"
                      type="text"
                      value={studentIdentifier}
                      onChange={(e) => {
                        setStudentIdentifier(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="e.g. samuel@example.com, 0803..., or EDG-2027-XXXX"
                      className="mt-1.5 min-h-[46px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    />
                  </div>

                  {loginError && (
                    <p
                      role="alert"
                      data-testid="portal-login-error"
                      className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-200"
                    >
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="student-login-submit"
                    className="cta-waitlist-btn flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                  >
                    <span>
                      {isSubmitting
                        ? 'Checking Database...'
                        : 'Open Verified Student Dashboard'}
                    </span>
                  </button>

                  <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                    Not registered yet?{' '}
                    <button
                      type="button"
                      onClick={handleGoToRegister}
                      className="font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                    >
                      Create your verified student account
                    </button>
                  </p>
                </form>
              ) : (
                <form
                  onSubmit={handleTutorLogin}
                  noValidate
                  className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 sm:p-6"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white">
                      EdgeMax Tutor Portal Sign In
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Sign in with your assigned Tutor ID (
                      <span className="font-mono">EG-TUTOR-KOLE</span>,{' '}
                      <span className="font-mono">EG-TUTOR-ISAAC</span>,{' '}
                      <span className="font-mono">EG-TUTOR-DAVIES</span>,{' '}
                      <span className="font-mono">EG-MARVY</span>, or{' '}
                      <span className="font-mono">EG-TUTOR-MAVERICK</span>) or
                      registered phone number and password.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="tutor-login-identifier"
                      className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Tutor ID or Phone Number
                    </label>
                    <input
                      id="tutor-login-identifier"
                      type="text"
                      value={tutorIdentifier}
                      onChange={(e) => {
                        setTutorIdentifier(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="e.g. EG-MARVY or +234 915 761 1607"
                      className="mt-1.5 min-h-[46px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tutor-login-password"
                      className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Tutor Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="tutor-login-password"
                        type={showTutorPassword ? 'text' : 'password'}
                        value={tutorPassword}
                        onChange={(e) => {
                          setTutorPassword(e.target.value);
                          if (loginError) setLoginError(null);
                        }}
                        placeholder="Enter tutor password"
                        className="min-h-[46px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTutorPassword((p) => !p)}
                        aria-label={
                          showTutorPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {showTutorPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p
                      role="alert"
                      data-testid="portal-login-error"
                      className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-200"
                    >
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="tutor-login-submit"
                    className="cta-waitlist-btn flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 disabled:opacity-60"
                  >
                    <span>
                      {isSubmitting ? 'Verifying Credentials...' : 'Sign In as Tutor'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          ) : session.userType === 'student' ? (
            <StudentDashboardView
              student={session.student}
              cardImageUrl={cardImageUrl}
              cardLoading={cardLoading}
              now={now}
            />
          ) : (
            <TutorDashboardView
              tutorAccount={session.tutor}
              students={session.students}
              rosterSearch={rosterSearch}
              onChangeSearch={setRosterSearch}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboardView({
  student,
  cardImageUrl,
  cardLoading,
  now,
}: {
  student: StudentRecord;
  cardImageUrl: string | null;
  cardLoading: boolean;
  now: Date;
}) {
  const qrPayload = buildStudentIdQrPayload(studentRecordToCardData(student));

  return (
    <div data-testid="student-verified-dashboard" className="space-y-6">
      {/* Verified Header + Immutable Notice */}
      <div className="flex flex-col gap-4 rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/70 dark:bg-sky-950/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeCheck
              className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-bold tracking-wide text-sky-800 dark:text-sky-300">
              Verified JAMB {EDGEMAX_INFO.programYear} Student
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Locked · Cannot be edited</span>
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-2xl font-bold text-slate-950 dark:text-white">
            {student.fullName}
          </h3>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
            Issued {student.dateIssued} · {student.timeIssued}
          </p>
        </div>

        <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 px-4 py-3 text-left sm:text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            EdgeMax Student ID
          </span>
          <span
            data-testid="dashboard-student-id"
            className="mt-0.5 block font-mono text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300"
          >
            {student.id}
          </span>
        </div>
      </div>

      {/* Two-Column Overview: Immutable Details & Subjects Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Read-Only Personal & Academic Profile */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">
              Verified Profile Details
            </h4>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Read-only
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email Address
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 break-all">
                {student.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Phone / WhatsApp Number
              </dt>
              <dd className="mt-0.5 font-mono font-medium tabular-nums text-slate-900 dark:text-slate-100">
                {student.phoneNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Aspiring Course
              </dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                {student.aspiringCourse}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Aspiring School / University
              </dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                {student.aspiringSchool}
              </dd>
            </div>
            {student.otherDetails && (
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Additional Notes
                </dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {student.otherDetails}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Right: Student's 4 Registered JAMB Subjects + Live Next Teacher Countdown */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span>Your 4 Registered JAMB Subjects</span>
            </h4>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {EDGEMAX_INFO.timezoneLabel}
            </span>
          </div>

          <div
            data-testid="dashboard-subjects-grid"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {student.subjects.map((subj) => {
              const nextInfo = getNextClassForSubject(subj, now);
              return (
                <div
                  key={subj}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-slate-950 dark:text-white">
                      {subj}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        nextInfo.isLiveNow
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      {nextInfo.isLiveNow ? 'Live Now' : nextInfo.dayLabel}
                    </span>
                  </div>

                  <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    <Clock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    <span>
                      {nextInfo.isLiveNow
                        ? `${formatPad2(nextInfo.countdown.hours)}h ${formatPad2(nextInfo.countdown.minutes)}m ${formatPad2(nextInfo.countdown.seconds)}s left`
                        : `${nextInfo.countdown.days}d ${formatPad2(nextInfo.countdown.hours)}h ${formatPad2(nextInfo.countdown.minutes)}m ${formatPad2(nextInfo.countdown.seconds)}s`}
                    </span>
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <UserCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                    <span>Teacher: {nextInfo.teacherName}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Downloadable Official Student ID Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Official Downloadable Student ID Card
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Automatically verified in the database with embedded QR code.
            </p>
          </div>
          {cardImageUrl && (
            <a
              href={cardImageUrl}
              download={`EdgeMax-ID-${student.id}.png`}
              data-testid="dashboard-download-id-btn"
              className="cta-waitlist-btn inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 whitespace-nowrap"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Download ID Card (PNG)</span>
            </a>
          )}
        </div>

        {cardLoading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-500">
            Rendering your ID card image...
          </div>
        ) : cardImageUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950">
            <img
              src={cardImageUrl}
              alt={`Official EdgeMax Student ID Card for ${student.fullName} (${student.id})`}
              data-testid="dashboard-id-card-image"
              className="block w-full h-auto"
            />
          </div>
        ) : null}

        <details className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-xs">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span>View QR Code Payload ({student.id})</span>
          </summary>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            {qrPayload}
          </pre>
        </details>
      </div>
    </div>
  );
}

function TutorDashboardView({
  tutorAccount,
  students,
  rosterSearch,
  onChangeSearch,
}: {
  tutorAccount: TutorAccountRecord;
  students: StudentRecord[];
  rosterSearch: string;
  onChangeSearch: (q: string) => void;
}) {
  const profile = TUTORS.find(
    (t) =>
      t.tutorAccountId === tutorAccount.id ||
      t.id === tutorAccount.tutorProfileId
  );

  const teachingSlots = WEEKLY_SCHEDULE.flatMap((day) => {
    const slots: Array<{
      dayLabel: string;
      time: string;
      subject: string;
    }> = [];
    if (profile && day.slot1.tutorName === profile.name) {
      slots.push({
        dayLabel: day.dayLabel,
        time: EDGEMAX_INFO.slot1Time,
        subject: day.slot1.subject,
      });
    }
    if (profile && day.slot2.tutorName === profile.name) {
      slots.push({
        dayLabel: day.dayLabel,
        time: EDGEMAX_INFO.slot2Time,
        subject: day.slot2.subject,
      });
    }
    return slots;
  });

  const q = rosterSearch.trim().toLowerCase();
  const filteredStudents = students.filter((s) => {
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.aspiringCourse.toLowerCase().includes(q) ||
      s.subjects.some((sub) => sub.toLowerCase().includes(q))
    );
  });

  return (
    <div data-testid="tutor-verified-dashboard" className="space-y-6">
      {/* Tutor Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/70 dark:bg-sky-950/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeCheck
              className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-bold tracking-wide text-sky-800 dark:text-sky-300">
              Verified EdgeMax Tutor Account
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Read-only account</span>
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-2xl font-bold text-slate-950 dark:text-white">
            {tutorAccount.name}
          </h3>
          {profile && (
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              {profile.roles.join(' · ')}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 px-4 py-3 text-left sm:text-right">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned Tutor ID
          </span>
          <span
            data-testid="dashboard-tutor-id"
            className="mt-0.5 block font-mono text-lg font-bold tabular-nums text-sky-700 dark:text-sky-300"
          >
            {tutorAccount.id}
          </span>
        </div>
      </div>

      {/* Tutor Account & Timetable Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <div className="md:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-3">
          <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">
            Tutor Credentials &amp; Academic Profile
          </h4>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Registered Phone Number
                </dt>
                <dd className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                  {tutorAccount.phoneDisplay}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">
                  Official Tutor Email
                </dt>
                <dd className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {tutorAccount.email ?? 'Pending — tutor email will be sent soon'}
                </dd>
              </div>
            </div>
            {profile && (
              <div className="flex items-start gap-2.5">
                <GraduationCap className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-slate-500 dark:text-slate-400">
                    Academic Profile
                  </dt>
                  <dd className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {profile.course} · {profile.university} (JAMB {profile.jambScore})
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </div>

        <div className="md:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5 space-y-3">
          <h4 className="font-display text-sm font-bold text-slate-950 dark:text-white">
            Weekly Assigned Teaching Slots ({EDGEMAX_INFO.timezoneLabel})
          </h4>
          <div className="space-y-2">
            {teachingSlots.map((slot, idx) => (
              <div
                key={`${slot.dayLabel}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs"
              >
                <div>
                  <span className="font-display font-bold text-slate-950 dark:text-white">
                    {slot.subject}
                  </span>
                  <span className="mx-1.5 text-slate-400">·</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {slot.dayLabel}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  {slot.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort Students Roster */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <h4 className="font-display text-base font-bold text-slate-950 dark:text-white">
              Registered JAMB {EDGEMAX_INFO.programYear} Students (
              <span className="font-mono tabular-nums">{students.length}</span>)
            </h4>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={rosterSearch}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Search name, ID, subject..."
              aria-label="Search registered cohort students"
              className="min-h-[38px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {students.length === 0
              ? 'No students have registered yet. New verified registrations appear here automatically.'
              : 'No registered students match your search filter.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              data-testid="tutor-student-roster"
              className="w-full border-collapse text-left text-xs"
            >
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-3 font-semibold">Student ID</th>
                  <th className="py-2.5 pr-3 font-semibold">Full Name</th>
                  <th className="py-2.5 pr-3 font-semibold">Course &amp; School</th>
                  <th className="py-2.5 pr-3 font-semibold">Subjects (4)</th>
                  <th className="py-2.5 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 pr-3 font-mono font-semibold tabular-nums text-sky-700 dark:text-sky-400 whitespace-nowrap">
                      {s.id}
                    </td>
                    <td className="py-3 pr-3 font-semibold text-slate-950 dark:text-white">
                      {s.fullName}
                    </td>
                    <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                      <span className="block font-medium text-slate-800 dark:text-slate-200">
                        {s.aspiringCourse}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {s.aspiringSchool}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                      {s.subjects.join(', ')}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="block font-mono tabular-nums">
                        {s.phoneNumber}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {s.email}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
