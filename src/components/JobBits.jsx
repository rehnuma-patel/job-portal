// Small reusable pieces for jobs: company logo, save button, badges and the job card.
import { Link, useLocation } from 'react-router-dom';
import { companyById, companyInitials } from '../data/companies.js';
import { levelById } from '../data/jobs.js';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import { formatPosted, formatSalary } from '../lib/filters.js';
import { STATUS_LABELS } from '../lib/applications.js';
import { BookmarkIcon, BoltIcon, BriefcaseIcon, ClockIcon, PinIcon, WalletIcon } from './Icons.jsx';

export function CompanyLogo({ companyId, size = 48 }) {
  const company = companyById[companyId];
  return (
    <span
      className="company-logo"
      style={{ '--logo': company?.color ?? '#4f46e5', width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {companyInitials(company?.name ?? '?')}
    </span>
  );
}

export function SaveButton({ job, withLabel = false }) {
  const { isSaved, toggleSave } = useJobBoard();
  const saved = isSaved(job.id);
  return (
    <button
      type="button"
      className={`save-btn${saved ? ' saved' : ''}${withLabel ? ' with-label' : ''}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSave(job.id);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
      title={saved ? 'Saved' : 'Save job'}
    >
      <BookmarkIcon filled={saved} />
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function JobMeta({ job }) {
  return (
    <ul className="job-meta">
      <li>
        <PinIcon size={15} /> {job.location}
      </li>
      <li>
        <BriefcaseIcon size={15} /> {job.type} · {levelById[job.level].label}
      </li>
      <li>
        <WalletIcon size={15} /> {formatSalary(job)}
      </li>
      <li>
        <ClockIcon size={15} /> {formatPosted(job.postedDaysAgo)}
      </li>
    </ul>
  );
}

export function JobCard({ job }) {
  const location = useLocation();
  const { applicationFor } = useJobBoard();
  const application = applicationFor(job.id);

  return (
    <article className={`job-card${job.featured ? ' featured' : ''}`}>
      <CompanyLogo companyId={job.companyId} />
      <div className="job-card-body">
        <div className="job-card-top">
          <div>
            <h3 className="job-title">
              {/* Pass the current search so "Back to results" can return to it */}
              <Link to={`/jobs/${job.id}`} state={{ from: location.pathname + location.search }} className="stretched-link">
                {job.title}
              </Link>
            </h3>
            <p className="job-company">{job.company}</p>
          </div>
          <SaveButton job={job} />
        </div>
        <JobMeta job={job} />
        <div className="job-card-bottom">
          <div className="tags">
            <span className={`tag workplace-${job.workplace.toLowerCase()}`}>{job.workplace}</span>
            {job.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>
          <div className="card-flags">
            {application && <StatusBadge status={application.status} />}
            {!application && job.urgent && (
              <span className="flag urgent">
                <BoltIcon size={13} /> Urgent
              </span>
            )}
            {!application && job.featured && <span className="flag">Featured</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
