import { describe, expect, it } from 'vitest';
import { JOBS } from '../data/jobs.js';
import { advanceApplication, createApplication, interviewSlot, nextUpdateAt, stepIndex, validateApplication, validateResume, withdrawApplication } from './applications.js';

const MIN = 60_000;
const job = JOBS[0];
const form = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210', experience: '1–2 years', portfolio: '', coverLetter: '', consent: true };
const resume = { name: 'cv.pdf', size: 1000, type: 'application/pdf' };
const make = (random) => createApplication({ job, form, resume, now: 0, random });

describe('application tracker', () => {
  it('moves a successful application through every step to an offer', () => {
    const app = make(0.1);
    expect(app.status).toBe('applied');
    expect(advanceApplication(app, 30_000)).toBe(app); // nothing changes yet
    expect(advanceApplication(app, 1 * MIN).status).toBe('reviewing');
    const interview = advanceApplication(app, 3 * MIN);
    expect(interview.status).toBe('interview');
    expect(interview.history.at(-1).interviewAt).toBeGreaterThan(3 * MIN);
    const offer = advanceApplication(app, 10 * MIN);
    expect(offer.history.map((h) => h.status)).toEqual(['applied', 'reviewing', 'interview', 'offer']);
    expect(stepIndex(offer)).toBe(3);
    expect(nextUpdateAt(offer)).toBeNull();
  });

  it('skips the interview when the candidate is not selected', () => {
    const app = make(0.9);
    const done = advanceApplication(app, 10 * MIN);
    expect(done.history.map((h) => h.status)).toEqual(['applied', 'reviewing', 'rejected']);
    expect(stepIndex(done)).toBe(1);
  });

  it('can be withdrawn and then never changes', () => {
    const withdrawn = withdrawApplication(make(0.1), 30_000);
    expect(withdrawn.status).toBe('withdrawn');
    expect(advanceApplication(withdrawn, 60 * MIN)).toBe(withdrawn);
  });

  it('schedules interviews on a weekday at 11:00', () => {
    const friday = new Date(2026, 10, 13, 15, 0).getTime();
    const slot = new Date(interviewSlot(friday));
    expect(slot.getDay()).toBe(2); // Tuesday
    expect(slot.getHours()).toBe(11);
  });
});

describe('application form validation', () => {
  it('accepts a complete form', () => {
    expect(validateApplication(form, { name: 'cv.pdf', size: 2000, type: 'application/pdf' })).toEqual({});
  });

  it('reports every problem', () => {
    const errors = validateApplication({ ...form, name: 'A', email: 'nope', phone: '123', experience: '', portfolio: 'site', consent: false }, null);
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'experience', 'name', 'phone', 'portfolio', 'resume']);
  });

  it('checks the resume type and size', () => {
    expect(validateResume({ name: 'photo.png', size: 100, type: 'image/png' })).toMatch(/PDF/);
    expect(validateResume({ name: 'cv.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' })).toMatch(/too large/);
    expect(validateResume({ name: 'cv.docx', size: 100, type: '' })).toBeNull();
  });
});
