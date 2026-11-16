import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Download,
  LayoutDashboard,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  EDGEMAX_INFO,
  ElectiveSubject,
  REGISTRATION_ELECTIVES,
  StudentRecord,
  buildStudentIdQrPayload,
  formatPhoneDisplay,
  studentRecordToCardData,
  validateRegistrationForm,
} from '../utils/tutorialData';
import { generateStudentIdCardDataUrl } from '../utils/idCardGenerator';
import { parseApiResponse } from '../utils/apiClient';
import { type AuthSessionState } from './PortalModal';

interface RegisteredPreview {
  student: StudentRecord;
  cardImageUrl: string;
  qrPayload: string;
}

interface RegistrationSectionProps {
  referralChannel?: string | null;
  session: AuthSessionState;
  onRegistered: (nextSession: Exclude<AuthSessionState, null>) => void;
  onOpenPortal: (tab?: 'student' | 'tutor') => void;
}

export function RegistrationSection({
  referralChannel = null,
  session,
  onRegistered,
  onOpenPortal,
}: RegistrationSectionProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [aspiringCourse, setAspiringCourse] = useState('');
  const [otherSubjects, setOtherSubjects] = useState<ElectiveSubject[]>([
    'Biology',
    'Chemistry',
    'Physics',
  ]);
  const [aspiringSchool, setAspiringSchool] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<'form' | 'review' | 'confirmed'>('form');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [registered, setRegistered] = useState<RegisteredPreview | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const toggleElective = (subject: ElectiveSubject) => {
    setError(null);
    setOtherSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), subject];
      }
      return [...prev, subject];
    });
  };

  // Step 1 -> Step 2 (Mandatory Pre-Registration Reverification)
  const handleProceedToReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateRegistrationForm({
      fullName,
      email,
      phoneNumber,
      aspiringCourse,
      otherSubjects,
      aspiringSchool,
      otherDetails,
    });
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setConfirmChecked(false);
    setStep('review');
  };

  // Step 2 -> Step 3 (Persist to DB + Generate Instant Verified ID Card)
  const handleConfirmRegistration = async () => {
    if (!confirmChecked) {
      setError(
        'Please tick the confirmation box confirming all your details are accurate before saving.'
      );
      return;
    }

    setError(null);
    setIsSaving(true);
    setHasDownloaded(false);

    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          aspiringCourse: aspiringCourse.trim(),
          otherSubjects,
          aspiringSchool: aspiringSchool.trim(),
          otherDetails: otherDetails.trim(),
          sourceSection: 'EdgeMax Registration Form',
          referralChannel,
          confirmedDetails: true,
        }),
      });

      const data = await parseApiResponse<{ student?: StudentRecord }>(res);
      if (!res.ok || !data.student) {
        setError(
          data.error ||
            'Could not complete registration. Please check your details and try again.'
        );
        return;
      }

      const student: StudentRecord = data.student;
      const cardData = studentRecordToCardData(student);
      const cardImageUrl = await generateStudentIdCardDataUrl(cardData);
      const qrPayload = buildStudentIdQrPayload(cardData);

      setRegistered({
        student,
        cardImageUrl,
        qrPayload,
      });
      setStep('confirmed');
      onRegistered({ userType: 'student', student });
    } catch {
      setError(
        'Network error while saving your account. Please try confirming again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    setRegistered(null);
    setHasDownloaded(false);
    setConfirmChecked(false);
    setStep('form');
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setAspiringCourse('');
    setAspiringSchool('');
    setOtherDetails('');
    setError(null);
  };

  return (
    <section
      id="register"
      className="scroll-mt-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14 sm:py-18 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left column: Registration context & passwordless login details */}
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
              JAMB {EDGEMAX_INFO.programYear} Student Account
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
              Register for the EdgeMax JAMB {EDGEMAX_INFO.programYear} Tutorial
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Create your verified EdgeMax student profile directly in our
              database—no manual WhatsApp verification needed. Review all details
              carefully before submitting, download your official QR ID card, and
              log in anytime using your Email, Phone Number, or EdgeMax ID.
            </p>

            <dl className="mt-6 space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Compulsory Subject Rule
                </dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                  English is included; choose 3 from Mathematics, Biology,
                  Chemistry, and Physics (4 total).
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Instant Verification &amp; Immutable Profile
                </dt>
                <dd className="mt-0.5 text-slate-700 dark:text-slate-300">
                  Profiles are verified automatically upon confirmation and
                  cannot be edited afterwards.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Already Registered?
                </dt>
                <dd className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenPortal('student')}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 px-4 py-2 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {session
                        ? 'Open My Verified Dashboard'
                        : 'Log in with Email, Phone, or EdgeMax ID'}
                    </span>
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  24/7 Brainstorm Community
                </dt>
                <dd className="mt-1">
                  <a
                    href={EDGEMAX_INFO.brainstormWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    <span>Join 24/7 Brainstorm WhatsApp Group</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Right column: Registration Form -> Reverify Step -> Confirmed Verified Profile + Downloadable ID Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-6 sm:p-8">
              {isSaving ? (
                <div
                  data-testid="id-generating-state"
                  role="status"
                  aria-live="polite"
                  className="flex min-h-[340px] flex-col items-center justify-center py-10 text-center"
                >
                  <Loader2
                    className="h-10 w-10 animate-spin text-sky-600 dark:text-sky-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-950 dark:text-white">
                    Saving verified profile &amp; generating ID card...
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
                    Recording your immutable JAMB {EDGEMAX_INFO.programYear}{' '}
                    profile in the EdgeMax database and encoding your QR ID card.
                  </p>
                </div>
              ) : step === 'confirmed' && registered ? (
                <div
                  data-testid="registration-confirmation"
                  className="space-y-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-6 w-6 shrink-0 text-sky-600 dark:text-sky-400"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                          Verified Profile Saved · Ready for Classes
                        </p>
                        <h3 className="mt-0.5 font-display text-xl font-bold text-slate-950 dark:text-white">
                          Welcome to EdgeMax, {registered.student.fullName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Your profile is now verified in our database—no manual
                          upload needed. Download your ID card or open your
                          verified dashboard anytime.
                        </p>
                      </div>
                    </div>

                    <span
                      data-testid="generated-registration-id"
                      className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-sky-950 dark:text-sky-200"
                    >
                      {registered.student.id}
                    </span>
                  </div>

                  {/* Rendered Downloadable Student ID Card Image */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-sm">
                    <img
                      src={registered.cardImageUrl}
                      alt={`Downloadable EdgeMax Student ID Card for ${registered.student.fullName} (${registered.student.id})`}
                      data-testid="student-id-card-image"
                      className="block w-full h-auto"
                    />
                  </div>

                  {/* Primary Dashboard + Download Actions */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a
                      href={registered.cardImageUrl}
                      download={`EdgeMax-ID-${registered.student.id}.png`}
                      onClick={() => setHasDownloaded(true)}
                      data-testid="download-id-card-btn"
                      className="cta-waitlist-btn flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 whitespace-nowrap"
                    >
                      <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        {hasDownloaded
                          ? 'Download ID Card Again (PNG)'
                          : 'Download ID Card (PNG)'}
                      </span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenPortal('student')}
                      data-testid="open-verified-dashboard-btn"
                      className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-500 px-5 py-3 text-sm font-semibold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Open Verified Profile Dashboard</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Log in anytime using{' '}
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        {registered.student.email}
                      </strong>
                      ,{' '}
                      <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                        {registered.student.phoneNumber}
                      </strong>
                      , or{' '}
                      <strong className="font-mono font-semibold text-slate-900 dark:text-white">
                        {registered.student.id}
                      </strong>
                      .
                    </span>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                    >
                      Register another student
                    </button>
                  </div>

                  {/* Scannable QR Details Summary */}
                  <details className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs">
                    <summary className="flex cursor-pointer items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                      <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                      <span>
                        View embedded QR code details ({registered.student.dateIssued} ·{' '}
                        {registered.student.timeIssued})
                      </span>
                    </summary>
                    <pre
                      data-testid="qr-payload-preview"
                      className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400"
                    >
                      {registered.qrPayload}
                    </pre>
                  </details>
                </div>
              ) : step === 'review' ? (
                <div
                  data-testid="registration-reverify-step"
                  className="space-y-5"
                >
                  <div className="flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4">
                    <AlertTriangle
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
                        Reverify Your Details Before Submitting
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        Please check every detail carefully.{' '}
                        <strong>
                          Once your EdgeMax account is created, your profile
                          details cannot be edited.
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Read-Only Preview of Entered Details */}
                  <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Full Name
                      </dt>
                      <dd className="mt-0.5 font-semibold text-slate-950 dark:text-white">
                        {fullName.trim()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Email Address
                      </dt>
                      <dd className="mt-0.5 font-semibold text-slate-950 dark:text-white break-all">
                        {email.trim()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Phone / WhatsApp Number
                      </dt>
                      <dd className="mt-0.5 font-mono font-semibold tabular-nums text-slate-950 dark:text-white">
                        {formatPhoneDisplay(phoneNumber)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Aspiring Course
                      </dt>
                      <dd className="mt-0.5 font-semibold text-slate-950 dark:text-white">
                        {aspiringCourse.trim()}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Aspiring School / University
                      </dt>
                      <dd className="mt-0.5 font-semibold text-slate-950 dark:text-white">
                        {aspiringSchool.trim()}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        JAMB Subjects (4)
                      </dt>
                      <dd className="mt-1 font-semibold text-sky-700 dark:text-sky-400">
                        English, {otherSubjects.join(', ')}
                      </dd>
                    </div>
                    {otherDetails.trim() && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Other Details
                        </dt>
                        <dd className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">
                          {otherDetails.trim()}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(e) => {
                        setConfirmChecked(e.target.checked);
                        if (error) setError(null);
                      }}
                      data-testid="reverify-confirm-checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                    />
                    <span>
                      I have reverified my name, email, phone number, aspiring
                      course, school, and 4 JAMB subjects, and understand they{' '}
                      <strong>cannot be edited</strong> after registration.
                    </span>
                  </label>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-200"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setError(null);
                      }}
                      data-testid="back-to-edit-btn"
                      className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Back to Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmRegistration}
                      data-testid="confirm-registration-btn"
                      className="cta-waitlist-btn flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Confirm &amp; Complete Registration</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleProceedToReview}
                  noValidate
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="reg-fullname"
                      className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="reg-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Samuel Adewale"
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. samuel@example.com"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reg-phone"
                        className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        Phone / WhatsApp Number{' '}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. 0803 639 5539"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="reg-course"
                        className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        Aspiring Course <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="reg-course"
                        type="text"
                        required
                        value={aspiringCourse}
                        onChange={(e) => {
                          setAspiringCourse(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Medicine and Surgery"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reg-school"
                        className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        Aspiring School / University{' '}
                        <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="reg-school"
                        type="text"
                        required
                        value={aspiringSchool}
                        onChange={(e) => {
                          setAspiringSchool(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Obafemi Awolowo University (OAU)"
                        className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                      />
                    </div>
                  </div>

                  {/* Subjects: English included + 3 of Math/Bio/Chem/Phys */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        JAMB Subjects (English + 3 others)
                      </span>
                      <span className="font-mono text-xs tabular-nums text-sky-700 dark:text-sky-400">
                        {1 + otherSubjects.length} / 4 selected
                      </span>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <div
                        aria-label="English is included as a compulsory JAMB subject"
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-sky-700 bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>English · Included</span>
                      </div>

                      {REGISTRATION_ELECTIVES.map((subject) => {
                        const selected = otherSubjects.includes(subject);
                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => toggleElective(subject)}
                            aria-pressed={selected}
                            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                              selected
                                ? 'border-slate-900 dark:border-sky-400 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {selected && (
                              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            )}
                            <span>{subject}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-details"
                      className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Any Other Details (Optional)
                    </label>
                    <textarea
                      id="reg-details"
                      rows={3}
                      value={otherDetails}
                      onChange={(e) => setOtherDetails(e.target.value)}
                      placeholder="Target JAMB score, preferred study support, or any questions for our tutors..."
                      className="mt-1.5 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-200"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    data-testid="review-registration-btn"
                    className="cta-waitlist-btn flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Review &amp; Reverify Details</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
