import { useState } from 'react';
import { ArrowUpRight, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { EdgeMaxLogo } from './EdgeMaxLogo';
import { EDGEMAX_INFO } from '../utils/tutorialData';
import { type AuthSessionState } from './PortalModal';

const NAV_LINKS = [
  { label: 'Subjects', href: '#subjects' },
  { label: 'Tutors', href: '#tutors' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Register', href: '#register' },
  { label: 'FAQ', href: '#faq' },
];

interface NavbarProps {
  theme: 'light' | 'dark';
  session: AuthSessionState;
  onOpenPortal: (tab?: 'student' | 'tutor') => void;
}

export function Navbar({ theme, session, onOpenPortal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark only */}
        <a
          href="#top"
          aria-label="EdgeMax JAMB 2027 Tutorial Home"
          className="shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-md"
        >
          <EdgeMaxLogo variant={theme === 'dark' ? 'dark' : 'light'} />
        </a>

        {/* Zone 2: Concise single-line nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:underline hover:underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action (+ mobile menu trigger) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpenPortal('student')}
            data-testid="nav-portal-btn"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {session ? (
              <>
                <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Verified Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Portal Login</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#enquiries"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
            >
              Enquiries
            </a>
          </nav>
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortal('student');
              }}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              {session ? (
                <>
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span>Open Verified Dashboard</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Student / Tutor Portal Login</span>
                </>
              )}
            </button>
            <a
              href={EDGEMAX_INFO.brainstormWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Join 24/7 Brainstorm Group</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
