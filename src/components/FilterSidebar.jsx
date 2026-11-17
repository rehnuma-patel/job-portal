import { useId } from 'react';
import { CATEGORIES, JOB_TYPES, LEVELS, WORKPLACES } from '../data/jobs.js';
import { activeFilterCount, facetCounts, POSTED_OPTIONS, SALARY_STEPS, salaryCounts } from '../lib/filters.js';
import { CloseIcon } from './Icons.jsx';

function CheckboxFacet({ title, facetKey, options, filters, counts, onToggle }) {
  return (
    <details className="facet" open>
      <summary>{title}</summary>
      <ul className="facet-options">
        {options.map(({ value, label }) => {
          const checked = filters[facetKey].includes(value);
          const count = counts[value] ?? 0;
          return (
            <li key={value}>
              <label className={`facet-option${!count && !checked ? ' is-empty' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => onToggle(facetKey, value)} />
                <span className="facet-label">{label}</span>
                <span className="facet-count">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export default function FilterSidebar({ jobs, filters, onChange, onClear, open, onClose, resultCount }) {
  const salaryId = useId();
  const toggle = (key, value) => {
    const list = filters[key];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const counts = (key, values) => facetCounts(jobs, filters, key, values);
  const salary = salaryCounts(jobs, filters);
  const salaryIndex = Math.max(0, SALARY_STEPS.indexOf(filters.minSalary));
  const activeCount = activeFilterCount(filters);

  return (
    <aside className={`filters${open ? ' open' : ''}`} aria-label="Filters">
      <div className="filters-head">
        <h2>
          Filters {activeCount > 0 && <span className="nav-count">{activeCount}</span>}
        </h2>
        <div className="filters-head-actions">
          {activeCount > 0 && (
            <button type="button" className="link-btn" onClick={onClear}>
              Clear all
            </button>
          )}
          <button type="button" className="icon-btn filters-close" onClick={onClose} aria-label="Close filters">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="filters-body">
        <CheckboxFacet
          title="Workplace"
          facetKey="workplace"
          options={WORKPLACES.map((w) => ({ value: w, label: w }))}
          filters={filters}
          counts={counts('workplace', WORKPLACES)}
          onToggle={toggle}
        />

        <details className="facet" open>
          <summary>Minimum salary</summary>
          <div className="salary-filter">
            <label htmlFor={salaryId} className="salary-value">
              {filters.minSalary ? `₹${filters.minSalary} LPA or more` : 'Any salary'}
              <span className="facet-count">{salary[filters.minSalary]}</span>
            </label>
            <input
              id={salaryId}
              type="range"
              min="0"
              max={SALARY_STEPS.length - 1}
              step="1"
              value={salaryIndex}
              onChange={(event) => onChange({ minSalary: SALARY_STEPS[Number(event.target.value)] })}
              aria-valuetext={filters.minSalary ? `${filters.minSalary} lakh per year or more` : 'Any salary'}
              style={{ '--fill': `${(salaryIndex / (SALARY_STEPS.length - 1)) * 100}%` }}
            />
            <div className="salary-scale" aria-hidden="true">
              {SALARY_STEPS.map((step) => (
                <span key={step}>{step ? `${step}` : 'Any'}</span>
              ))}
            </div>
          </div>
        </details>

        <CheckboxFacet
          title="Experience"
          facetKey="level"
          options={LEVELS.map((l) => ({ value: l.id, label: `${l.label} (${l.years})` }))}
          filters={filters}
          counts={counts('level', LEVELS.map((l) => l.id))}
          onToggle={toggle}
        />
        <CheckboxFacet
          title="Job type"
          facetKey="type"
          options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
          filters={filters}
          counts={counts('type', JOB_TYPES)}
          onToggle={toggle}
        />
        <CheckboxFacet
          title="Category"
          facetKey="category"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          filters={filters}
          counts={counts('category', CATEGORIES)}
          onToggle={toggle}
        />

        <details className="facet" open>
          <summary>Date posted</summary>
          <ul className="facet-options">
            {POSTED_OPTIONS.map((option) => (
              <li key={option.value}>
                <label className="facet-option">
                  <input type="radio" name="posted" checked={filters.posted === option.value} onChange={() => onChange({ posted: option.value })} />
                  <span className="facet-label">{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="filters-foot">
        <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
          Show {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
        </button>
      </div>
    </aside>
  );
}
