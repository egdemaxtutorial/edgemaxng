import { useState } from 'react';
import { Clock, MessageCircle } from 'lucide-react';
import {
  DayCode,
  EDGEMAX_INFO,
  WEEKLY_SCHEDULE,
  filterScheduleByDay,
} from '../utils/tutorialData';

const DAY_FILTERS: Array<{ code: DayCode | 'ALL'; label: string }> = [
  { code: 'ALL', label: 'All Days' },
  { code: 'MON', label: 'MON' },
  { code: 'TUE', label: 'TUE' },
  { code: 'WED', label: 'WED' },
  { code: 'THU', label: 'THU' },
  { code: 'FRI', label: 'FRI' },
];

interface ScheduleSectionProps {
  onSelectEnquirySource: (source: string) => void;
}

export function ScheduleSection({ onSelectEnquirySource }: ScheduleSectionProps) {
  const [selectedDay, setSelectedDay] = useState<DayCode | 'ALL'>('ALL');
  const filteredDays = filterScheduleByDay(WEEKLY_SCHEDULE, selectedDay);

  return (
    <section
      id="schedule"
      className="scroll-mt-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-14 sm:py-18 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
              Weekly Class Schedule · Active Cohort
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
              Evening timetable built around school hours
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                <span>Started {EDGEMAX_INFO.startDate}</span>
              </span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <span>Venue: {EDGEMAX_INFO.venue} ({EDGEMAX_INFO.timezoneLabel})</span>
              <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">
                ·
              </span>
              <a
                href="#enquiries"
                onClick={() => onSelectEnquirySource('Weekly Class Schedule')}
                className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ask about timetable</span>
              </a>
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter timetable by day"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5"
          >
            {DAY_FILTERS.map((item) => {
              const active = selectedDay === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedDay(item.code)}
                  aria-pressed={active}
                  className={`min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                    active
                      ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Timetable Table */}
        <div className="mt-8 hidden md:block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <th
                  scope="col"
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 w-36"
                >
                  Day
                </th>
                <th scope="col" className="px-6 py-4 text-slate-900 dark:text-white">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Time Slot 1
                  </span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {EDGEMAX_INFO.slot1Time}
                  </span>
                </th>
                <th scope="col" className="px-6 py-4 text-slate-900 dark:text-white">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Time Slot 2
                  </span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                    {EDGEMAX_INFO.slot2Time}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDays.map((row) => (
                <tr
                  key={row.day}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <th scope="row" className="px-6 py-5 align-top">
                    <span className="block font-display text-base font-bold text-slate-950 dark:text-white">
                      {row.day}
                    </span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {row.dayLabel}
                    </span>
                  </th>
                  <td className="px-6 py-5 align-top">
                    <p className="font-display text-base font-bold text-slate-950 dark:text-white">
                      {row.slot1.subject}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                      {row.slot1.tutorName}
                      <span aria-hidden="true" className="mx-1.5 text-slate-400 dark:text-slate-600">
                        ·
                      </span>
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        Tutor {row.slot1.tutorCode}
                      </span>
                    </p>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <p className="font-display text-base font-bold text-slate-950 dark:text-white">
                      {row.slot2.subject}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                      {row.slot2.tutorName}
                      <span aria-hidden="true" className="mx-1.5 text-slate-400 dark:text-slate-600">
                        ·
                      </span>
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        Tutor {row.slot2.tutorCode}
                      </span>
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Day Cards (no horizontal scroll) */}
        <div className="mt-8 space-y-3 md:hidden" data-testid="mobile-schedule-list">
          {filteredDays.map((row) => (
            <article
              key={row.day}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-4"
            >
              <div className="flex items-baseline justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <h3 className="font-display text-base font-bold text-slate-950 dark:text-white">
                  {row.dayLabel}
                </h3>
                <span className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
                  {row.day}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
                  <p className="font-mono text-xs font-medium tabular-nums text-sky-700 dark:text-sky-400">
                    Slot 1 · {EDGEMAX_INFO.slot1Time}
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-slate-950 dark:text-white">
                    {row.slot1.subject}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {row.slot1.tutorName} · Tutor {row.slot1.tutorCode}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3">
                  <p className="font-mono text-xs font-medium tabular-nums text-amber-700 dark:text-amber-400">
                    Slot 2 · {EDGEMAX_INFO.slot2Time}
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-slate-950 dark:text-white">
                    {row.slot2.subject}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {row.slot2.tutorName} · Tutor {row.slot2.tutorCode}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
