import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">{t('home.badge')}</div>
        <h1 className="hero-title">
          {t('home.heroTitle')}<br />
          <span className="gradient-text">{t('home.heroGradient')}</span>
        </h1>
        <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
        <div className="hero-actions">
          <Link to="/create" className="btn btn-primary">{t('home.cta1')}</Link>
          <Link to="/match" className="btn btn-secondary">{t('home.cta2')}</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">{t('home.howItWorks')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>{t('home.step1Title')}</h3>
            <p>{t('home.step1Desc')}</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">🔗</div>
            <h3>{t('home.step2Title')}</h3>
            <p>{t('home.step2Desc')}</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💡</div>
            <h3>{t('home.step3Title')}</h3>
            <p>{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Match types — 4 cards */}
      <section className="match-types">
        <h2 className="section-title">{t('home.matchTypes')}</h2>
        <div className="type-cards four-col">
          <div className="type-card type-romantic">
            <div className="type-emoji">💕</div>
            <h3>{t('home.romanticTitle')}</h3>
            <p>{t('home.romanticDesc')}</p>
          </div>
          <div className="type-card type-roommate">
            <div className="type-emoji">🏠</div>
            <h3>{t('home.roommateTitle')}</h3>
            <p>{t('home.roommateDesc')}</p>
          </div>
          <div className="type-card type-friend">
            <div className="type-emoji">🤝</div>
            <h3>{t('home.friendTitle')}</h3>
            <p>{t('home.friendDesc')}</p>
          </div>
          <div className="type-card type-travel">
            <div className="type-emoji">✈️</div>
            <h3>{t('home.travelTitle')}</h3>
            <p>{t('home.travelDesc')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>{t('home.ctaTitle')}</h2>
          <p>{t('home.ctaDesc')}</p>
          <Link to="/create" className="btn btn-primary btn-large">{t('home.ctaBtn')}</Link>
        </div>
      </section>
    </main>
  );
}
