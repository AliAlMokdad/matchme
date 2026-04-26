import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">💜</span>
        <span className="brand-name">MatchMe</span>
      </Link>
      <div className="navbar-links">
        <Link to="/create" className={`nav-link ${pathname === '/create' ? 'active' : ''}`}>
          Create Profile
        </Link>
        <Link to="/match" className={`nav-link nav-link-cta ${pathname === '/match' ? 'active' : ''}`}>
          Find Match
        </Link>
      </div>
    </nav>
  );
}
