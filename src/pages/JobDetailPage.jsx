import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { jobById, JOBS, levelById } from '../data/jobs.js';
import { companyById } from '../data/companies.js';
import { formatPosted, formatSalary } from '../lib/filters.js';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import ApplyModal from '../components/ApplyModal.jsx';
import { CompanyLogo, JobCard, JobMeta, SaveButton, StatusBadge } from '../components/JobBits.jsx';
import { ArrowLeftIcon, BoltIcon, BriefcaseIcon, CalendarIcon, CheckIcon, ClockIcon, HomeIcon, LayersIcon, ShareIcon, StarIcon, UsersIcon, WalletIcon } from '../components/Icons.jsx';
import NotFoundPage from './NotFoundPage.jsx';

/** Jobs that share the category, preferring the same level, excluding this one. */
function similarJobs(job) {
  return JOBS.filter((other) => other.id !== job.id && other.category === job.category)
    .sort((a, b) => Number(b.level === job.level) - Number(a.level === job.level) || a.postedDaysAgo - b.postedDaysAgo)
    .slice(0, 3);
}

export default function JobDetailPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const job = jobById[jobId];
  const { applicationFor } = useJobBoard();
  const [applyOpen, setApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const similar = useMemo(() => (job ? similarJobs(job) : []), [job]);

  useEffect(() => {
    if (job) document.title = `${job.title} at ${job.company} – HireWave`;
    setApplyOpen(false);
  }, [job]);

  if (!job) return <NotFoundPage message="This job could not be found. It may have been filled or removed." />;

  const company = companyById[job.companyId];
  const application = applicationFor(job.id);
  const backTo = location.state?.from ?? '/jobs';

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${job.title} at ${job.company}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // share sheet closed
    }
  };

  const overview = [
    [WalletIcon, 'Salary', formatSalary(job)],
    [BriefcaseIcon, 'Job type', job.type],
    [LayersIcon, 'Experience', `${levelById[job.level].label} · ${job.experience}`],
    [HomeIcon, 'Workplace', job.workplace],
    [UsersIcon, 'Openings', `${job.openings} ${job.openings === 1 ? 'position' : 'positions'}`],
    [ClockIcon, 'Posted', formatPosted(job.postedDaysAgo)],
    [CalendarIcon, 'Apply by', new Date(Date.now() + (30 - job.postedDaysAgo) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
  ];

  const applyArea = application ? (
    <div className="applied-box">
      <StatusBadge status={application.status} />
      <span>You applied on {new Date(application.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      <Link to="/applications" className="link-btn">
        Track status
      </Link>
    </div>
  ) : (
    <button type="button" className="btn btn-primary btn-lg" onClick={() => setApplyOpen(true)}>
      Apply now
    </button>
  );

  return (
    <div className="container detail-page">
      <Link to={backTo} className="back-link">
        <ArrowLeftIcon /> Back to results
      </Link>

      <div className="detail-layout">
        <article className="detail-main">
          <header className="detail-head card">
            <CompanyLogo companyId={job.companyId} size={64} />
            <div className="detail-head-text">
              <div className="flags">
                {job.featured && <span className="flag">Featured</span>}
                {job.urgent && (
                  <span className="flag urgent">
                    <BoltIcon size={13} /> Hiring urgently
                  </span>
                )}
              </div>
              <h1>{job.title}</h1>
              <p className="detail-company">
                {job.company}
                <span className="rating">
                  <StarIcon size={14} /> {company.rating}
                </span>
              </p>
              <JobMeta job={job} />
              <div className="detail-actions">
                {applyArea}
                <SaveButton job={job} withLabel />
                <button type="button" className="btn btn-outline" onClick={share}>
                  {copied ? <CheckIcon /> : <ShareIcon />} {copied ? 'Link copied' : 'Share'}
                </button>
              </div>
              <p className="muted small">{job.applicants} people have applied</p>
            </div>
          </header>

          <section className="card prose">
            <h2>About the role</h2>
            <p>{job.summary}</p>
            <h2>What you will do</h2>
            <ul className="check-list">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2>What we are looking for</h2>
            <ul className="check-list">
              {job.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h2>Skills</h2>
            <div className="tags">
              {job.skills.map((skill) => (
                <Link key={skill} to={`/jobs?q=${encodeURIComponent(skill)}`} className="tag tag-link">
                  {skill}
                </Link>
              ))}
            </div>
            <h2>Benefits</h2>
            <ul className="benefit-list">
              {job.benefits.map((benefit) => (
                <li key={benefit}>
                  <CheckIcon size={16} /> {benefit}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="detail-side">
          <section className="card">
            <h2 className="side-title">Job overview</h2>
            <dl className="overview">
              {overview.map(([Icon, label, value]) => (
                <div key={label}>
                  <dt>
                    <Icon size={16} /> {label}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card">
            <div className="company-card-head">
              <CompanyLogo companyId={job.companyId} size={44} />
              <div>
                <h2 className="side-title">{company.name}</h2>
                <p className="muted small">{company.industry}</p>
              </div>
            </div>
            <p className="small">{company.about}</p>
            <dl className="company-facts">
              <div>
                <dt>Size</dt>
                <dd>{company.size}</dd>
              </div>
              <div>
                <dt>Founded</dt>
                <dd>{company.founded}</dd>
              </div>
              <div>
                <dt>Head office</dt>
                <dd>{company.hq}</dd>
              </div>
            </dl>
            <Link to={`/jobs?q=${encodeURIComponent(company.name)}`} className="btn btn-outline btn-block">
              All jobs at {company.name}
            </Link>
          </section>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="similar">
          <h2>Similar jobs</h2>
          <ul className="job-list grid">
            {similar.map((other) => (
              <li key={other.id}>
                <JobCard job={other} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sticky apply bar on phones */}
      <div className="mobile-apply">{applyArea}</div>

      {applyOpen && <ApplyModal key={job.id} job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
