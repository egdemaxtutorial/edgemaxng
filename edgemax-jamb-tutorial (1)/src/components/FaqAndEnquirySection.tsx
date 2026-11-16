import { useState, type MouseEvent } from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react';
import {
  ALL_SUBJECTS,
  EDGEMAX_INFO,
  ENQUIRY_TOPICS,
  EnquiryTopicId,
  FAQS,
  SubjectName,
  buildMailtoUrl,
  buildPrefilledEnquiryText,
  buildWhatsAppEnquiryUrl,
  validateEnquiryForm,
} from '../utils/tutorialData';

const SOURCE_OPTIONS = [
  'Enquiries Desk',
  'Hero Section',
  'Weekly Class Schedule',
  '24/7 Brainstorm Group',
  'Tutor Directory',
  'FAQ Section',
];

type FaqFilter = 'All' | 'Registration & ID' | 'Classes & Subjects' | 'Tutors & Support';

const FAQ_FILTERS: FaqFilter[] = [
  'All',
  'Registration & ID',
  'Classes & Subjects',
  'Tutors & Support',
];

interface FaqAndEnquirySectionProps {
  enquirySource: string;
  referralChannel?: string | null;
  onChangeEnquirySource: (source: string) => void;
}

export function FaqAndEnquirySection({
  enquirySource,
  referralChannel = null,
  onChangeEnquirySource,
}: FaqAndEnquirySectionProps) {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([FAQS[0].id]);
  const [faqFilter, setFaqFilter] = useState<FaqFilter>('All');

  const [topicId, setTopicId] = useState<EnquiryTopicId>('waitlist');
  const [studentName, setStudentName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectName[]>([
    'English',
    'Mathematics',
  ]);
  const [customNote, setCustomNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const visibleFaqs = FAQS.filter((faq) => {
    if (faqFilter === 'All') return true;
    if (faqFilter === 'Registration & ID') {
      return (
        faq.category === 'Registration & ID' ||
        faq.category === 'Admission & Cost'
      );
    }
    if (faqFilter === 'Classes & Subjects') {
      return (
        faq.category === 'Subjects Offered' ||
        faq.category === 'Timetable' ||
        faq.category === 'Cohort Status' ||
        faq.category === 'Mock Exams' ||
        faq.category === 'Attendance & Notes' ||
        faq.category === 'Study Method'
      );
    }
    return (
      faq.category === 'Tutors & Contact' ||
      faq.category === '24/7 Brainstorm' ||
      faq.category === 'Online Access'
    );
  });

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allVisibleExpanded =
    visibleFaqs.length > 0 &&
    visibleFaqs.every((f) => openFaqIds.includes(f.id));

  const toggleAllFaqs = () => {
    if (allVisibleExpanded) {
      setOpenFaqIds((prev) =>
        prev.filter((id) => !visibleFaqs.some((f) => f.id === id))
      );
    } else {
      setOpenFaqIds((prev) => [
        ...new Set([...prev, ...visibleFaqs.map((f) => f.id)]),
      ]);
    }
  };

  const toggleSubject = (subject: SubjectName) => {
    setFormError(null);
    setStatusNote(null);
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const currentTopic =
    ENQUIRY_TOPICS.find((t) => t.id === topicId) ?? ENQUIRY_TOPICS[0];

  const previewMessage = buildPrefilledEnquiryText({
    studentName,
    topicId,
    selectedSubjects,
    customNote,
    sourceSection: enquirySource,
    referralChannel,
  });

  const whatsappUrl = buildWhatsAppEnquiryUrl(
    EDGEMAX_INFO.phoneRaw,
    previewMessage
  );
  const mailtoUrl = buildMailtoUrl(
    EDGEMAX_INFO.email,
    currentTopic.emailSubject,
    previewMessage
  );

  const handleActionClick = (
    e: MouseEvent<HTMLAnchorElement>,
    channel: 'WhatsApp' | 'Email'
  ) => {
    const check = validateEnquiryForm({ studentName, selectedSubjects });
    if (!check.valid) {
      e.preventDefault();
      setFormError(check.error);
      setStatusNote(null);
      return;
    }
    setFormError(null);
    setStatusNote(
      `Your prefilled ${channel} message is ready—complete sending in ${channel}.`
    );
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatusNote('Copy manually from the preview box above.');
    }
  };

  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-slate-50 dark:bg-slate-950 py-14 sm:py-18 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left: Toggled FAQ Sections (20 FAQs with category filter) */}
          <div className="lg:col-span-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                  Frequently Asked Questions ({FAQS.length})
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl [text-wrap:balance]">
                  Quick answers before you join
                </h2>
              </div>

              <button
                type="button"
                onClick={toggleAllFaqs}
                className="min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {allVisibleExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            {/* Category Tabs */}
            <div
              role="group"
              aria-label="Filter FAQs by category"
              className="mt-4 flex flex-wrap gap-1.5"
            >
              {FAQ_FILTERS.map((filter) => {
                const active = faqFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFaqFilter(filter)}
                    aria-pressed={active}
                    className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'border-slate-900 dark:border-sky-400 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {visibleFaqs.map((faq) => {
                const isOpen = openFaqIds.includes(faq.id);
                const panelId = `faq-panel-${faq.id}`;
                return (
                  <div key={faq.id}>
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex min-h-[54px] w-full items-center justify-between gap-4 px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-sky-600"
                    >
                      <div>
                        <span className="block text-xs font-medium text-sky-700 dark:text-sky-400">
                          {faq.category}
                        </span>
                        <span className="mt-0.5 block font-display text-sm sm:text-base font-semibold text-slate-950 dark:text-white">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-sky-700 dark:text-sky-400' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={panelId}
                        className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Direct Contact & Source-Tagged Prefilled Message Builder */}
          <div id="enquiries" className="scroll-mt-20 lg:col-span-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7">
              <p className="text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-400">
                Enquiries &amp; Prefill Message
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                Reach EdgeMax Secretary / RSVP
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                Call, email, or customize a prefilled WhatsApp or Email message
                including where you joined from.
              </p>

              {/* Direct Phone & Email Contact Channels */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
                <a
                  href={EDGEMAX_INFO.phoneTel}
                  className="sm:col-span-5 flex min-h-[56px] items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/60 dark:hover:bg-sky-950/40 transition-colors"
                >
                  <Phone
                    className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Secretary / RSVP
                    </span>
                    <span className="block font-mono text-[13px] font-semibold tabular-nums text-slate-950 dark:text-white whitespace-nowrap">
                      {EDGEMAX_INFO.phoneDisplay}
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${EDGEMAX_INFO.email}?subject=${encodeURIComponent(
                    'EdgeMax JAMB 2027 Tutorial Enquiry'
                  )}`}
                  className="sm:col-span-7 flex min-h-[56px] items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/60 dark:hover:bg-sky-950/40 transition-colors"
                >
                  <Mail
                    className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Official Email
                    </span>
                    <span className="block text-[13px] font-semibold text-slate-950 dark:text-white break-all sm:break-normal">
                      {EDGEMAX_INFO.email}
                    </span>
                  </div>
                </a>
              </div>

              {/* Prefill Builder Controls */}
              <div className="mt-6 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-topic"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Enquiry Topic
                    </label>
                    <select
                      id="enquiry-topic"
                      value={topicId}
                      onChange={(e) => {
                        setTopicId(e.target.value as EnquiryTopicId);
                        setStatusNote(null);
                      }}
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    >
                      {ENQUIRY_TOPICS.map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-source"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Joined From (Section)
                    </label>
                    <select
                      id="enquiry-source"
                      value={enquirySource}
                      onChange={(e) => {
                        onChangeEnquirySource(e.target.value);
                        setStatusNote(null);
                      }}
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                    >
                      {SOURCE_OPTIONS.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Your Full Name
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      if (formError) setFormError(null);
                      setStatusNote(null);
                    }}
                    placeholder="e.g. Chinedu Okafor"
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target JAMB Subjects
                  </span>
                  <div
                    role="group"
                    aria-label="Select target JAMB subjects"
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {ALL_SUBJECTS.map((subject) => {
                      const active = selectedSubjects.includes(subject);
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          aria-pressed={active}
                          className={`min-h-[40px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                            active
                              ? 'border-sky-600 bg-sky-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {subject}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="custom-note"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Optional Question or Target Course
                  </label>
                  <input
                    id="custom-note"
                    type="text"
                    value={customNote}
                    onChange={(e) => {
                      setCustomNote(e.target.value);
                      setStatusNote(null);
                    }}
                    placeholder="e.g. Aiming for 310+ in Medicine & Surgery"
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                  />
                </div>

                {/* Live Prefilled Message Preview */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Prefilled Message Preview
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-100/70 dark:hover:bg-slate-800 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Copy text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    data-testid="prefill-preview"
                    className="mt-2 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    {previewMessage}
                  </pre>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-200"
                  >
                    {formError}
                  </p>
                )}

                {statusNote && !formError && (
                  <p
                    role="status"
                    className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 px-3.5 py-2.5 text-xs font-medium text-sky-900 dark:text-sky-200"
                  >
                    {statusNote}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleActionClick(e, 'WhatsApp')}
                    className="cta-waitlist-btn flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Send via WhatsApp</span>
                  </a>

                  <a
                    href={mailtoUrl}
                    onClick={(e) => handleActionClick(e, 'Email')}
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <Send
                      className="h-4 w-4 shrink-0 text-slate-600 dark:text-slate-400"
                      aria-hidden="true"
                    />
                    <span>Send via Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
