import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobById } from '../data/jobs.js';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import { JobCard } from '../components/JobBits.jsx';
import { BookmarkIcon } from '../components/Icons.jsx';

export default function SavedJobsPage() {
  const { saved } = useJobBoard();
  const jobs = saved.map((id) => jobById[id]).filter(Boolean);

  useEffect(() => {
    document.title = 'Saved jobs – HireWave';
  }, []);

  return (
    <div className="container page">
      <header className="page-head">
        <h1>Saved jobs</h1>
        <p className="muted">
          {jobs.length ? `${jobs.length} saved ${jobs.length === 1 ? 'job' : 'jobs'}. They stay here after you close the browser.` : 'Jobs you bookmark appear here.'}
        </p>
      </header>
      {jobs.length ? (
        <ul className="job-list">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          <BookmarkIcon size={36} />
          <h2>No saved jobs yet</h2>
          <p className="muted">Tap the bookmark on any job to save it for later.</p>
          <Link to="/jobs" className="btn btn-primary">
            Browse jobs
          </Link>
        </div>
      )}
    </div>
  );
}
