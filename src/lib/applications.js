// Application status tracker.
// There is no real employer in this demo, so each application moves forward on a timer:
// Applied -> In review -> Interview -> Offer or Not selected. The outcome is fixed when you apply.

export const STATUS_STEPS = [
  { id: 'applied', label: 'Applied', description: 'Your application was sent to the employer.' },
  { id: 'reviewing', label: 'In review', description: 'The hiring team is reading your resume.' },
  { id: 'interview', label: 'Interview', description: 'You have been invited to an interview.' },
  { id: 'offer', label: 'Offer', description: 'Congratulations! You received an offer.' },
];

export const STATUS_LABELS = {
  applied: 'Applied',
  reviewing: 'In review',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};

export const FINAL_STATUSES = ['offer', 'rejected', 'withdrawn'];

// Demo speed: minutes after applying when each update arrives
export const DEMO_DELAYS = { reviewing: 1, interview: 3, decision: 6 };
const MINUTE = 60_000;

/** Creates a new application. `random` decides the final outcome (offer or not). */
export function createApplication({ job, form, resume, now = Date.now(), random = Math.random() }) {
  return {
    id: `app_${now.toString(36)}_${Math.floor(random * 1e6).toString(36)}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    companyId: job.companyId,
    location: job.location,
    workplace: job.workplace,
    applicant: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
    experienceYears: form.experience,
    portfolio: form.portfolio.trim(),
    coverLetter: form.coverLetter.trim(),
    resume, // { name, size, type } – the file itself never leaves the browser
    appliedAt: now,
    willGetOffer: random < 0.55,
    status: 'applied',
    history: [{ status: 'applied', at: now }],
  };
}

/** Moves an application forward if enough time has passed. Returns the same object if nothing changed. */
export function advanceApplication(app, now = Date.now()) {
  if (FINAL_STATUSES.includes(app.status)) return app;
  const plan = [
    { status: 'reviewing', at: app.appliedAt + DEMO_DELAYS.reviewing * MINUTE },
    { status: 'interview', at: app.appliedAt + DEMO_DELAYS.interview * MINUTE, onlyIfOffer: true },
    { status: app.willGetOffer ? 'offer' : 'rejected', at: app.appliedAt + DEMO_DELAYS.decision * MINUTE },
  ];
  let next = app;
  for (const step of plan) {
    if (step.onlyIfOffer && !app.willGetOffer) continue;
    if (now < step.at) break;
    if (next.history.some((h) => h.status === step.status)) continue;
    const entry = { status: step.status, at: step.at };
    if (step.status === 'interview') entry.interviewAt = interviewSlot(step.at);
    next = { ...next, status: step.status, history: [...next.history, entry] };
  }
  return next;
}

/** A plausible interview time: two working days later at 11:00. */
export function interviewSlot(from) {
  const date = new Date(from);
  let added = 0;
  while (added < 2) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added++;
  }
  date.setHours(11, 0, 0, 0);
  return date.getTime();
}

export function withdrawApplication(app, now = Date.now()) {
  if (FINAL_STATUSES.includes(app.status)) return app;
  return { ...app, status: 'withdrawn', history: [...app.history, { status: 'withdrawn', at: now }] };
}

/** Index of the step reached in STATUS_STEPS (rejected/withdrawn stop where they were). */
export function stepIndex(app) {
  const reached = app.history.map((h) => STATUS_STEPS.findIndex((s) => s.id === h.status)).filter((i) => i >= 0);
  return Math.max(0, ...reached);
}

/** When the next update is expected, or null if the application is finished. */
export function nextUpdateAt(app) {
  if (FINAL_STATUSES.includes(app.status)) return null;
  if (app.status === 'applied') return app.appliedAt + DEMO_DELAYS.reviewing * MINUTE;
  if (app.status === 'reviewing' && app.willGetOffer) return app.appliedAt + DEMO_DELAYS.interview * MINUTE;
  return app.appliedAt + DEMO_DELAYS.decision * MINUTE;
}

/* ---------------- application form validation ---------------- */

export const MAX_RESUME_MB = 5;
export const RESUME_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

export function validateResume(file) {
  if (!file) return 'Please attach your resume.';
  const extension = file.name.split('.').pop()?.toLowerCase();
  const okType = file.type in RESUME_TYPES || ['pdf', 'doc', 'docx'].includes(extension);
  if (!okType) return 'Upload a PDF, DOC or DOCX file.';
  if (file.size > MAX_RESUME_MB * 1024 * 1024) return `The file is too large. The limit is ${MAX_RESUME_MB} MB.`;
  if (file.size === 0) return 'This file is empty.';
  return null;
}

export function validateApplication(form, resumeFile) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  const digits = form.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Enter a valid phone number (10 digits).';
  if (form.experience === '') errors.experience = 'Choose your years of experience.';
  if (form.portfolio.trim() && !/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(form.portfolio.trim())) {
    errors.portfolio = 'Enter a full link starting with https://';
  }
  if (form.coverLetter.length > 1500) errors.coverLetter = 'Keep the cover letter under 1,500 characters.';
  if (!form.consent) errors.consent = 'Please confirm to continue.';
  const resumeError = validateResume(resumeFile);
  if (resumeError) errors.resume = resumeError;
  return errors;
}
