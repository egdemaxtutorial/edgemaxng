import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EDGEMAX_INFO,
  FAQS,
  REGISTRATION_ELECTIVES,
  TUTORS,
  WEEKLY_SCHEDULE,
  filterTutorsBySubject,
  filterScheduleByDay,
  buildPrefilledEnquiryText,
  buildWhatsAppEnquiryUrl,
  buildMailtoUrl,
  validateEnquiryForm,
  getClassStatusAndCountdowns,
  getNextClassForSubject,
  generateRegistrationId,
  validateRegistrationForm,
  buildRegistrationMessage,
  buildRegistrationWhatsAppUrl,
  buildTutorWhatsAppMessage,
  buildTutorWhatsAppUrl,
  formatIssuedTimestampWat,
  buildStudentIdQrPayload,
  detectJoinSource,
  normalizePhoneNumber,
  formatPhoneDisplay,
  isValidEmail,
} from './tutorialData';

test('only the 5 offered JAMB subjects exist in electives alongside English', () => {
  assert.deepEqual(REGISTRATION_ELECTIVES, [
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
  ]);
  assert.equal(EDGEMAX_INFO.programYear, '2027');
  assert.ok(FAQS.length >= 20);
});

test('filterTutorsBySubject returns all tutors when All is selected', () => {
  const result = filterTutorsBySubject(TUTORS, 'All');
  assert.equal(result.length, 5);
});

test('filterTutorsBySubject filters accurately by subject', () => {
  const mathTutors = filterTutorsBySubject(TUTORS, 'Mathematics');
  assert.deepEqual(
    mathTutors.map((t) => t.name),
    ['Maverick', 'Olubanjo Koleola', 'Daviesking']
  );

  const englishTutors = filterTutorsBySubject(TUTORS, 'English');
  assert.deepEqual(
    englishTutors.map((t) => t.name),
    ['Maverick']
  );
});

test('tutor account IDs, WhatsApp numbers, bio links, and unique role-based messages match requirements', () => {
  const byId = Object.fromEntries(TUTORS.map((t) => [t.id, t]));
  assert.equal(byId['marvy-jhoe'].tutorAccountId, 'EG-MARVY');
  assert.equal(byId['olubanjo-koleola'].tutorAccountId, 'EG-TUTOR-KOLE');
  assert.equal(byId['developer-isaac'].tutorAccountId, 'EG-TUTOR-ISAAC');
  assert.equal(byId['daviesking'].tutorAccountId, 'EG-TUTOR-DAVIES');
  assert.equal(byId['maverick'].tutorAccountId, 'EG-TUTOR-MAVERICK');

  assert.equal(byId['marvy-jhoe'].whatsappRaw, '2349157611607');
  assert.equal(byId['daviesking'].whatsappRaw, '2348036395539');
  assert.equal(byId['olubanjo-koleola'].whatsappRaw, '2348146008071');
  assert.equal(byId['maverick'].whatsappRaw, '2349131134004');
  assert.equal(byId['developer-isaac'].whatsappRaw, '2349032045891');

  // Real links only for Daviesking (TikTok) and Developer Isaac (LinkedIn); others null (no fake URLs)
  assert.equal(
    byId['daviesking'].bioLinkUrl,
    'https://www.tiktok.com/@daviesking001?_r=1&_t=ZS-9BNkoj6EwQG'
  );
  assert.equal(
    byId['developer-isaac'].bioLinkUrl,
    'https://www.linkedin.com/in/binuyoisaac/'
  );
  assert.equal(byId['marvy-jhoe'].bioLinkUrl, null);
  assert.equal(byId['maverick'].bioLinkUrl, null);
  assert.equal(byId['olubanjo-koleola'].bioLinkUrl, null);

  // All 5 tutors have distinct prefilled WhatsApp messages
  const messages = TUTORS.map((tutor) =>
    buildTutorWhatsAppMessage(tutor, 'TikTok')
  );
  const uniqueMessages = new Set(messages);
  assert.equal(uniqueMessages.size, 5);
  assert.match(messages[1], /Vocabulary Director/);
  assert.match(messages[2], /Financial Advisor/);
  assert.match(messages[3], /Secretary \/ RSVP/);
  assert.match(messages[4], /Academic Strategist/);
  assert.ok(
    buildTutorWhatsAppUrl(byId['maverick'], 'TikTok').startsWith(
      'https://wa.me/2349131134004?text='
    )
  );
});

test('filterScheduleByDay returns full 5-day week or single day', () => {
  assert.equal(filterScheduleByDay(WEEKLY_SCHEDULE, 'ALL').length, 5);
  const wed = filterScheduleByDay(WEEKLY_SCHEDULE, 'WED');
  assert.equal(wed.length, 1);
  assert.equal(wed[0].slot1.subject, 'Biology');
  assert.equal(wed[0].slot1.tutorName, 'Marvy Jhoe');
  assert.equal(wed[0].slot2.subject, 'Mathematics');
  assert.equal(wed[0].slot2.tutorName, 'Olubanjo Koleola');
});

test('getClassStatusAndCountdowns detects active Monday Slot 1 and elapsed time since Oct 19', () => {
  const now = new Date('2026-11-16T20:30:00+01:00');
  const snap = getClassStatusAndCountdowns(now);

  assert.equal(snap.hasStarted, true);
  assert.equal(snap.elapsedSinceStart.days, 28);
  assert.equal(snap.isInSession, true);
  assert.equal(snap.currentClass?.subject, 'English');
  assert.equal(snap.currentClass?.tutorName, 'Maverick');
  assert.equal(snap.currentClass?.remaining.hours, 1);
  assert.equal(snap.currentClass?.remaining.minutes, 0);

  assert.equal(snap.nextClass.subject, 'Mathematics');
  assert.equal(snap.nextClass.tutorName, 'Daviesking');
  assert.equal(snap.nextClass.startsIn.hours, 1);
});

test('getNextClassForSubject computes per-subject countdown and teacher accurately', () => {
  const monActive = new Date('2026-11-16T20:30:00+01:00');
  const eng = getNextClassForSubject('English', monActive);
  assert.equal(eng.isLiveNow, true);
  assert.equal(eng.teacherName, 'Maverick');
  assert.equal(eng.countdown.hours, 1);
  assert.equal(eng.countdown.minutes, 0);

  const math = getNextClassForSubject('Mathematics', monActive);
  assert.equal(math.isLiveNow, false);
  assert.equal(math.day, 'MON');
  assert.equal(math.teacherName, 'Daviesking');
  assert.equal(math.countdown.hours, 1);

  const chem = getNextClassForSubject('Chemistry', monActive);
  assert.equal(chem.isLiveNow, false);
  assert.equal(chem.day, 'THU');
  assert.equal(chem.teacherName, 'Marvy Jhoe');
});

test('getClassStatusAndCountdowns wraps weekend to Monday Slot 1', () => {
  const sat = new Date('2026-11-14T12:00:00+01:00');
  const snap = getClassStatusAndCountdowns(sat);

  assert.equal(snap.isInSession, false);
  assert.equal(snap.currentClass, null);
  assert.equal(snap.nextClass.day, 'MON');
  assert.equal(snap.nextClass.subject, 'English');
  assert.equal(snap.nextClass.startsIn.days, 2);
  assert.equal(snap.nextClass.startsIn.hours, 8);
});

test('detectJoinSource reads query params and social referrers', () => {
  assert.equal(detectJoinSource('?from=TikTok', ''), 'TikTok');
  assert.equal(detectJoinSource('?utm_source=WhatsAppStatus', ''), 'WhatsAppStatus');
  assert.equal(detectJoinSource('', 'https://www.tiktok.com/@daviesking001'), 'TikTok');
  assert.equal(detectJoinSource('', ''), null);
});

test('phone normalization and email validation work across Nigerian & international formats', () => {
  assert.equal(normalizePhoneNumber('0803 639 5539'), '2348036395539');
  assert.equal(normalizePhoneNumber('+234 803 639 5539'), '2348036395539');
  assert.equal(normalizePhoneNumber('2348036395539'), '2348036395539');
  assert.equal(formatPhoneDisplay('08036395539'), '+234 803 639 5539');
  assert.equal(isValidEmail('student@example.com'), true);
  assert.equal(isValidEmail('bad-email'), false);
});

test('buildPrefilledEnquiryText includes student name, source, referral channel, and subjects', () => {
  const text = buildPrefilledEnquiryText({
    studentName: 'Amina Yusuf',
    topicId: 'waitlist',
    selectedSubjects: ['Biology', 'Chemistry', 'Physics'],
    customNote: 'Preparing for Medicine at UI',
    sourceSection: 'Hero Section',
    referralChannel: 'TikTok',
  });
  assert.match(text, /JAMB 2027/);
  assert.match(text, /Joined from: Hero Section via TikTok/);
  assert.match(text, /Amina Yusuf/);
  assert.match(text, /Biology, Chemistry, Physics/);
  assert.match(text, /Preparing for Medicine at UI/);
});

test('buildWhatsAppEnquiryUrl encodes phone and message safely', () => {
  const url = buildWhatsAppEnquiryUrl(
    EDGEMAX_INFO.phoneDisplay,
    'Hello EdgeMax & Tutors!'
  );
  assert.equal(
    url,
    'https://wa.me/2348036395539?text=Hello%20EdgeMax%20%26%20Tutors!'
  );
});

test('buildMailtoUrl encodes subject and body parameters', () => {
  const url = buildMailtoUrl(
    EDGEMAX_INFO.email,
    'Waitlist Enquiry',
    'Hi EdgeMax,\nCount me in.'
  );
  assert.ok(url.startsWith('mailto:edgemaxtutorial@gmail.com?subject='));
  assert.match(url, /subject=Waitlist%20Enquiry/);
  assert.match(url, /body=Hi%20EdgeMax/);
});

test('validateEnquiryForm requires non-empty name and at least one subject', () => {
  assert.equal(
    validateEnquiryForm({ studentName: '   ', selectedSubjects: ['Physics'] })
      .valid,
    false
  );
  assert.equal(
    validateEnquiryForm({ studentName: 'Tunde', selectedSubjects: [] }).valid,
    false
  );
  assert.equal(
    validateEnquiryForm({
      studentName: 'Tunde',
      selectedSubjects: ['Mathematics', 'English'],
    }).valid,
    true
  );
});

test('Student ID card QR payload uses JAMB 2027 ID and includes verified fields', () => {
  const id1 = generateRegistrationId(123456);
  assert.match(id1, /^EDG-2027-[A-Z2-9]{4}$/);

  const { dateIssued, timeIssued } = formatIssuedTimestampWat(
    new Date('2026-11-13T16:30:00+01:00')
  );
  assert.equal(dateIssued, '13 Nov 2026');
  assert.equal(timeIssued, '04:30 PM WAT');

  const qrText = buildStudentIdQrPayload({
    id: id1,
    fullName: 'Tola Adeyemi',
    email: 'tola@example.com',
    phoneNumber: '+234 803 111 2233',
    aspiringCourse: 'Medicine and Surgery',
    aspiringSchool: 'OAU',
    subjects: ['English', 'Biology', 'Chemistry', 'Physics'],
    dateIssued,
    timeIssued,
    motto: EDGEMAX_INFO.tagline,
    verified: true,
    sourceSection: 'EdgeMax Registration Form',
    referralChannel: 'TikTok',
  });
  assert.match(qrText, /JAMB 2027/);
  assert.match(qrText, /We don't burn out, We max out potentials\./);
  assert.match(qrText, /Tola Adeyemi/);
  assert.match(qrText, /tola@example\.com/);
  assert.match(qrText, /\+234 803 111 2233/);
  assert.match(qrText, /Medicine and Surgery/);
  assert.match(qrText, /English, Biology, Chemistry, Physics/);
  assert.match(qrText, /Verified Profile/);
});

test('registration validation enforces email, phone, and 3 electives cleanly without auto-picked text', () => {
  const id1 = generateRegistrationId(123456);
  const id2 = generateRegistrationId(789012);
  assert.notEqual(id1, id2);

  assert.equal(
    validateRegistrationForm({
      fullName: 'Tola Adeyemi',
      email: 'invalid-email',
      phoneNumber: '08031112233',
      aspiringCourse: 'Medicine',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'OAU',
    }).valid,
    false
  );

  assert.equal(
    validateRegistrationForm({
      fullName: 'Tola Adeyemi',
      email: 'tola@example.com',
      phoneNumber: '123',
      aspiringCourse: 'Medicine',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'OAU',
    }).valid,
    false
  );

  assert.equal(
    validateRegistrationForm({
      fullName: 'Tola Adeyemi',
      email: 'tola@example.com',
      phoneNumber: '08031112233',
      aspiringCourse: 'Medicine',
      otherSubjects: ['Biology', 'Chemistry'],
      aspiringSchool: 'OAU',
    }).valid,
    false
  );

  assert.equal(
    validateRegistrationForm({
      fullName: 'Tola Adeyemi',
      email: 'tola@example.com',
      phoneNumber: '08031112233',
      aspiringCourse: 'Medicine',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'OAU',
    }).valid,
    true
  );

  const msg = buildRegistrationMessage(
    {
      fullName: 'Tola Adeyemi',
      email: 'tola@example.com',
      phoneNumber: '08031112233',
      aspiringCourse: 'Medicine and Surgery',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'OAU',
      otherDetails: 'Need past questions',
      sourceSection: 'EdgeMax Registration Form',
      referralChannel: 'LinkedIn',
    },
    id1
  );
  assert.match(msg, new RegExp(id1));
  assert.match(msg, /JAMB Subjects \(4\): English, Biology, Chemistry, Physics/);
  assert.doesNotMatch(msg, /auto[- ]?picked/i);

  const waUrl = buildRegistrationWhatsAppUrl(
    {
      fullName: 'Tola Adeyemi',
      email: 'tola@example.com',
      phoneNumber: '08031112233',
      aspiringCourse: 'Medicine and Surgery',
      otherSubjects: ['Biology', 'Chemistry', 'Physics'],
      aspiringSchool: 'OAU',
    },
    id1
  );
  assert.ok(waUrl.startsWith('https://wa.me/2348036395539?text='));
});
