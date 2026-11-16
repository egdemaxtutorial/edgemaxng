import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Clock,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Moon,
  Phone,
  Sun,
} from 'lucide-react';
import {
  EDGEMAX_INFO,
  formatPad2,
  getClassStatusAndCountdowns,
} from '../utils/tutorialData';
import { type AuthSessionState } from './PortalModal';

interface HeroSectionProps {
  theme: 'light' | 'dark';
  session: AuthSessionState;
  onToggleTheme: () => void;
  onSelectEnquirySource: (source: string) => void;
  onOpenPortal: (tab?: 'student' | 'tutor') => void;
}

export function HeroSection({
  theme,
  session,
  onToggleTheme,
  onSelectEnquirySource,
  onOpenPortal,
}: HeroSectionProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    getClassStatusAndCountdowns(new Date())
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getClassStatusAndCountdowns(new Date()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="top"
      className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-6 pb-14 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Utility row: Cohort status + Light/Dark Theme Toggle */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
            JAMB {EDGEMAX_INFO.programYear} Cohort · Started {EDGEMAX_INFO.startDate}
            <span aria-hidden="true" className="mx-2 text-slate-400 dark:text-slate-600">
              ·
            </span>
            Free Online Cohort
            <span aria-hidden="true" className="mx-2 text-slate-400 dark:text-slate-600">
              ·
            </span>
            {EDGEMAX_INFO.venue}
          </p>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-sky-700 shrink-0" aria-hidden="true" />
                <span>Dark mode</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          {/* Left column: Value proposition, CTAs, and live countdowns */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <h1 className="font-display text-[clamp(2.25rem,4.4vw,3.65rem)] font-extrabold leading-[1.08] tracking-tight text-slate-950 dark:text-white [text-wrap:balance]">
              Prepare smarter for JAMB 2027 without burning out.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              <strong className="font-semibold text-slate-900 dark:text-white">
                {EDGEMAX_INFO.tagline}
              </strong>{' '}
              Classes have started! Create your verified student profile below
              for an instant downloadable ID card, log in anytime via email,
              phone, or EdgeMax ID, and join our{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                24/7 Brainstorm Group
              </span>{' '}
              led by top mentors scoring{' '}
              <span className="font-mono font-medium tabular-nums text-slate-900 dark:text-sky-300">
                312–330
              </span>
              .
            </p>

            {/* Primary interactive CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#register"
                className="cta-waitlist-btn group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-sky-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <span>Register for Classes</span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              <button
                type="button"
                onClick={() => onOpenPortal('student')}
                data-testid="hero-portal-btn"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {session ? (
                  <>
                    <LayoutDashboard
                      className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Open Verified Dashboard</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck
                      className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span>Student / Tutor Login</span>
                  </>
                )}
              </button>

              <a
                href={EDGEMAX_INFO.brainstormWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-1.5 px-2 py-2 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline underline-offset-4 whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>24/7 Brainstorm</span>
              </a>
            </div>

            {session && (
              <div
                data-testid="hero-signed-in-bar"
                className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 px-4 py-2.5 text-xs"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  Signed in as{' '}
                  <strong>
                    {session.userType === 'student'
                      ? session.student.fullName
                      : session.tutor.name}
                  </strong>{' '}
                  (
                  <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">
                    {session.userType === 'student'
                      ? session.student.id
                      : session.tutor.id}
                  </span>
                  )
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPortal(session.userType)}
                  className="font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  View Verified Profile →
                </button>
              </div>
            )}

            {/* Direct enquiry metadata */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200 dark:border-slate-800 pt-5 text-sm text-slate-600 dark:text-slate-300">
              <a
                href={EDGEMAX_INFO.phoneTel}
                className="inline-flex items-center gap-2 font-mono tabular-nums text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <span>RSVP: {EDGEMAX_INFO.phoneDisplay}</span>
              </a>

              <a
                href={`mailto:${EDGEMAX_INFO.email}?subject=${encodeURIComponent(
                  'EdgeMax JAMB 2027 Tutorial Enquiry'
                )}`}
                className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 transition-colors break-all sm:break-normal"
              >
                <Mail className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                <span>{EDGEMAX_INFO.email}</span>
              </a>

              <a
                href="#enquiries"
                onClick={() => onSelectEnquirySource('Hero Section')}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
              >
                Prefill WhatsApp Enquiry
              </a>
            </div>
          </div>

          {/* Right column: Visual anchor */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 min-h-[320px] sm:min-h-[380px] lg:h-full">
              {!heroImgError ? (
                <img
                  src="/assets/extracted/hero-students.jpg"
                  alt="Smiling JAMB students studying with laptop and textbooks for EdgeMax Tutorial"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-8 text-center text-white">
                  <Calendar className="h-10 w-10 text-sky-400 mb-3" aria-hidden="true" />
                  <p className="font-display text-xl font-bold">
                    EdgeMax JAMB {EDGEMAX_INFO.programYear} Cohort
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Classes started {EDGEMAX_INFO.startDate}
                  </p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent p-5 sm:p-6">
                <p className="font-display text-base font-bold text-white">
                  JAMB {EDGEMAX_INFO.programYear} Cohort — Now Running
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Live Mon–Fri evening classes
                  <span aria-hidden="true" className="mx-1.5 text-slate-400">
                    ·
                  </span>
                  <span className="font-mono tabular-nums">8:00 PM – 11:00 PM WAT</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Cohort & Next-Class Countdown Strip */}
        <div
          data-testid="live-countdown-strip"
          className="mt-10 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 sm:p-6 lg:grid-cols-2"
        >
          {/* Elapsed since classes started */}
          <div className="flex flex-col justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                Cohort Progress · Classes Have Started
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Since {EDGEMAX_INFO.startDate}
              </span>
            </div>
            <p
              data-testid="elapsed-countdown"
              className="font-mono text-2xl font-bold tabular-nums text-slate-950 dark:text-white sm:text-3xl"
            >
              {countdown.elapsedSinceStart.days}d{' '}
              {formatPad2(countdown.elapsedSinceStart.hours)}h{' '}
              {formatPad2(countdown.elapsedSinceStart.minutes)}m{' '}
              {formatPad2(countdown.elapsedSinceStart.seconds)}s
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Time running since Cohort Kickoff (8:00 PM {EDGEMAX_INFO.timezoneLabel})
            </p>
          </div>

          {/* Countdown to next class or live session remaining */}
          <div className="flex flex-col justify-between gap-2 lg:pl-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {countdown.isInSession && countdown.currentClass
                    ? `Live Now: ${countdown.currentClass.subject} (${countdown.currentClass.tutorName})`
                    : `Next Class: ${countdown.nextClass.dayLabel} · ${countdown.nextClass.subject}`}
                </span>
              </span>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {countdown.isInSession && countdown.currentClass
                  ? countdown.currentClass.slotTime
                  : countdown.nextClass.slotTime}
              </span>
            </div>
            <p
              data-testid="next-class-countdown"
              className="font-mono text-2xl font-bold tabular-nums text-slate-950 dark:text-white sm:text-3xl"
            >
              {countdown.isInSession && countdown.currentClass ? (
                <>
                  {formatPad2(countdown.currentClass.remaining.hours)}h{' '}
                  {formatPad2(countdown.currentClass.remaining.minutes)}m{' '}
                  {formatPad2(countdown.currentClass.remaining.seconds)}s left
                </>
              ) : (
                <>
                  {countdown.nextClass.startsIn.days}d{' '}
                  {formatPad2(countdown.nextClass.startsIn.hours)}h{' '}
                  {formatPad2(countdown.nextClass.startsIn.minutes)}m{' '}
                  {formatPad2(countdown.nextClass.startsIn.seconds)}s
                </>
              )}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {countdown.isInSession && countdown.currentClass
                ? `Next slot: ${countdown.nextClass.subject} with ${countdown.nextClass.tutorName} (${countdown.nextClass.dayLabel})`
                : `Tutor: ${countdown.nextClass.tutorName} · Period until next class (${EDGEMAX_INFO.timezoneLabel})`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
