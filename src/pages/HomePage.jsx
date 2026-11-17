import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES, JOBS } from '../data/jobs.js';
import { COMPANIES } from '../data/companies.js';
import { toSearchParams, DEFAULT_FILTERS, sortJobs } from '../lib/filters.js';
import SearchBar from '../components/SearchBar.jsx';
import { CompanyLogo, JobCard } from '../components/JobBits.jsx';
import { ArrowRightIcon, StarIcon } from '../components/Icons.jsx';

const CATEGORY_ICONS = {
  Engineering: '💻',
  Design: '🎨',
  Data: '📊',
  Marketing: '📣',
  Product: '🧭',
  'Sales & Support': '🤝',
  Security: '🛡️',
};

const POPULAR = ['React', 'Python', 'Figma', 'SQL', 'Remote', 'Internship'];

export default function HomePage() {
  const navigate = useNavigate();
  const latest = useMemo(() => sortJobs(JOBS, { ...DEFAULT_FILTERS, sort: 'newest' }).slice(0, 6), []);
  const categoryCounts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c, JOBS.filter((j) => j.category === c).length])), []);
  const topCompanies = useMemo(
    () =>
      COMPANIES.map((company) => ({ ...company, open: JOBS.filter((j) => j.companyId === company.id).length }))
        .filter((c) => c.open > 0)
        .sort((a, b) => b.open - a.open || b.rating - a.rating)
        .slice(0, 8),
    [],
  );
  const remoteCount = JOBS.filter((j) => j.workplace === 'Remote').length;

  useEffect(() => {
    document.title = 'HireWave – Find your next job';
  }, []);

  const search = ({ q, location }) => navigate(`/jobs?${toSearchParams({ ...DEFAULT_FILTERS, q, location })}`);
  const popularLink = (term) =>
    term === 'Remote' ? '/jobs?workplace=Remote' : term === 'Internship' ? '/jobs?type=Internship' : `/jobs?q=${encodeURIComponent(term)}`;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">{JOBS.length} open jobs · {COMPANIES.length} companies hiring</p>
          <h1>
            Find a job you'll <span className="gradient-text">love</span>
          </h1>
          <p className="hero-sub">Search roles in engineering, design, data, marketing and more. Apply in minutes and track every application in one place.</p>
          <SearchBar large onSearch={search} />
          <div className="popular">
            <span>Popular:</span>
            {POPULAR.map((term) => (
              <Link key={term} to={popularLink(term)} className="chip light">
                {term}
              </Link>
            ))}
          </div>
          <dl className="hero-stats">
            <div>
              <dt>Remote jobs</dt>
              <dd>{remoteCount}</dd>
            </div>
            <div>
              <dt>Internships</dt>
              <dd>{JOBS.filter((j) => j.type === 'Internship').length}</dd>
            </div>
            <div>
              <dt>New this week</dt>
              <dd>{JOBS.filter((j) => j.postedDaysAgo < 7).length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Browse by category</h2>
        </div>
        <ul className="category-grid">
          {CATEGORIES.map((category) => (
            <li key={category}>
              <Link to={`/jobs?category=${encodeURIComponent(category)}`} className="category-card">
                <span className="category-icon" aria-hidden="true">
                  {CATEGORY_ICONS[category]}
                </span>
                <strong>{category}</strong>
                <span className="muted">{categoryCounts[category]} jobs</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Latest jobs</h2>
          <Link to="/jobs?sort=newest" className="link-btn">
            See all jobs <ArrowRightIcon size={16} />
          </Link>
        </div>
        <ul className="job-list grid">
          {latest.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Top companies hiring</h2>
        </div>
        <ul className="company-grid">
          {topCompanies.map((company) => (
            <li key={company.id}>
              <Link to={`/jobs?q=${encodeURIComponent(company.name)}`} className="company-tile">
                <CompanyLogo companyId={company.id} size={44} />
                <span>
                  <strong>{company.name}</strong>
                  <small className="muted">
                    {company.industry} · <StarIcon size={12} className="star" /> {company.rating}
                  </small>
                </span>
                <span className="open-count">{company.open} open</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <div className="steps-band">
          <div>
            <h2>How it works</h2>
            <p className="muted">From search to offer in three simple steps.</p>
          </div>
          <ol className="steps">
            <li>
              <strong>Search &amp; filter</strong>
              <span>Narrow jobs by remote, salary, experience and more.</span>
            </li>
            <li>
              <strong>Apply with your resume</strong>
              <span>Upload your CV and add a short cover letter.</span>
            </li>
            <li>
              <strong>Track your status</strong>
              <span>See when you're in review, invited to interview, or hired.</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
