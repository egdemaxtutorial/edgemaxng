export type SubjectName =
  | 'Biology'
  | 'Chemistry'
  | 'Physics'
  | 'English'
  | 'Mathematics';

export type ElectiveSubject =
  | 'Biology'
  | 'Chemistry'
  | 'Physics'
  | 'Mathematics';

export type DayCode = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

export interface SubjectInfo {
  name: SubjectName;
  focus: string;
  sessionsPerWeek: number;
  tutors: string[];
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  highlight: string;
}

export interface TutorProfile {
  id: string;
  tutorAccountId:
    | 'EG-MARVY'
    | 'EG-TUTOR-MAVERICK'
    | 'EG-TUTOR-KOLE'
    | 'EG-TUTOR-DAVIES'
    | 'EG-TUTOR-ISAAC';
  code: string;
  name: string;
  roles: string[];
  subjects: SubjectName[];
  bio: string;
  course: string;
  university: string;
  jambScore: number;
  quote: string;
  portraitPath: string;
  initials: string;
  whatsappDisplay: string;
  whatsappRaw: string;
  whatsappRuleLabel: string;
  whatsappIntroLine: string;
  whatsappChecklistLine: string;
  bioLinkLabel: 'TikTok' | 'LinkedIn';
  bioLinkUrl: string | null;
  isBioPlaceholder: boolean;
}

export interface ScheduleSlot {
  subject: SubjectName;
  tutorName: string;
  tutorCode: string;
}

export interface DaySchedule {
  day: DayCode;
  dayLabel: string;
  dayOfWeekWat: number; // 1=Mon .. 5=Fri
  slot1: ScheduleSlot; // 8:00 PM - 9:30 PM WAT
  slot2: ScheduleSlot; // 9:30 PM - 11:00 PM WAT
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export type EnquiryTopicId =
  | 'waitlist'
  | 'schedule'
  | 'guidance'
  | 'general';

export interface EnquiryTopic {
  id: EnquiryTopicId;
  label: string;
  emailSubject: string;
  introLine: string;
}

export interface StudentRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  phoneNormalized: string;
  aspiringCourse: string;
  aspiringSchool: string;
  subjects: SubjectName[];
  otherDetails?: string;
  verified: boolean;
  dateIssued: string;
  timeIssued: string;
  createdAt: string;
  sourceSection?: string;
  referralChannel?: string | null;
}

export interface TutorAccountRecord {
  id: string;
  tutorProfileId: string;
  name: string;
  phoneDisplay: string;
  phoneNormalized: string;
  email: string | null;
  verified: boolean;
  createdAt: string;
}

export const EDGEMAX_INFO = {
  brandName: 'EDGEMAX',
  programYear: '2027',
  tagline: "We don't burn out, We max out potentials.",
  footerMotto: 'Your JAMB Success Starts Here.',
  programTitle: 'JAMB 2027 Tutorial',
  tuition: 'Free',
  startDate: '19 October 2026',
  startDateIsoWat: '2026-10-19T20:00:00+01:00',
  venue: 'Online',
  whatsappWaitlistUrl: 'https://bit.ly/3UpeE9e',
  brainstormWhatsappUrl:
    'https://chat.whatsapp.com/If36hp3A68C8myrbq8FVai?s=cl&p=a&mlu=4&ilr=4&iam=2',
  phoneDisplay: '+234 803 639 5539',
  phoneRaw: '2348036395539',
  phoneTel: 'tel:+2348036395539',
  secretaryLabel: 'Secretary / RSVP (Daviesking)',
  email: 'edgemaxtutorial@gmail.com',
  slot1Time: '8:00 PM – 9:30 PM',
  slot2Time: '9:30 PM – 11:00 PM',
  timezoneLabel: 'WAT (UTC+1)',
} as const;

export const ALL_SUBJECTS: SubjectName[] = [
  'English',
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
];

// Only the 5 offered JAMB subjects: English is included, choose 3 from the remaining 4
export const REGISTRATION_ELECTIVES: ElectiveSubject[] = [
  'Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
];

export const SUBJECTS: SubjectInfo[] = [
  {
    name: 'English',
    focus:
      'Comprehension mastery, lexis & structure, oral forms, and high-yield JAMB vocabulary.',
    sessionsPerWeek: 2,
    tutors: ['Maverick'],
  },
  {
    name: 'Mathematics',
    focus:
      'Algebra, calculus, trigonometry, geometry, and timed speed-solving drills.',
    sessionsPerWeek: 2,
    tutors: ['Maverick', 'Olubanjo Koleola', 'Daviesking'],
  },
  {
    name: 'Biology',
    focus:
      'Cell biology, genetics, ecology, human physiology, and past JAMB diagram drills.',
    sessionsPerWeek: 2,
    tutors: ['Marvy Jhoe', 'Developer Isaac'],
  },
  {
    name: 'Chemistry',
    focus:
      'Stoichiometry, organic chemistry, equilibria, periodicity, and rapid calculation shortcuts.',
    sessionsPerWeek: 2,
    tutors: ['Marvy Jhoe', 'Developer Isaac'],
  },
  {
    name: 'Physics',
    focus:
      'Mechanics, waves, optics, electricity, and structured formula application.',
    sessionsPerWeek: 2,
    tutors: ['Olubanjo Koleola', 'Daviesking'],
  },
];

export const SERVICES: ServiceItem[] = [
  {
    number: '01',
    title: 'Quality Teaching by Standard Tutors',
    description:
      'Learn directly from top-performing university undergraduates who scored 312 to 330 in JAMB across Medicine and Engineering.',
    highlight: '312–330 JAMB Scorers',
  },
  {
    number: '02',
    title: 'Mock Exams & Past Questions',
    description:
      'Regular CBT-style mock tests and guided walkthroughs of verified JAMB past questions to build speed and accuracy under exam pressure.',
    highlight: 'CBT-Ready Drills',
  },
  {
    number: '03',
    title: '24/7 Brainstorming Sessions',
    description:
      'Round-the-clock academic discussions in the 24/7 WhatsApp Brainstorm Group alongside live evening problem-solving sessions.',
    highlight: '24/7 Group + Live Q&A',
  },
  {
    number: '04',
    title: 'Study Materials & Notes',
    description:
      'Concise, syllabus-aligned summary notes, formula sheets, and curated topic handouts shared directly after every class.',
    highlight: 'Structured Handouts',
  },
  {
    number: '05',
    title: 'Personal Support & Academic Guidance',
    description:
      'One-on-one mentorship on course selection, university cut-off targets, study timetables, and staying consistent without burnout.',
    highlight: 'Direct Mentorship',
  },
];

export const TUTORS: TutorProfile[] = [
  {
    id: 'marvy-jhoe',
    tutorAccountId: 'EG-MARVY',
    code: '01',
    name: 'Marvy Jhoe',
    roles: ['Digital Manager', 'Community Manager'],
    subjects: ['Biology', 'Chemistry'],
    bio: 'A dedicated tutor with a passion for helping students excel in Biology and Chemistry through clear explanations, strategic study methods, and consistent practice.',
    course: 'Medicine and Surgery',
    university: 'Obafemi Awolowo University (OAU)',
    jambScore: 327,
    quote: 'Read like you want to die and pray as if you have never read.',
    portraitPath: '/assets/extracted/tutor-marvy.jpg',
    initials: 'MJ',
    whatsappDisplay: '+234 915 761 1607',
    whatsappRaw: '2349157611607',
    whatsappRuleLabel: 'Community & Science Mentorship',
    whatsappIntroLine:
      'Hello Marvy Jhoe (Digital & Community Manager), I am reaching out from EdgeMax regarding community access and Biology / Chemistry coaching.',
    whatsappChecklistLine:
      'Enquiry Focus: Digital group guidelines, Biology & Chemistry drills, and Medicine target guidance',
    bioLinkLabel: 'LinkedIn',
    bioLinkUrl: null,
    isBioPlaceholder: true,
  },
  {
    id: 'maverick',
    tutorAccountId: 'EG-TUTOR-MAVERICK',
    code: '02',
    name: 'Maverick',
    roles: ['Vocabulary Director', 'Outreach Coordinator'],
    subjects: ['Mathematics', 'English'],
    bio: 'A logic-driven Software Engineering student from U.I passionate about building analytical foundations and communication skills through Mathematics and English.',
    course: 'Software Engineering',
    university: 'University of Ibadan (U.I)',
    jambScore: 312,
    quote: 'Your network is your networth.',
    portraitPath: '/assets/extracted/tutor-maverick.jpg',
    initials: 'MV',
    whatsappDisplay: '+234 913 113 4004',
    whatsappRaw: '2349131134004',
    whatsappRuleLabel: 'Vocabulary & Outreach Desk',
    whatsappIntroLine:
      'Hello Maverick (Vocabulary Director & Outreach Coordinator), I want to connect about Use of English vocabulary drills, Mathematics, or school outreach.',
    whatsappChecklistLine:
      'Enquiry Focus: Lexis & structure, daily vocabulary practice, Mathematics speed drills, and EdgeMax outreach',
    bioLinkLabel: 'LinkedIn',
    bioLinkUrl: null,
    isBioPlaceholder: true,
  },
  {
    id: 'olubanjo-koleola',
    tutorAccountId: 'EG-TUTOR-KOLE',
    code: '03',
    name: 'Olubanjo Koleola',
    roles: ['Community Manager', 'Financial Advisor'],
    subjects: ['Mathematics', 'Physics'],
    bio: 'A dynamic Electrical and Electronic Engineering student at OAU with a logic-driven approach, passionate about helping students master analytical concepts and build foundational engineering skills through tailored Mathematics and Physics mentoring.',
    course: 'Electrical and Electronic Engineering',
    university: 'Obafemi Awolowo University (OAU)',
    jambScore: 327,
    quote: 'True expertise is in applying knowledge, not just acquiring it.',
    portraitPath: '/assets/extracted/tutor-koleola.jpg',
    initials: 'OK',
    whatsappDisplay: '+234 814 600 8071',
    whatsappRaw: '2348146008071',
    whatsappRuleLabel: 'Engineering Maths, Physics & Advisory',
    whatsappIntroLine:
      'Hello Olubanjo Koleola (Community Manager & Financial Advisor), I would like support on Mathematics, Physics, or EdgeMax community resources.',
    whatsappChecklistLine:
      'Enquiry Focus: Analytical problem solving (Maths & Physics), community support, and student resource planning',
    bioLinkLabel: 'LinkedIn',
    bioLinkUrl: null,
    isBioPlaceholder: true,
  },
  {
    id: 'daviesking',
    tutorAccountId: 'EG-TUTOR-DAVIES',
    code: '04',
    name: 'Daviesking',
    roles: ['Secretary / RSVP', 'Academic Mentor'],
    subjects: ['Mathematics', 'Physics'],
    bio: 'Daviesking is a dedicated academic mentor and aspiring software engineer at Obafemi Awolowo University, passionate about helping students excel in Mathematics and Physics through effective preparation and consistent practice.',
    course: 'Software Engineering',
    university: 'Obafemi Awolowo University (OAU)',
    jambScore: 318,
    quote: "Winners don't quit. Quitters don't win.",
    portraitPath: '/assets/extracted/tutor-daviesking.jpg',
    initials: 'DK',
    whatsappDisplay: '+234 803 639 5539',
    whatsappRaw: '2348036395539',
    whatsappRuleLabel: 'Secretary / RSVP & Attendance',
    whatsappIntroLine:
      'Hello Daviesking (EdgeMax Secretary / RSVP & Academic Mentor), I am contacting the RSVP desk regarding cohort onboarding, timetable, and Mathematics / Physics.',
    whatsappChecklistLine:
      'Enquiry Focus: Cohort RSVP confirmation, class attendance schedule, and Maths / Physics mentorship',
    bioLinkLabel: 'TikTok',
    bioLinkUrl: 'https://www.tiktok.com/@daviesking001?_r=1&_t=ZS-9BNkoj6EwQG',
    isBioPlaceholder: false,
  },
  {
    id: 'developer-isaac',
    tutorAccountId: 'EG-TUTOR-ISAAC',
    code: '05',
    name: 'Developer Isaac',
    roles: ['Digital Manager', 'Academic Strategist'],
    subjects: ['Biology', 'Chemistry'],
    bio: 'A dedicated academic mentor and aspiring medical professional passionate about helping students excel in Biology and Chemistry through clear explanations, strategic preparation, and consistent practice.',
    course: 'Medicine and Surgery',
    university: 'University of Ilorin',
    jambScore: 330,
    quote: 'Every setback is a stepback for a greater comeback.',
    portraitPath: '/assets/extracted/tutor-isaac.jpg',
    initials: 'DI',
    whatsappDisplay: '+234 903 204 5891',
    whatsappRaw: '2349032045891',
    whatsappRuleLabel: 'Digital Strategy & Science Coaching',
    whatsappIntroLine:
      'Hello Developer Isaac (Digital Manager & Academic Strategist), I am reaching out regarding EdgeMax portal onboarding, study tools, or Biology & Chemistry strategy.',
    whatsappChecklistLine:
      'Enquiry Focus: Student portal access, digital study resources, and high-score Biology / Chemistry strategy',
    bioLinkLabel: 'LinkedIn',
    bioLinkUrl: 'https://www.linkedin.com/in/binuyoisaac/',
    isBioPlaceholder: false,
  },
];

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    day: 'MON',
    dayLabel: 'Monday',
    dayOfWeekWat: 1,
    slot1: { subject: 'English', tutorName: 'Maverick', tutorCode: '02' },
    slot2: { subject: 'Mathematics', tutorName: 'Daviesking', tutorCode: '04' },
  },
  {
    day: 'TUE',
    dayLabel: 'Tuesday',
    dayOfWeekWat: 2,
    slot1: { subject: 'Physics', tutorName: 'Daviesking', tutorCode: '04' },
    slot2: { subject: 'Biology', tutorName: 'Developer Isaac', tutorCode: '05' },
  },
  {
    day: 'WED',
    dayLabel: 'Wednesday',
    dayOfWeekWat: 3,
    slot1: { subject: 'Biology', tutorName: 'Marvy Jhoe', tutorCode: '01' },
    slot2: {
      subject: 'Mathematics',
      tutorName: 'Olubanjo Koleola',
      tutorCode: '03',
    },
  },
  {
    day: 'THU',
    dayLabel: 'Thursday',
    dayOfWeekWat: 4,
    slot1: {
      subject: 'Physics',
      tutorName: 'Olubanjo Koleola',
      tutorCode: '03',
    },
    slot2: { subject: 'Chemistry', tutorName: 'Marvy Jhoe', tutorCode: '01' },
  },
  {
    day: 'FRI',
    dayLabel: 'Friday',
    dayOfWeekWat: 5,
    slot1: { subject: 'English', tutorName: 'Maverick', tutorCode: '02' },
    slot2: {
      subject: 'Chemistry',
      tutorName: 'Developer Isaac',
      tutorCode: '05',
    },
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'free-tuition',
    category: 'Admission & Cost',
    question: 'Is the EdgeMax JAMB 2027 Tutorial really 100% free?',
    answer:
      'Yes. All live evening classes, 24/7 brainstorming sessions, mock exams, and study materials are completely free with no hidden charges. Register on this page to save your verified student account and download your Student ID card.',
  },
  {
    id: 'classes-started',
    category: 'Cohort Status',
    question: 'Have classes started, and can new students still register?',
    answer:
      'Yes! Classes started on 19 October 2026 for the JAMB 2027 cohort and run Monday to Friday. New students can register anytime using the registration form to save their verified profile and download their EdgeMax ID card immediately.',
  },
  {
    id: 'subjects-offered',
    category: 'Subjects Offered',
    question: 'Which subjects does EdgeMax offer for JAMB 2027?',
    answer:
      'EdgeMax offers strictly the five core JAMB subjects: English, Mathematics, Biology, Chemistry, and Physics. During registration, English is included alongside three subjects you choose from Mathematics, Biology, Chemistry, and Physics.',
  },
  {
    id: 'schedule-timing',
    category: 'Timetable',
    question: 'When do classes hold and how long is each session?',
    answer:
      'Classes hold online Monday to Friday every evening (WAT / UTC+1) in two focused 90-minute slots: Time Slot 1 from 8:00 PM to 9:30 PM, and Time Slot 2 from 9:30 PM to 11:00 PM.',
  },
  {
    id: 'id-card-download',
    category: 'Registration & ID',
    question: 'How does the instant Verified Profile & downloadable ID card work?',
    answer:
      'Before completing registration, you review and confirm all your details. Once confirmed, your account is saved directly to the EdgeMax database as a verified student—no manual upload needed—and you can download your PNG Student ID card with a scannable QR code anytime from your dashboard.',
  },
  {
    id: 'student-login-access',
    category: 'Registration & ID',
    question: 'How do I log back into my Verified Student Dashboard later?',
    answer:
      'Open the Student / Tutor Portal and enter any one of your Email Address, Phone Number, or EdgeMax ID (e.g. EDG-2027-XXXX)—no student password is required. Your verified subjects, profile details, and downloadable ID card load directly from the database.',
  },
  {
    id: 'immutable-profile',
    category: 'Registration & ID',
    question: 'Can I edit my profile details after registration?',
    answer:
      'No. Once you reverify your details and confirm registration, your verified EdgeMax profile is locked and cannot be edited. Always double-check your name, email, phone number, aspiring course, school, and 4 JAMB subjects on the reverification screen before confirming.',
  },
  {
    id: 'brainstorm-group',
    category: '24/7 Brainstorm',
    question: 'What happens in the 24/7 Brainstorm WhatsApp Group?',
    answer:
      'The 24/7 Brainstorm Group connects EdgeMax students round-the-clock to solve past questions, clarify difficult concepts in English, Mathematics, Biology, Chemistry, and Physics, and collaborate with tutors outside evening class hours.',
  },
  {
    id: 'missed-classes',
    category: 'Attendance & Notes',
    question: 'What if I join late or miss an evening class?',
    answer:
      'Summary notes, worked past-question PDFs, and topic handouts are shared after sessions so students who join mid-cohort or miss an evening slot can catch up quickly alongside peer support in the 24/7 Brainstorm Group.',
  },
  {
    id: 'mock-exams',
    category: 'Mock Exams',
    question: 'Are CBT mock tests and past-question drills included?',
    answer:
      'Yes. Tutors organize timed mock assessments and structured walkthroughs of real JAMB past questions to build speed, accuracy, and exam confidence before UTME 2027.',
  },
  {
    id: 'tutors-credentials',
    category: 'Tutors & Contact',
    question: 'How can I contact an individual tutor or the Secretary directly?',
    answer:
      'Every tutor card has a direct WhatsApp button with a custom prefilled message aligned with their specific role. For general RSVP and cohort enquiries, contact Secretary Daviesking on +234 803 639 5539 or edgemaxtutorial@gmail.com.',
  },
  {
    id: 'tutor-roles-explained',
    category: 'Tutors & Contact',
    question: 'Why does each EdgeMax tutor have a different role and WhatsApp prompt?',
    answer:
      'Each mentor leads a dedicated responsibility: Marvy Jhoe (Community & Digital), Maverick (Vocabulary Director & Outreach), Olubanjo Koleola (Community & Financial Advisory), Daviesking (Secretary / RSVP), and Developer Isaac (Digital Manager & Academic Strategy).',
  },
  {
    id: 'device-requirements',
    category: 'Online Access',
    question: 'What do I need to attend online classes comfortably?',
    answer:
      'A smartphone, tablet, or laptop with internet access, WhatsApp installed for notes and the 24/7 Brainstorm Group, plus a notebook and past-question pack for evening drills.',
  },
  {
    id: 'subject-countdowns',
    category: 'Timetable',
    question: 'How do the live subject countdowns work on this page?',
    answer:
      'Each subject card in Core Curriculum—and your Verified Student Dashboard—displays a live countdown in West Africa Time (WAT) showing the exact time left until the next session of that specific subject plus the assigned teacher.',
  },
  {
    id: 'qr-scanner-compatibility',
    category: 'Registration & ID',
    question: 'What scanner can read the QR code on my EdgeMax ID card?',
    answer:
      'Any standard smartphone camera (iPhone or Android), Google Lens, or QR reader app can scan the QR code on your ID card to display your name, EdgeMax ID, subjects, aspiring course, issue date/time, and motto.',
  },
  {
    id: 'burnout-approach',
    category: 'Study Method',
    question: 'What does "We don\'t burn out, We max out potentials" mean in practice?',
    answer:
      'Rather than overwhelming students with 8-hour marathons, EdgeMax runs focused 90-minute evening blocks Monday to Friday with targeted past-question practice, rest balance, and steady weekly accountability.',
  },
  {
    id: 'target-jamb-scores',
    category: 'Admission & Cost',
    question: 'Can beginners or repeat JAMB candidates join EdgeMax?',
    answer:
      'Yes. Both first-time JAMB 2027 candidates and re-sitting students aiming to jump into 300+ cut-off territory are welcome. Tutors scored between 312 and 330 and teach from foundational principles up to exam speed.',
  },
  {
    id: 'tutor-portal-access',
    category: 'Tutors & Contact',
    question: 'Do tutors also have verified EdgeMax portal accounts?',
    answer:
      'Yes. All 5 EdgeMax tutors have dedicated EG-* portal IDs linked to their phone numbers with hashed password authentication to manage their schedules and view enrolled cohort students.',
  },
  {
    id: 'university-cutoff-guidance',
    category: 'Tutors & Contact',
    question: 'Do tutors advise on university cut-off marks and course choices?',
    answer:
      'Yes. Because mentors are currently studying Medicine and Engineering at OAU, UI, and Unilorin, they guide students on competitive JAMB score targets, subject combinations, and post-UTME readiness.',
  },
  {
    id: 'parent-support',
    category: 'Admission & Cost',
    question: 'Can parents or guardians verify the program schedule and safety?',
    answer:
      'Yes. Parents can review the full Mon–Fri 8:00 PM – 11:00 PM WAT timetable right on this page and reach Secretary Daviesking (+234 803 639 5539) or edgemaxtutorial@gmail.com directly for verification.',
  },
];

export const ENQUIRY_TOPICS: EnquiryTopic[] = [
  {
    id: 'waitlist',
    label: 'Join Active Cohort / Waitlist',
    emailSubject: 'EdgeMax JAMB 2027 Tutorial — Cohort Admission Enquiry',
    introLine:
      'Hello EdgeMax Team, I would like to join the Free JAMB 2027 Tutorial cohort (started 19 October 2026).',
  },
  {
    id: 'schedule',
    label: 'Class Schedule & Venue',
    emailSubject: 'EdgeMax JAMB 2027 Tutorial — Timetable & Online Class Enquiry',
    introLine:
      'Hello EdgeMax Team, I have a question about the 8:00 PM – 11:00 PM online class timetable.',
  },
  {
    id: 'guidance',
    label: 'Subject & Course Guidance',
    emailSubject: 'EdgeMax JAMB 2027 Tutorial — Academic Guidance Enquiry',
    introLine:
      'Hello EdgeMax Team, I would like academic guidance on my JAMB 2027 subject combination and target score.',
  },
  {
    id: 'general',
    label: 'General Enquiry',
    emailSubject: 'EdgeMax JAMB 2027 Tutorial — General Enquiry',
    introLine:
      'Hello EdgeMax Team, I would like more information about the EdgeMax JAMB 2027 Tutorial.',
  },
];

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export interface ClassCountdownSnapshot {
  hasStarted: boolean;
  elapsedSinceStart: DurationParts;
  isInSession: boolean;
  currentClass: {
    day: DayCode;
    dayLabel: string;
    slotNumber: 1 | 2;
    slotTime: string;
    subject: SubjectName;
    tutorName: string;
    tutorCode: string;
    remaining: DurationParts;
  } | null;
  nextClass: {
    day: DayCode;
    dayLabel: string;
    slotNumber: 1 | 2;
    slotTime: string;
    subject: SubjectName;
    tutorName: string;
    tutorCode: string;
    startsIn: DurationParts;
  };
}

export interface SubjectNextClassInfo {
  subject: SubjectName;
  isLiveNow: boolean;
  day: DayCode;
  dayLabel: string;
  slotNumber: 1 | 2;
  slotTime: string;
  teacherName: string;
  teacherCode: string;
  countdown: DurationParts;
}

export function splitDurationMs(ms: number): DurationParts {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalMs: safeMs };
}

function getWatClockParts(nowDate: Date) {
  const nowMs = nowDate.getTime();
  const watOffsetMs = 60 * 60 * 1000;
  const watClock = new Date(nowMs + watOffsetMs);
  const watDay = watClock.getUTCDay();
  const watHour = watClock.getUTCHours();
  const watMinute = watClock.getUTCMinutes();
  const watSecond = watClock.getUTCSeconds();
  const watMs = watClock.getUTCMilliseconds();

  const msIntoDay =
    ((watHour * 60 + watMinute) * 60 + watSecond) * 1000 + watMs;

  return { nowMs, watClock, watDay, msIntoDay };
}

export function getClassStatusAndCountdowns(
  nowDate: Date = new Date()
): ClassCountdownSnapshot {
  const startMs = Date.parse(EDGEMAX_INFO.startDateIsoWat);
  const { nowMs, watDay, msIntoDay } = getWatClockParts(nowDate);
  const hasStarted = nowMs >= startMs;
  const elapsedSinceStart = splitDurationMs(nowMs - startMs);

  const slot1StartMs = 20 * 3600 * 1000;
  const slot1EndMs = (21 * 60 + 30) * 60 * 1000;
  const slot2StartMs = slot1EndMs;
  const slot2EndMs = 23 * 3600 * 1000;

  const todaySchedule = WEEKLY_SCHEDULE.find((s) => s.dayOfWeekWat === watDay);

  let isInSession = false;
  let currentClass: ClassCountdownSnapshot['currentClass'] = null;

  if (todaySchedule) {
    if (msIntoDay >= slot1StartMs && msIntoDay < slot1EndMs) {
      isInSession = true;
      currentClass = {
        day: todaySchedule.day,
        dayLabel: todaySchedule.dayLabel,
        slotNumber: 1,
        slotTime: EDGEMAX_INFO.slot1Time,
        subject: todaySchedule.slot1.subject,
        tutorName: todaySchedule.slot1.tutorName,
        tutorCode: todaySchedule.slot1.tutorCode,
        remaining: splitDurationMs(slot1EndMs - msIntoDay),
      };
    } else if (msIntoDay >= slot2StartMs && msIntoDay < slot2EndMs) {
      isInSession = true;
      currentClass = {
        day: todaySchedule.day,
        dayLabel: todaySchedule.dayLabel,
        slotNumber: 2,
        slotTime: EDGEMAX_INFO.slot2Time,
        subject: todaySchedule.slot2.subject,
        tutorName: todaySchedule.slot2.tutorName,
        tutorCode: todaySchedule.slot2.tutorCode,
        remaining: splitDurationMs(slot2EndMs - msIntoDay),
      };
    }
  }

  let nextClass: ClassCountdownSnapshot['nextClass'] | null = null;

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const candidateDow = (watDay + dayOffset) % 7;
    const sched = WEEKLY_SCHEDULE.find((s) => s.dayOfWeekWat === candidateDow);
    if (!sched) continue;

    const s1Diff = dayOffset * 86400 * 1000 + slot1StartMs - msIntoDay;
    if (s1Diff > 0) {
      nextClass = {
        day: sched.day,
        dayLabel: sched.dayLabel,
        slotNumber: 1,
        slotTime: EDGEMAX_INFO.slot1Time,
        subject: sched.slot1.subject,
        tutorName: sched.slot1.tutorName,
        tutorCode: sched.slot1.tutorCode,
        startsIn: splitDurationMs(s1Diff),
      };
      break;
    }

    const s2Diff = dayOffset * 86400 * 1000 + slot2StartMs - msIntoDay;
    if (s2Diff > 0) {
      nextClass = {
        day: sched.day,
        dayLabel: sched.dayLabel,
        slotNumber: 2,
        slotTime: EDGEMAX_INFO.slot2Time,
        subject: sched.slot2.subject,
        tutorName: sched.slot2.tutorName,
        tutorCode: sched.slot2.tutorCode,
        startsIn: splitDurationMs(s2Diff),
      };
      break;
    }
  }

  if (!nextClass) {
    const mon = WEEKLY_SCHEDULE[0];
    nextClass = {
      day: mon.day,
      dayLabel: mon.dayLabel,
      slotNumber: 1,
      slotTime: EDGEMAX_INFO.slot1Time,
      subject: mon.slot1.subject,
      tutorName: mon.slot1.tutorName,
      tutorCode: mon.slot1.tutorCode,
      startsIn: splitDurationMs(0),
    };
  }

  return {
    hasStarted,
    elapsedSinceStart,
    isInSession,
    currentClass,
    nextClass,
  };
}

export function getNextClassForSubject(
  subject: SubjectName,
  nowDate: Date = new Date()
): SubjectNextClassInfo {
  const { watDay, msIntoDay } = getWatClockParts(nowDate);
  const slot1StartMs = 20 * 3600 * 1000;
  const slot1EndMs = (21 * 60 + 30) * 60 * 1000;
  const slot2StartMs = slot1EndMs;
  const slot2EndMs = 23 * 3600 * 1000;

  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const candidateDow = (watDay + dayOffset) % 7;
    const sched = WEEKLY_SCHEDULE.find((s) => s.dayOfWeekWat === candidateDow);
    if (!sched) continue;

    if (sched.slot1.subject === subject) {
      if (dayOffset === 0 && msIntoDay >= slot1StartMs && msIntoDay < slot1EndMs) {
        return {
          subject,
          isLiveNow: true,
          day: sched.day,
          dayLabel: sched.dayLabel,
          slotNumber: 1,
          slotTime: EDGEMAX_INFO.slot1Time,
          teacherName: sched.slot1.tutorName,
          teacherCode: sched.slot1.tutorCode,
          countdown: splitDurationMs(slot1EndMs - msIntoDay),
        };
      }
      const diff = dayOffset * 86400 * 1000 + slot1StartMs - msIntoDay;
      if (diff > 0) {
        return {
          subject,
          isLiveNow: false,
          day: sched.day,
          dayLabel: sched.dayLabel,
          slotNumber: 1,
          slotTime: EDGEMAX_INFO.slot1Time,
          teacherName: sched.slot1.tutorName,
          teacherCode: sched.slot1.tutorCode,
          countdown: splitDurationMs(diff),
        };
      }
    }

    if (sched.slot2.subject === subject) {
      if (dayOffset === 0 && msIntoDay >= slot2StartMs && msIntoDay < slot2EndMs) {
        return {
          subject,
          isLiveNow: true,
          day: sched.day,
          dayLabel: sched.dayLabel,
          slotNumber: 2,
          slotTime: EDGEMAX_INFO.slot2Time,
          teacherName: sched.slot2.tutorName,
          teacherCode: sched.slot2.tutorCode,
          countdown: splitDurationMs(slot2EndMs - msIntoDay),
        };
      }
      const diff = dayOffset * 86400 * 1000 + slot2StartMs - msIntoDay;
      if (diff > 0) {
        return {
          subject,
          isLiveNow: false,
          day: sched.day,
          dayLabel: sched.dayLabel,
          slotNumber: 2,
          slotTime: EDGEMAX_INFO.slot2Time,
          teacherName: sched.slot2.tutorName,
          teacherCode: sched.slot2.tutorCode,
          countdown: splitDurationMs(diff),
        };
      }
    }
  }

  const firstRow =
    WEEKLY_SCHEDULE.find(
      (s) => s.slot1.subject === subject || s.slot2.subject === subject
    ) ?? WEEKLY_SCHEDULE[0];
  const isSlot1 = firstRow.slot1.subject === subject;
  const chosenSlot = isSlot1 ? firstRow.slot1 : firstRow.slot2;

  return {
    subject,
    isLiveNow: false,
    day: firstRow.day,
    dayLabel: firstRow.dayLabel,
    slotNumber: isSlot1 ? 1 : 2,
    slotTime: isSlot1 ? EDGEMAX_INFO.slot1Time : EDGEMAX_INFO.slot2Time,
    teacherName: chosenSlot.tutorName,
    teacherCode: chosenSlot.tutorCode,
    countdown: splitDurationMs(0),
  };
}

export function formatPad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function detectJoinSource(
  search: string = '',
  referrer: string = ''
): string | null {
  try {
    const params = new URLSearchParams(search);
    const paramSource =
      params.get('from') ||
      params.get('source') ||
      params.get('ref') ||
      params.get('utm_source');
    if (paramSource && paramSource.trim()) {
      return paramSource.trim();
    }
  } catch {
    // ignore malformed search string
  }

  if (referrer && referrer.trim()) {
    const lower = referrer.toLowerCase();
    if (lower.includes('tiktok')) return 'TikTok';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower.includes('whatsapp') || lower.includes('wa.me')) return 'WhatsApp';
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('facebook') || lower.includes('fb.')) return 'Facebook';
    if (lower.includes('twitter') || lower.includes('x.com')) return 'X / Twitter';
    if (lower.includes('google')) return 'Google Search';
  }

  return null;
}

export function filterTutorsBySubject(
  tutors: TutorProfile[],
  subject: SubjectName | 'All'
): TutorProfile[] {
  if (subject === 'All') {
    return tutors;
  }
  return tutors.filter((tutor) => tutor.subjects.includes(subject));
}

export function filterScheduleByDay(
  schedule: DaySchedule[],
  day: DayCode | 'ALL'
): DaySchedule[] {
  if (day === 'ALL') {
    return schedule;
  }
  return schedule.filter((item) => item.day === day);
}

export function buildTutorWhatsAppMessage(
  tutor: TutorProfile,
  referralChannel?: string | null
): string {
  const joinedSuffix = referralChannel?.trim()
    ? ` via ${referralChannel.trim()}`
    : '';
  const lines = [
    tutor.whatsappIntroLine,
    `Joined from: Tutor Profile (${tutor.name})${joinedSuffix}`,
    `Tutor Role: ${tutor.roles.join(' & ')}`,
    `Subjects Taught: ${tutor.subjects.join(', ')}`,
    tutor.whatsappChecklistLine,
  ];
  return lines.join('\n');
}

export function buildTutorWhatsAppUrl(
  tutor: TutorProfile,
  referralChannel?: string | null
): string {
  const message = buildTutorWhatsAppMessage(tutor, referralChannel);
  return buildWhatsAppEnquiryUrl(tutor.whatsappRaw, message);
}

export interface PrefillEnquiryParams {
  studentName: string;
  topicId: EnquiryTopicId;
  selectedSubjects: SubjectName[];
  customNote?: string;
  tutorName?: string;
  sourceSection?: string;
  referralChannel?: string | null;
}

export function buildPrefilledEnquiryText({
  studentName,
  topicId,
  selectedSubjects,
  customNote,
  tutorName,
  sourceSection,
  referralChannel,
}: PrefillEnquiryParams): string {
  const topic =
    ENQUIRY_TOPICS.find((t) => t.id === topicId) ?? ENQUIRY_TOPICS[0];
  const cleanName = studentName.trim();
  const subjectsLine =
    selectedSubjects.length > 0
      ? selectedSubjects.join(', ')
      : 'Not specified yet';

  const lines: string[] = [topic.introLine];

  const sourceParts = [
    sourceSection?.trim(),
    referralChannel?.trim() ? `via ${referralChannel.trim()}` : null,
  ].filter(Boolean);

  if (sourceParts.length > 0) {
    lines.push(`Joined from: ${sourceParts.join(' ')}`);
  }
  if (cleanName) {
    lines.push(`Name: ${cleanName}`);
  }
  lines.push(`Target Subjects: ${subjectsLine}`);

  if (tutorName && tutorName.trim()) {
    lines.push(`Tutor Focus: ${tutorName.trim()}`);
  }

  if (customNote && customNote.trim()) {
    lines.push(`Message: ${customNote.trim()}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppEnquiryUrl(
  phoneRaw: string,
  message: string
): string {
  const sanitizedPhone = phoneRaw.replace(/\D/g, '');
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoUrl(
  email: string,
  subject: string,
  body: string
): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function validateEnquiryForm(input: {
  studentName: string;
  selectedSubjects: SubjectName[];
}): { valid: boolean; error: string | null } {
  if (!input.studentName.trim()) {
    return {
      valid: false,
      error: 'Please enter your name so our tutors can address you properly.',
    };
  }
  if (input.selectedSubjects.length === 0) {
    return {
      valid: false,
      error: 'Select at least one JAMB subject to tailor your prefilled message.',
    };
  }
  return { valid: true, error: null };
}

export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  // Local Nigerian 11-digit number e.g. 08036395539 -> 2348036395539
  if (digits.length === 11 && digits.startsWith('0')) {
    return `234${digits.slice(1)}`;
  }
  // Nigerian 10-digit number without leading zero e.g. 8036395539 -> 2348036395539
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return `234${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(rawOrNormalized: string): string {
  const norm = normalizePhoneNumber(rawOrNormalized);
  if (norm.startsWith('234') && norm.length === 13) {
    return `+234 ${norm.slice(3, 6)} ${norm.slice(6, 9)} ${norm.slice(9)}`;
  }
  const trimmed = rawOrNormalized.trim();
  if (trimmed.startsWith('+')) return trimmed;
  return norm ? `+${norm}` : trimmed;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export interface RegistrationInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  aspiringCourse: string;
  otherSubjects: ElectiveSubject[]; // 3 subjects alongside English
  aspiringSchool: string;
  otherDetails?: string;
  sourceSection?: string;
  referralChannel?: string | null;
}

export interface StudentIdCardData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  aspiringCourse: string;
  aspiringSchool: string;
  subjects: SubjectName[];
  dateIssued: string;
  timeIssued: string;
  motto: string;
  verified: boolean;
  otherDetails?: string;
  sourceSection?: string;
  referralChannel?: string | null;
}

export function generateRegistrationId(randomSeed?: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const base =
    typeof randomSeed === 'number'
      ? Math.abs(Math.floor(randomSeed))
      : Math.floor(Math.random() * 1679616) + Date.now();
  let n = base;
  for (let i = 0; i < 4; i++) {
    suffix = chars[n % chars.length] + suffix;
    n = Math.floor(n / chars.length) + (i + 7) * 13;
  }
  return `EDG-2027-${suffix}`;
}

export function validateRegistrationForm(
  input: RegistrationInput
): { valid: boolean; error: string | null } {
  if (input.fullName.trim().length < 2) {
    return { valid: false, error: 'Please enter your full name.' };
  }
  if (!isValidEmail(input.email)) {
    return {
      valid: false,
      error: 'Please enter a valid email address for your EdgeMax profile.',
    };
  }
  const normalizedPhone = normalizePhoneNumber(input.phoneNumber);
  if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    return {
      valid: false,
      error: 'Please enter a valid WhatsApp / phone number (e.g. 0803 639 5539 or +234...).',
    };
  }
  if (input.aspiringCourse.trim().length < 2) {
    return { valid: false, error: 'Please enter your aspiring course.' };
  }
  const uniqueElectives = Array.from(new Set(input.otherSubjects)).filter((s) =>
    REGISTRATION_ELECTIVES.includes(s)
  );
  if (uniqueElectives.length !== 3) {
    return {
      valid: false,
      error: `English is included by default. Please choose 3 other subjects from Mathematics, Biology, Chemistry, and Physics (${uniqueElectives.length} selected).`,
    };
  }
  if (input.aspiringSchool.trim().length < 2) {
    return { valid: false, error: 'Please enter your aspiring school / university.' };
  }
  return { valid: true, error: null };
}

export function formatIssuedTimestampWat(date: Date = new Date()): {
  dateIssued: string;
  timeIssued: string;
} {
  const watOffsetMs = 60 * 60 * 1000;
  const watClock = new Date(date.getTime() + watOffsetMs);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = formatPad2(watClock.getUTCDate());
  const month = months[watClock.getUTCMonth()];
  const year = watClock.getUTCFullYear();

  const hours24 = watClock.getUTCHours();
  const minutes = formatPad2(watClock.getUTCMinutes());
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return {
    dateIssued: `${day} ${month} ${year}`,
    timeIssued: `${formatPad2(hours12)}:${minutes} ${period} WAT`,
  };
}

export function studentRecordToCardData(student: StudentRecord): StudentIdCardData {
  return {
    id: student.id,
    fullName: student.fullName,
    email: student.email,
    phoneNumber: student.phoneNumber,
    aspiringCourse: student.aspiringCourse,
    aspiringSchool: student.aspiringSchool,
    subjects: student.subjects,
    dateIssued: student.dateIssued,
    timeIssued: student.timeIssued,
    motto: EDGEMAX_INFO.tagline,
    verified: student.verified,
    otherDetails: student.otherDetails,
    sourceSection: student.sourceSection,
    referralChannel: student.referralChannel,
  };
}

export function buildStudentIdQrPayload(details: StudentIdCardData): string {
  const lines = [
    'EDGEMAX JAMB 2027 TUTORIAL — OFFICIAL STUDENT ID',
    `Motto: ${details.motto}`,
    `Verification: Verified Profile (${details.id})`,
    `Full Name: ${details.fullName}`,
    `Email: ${details.email}`,
    `Phone: ${details.phoneNumber}`,
    `Aspiring Course: ${details.aspiringCourse}`,
    `Aspiring School: ${details.aspiringSchool}`,
    `Subjects (4): ${details.subjects.join(', ')}`,
    `Date Issued: ${details.dateIssued}`,
    `Time Issued: ${details.timeIssued}`,
  ];
  return lines.join('\n');
}

export function buildRegistrationMessage(
  input: RegistrationInput,
  registrationId: string
): string {
  const allFourSubjects = ['English', ...input.otherSubjects];
  const baseSource =
    input.sourceSection?.trim() || 'EdgeMax Website — Registration Form';
  const source = input.referralChannel?.trim()
    ? `${baseSource} (via ${input.referralChannel.trim()})`
    : baseSource;

  const lines = [
    'EDGEMAX JAMB 2027 TUTORIAL — VERIFIED STUDENT REGISTRATION',
    `Registration ID: ${registrationId}`,
    `Joined from: ${source}`,
    `Full Name: ${input.fullName.trim()}`,
    `Email: ${input.email.trim()}`,
    `Phone: ${formatPhoneDisplay(input.phoneNumber)}`,
    `Aspiring Course: ${input.aspiringCourse.trim()}`,
    `Aspiring School: ${input.aspiringSchool.trim()}`,
    `JAMB Subjects (4): ${allFourSubjects.join(', ')}`,
  ];

  if (input.otherDetails && input.otherDetails.trim()) {
    lines.push(`Other Details: ${input.otherDetails.trim()}`);
  }

  return lines.join('\n');
}

export function buildRegistrationWhatsAppUrl(
  input: RegistrationInput,
  registrationId: string
): string {
  const msg = buildRegistrationMessage(input, registrationId);
  return buildWhatsAppEnquiryUrl(EDGEMAX_INFO.phoneRaw, msg);
}
