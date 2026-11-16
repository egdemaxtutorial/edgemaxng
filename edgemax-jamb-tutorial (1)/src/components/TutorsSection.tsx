import { useState } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react';
import {
  ALL_SUBJECTS,
  EDGEMAX_INFO,
  SubjectName,
  TUTORS,
  TutorProfile,
  buildTutorWhatsAppUrl,
  filterTutorsBySubject,
} from '../utils/tutorialData';

function LinkedInLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function TikTokLogo({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
    </svg>
  );
}

function TutorAvatar({ tutor }: { tutor: TutorProfile }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-950 font-display text-lg font-bold text-sky-200"
        aria-hidden="true"
      >
        {tutor.initials}
      </div>
    );
  }

  return (
    <img
      src={tutor.portraitPath}
      alt={`Portrait of ${tutor.name}`}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className="h-16 w-16 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 object-cover object-top"
    />
  );
}

interface TutorsSectionProps {
  referralChannel?: string | null;
}

export function TutorsSection({ referralChannel = null }: TutorsSectionProps) {
  const [selectedSubject, setSelectedSubject] = useState<SubjectName | 'All'>(
    'All'
  );
  const visibleTutors = filterTutorsBySubject(TUTORS, selectedSubject);

  return (
    <section
      id="tutors"
      className="scroll-mt-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-14 sm:py-18 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
              Verified Mentors
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
              Meet the 5 tutors leading your classes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Message any tutor directly on WhatsApp with a prefilled prompt
              tailored to their EdgeMax role, or open verified social profiles.
            </p>
          </div>

          {/* Interactive subject filter bar */}
          <div
            role="group"
            aria-label="Filter tutors by subject"
            className="flex flex-wrap sm:flex-nowrap items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1.5 shrink-0"
          >
            {(['All', ...ALL_SUBJECTS] as const).map((subject) => {
              const active = selectedSubject === subject;
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setSelectedSubject(subject)}
                  aria-pressed={active}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    active
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        <div
          data-testid="tutors-grid"
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {visibleTutors.map((tutor) => {
            const whatsappHref = buildTutorWhatsAppUrl(tutor, referralChannel);

            return (
              <article
                key={tutor.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6"
              >
                <div>
                  {/* Header: Portrait + Name + Roles */}
                  <div className="flex items-start gap-4">
                    <TutorAvatar tutor={tutor} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-medium tabular-nums text-sky-700 dark:text-sky-400">
                        Tutor {tutor.code} of 05
                      </p>
                      <h3 className="mt-0.5 flex items-center gap-1.5 font-display text-lg font-bold text-slate-950 dark:text-white">
                        <span className="truncate">{tutor.name}</span>
                        <BadgeCheck
                          className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
                          aria-label="Verified tutor"
                        />
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {tutor.roles.join(' · ')}
                      </p>
                    </div>
                  </div>

                  {/* Subjects & Academic Profile */}
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 dark:border-slate-800 py-4 text-xs">
                    <div>
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        Subjects
                      </dt>
                      <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                        {tutor.subjects.join(' · ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        JAMB Score
                      </dt>
                      <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-sky-700 dark:text-sky-400">
                        {tutor.jambScore}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        Academic Profile
                      </dt>
                      <dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">
                        {tutor.course} · {tutor.university}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {tutor.bio}
                  </p>

                  <blockquote className="mt-4 text-sm italic text-slate-700 dark:text-slate-300">
                    “{tutor.quote}”
                  </blockquote>
                </div>

                <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={tutor.whatsappRuleLabel}
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-800 dark:hover:text-sky-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <MessageCircle
                      className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400"
                      aria-hidden="true"
                    />
                    <span className="truncate">WhatsApp {tutor.name}</span>
                    <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                      {tutor.whatsappDisplay}
                    </span>
                  </a>

                  {tutor.bioLinkUrl ? (
                    <a
                      href={tutor.bioLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {tutor.bioLinkLabel === 'TikTok' ? (
                        <TikTokLogo className="h-4 w-4 shrink-0" />
                      ) : (
                        <LinkedInLogo className="h-4 w-4 shrink-0" />
                      )}
                      <span>
                        {tutor.bioLinkLabel} Bio — {tutor.name}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <div
                      aria-label={`LinkedIn profile placeholder for ${tutor.name}`}
                      className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 select-none"
                    >
                      <LinkedInLogo className="h-4 w-4 shrink-0 opacity-70" />
                      <span>LinkedIn Profile · Pending</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {selectedSubject === 'All' && (
            <aside className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-6 text-white">
              <div>
                <p className="font-mono text-xs font-medium text-sky-400">
                  24/7 Study Community
                </p>
                <h3 className="mt-2 font-display text-xl font-bold text-white">
                  Join the 24/7 Brainstorm Group
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Classes have started! Connect round-the-clock with peers and all
                  five EdgeMax tutors on WhatsApp, or contact Secretary / RSVP
                  Daviesking directly.
                </p>
                <dl className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-300">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Tuition</dt>
                    <dd className="font-semibold text-white">100% Free</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Schedule</dt>
                    <dd className="font-mono tabular-nums text-white">
                      Mon–Fri · 8:00–11:00 PM
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-400">Secretary / RSVP</dt>
                    <dd className="font-mono tabular-nums text-white">
                      {EDGEMAX_INFO.phoneDisplay}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="mt-6 space-y-2.5">
                <a
                  href={EDGEMAX_INFO.brainstormWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-waitlist-btn flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 whitespace-nowrap"
                >
                  <span>Join 24/7 Brainstorm Group</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
                <a
                  href="#register"
                  className="flex min-h-[40px] w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Generate Student ID Card
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
