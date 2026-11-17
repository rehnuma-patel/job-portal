import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import { FINAL_STATUSES, nextUpdateAt, STATUS_LABELS } from '../lib/applications.js';
import StatusTracker from '../components/StatusTracker.jsx';
import { CompanyLogo, StatusBadge } from '../components/JobBits.jsx';
import { BriefcaseIcon, FileIcon, TrashIcon } from '../components/Icons.jsx';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active', match: (s) => ['applied', 'reviewing', 'interview'].includes(s) },
  { id: 'interview', label: 'Interviews', match: (s) => s === 'interview' },
  { id: 'offer', label: 'Offers', match: (s) => s === 'offer' },
  { id: 'closed', label: 'Closed', match: (s) => ['rejected', 'withdrawn'].includes(s) },
];

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

function countdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}

export default function ApplicationsPage() {
  const { applications, withdraw, remove } = useJobBoard();
  const [tab, setTab] = useState('all');
  const now = useNow();

  useEffect(() => {
    document.title = 'My applications – HireWave';
  }, []);

  const count = (id) => (id === 'all' ? applications.length : applications.filter((a) => TABS.find((t) => t.id === id).match(a.status)).length);
  const current = TABS.find((t) => t.id === tab);
  const visible = tab === 'all' ? applications : applications.filter((a) => current.match(a.status));

  const stats = [
    ['Applied', applications.length],
    ['In progress', count('active')],
    ['Interviews', applications.filter((a) => a.history.some((h) => h.status === 'interview')).length],
    ['Offers', count('offer')],
  ];

  return (
    <div className="container page">
      <header className="page-head">
        <h1>My applications</h1>
        <p className="muted">Track every job you applied for. In this demo, employers reply within a few minutes.</p>
      </header>

      {applications.length === 0 ? (
        <div className="empty">
          <BriefcaseIcon size={36} />
          <h2>No applications yet</h2>
          <p className="muted">When you apply for a job, you can follow its status here.</p>
          <Link to="/jobs" className="btn btn-primary">
            Find jobs
          </Link>
        </div>
      ) : (
        <>
          <dl className="stat-grid">
            {stats.map(([label, value]) => (
              <div key={label} className="stat">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="tabs" role="tablist" aria-label="Filter applications">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label} <span className="tab-count">{count(t.id)}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="muted empty-tab">No applications in “{current.label}”.</p>
          ) : (
            <ul className="application-list" role="tabpanel">
              {visible.map((app) => {
                const next = nextUpdateAt(app);
                return (
                  <li key={app.id} className="card application">
                    <header className="application-head">
                      <CompanyLogo companyId={app.companyId} size={48} />
                      <div className="application-title">
                        <h2>
                          <Link to={`/jobs/${app.jobId}`}>{app.jobTitle}</Link>
                        </h2>
                        <p className="muted">
                          {app.company} · {app.location} · Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </header>

                    <StatusTracker application={app} />

                    <footer className="application-foot">
                      <span className="resume-chip">
                        <FileIcon size={16} /> {app.resume?.name}
                      </span>
                      {next && (
                        <span className="muted small" aria-live="off">
                          Next update in about {countdown(next - now)}
                        </span>
                      )}
                      <div className="application-actions">
                        {!FINAL_STATUSES.includes(app.status) && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => window.confirm(`Withdraw your application for ${app.jobTitle}?`) && withdraw(app.id)}
                          >
                            Withdraw
                          </button>
                        )}
                        {FINAL_STATUSES.includes(app.status) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => remove(app.id)}
                            aria-label={`Remove ${STATUS_LABELS[app.status].toLowerCase()} application for ${app.jobTitle}`}
                          >
                            <TrashIcon size={16} /> Remove
                          </button>
                        )}
                      </div>
                    </footer>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
