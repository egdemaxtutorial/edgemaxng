import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { EdgeMaxLogo } from './EdgeMaxLogo';
import { EDGEMAX_INFO } from '../utils/tutorialData';

interface FooterProps {
  onOpenPortal: (tab?: 'student' | 'tutor') => void;
}

export function Footer({ onOpenPortal }: FooterProps) {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-950 py-12 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <EdgeMaxLogo variant="dark" />
            <p className="mt-3 text-sm font-medium text-white">
              {EDGEMAX_INFO.tagline}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {EDGEMAX_INFO.footerMotto}
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-semibold tracking-wide text-slate-400">
              Sections &amp; Portal
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#subjects" className="hover:text-white transition-colors">
                  Subjects
                </a>
              </li>
              <li>
                <a href="#tutors" className="hover:text-white transition-colors">
                  Tutors
                </a>
              </li>
              <li>
                <a href="#schedule" className="hover:text-white transition-colors">
                  Weekly Schedule
                </a>
              </li>
              <li>
                <a href="#register" className="hover:text-white transition-colors">
                  Student Registration
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPortal('student')}
                  className="hover:text-white transition-colors text-left"
                >
                  Student Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPortal('tutor')}
                  className="hover:text-white transition-colors text-left"
                >
                  Tutor Login
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-semibold tracking-wide text-slate-400">
              Groups &amp; Secretary / RSVP
            </p>
            <div className="mt-3 space-y-2.5 text-sm">
              <div>
                <a
                  href={EDGEMAX_INFO.brainstormWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>Join 24/7 Brainstorm Group</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <div>
                <a
                  href={EDGEMAX_INFO.whatsappWaitlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <span>Main Cohort WhatsApp Link</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <div>
                <a
                  href={EDGEMAX_INFO.phoneTel}
                  className="inline-flex items-center gap-2 font-mono tabular-nums text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
                  <span>{EDGEMAX_INFO.phoneDisplay}</span>
                </a>
              </div>
              <div>
                <a
                  href={`mailto:${EDGEMAX_INFO.email}`}
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
                  <span>{EDGEMAX_INFO.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {EDGEMAX_INFO.programYear} EdgeMax JAMB Tutorial. Free Online Cohort.</p>
          <p>
            Started {EDGEMAX_INFO.startDate} · Venue: {EDGEMAX_INFO.venue}
          </p>
        </div>
      </div>
    </footer>
  );
}
