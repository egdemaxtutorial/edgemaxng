import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  Calculator,
  Clock,
  Dna,
  FlaskConical,
  UserCheck,
} from 'lucide-react';
import {
  EDGEMAX_INFO,
  SERVICES,
  SUBJECTS,
  SubjectName,
  formatPad2,
  getNextClassForSubject,
} from '../utils/tutorialData';

function getSubjectIcon(name: SubjectName) {
  switch (name) {
    case 'Biology':
      return Dna;
    case 'Chemistry':
      return FlaskConical;
    case 'Physics':
      return Atom;
    case 'English':
      return BookOpen;
    case 'Mathematics':
      return Calculator;
  }
}

export function CurriculumAndServices() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {/* Core Subjects */}
      <section
        id="subjects"
        className="scroll-mt-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-14 sm:py-18 transition-colors"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                Core Curriculum
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
                Five high-yield JAMB subjects
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Each subject is taught twice weekly in focused 90-minute evening
              sessions with live countdowns and assigned teachers below.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((subject) => {
              const Icon = getSubjectIcon(subject.name);
              const nextInfo = getNextClassForSubject(subject.name, now);

              return (
                <article
                  key={subject.name}
                  data-testid={`subject-card-${subject.name.toLowerCase()}`}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 transition-colors hover:border-sky-300 dark:hover:border-sky-700"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {subject.sessionsPerWeek}x / week
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold text-slate-950 dark:text-white">
                      {subject.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {subject.focus}
                    </p>
                  </div>

                  {/* Next Class Countdown & Assigned Teacher beside every subject */}
                  <div className="mt-4 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                    <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            nextInfo.isLiveNow
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-sky-700 dark:text-sky-400'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            {nextInfo.isLiveNow
                              ? 'Live Now'
                              : `Next: ${nextInfo.dayLabel}`}
                          </span>
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                          {nextInfo.slotTime}
                        </span>
                      </div>

                      <p
                        data-testid={`subject-countdown-${subject.name.toLowerCase()}`}
                        className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-950 dark:text-white"
                      >
                        {nextInfo.isLiveNow ? (
                          <>
                            {formatPad2(nextInfo.countdown.hours)}h{' '}
                            {formatPad2(nextInfo.countdown.minutes)}m{' '}
                            {formatPad2(nextInfo.countdown.seconds)}s left
                          </>
                        ) : (
                          <>
                            {nextInfo.countdown.days}d{' '}
                            {formatPad2(nextInfo.countdown.hours)}h{' '}
                            {formatPad2(nextInfo.countdown.minutes)}m{' '}
                            {formatPad2(nextInfo.countdown.seconds)}s
                          </>
                        )}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <UserCheck
                          className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400"
                          aria-hidden="true"
                        />
                        <span>
                          Next Teacher:{' '}
                          <strong className="font-semibold text-slate-900 dark:text-white">
                            {nextInfo.teacherName}
                          </strong>
                        </span>
                      </p>
                    </div>

                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Tutors: {subject.tutors.join(' · ')}
                    </p>
                  </div>
                </article>
              );
            })}

            {/* 6th Grid Card: Complete Timetable Overview */}
            <aside className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-5 text-white">
              <div>
                <p className="font-mono text-xs font-medium text-sky-400">
                  Strictly 5 Offered Subjects
                </p>
                <h3 className="mt-2 font-display text-lg font-bold text-white">
                  10 Live Evening Sessions Weekly
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  EdgeMax focuses exclusively on English, Mathematics, Biology,
                  Chemistry, and Physics—every Monday to Friday from 8:00 PM to
                  11:00 PM WAT.
                </p>
              </div>
              <div className="mt-5 space-y-2">
                <a
                  href="#schedule"
                  className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
                >
                  <span>View Full Weekly Schedule</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
                <a
                  href="#register"
                  className="flex min-h-[40px] w-full items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Register for Student ID Card
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section
        id="services"
        className="scroll-mt-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-14 sm:py-18 transition-colors"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                What You Get
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
                Structured preparation built for consistency
              </h2>
            </div>
            <a
              href={EDGEMAX_INFO.brainstormWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 whitespace-nowrap shrink-0"
            >
              <span>Join 24/7 Brainstorm Group</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-6">
            {SERVICES.map((service, index) => {
              const spanClass = index < 2 ? 'md:col-span-3' : 'md:col-span-2';
              return (
                <article
                  key={service.number}
                  className={`${spanClass} flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-6`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                        {service.number}.
                      </span>
                      <span>{service.highlight}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-950 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
