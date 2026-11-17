import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import { DEMO_DELAYS, MAX_RESUME_MB, validateApplication, validateResume } from '../lib/applications.js';
import { CompanyLogo } from './JobBits.jsx';
import { CheckIcon, CloseIcon, FileIcon, UploadIcon } from './Icons.jsx';

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '5–8 years', '8+ years'];

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/** Resume submission form in a modal <dialog>. */
export default function ApplyModal({ job, open, onClose }) {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const { profile, apply } = useJobBoard();
  const [form, setForm] = useState(() => ({ ...profile, experience: '', portfolio: '', coverLetter: '', consent: false }));
  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState('form'); // form | sending | done

  // Open/close the native dialog (it traps focus and closes on Escape for us)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const chooseFile = (file) => {
    if (!file) return;
    const error = validateResume(file);
    setErrors((current) => ({ ...current, resume: error ?? undefined }));
    setResume(error ? null : file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validateApplication(form, resume);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      dialogRef.current.querySelector(`[data-field="${firstError}"]`)?.focus();
      return;
    }
    setPhase('sending');
    // Simulated upload so the user sees a sending state
    setTimeout(() => {
      apply(job, form, { name: resume.name, size: resume.size, type: resume.type });
      setPhase('done');
    }, 1200);
  };

  const fieldProps = (key) => ({
    'data-field': key,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });
  const errorText = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} className="field-error" role="alert">
        {errors[field]}
      </p>
    ) : null;

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="apply-title"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && phase !== 'sending' && onClose()}
    >
      <div className="modal-inner">
        <header className="modal-head">
          <CompanyLogo companyId={job.companyId} size={40} />
          <div>
            <h2 id="apply-title">{phase === 'done' ? 'Application sent!' : `Apply for ${job.title}`}</h2>
            <p className="muted">
              {job.company} · {job.location}
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={phase === 'sending'}>
            <CloseIcon />
          </button>
        </header>

        {phase === 'done' ? (
          <div className="modal-success">
            <span className="success-icon">
              <CheckIcon size={34} />
            </span>
            <p>
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> was sent with <strong>{resume?.name}</strong>.
            </p>
            <p className="muted">
              In this demo the employer replies within a few minutes: in review after {DEMO_DELAYS.reviewing} minute, and a decision after{' '}
              {DEMO_DELAYS.decision} minutes. Follow it in My applications.
            </p>
            <div className="modal-actions">
              <Link to="/applications" className="btn btn-primary" onClick={onClose}>
                Track application
              </Link>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Keep browsing
              </button>
            </div>
          </div>
        ) : (
          <form className="apply-form" onSubmit={handleSubmit} noValidate>
            <fieldset disabled={phase === 'sending'}>
              <div className="form-grid">
                <label className="field">
                  <span>Full name *</span>
                  <input type="text" autoComplete="name" value={form.name} onChange={set('name')} {...fieldProps('name')} />
                  {errorText("name")}
                </label>
                <label className="field">
                  <span>Email *</span>
                  <input type="email" autoComplete="email" value={form.email} onChange={set('email')} {...fieldProps('email')} />
                  {errorText("email")}
                </label>
                <label className="field">
                  <span>Phone *</span>
                  <input type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} {...fieldProps('phone')} />
                  {errorText("phone")}
                </label>
                <label className="field">
                  <span>Experience *</span>
                  <select value={form.experience} onChange={set('experience')} {...fieldProps('experience')}>
                    <option value="">Choose…</option>
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  {errorText("experience")}
                </label>
              </div>

              <div className="field">
                <span id="resume-label">Resume *</span>
                <div
                  className={`dropzone${dragging ? ' dragging' : ''}${errors.resume ? ' invalid' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    chooseFile(event.dataTransfer.files[0]);
                  }}
                >
                  {resume ? (
                    <div className="file-chip">
                      <FileIcon size={22} />
                      <span>
                        <strong>{resume.name}</strong>
                        <small>{formatSize(resume.size)}</small>
                      </span>
                      <button type="button" className="link-btn" onClick={() => setResume(null)}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadIcon size={26} />
                      <p>
                        Drag your resume here, or{' '}
                        <button type="button" className="link-btn" onClick={() => fileInputRef.current.click()} data-field="resume" aria-describedby="resume-label">
                          choose a file
                        </button>
                      </p>
                      <small className="muted">PDF, DOC or DOCX · up to {MAX_RESUME_MB} MB</small>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    hidden
                    onChange={(event) => {
                      chooseFile(event.target.files[0]);
                      event.target.value = '';
                    }}
                  />
                </div>
                {errorText("resume")}
              </div>

              <label className="field">
                <span>
                  Portfolio or LinkedIn <em className="muted">(optional)</em>
                </span>
                <input type="url" placeholder="https://" value={form.portfolio} onChange={set('portfolio')} {...fieldProps('portfolio')} />
                {errorText("portfolio")}
              </label>

              <label className="field">
                <span>
                  Cover letter <em className="muted">(optional)</em>
                </span>
                <textarea rows={4} maxLength={1500} value={form.coverLetter} onChange={set('coverLetter')} placeholder="Why are you a good fit for this role?" {...fieldProps('coverLetter')} />
                <small className="counter">{form.coverLetter.length}/1500</small>
                {errorText("coverLetter")}
              </label>

              <label className="checkbox">
                <input type="checkbox" checked={form.consent} onChange={set('consent')} {...fieldProps('consent')} />
                <span>I confirm my details are correct and agree to share them with {job.company}.</span>
              </label>
              {errorText("consent")}
            </fieldset>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={phase === 'sending'}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={phase === 'sending'}>
                {phase === 'sending' ? (
                  <>
                    <span className="spinner" aria-hidden="true" /> Sending…
                  </>
                ) : (
                  'Submit application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
