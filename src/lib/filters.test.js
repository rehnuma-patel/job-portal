import { describe, expect, it } from 'vitest';
import { JOBS, WORKPLACES } from '../data/jobs.js';
import { DEFAULT_FILTERS, facetCounts, filterJobs, formatPosted, formatSalary, parseFilters, scoreJob, searchJobs, toSearchParams } from './filters.js';

const filters = (patch = {}) => ({ ...DEFAULT_FILTERS, ...patch });

describe('demo data', () => {
  it('has 60 jobs with unique ids and sensible salaries', () => {
    expect(JOBS).toHaveLength(60);
    expect(new Set(JOBS.map((j) => j.id)).size).toBe(60);
    for (const job of JOBS) expect(job.salaryMax).toBeGreaterThan(job.salaryMin);
    expect(JOBS.filter((j) => j.workplace === 'Remote').every((j) => j.location === 'Remote')).toBe(true);
  });
});

describe('URL filters', () => {
  it('round-trips through the URL and drops default values', () => {
    const original = filters({ q: 'react', workplace: ['Remote', 'Hybrid'], minSalary: 10, posted: '7', sort: 'newest', page: 2 });
    const params = toSearchParams(original);
    expect(params.toString()).toBe('q=react&workplace=Remote%2CHybrid&minSalary=10&posted=7&sort=newest&page=2');
    expect(parseFilters(params)).toEqual(original);
    expect(toSearchParams(filters()).toString()).toBe('');
  });

  it('ignores invalid values from a hand-edited URL', () => {
    const parsed = parseFilters(new URLSearchParams('minSalary=7&posted=99&sort=random&page=-3'));
    expect(parsed.minSalary).toBe(0);
    expect(parsed.posted).toBe('any');
    expect(parsed.sort).toBe('relevance');
    expect(parsed.page).toBe(1);
  });
});

describe('search', () => {
  it('requires every word to match and ranks title matches first', () => {
    const job = JOBS.find((j) => j.title.includes('Frontend Developer'));
    expect(scoreJob(job, 'frontend')).toBeGreaterThan(0);
    expect(scoreJob(job, 'frontend kubernetes')).toBe(0);
    const results = searchJobs(JOBS, filters({ q: 'designer' })).results;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((j) => scoreJob(j, 'designer') > 0)).toBe(true);
  });

  it('combines facets with AND across groups and OR inside a group', () => {
    const result = filterJobs(JOBS, filters({ workplace: ['Remote', 'Hybrid'], level: ['senior'] }));
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((j) => ['Remote', 'Hybrid'].includes(j.workplace) && j.level === 'senior')).toBe(true);
  });

  it('filters by minimum salary and date posted', () => {
    expect(filterJobs(JOBS, filters({ minSalary: 20 })).every((j) => j.salaryMax >= 20)).toBe(true);
    expect(filterJobs(JOBS, filters({ posted: '7' })).every((j) => j.postedDaysAgo < 7)).toBe(true);
    expect(filterJobs(JOBS, filters({ posted: '1' })).every((j) => j.postedDaysAgo === 0)).toBe(true);
  });

  it('"Remote" in the location box means remote jobs', () => {
    expect(filterJobs(JOBS, filters({ location: 'Remote' })).every((j) => j.workplace === 'Remote')).toBe(true);
  });

  it('sorts by salary and paginates', () => {
    const { results, pageItems, pageCount } = searchJobs(JOBS, filters({ sort: 'salary-high' }));
    for (let i = 1; i < results.length; i++) expect(results[i - 1].salaryMax).toBeGreaterThanOrEqual(results[i].salaryMax);
    expect(pageItems).toHaveLength(10);
    expect(pageCount).toBe(6);
    expect(searchJobs(JOBS, filters({ page: 99 })).page).toBe(6);
  });
});

describe('facet counts', () => {
  it('ignore their own facet but respect the others', () => {
    const active = filters({ workplace: ['Remote'], level: ['mid'] });
    const counts = facetCounts(JOBS, active, 'workplace', WORKPLACES);
    // Counts for workplace options are computed with the level filter only
    for (const workplace of WORKPLACES) {
      expect(counts[workplace]).toBe(JOBS.filter((j) => j.level === 'mid' && j.workplace === workplace).length);
    }
    // Selecting an option shows exactly as many results as its count said
    expect(filterJobs(JOBS, active)).toHaveLength(counts.Remote);
  });
});

describe('formatting', () => {
  it('formats salaries and dates', () => {
    expect(formatSalary({ type: 'Full-time', salaryMin: 8.5, salaryMax: 11 })).toBe('₹8.5–11 LPA');
    expect(formatSalary({ type: 'Internship', salaryMin: 2.4, salaryMax: 3 })).toBe('₹20k–25k / month');
    expect(formatPosted(0)).toBe('Today');
    expect(formatPosted(3)).toBe('3 days ago');
    expect(formatPosted(15)).toBe('2 weeks ago');
  });
});
