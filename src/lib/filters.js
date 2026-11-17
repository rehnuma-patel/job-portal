// Faceted search: parse filters from the URL, filter and sort jobs, and count results per facet.
// Filters live in the URL (?q=react&workplace=Remote,Hybrid&minSalary=10) so every search can be
// bookmarked, shared and navigated with the browser's back/forward buttons.

export const MULTI_FACETS = ['workplace', 'type', 'level', 'category'];

export const DEFAULT_FILTERS = {
  q: '',
  location: '',
  workplace: [],
  type: [],
  level: [],
  category: [],
  minSalary: 0,
  posted: 'any',
  sort: 'relevance',
  page: 1,
};

export const SALARY_STEPS = [0, 3, 6, 10, 15, 20, 30];

export const POSTED_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'newest', label: 'Newest first' },
  { value: 'salary-high', label: 'Salary: high to low' },
  { value: 'salary-low', label: 'Salary: low to high' },
];

export const PAGE_SIZE = 10;

/** URLSearchParams -> filters object */
export function parseFilters(params) {
  const filters = { ...DEFAULT_FILTERS };
  filters.q = (params.get('q') ?? '').slice(0, 80);
  filters.location = params.get('location') ?? '';
  for (const key of MULTI_FACETS) {
    const raw = params.get(key);
    filters[key] = raw ? raw.split(',').filter(Boolean) : [];
  }
  const salary = Number(params.get('minSalary'));
  filters.minSalary = SALARY_STEPS.includes(salary) ? salary : 0;
  const posted = params.get('posted');
  filters.posted = POSTED_OPTIONS.some((o) => o.value === posted) ? posted : 'any';
  const sort = params.get('sort');
  filters.sort = SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'relevance';
  filters.page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  return filters;
}

/** filters object -> URLSearchParams (default values are left out to keep URLs short) */
export function toSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.location) params.set('location', filters.location);
  for (const key of MULTI_FACETS) if (filters[key].length) params.set(key, filters[key].join(','));
  if (filters.minSalary) params.set('minSalary', String(filters.minSalary));
  if (filters.posted !== 'any') params.set('posted', filters.posted);
  if (filters.sort !== 'relevance') params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

const tokenize = (text) => text.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);

/**
 * Relevance score of a job for a search query. 0 means "doesn't match".
 * Every word must appear somewhere; title matches count most.
 */
export function scoreJob(job, query) {
  const words = tokenize(query);
  if (!words.length) return 1;
  const fields = [
    [job.title.toLowerCase(), 4],
    [job.skills.join(' ').toLowerCase(), 3],
    [job.company.toLowerCase(), 2],
    [job.category.toLowerCase(), 2],
    [job.summary.toLowerCase(), 1],
  ];
  let score = 0;
  for (const word of words) {
    let best = 0;
    for (const [text, weight] of fields) if (text.includes(word)) best = Math.max(best, weight);
    if (!best) return 0;
    score += best;
  }
  return score;
}

function matchesLocation(job, location) {
  if (!location) return true;
  if (location === 'Remote') return job.workplace === 'Remote';
  return job.location === location;
}

function matchesPosted(job, posted) {
  if (posted === 'any') return true;
  const days = Number(posted);
  return days === 1 ? job.postedDaysAgo === 0 : job.postedDaysAgo < days;
}

/** Applies every filter except the facet named in `except` (used for facet counts). */
export function filterJobs(jobs, filters, except = null) {
  return jobs.filter((job) => {
    if (except !== 'q' && filters.q && scoreJob(job, filters.q) === 0) return false;
    if (except !== 'location' && !matchesLocation(job, filters.location)) return false;
    for (const key of MULTI_FACETS) {
      if (key !== except && filters[key].length && !filters[key].includes(job[key])) return false;
    }
    if (except !== 'minSalary' && filters.minSalary && job.salaryMax < filters.minSalary) return false;
    if (except !== 'posted' && !matchesPosted(job, filters.posted)) return false;
    return true;
  });
}

export function sortJobs(jobs, filters) {
  const list = [...jobs];
  const newest = (a, b) => a.postedDaysAgo - b.postedDaysAgo;
  switch (filters.sort) {
    case 'newest':
      return list.sort(newest);
    case 'salary-high':
      return list.sort((a, b) => b.salaryMax - a.salaryMax || newest(a, b));
    case 'salary-low':
      return list.sort((a, b) => a.salaryMin - b.salaryMin || newest(a, b));
    default:
      if (filters.q.trim()) return list.sort((a, b) => scoreJob(b, filters.q) - scoreJob(a, filters.q) || newest(a, b));
      return list.sort((a, b) => Number(b.featured) - Number(a.featured) || newest(a, b));
  }
}

/** Filtered + sorted results and the current page. */
export function searchJobs(jobs, filters) {
  const results = sortJobs(filterJobs(jobs, filters), filters);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  return { results, total: results.length, page, pageCount, pageItems: results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

/**
 * How many jobs each option of a facet would show, given all *other* active filters.
 * This is what makes it "faceted": counts update as you filter, and options never lie.
 */
export function facetCounts(jobs, filters, key, options) {
  const pool = filterJobs(jobs, filters, key);
  return Object.fromEntries(options.map((option) => [option, pool.filter((job) => job[key] === option).length]));
}

export function salaryCounts(jobs, filters) {
  const pool = filterJobs(jobs, filters, 'minSalary');
  return Object.fromEntries(SALARY_STEPS.map((step) => [step, pool.filter((job) => job.salaryMax >= step).length]));
}

export function activeFilterCount(filters) {
  return (
    MULTI_FACETS.reduce((sum, key) => sum + filters[key].length, 0) +
    (filters.location ? 1 : 0) +
    (filters.minSalary ? 1 : 0) +
    (filters.posted !== 'any' ? 1 : 0)
  );
}

/* ---------------- formatting ---------------- */

export function formatSalary(job) {
  if (job.type === 'Internship') {
    const monthly = (lpa) => Math.round((lpa * 100000) / 12 / 1000);
    return `₹${monthly(job.salaryMin)}k–${monthly(job.salaryMax)}k / month`;
  }
  return `₹${job.salaryMin}–${job.salaryMax} LPA`;
}

export function formatPosted(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}
