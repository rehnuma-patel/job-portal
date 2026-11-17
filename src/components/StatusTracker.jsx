import { STATUS_LABELS, STATUS_STEPS, stepIndex } from '../lib/applications.js';
import { CheckIcon, CloseIcon } from './Icons.jsx';

const dateTime = (ms) =>
  new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Stepper showing how far an application has progressed, plus the history of updates. */
export default function StatusTracker({ application }) {
  const reached = stepIndex(application);
  const stopped = application.status === 'rejected' || application.status === 'withdrawn';
  const historyByStatus = Object.fromEntries(application.history.map((h) => [h.status, h]));

  return (
    <div className="tracker">
      <ol className="tracker-steps" aria-label="Application progress">
        {STATUS_STEPS.map((step, i) => {
          const done = i < reached || (i === reached && application.status === 'offer');
          const current = i === reached && !stopped && application.status !== 'offer';
          const failedHere = stopped && i === reached + 1;
          const state = done ? 'done' : current ? 'current' : failedHere ? 'stopped' : 'todo';
          return (
            <li key={step.id} className={`tracker-step ${state}`} aria-current={current ? 'step' : undefined}>
              <span className="tracker-dot" aria-hidden="true">
                {done ? <CheckIcon size={14} /> : failedHere ? <CloseIcon size={14} /> : i + 1}
              </span>
              <span className="tracker-label">
                {failedHere ? STATUS_LABELS[application.status] : step.label}
                {historyByStatus[step.id] && <small>{dateTime(historyByStatus[step.id].at)}</small>}
              </span>
            </li>
          );
        })}
      </ol>

      <ul className="tracker-history">
        {[...application.history].reverse().map((entry) => (
          <li key={entry.status}>
            <span className={`status-dot status-${entry.status}`} aria-hidden="true" />
            <div>
              <strong>{STATUS_LABELS[entry.status]}</strong>
              <span className="muted"> · {dateTime(entry.at)}</span>
              <p className="muted">
                {entry.status === 'applied' && 'Your resume and details were sent.'}
                {entry.status === 'reviewing' && 'A recruiter opened your application.'}
                {entry.status === 'interview' && `Interview scheduled for ${dateTime(entry.interviewAt)} (video call).`}
                {entry.status === 'offer' && 'You received an offer letter. Congratulations!'}
                {entry.status === 'rejected' && 'The team chose another candidate this time. Keep going!'}
                {entry.status === 'withdrawn' && 'You withdrew this application.'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
