import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useJobBoard } from '../context/JobBoardContext.jsx';
import { CloseIcon, MenuIcon } from './Icons.jsx';

export default function Header() {
  const { saved, applications } = useJobBoard();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeApplications = applications.filter((app) => !['withdrawn', 'rejected'].includes(app.status)).length;

  // Close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="HireWave home">
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="22" height="22">
              <path d="M8 38c6-8 10-8 14 0s8 8 14 0 9-8 14-2" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
              <circle cx="32" cy="18" r="6" fill="#fff" />
            </svg>
          </span>
          <span className="logo-text">
            Hire<span>Wave</span>
          </span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>

        <nav id="main-nav" className={`nav${menuOpen ? ' open' : ''}`} aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/jobs">Find jobs</NavLink>
          <NavLink to="/saved">
            Saved jobs {saved.length > 0 && <span className="nav-count">{saved.length}</span>}
          </NavLink>
          <NavLink to="/applications">
            My applications {activeApplications > 0 && <span className="nav-count">{activeApplications}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
