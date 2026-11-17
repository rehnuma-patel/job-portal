import { Link } from 'react-router-dom';
import { SearchIcon } from '../components/Icons.jsx';

export default function NotFoundPage({ message = 'The page you are looking for does not exist.' }) {
  return (
    <div className="container empty page-empty">
      <SearchIcon size={40} />
      <h1>Page not found</h1>
      <p className="muted">{message}</p>
      <Link to="/jobs" className="btn btn-primary">
        Browse all jobs
      </Link>
    </div>
  );
}
