import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JOBS, levelById } from '../data/jobs.js';
import { DEFAULT_FILTERS, MULTI_FACETS, parseFilters, searchJobs, SORT_OPTIONS, toSearchParams } from '../lib/filters.js';
import FilterSidebar from '../components/FilterSidebar.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { JobCard } from '../components/JobBits.jsx';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, FilterIcon, SearchIcon } from '../components/Icons.jsx';

const chipLabel = (key, value) => (key === 'level' ? levelById[value]?.label ?? value : value);

export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const { pageItems, total, page, pageCount } = useMemo(() => searchJobs(JOBS, filters), [filters]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The URL is the single source of truth for the search.
  // Changing a filter resets to page 1; other history entries stay usable with Back/Forward.
  const update = (patch, { keepPage = false } = {}) => {
    const next = { ...filters, ...patch };
    if (!keepPage) next.page = 1;
    setParams(toSearchParams(next));
  };
  const clearFilters = () => setParams(toSearchParams({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort }));

  useEffect(() => {
    document.title = `${filters.q ? `“${filters.q}” jobs` : 'Find jobs'} – HireWave`;
  }, [filters.q]);

  // Lock page scroll while the mobile filter drawer is open; Escape closes it
  useEffect(() => {
    if (!drawerOpen) return undefined;
    document.body.classList.add('no-scroll');
    const onKey = (event) => event.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const chips = [
    ...(filters.location ? [{ key: 'location', value: filters.location, label: filters.location }] : []),
    ...MULTI_FACETS.flatMap((key) => filters[key].map((value) => ({ key, value, label: chipLabel(key, value) }))),
    ...(filters.minSalary ? [{ key: 'minSalary', value: 0, label: `₹${filters.minSalary}+ LPA` }] : []),
    ...(filters.posted !== 'any' ? [{ key: 'posted', value: 'any', label: filters.posted === '1' ? 'Last 24 hours' : `Last ${filters.posted} days` }] : []),
  ];
  const removeChip = (chip) => {
    if (MULTI_FACETS.includes(chip.key)) update({ [chip.key]: filters[chip.key].filter((v) => v !== chip.value) });
    else update({ [chip.key]: chip.key === 'location' ? '' : chip.value });
  };

  const goToPage = (n) => {
    update({ page: n }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="jobs-page">
      <section className="page-search">
        <div className="container">
          <SearchBar initialQuery={filters.q} initialLocation={filters.location} onSearch={(values) => update(values)} />
        </div>
      </section>

      <div className="container jobs-layout">
        <FilterSidebar
          jobs={JOBS}
          filters={filters}
          onChange={update}
          onClear={clearFilters}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          resultCount={total}
        />
        {drawerOpen && <div className="backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

        <section className="results" aria-labelledby="results-title">
          <div className="results-head">
            <div>
              <h1 id="results-title" className="results-title">
                {filters.q ? `Jobs for “${filters.q}”` : 'All jobs'}
              </h1>
              <p className="muted" aria-live="polite">
                {total} {total === 1 ? 'job' : 'jobs'} found
              </p>
            </div>
            <div className="results-tools">
              <button type="button" className="btn btn-outline filters-open" onClick={() => setDrawerOpen(true)}>
                <FilterIcon /> Filters {chips.length > 0 && <span className="nav-count">{chips.length}</span>}
              </button>
              <label className="sort">
                <span>Sort by</span>
                <select value={filters.sort} onChange={(event) => update({ sort: event.target.value })}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className="chips" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={`${chip.key}-${chip.label}`}>
                  <button type="button" className="chip" onClick={() => removeChip(chip)} aria-label={`Remove filter ${chip.label}`}>
                    {chip.label} <CloseIcon size={14} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="link-btn" onClick={clearFilters}>
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {pageItems.length ? (
            <ul className="job-list">
              {pageItems.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <SearchIcon size={36} />
              <h2>No jobs match your search</h2>
              <p className="muted">Try fewer words, a different location, or remove a filter.</p>
              <button type="button" className="btn btn-primary" onClick={() => setParams(new URLSearchParams())}>
                Reset search
              </button>
            </div>
          )}

          {pageCount > 1 && (
            <nav className="pagination" aria-label="Pages">
              <button type="button" className="btn btn-outline" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                <ArrowLeftIcon /> Previous
              </button>
              <ol>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <li key={n}>
                    <button type="button" className={`page-btn${n === page ? ' active' : ''}`} aria-current={n === page ? 'page' : undefined} onClick={() => goToPage(n)}>
                      {n}
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className="btn btn-outline" disabled={page === pageCount} onClick={() => goToPage(page + 1)}>
                Next <ArrowRightIcon />
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
