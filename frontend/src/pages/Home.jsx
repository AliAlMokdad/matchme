import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">✨ Find your people</div>
        <h1 className="hero-title">
          Discover Real<br />
          <span className="gradient-text">Compatibility</span>
        </h1>
        <p className="hero-subtitle">
          MatchMe compares two profiles and gives you an honest compatibility score
          for romantic partners, roommates, and friendships — plus real advice on making it work.
        </p>
        <div className="hero-actions">
          <Link to="/create" className="btn btn-primary">Create My Profile</Link>
          <Link to="/match" className="btn btn-secondary">Check Compatibility</Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Fill Your Profile</h3>
            <p>Answer a few questions about your personality, lifestyle, and what you're looking for.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-icon">🔗</div>
            <h3>Share Your ID</h3>
            <p>Get your unique profile ID and share it with the person you want to check compatibility with.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-icon">💡</div>
            <h3>Get Your Score</h3>
            <p>See romantic, roommate, and friendship scores with a full explanation and practical tips.</p>
          </div>
        </div>
      </section>

      {/* Match types */}
      <section className="match-types">
        <h2 className="section-title">Three Types of Compatibility</h2>
        <div className="type-cards">
          <div className="type-card type-romantic">
            <div className="type-emoji">💕</div>
            <h3>Romantic</h3>
            <p>Are you ready for a relationship? We look at personality, sleep schedules, shared interests, and life alignment.</p>
          </div>
          <div className="type-card type-roommate">
            <div className="type-emoji">🏠</div>
            <h3>Roommate</h3>
            <p>Living together is serious. We weigh cleanliness, sleep habits, and city match to see if you'd thrive under one roof.</p>
          </div>
          <div className="type-card type-friend">
            <div className="type-emoji">🤝</div>
            <h3>Friendship</h3>
            <p>Great friendships are built on shared passions. We find your common hobbies and personality fit for lasting bonds.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to find out?</h2>
          <p>Create your profile in under 2 minutes.</p>
          <Link to="/create" className="btn btn-primary btn-large">Get Started →</Link>
        </div>
      </section>
    </main>
  );
}
