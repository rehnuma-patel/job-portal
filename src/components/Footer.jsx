import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="logo small">
            <span className="logo-text">
              Hire<span>Wave</span>
            </span>
          </Link>
          <p className="muted">A demo job portal built with React by Rehnuma Patel. Companies and jobs are fictional.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/jobs">All jobs</Link>
          <Link to="/jobs?workplace=Remote">Remote jobs</Link>
          <Link to="/jobs?type=Internship">Internships</Link>
          <Link to="/applications">My applications</Link>
        </nav>
      </div>
    </footer>
  );
}
