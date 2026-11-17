import { useEffect, useState } from 'react';
import { LOCATIONS } from '../data/jobs.js';
import { PinIcon, SearchIcon } from './Icons.jsx';

/** Keyword + location search. Calls onSearch({ q, location }) on submit. */
export default function SearchBar({ initialQuery = '', initialLocation = '', onSearch, large = false }) {
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  // Keep the inputs in sync when the URL changes (back/forward buttons, chips removed)
  useEffect(() => setQ(initialQuery), [initialQuery]);
  useEffect(() => setLocation(initialLocation), [initialLocation]);

  return (
    <form
      className={`search-bar${large ? ' large' : ''}`}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ q: q.trim(), location });
      }}
    >
      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">Job title, skill or company</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" maxLength={80} />
      </label>
      <label className="search-field location">
        <PinIcon />
        <span className="sr-only">Location</span>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Any location</option>
          {LOCATIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
}
