import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">💜</span>
        <span className="brand-name">MatchMe</span>
      </Link>
      <div className="navbar-links">
        <Link to="/create" className={`nav-link ${pathname === '/create' ? 'active' : ''}`}>
          {t('nav.createProfile')}
        </Link>
        <Link to="/match" className={`nav-link nav-link-cta ${pathname === '/match' ? 'active' : ''}`}>
          {t('nav.findMatch')}
        </Link>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
