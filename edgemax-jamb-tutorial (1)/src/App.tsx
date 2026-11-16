import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CurriculumAndServices } from './components/CurriculumAndServices';
import { TutorsSection } from './components/TutorsSection';
import { ScheduleSection } from './components/ScheduleSection';
import { RegistrationSection } from './components/RegistrationSection';
import { FaqAndEnquirySection } from './components/FaqAndEnquirySection';
import { Footer } from './components/Footer';
import { PortalModal, type AuthSessionState } from './components/PortalModal';
import { detectJoinSource } from './utils/tutorialData';
import { validateFirestoreConnection } from './firebase';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('edgemax-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'light';
  });

  const [enquirySource, setEnquirySource] = useState('Enquiries Desk');
  const [referralChannel] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return detectJoinSource(window.location.search, document.referrer);
    }
    return null;
  });

  const [session, setSession] = useState<AuthSessionState>(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalDefaultTab, setPortalDefaultTab] = useState<'student' | 'tutor'>(
    'student'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('edgemax-theme', theme);
  }, [theme]);

  useEffect(() => {
    void validateFirestoreConnection();
    let cancelled = false;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.authenticated) return;
        if (data.userType === 'student' && data.student) {
          setSession({ userType: 'student', student: data.student });
        } else if (data.userType === 'tutor' && data.tutor) {
          setSession({
            userType: 'tutor',
            tutor: data.tutor,
            students: Array.isArray(data.students) ? data.students : [],
          });
        }
      })
      .catch(() => {
        // Ignore transient startup checks
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const openPortal = (tab: 'student' | 'tutor' = 'student') => {
    setPortalDefaultTab(tab);
    setPortalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network failure on logout
    }
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar theme={theme} session={session} onOpenPortal={openPortal} />
      <main className="flex-1">
        <HeroSection
          theme={theme}
          session={session}
          onToggleTheme={toggleTheme}
          onSelectEnquirySource={setEnquirySource}
          onOpenPortal={openPortal}
        />
        <CurriculumAndServices />
        <TutorsSection referralChannel={referralChannel} />
        <ScheduleSection onSelectEnquirySource={setEnquirySource} />
        <RegistrationSection
          referralChannel={referralChannel}
          session={session}
          onRegistered={(next) => setSession(next)}
          onOpenPortal={openPortal}
        />
        <FaqAndEnquirySection
          enquirySource={enquirySource}
          referralChannel={referralChannel}
          onChangeEnquirySource={setEnquirySource}
        />
      </main>
      <Footer onOpenPortal={openPortal} />

      <PortalModal
        isOpen={portalOpen}
        initialTab={portalDefaultTab}
        session={session}
        onClose={() => setPortalOpen(false)}
        onAuthenticated={(next) => setSession(next)}
        onLogout={handleLogout}
      />
    </div>
  );
}
