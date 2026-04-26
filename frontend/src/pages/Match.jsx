import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import RadarChart from '../components/RadarChart';
import Confetti from '../components/Confetti';
import './Match.css';

const SECTION_LABELS = {
  values: '💎 Values',
  eq: '🧠 Emotional Intelligence',
  behavioral: '⚡ Behavioral',
  lifestyle: '🎯 Lifestyle',
  communication: '💬 Communication',
  partnership: '🤝 Partnership',
  daily: '☀️ Daily Life',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreRing({ score, label, emoji, color }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x="55" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill="#1f2937">{score}</text>
        <text x="55" y="66" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#9ca3af">/ 100</text>
      </svg>
      <div className="ring-emoji">{emoji}</div>
      <div className="ring-label">{label}</div>
    </div>
  );
}

function PersonalityCard({ name, profile, color }) {
  if (!profile) return null;
  const { personality, eq, dimensions } = profile;
  return (
    <div className="personality-card" style={{ '--pc': color }}>
      <div className="pc-emoji">{personality.emoji}</div>
      <div className="pc-name-label">{name}</div>
      <div className="pc-type">{personality.name}</div>
      <div className="pc-eq">
        EQ (Emotional Intelligence): <strong>{eq}/100</strong>
      </div>
      <p className="pc-desc">{personality.desc}</p>
      <div className="pc-dims">
        {Object.entries(dimensions).map(([dim, val]) => (
          <div key={dim} className="dim-row">
            <span className="dim-label">{dimLabel(dim)}</span>
            <div className="dim-bar-track">
              <div className="dim-bar-fill" style={{ width: `${val}%`, background: color }} />
            </div>
            <span className="dim-val">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function dimLabel(k) {
  return {
    commitment: 'Commitment',
    emotionalDepth: 'Emotional Depth',
    adaptability: 'Adaptability',
    communication: 'Communication',
    lifestyle: 'Lifestyle',
  }[k] || k;
}

function SectionBar({ label, score }) {
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="section-bar-row">
      <span className="section-bar-label">{label}</span>
      <div className="section-bar-track">
        <div className="section-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="section-bar-score" style={{ color }}>{score}%</span>
    </div>
  );
}

function CompatBlock({ label, emoji, color, data, defaultOpen = false, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!data) return null;
  const tag = data.score >= 80 ? 'Excellent' : data.score >= 65 ? 'Good' : data.score >= 45 ? 'Moderate' : data.score >= 25 ? 'Low' : 'Minimal';
  return (
    <div className="compat-block" style={{ '--bc': color }}>
      <button className="compat-header" onClick={() => setOpen(o => !o)}>
        <div className="compat-hl">
          <span className="compat-em">{emoji}</span>
          <div>
            <div className="compat-title">
              {label}
              {badge && <span className="compat-badge">{badge}</span>}
            </div>
            <div className="compat-subtag" style={{ color }}>{data.score}% — {tag}</div>
          </div>
        </div>
        <div className="compat-right">
          <div className="mini-bar"><div style={{ width: `${data.score}%`, background: color }} /></div>
          <span>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="compat-body">
          {data.reasons?.length > 0 && (
            <div className="cb-section">
              <div className="cb-head">✅ What works</div>
              <ul>{data.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {data.concerns?.length > 0 && (
            <div className="cb-section">
              <div className="cb-head">⚠️ Watch out for</div>
              <ul className="concerns">{data.concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {(!data.reasons?.length && !data.concerns?.length) && (
            <p className="cb-empty">Not enough answers to generate detailed analysis for this type.</p>
          )}
        </div>
      )}
    </div>
  );
}

const COMPAT_TYPES = [
  { key: 'romantic',  label: 'Romantic',   emoji: '💕', color: '#f472b6' },
  { key: 'roommate',  label: 'Roommate',   emoji: '🏠', color: '#7c3aed' },
  { key: 'friendship',label: 'Friendship', emoji: '🤝', color: '#06b6d4' },
];

function SmartCompatSection({ result }) {
  const [picked, setPicked] = useState(null);

  const sharedTypes = COMPAT_TYPES.filter(t => result[t.key]?.bothSelected);
  const otherTypes  = COMPAT_TYPES.filter(t => !result[t.key]?.bothSelected);

  // If both selected the same type → auto-expand those
  // If not → show a picker
  return (
    <div className="white-card">
      <h3 className="card-title">Compatibility by Relationship Type</h3>

      {sharedTypes.length > 0 && (
        <>
          <div className="shared-badge-row">
            <span className="shared-icon">✨</span>
            <span className="shared-text">
              You're both looking for the same {sharedTypes.length === 1 ? 'thing' : 'things'}
              {' '}— here's a deeper look.
            </span>
          </div>
          <div className="compat-blocks">
            {sharedTypes.map(t => (
              <CompatBlock
                key={t.key}
                label={t.label}
                emoji={t.emoji}
                color={t.color}
                data={result[t.key]}
                defaultOpen
                badge="✓ Both selected"
              />
            ))}
          </div>
        </>
      )}

      {otherTypes.length > 0 && (
        <div className={sharedTypes.length > 0 ? 'explore-other' : ''}>
          {sharedTypes.length > 0 && (
            <p className="explore-label">Curious about other compatibility types?</p>
          )}
          {sharedTypes.length === 0 && (
            <p className="explore-label">Pick what you'd like to explore:</p>
          )}

          <div className="compat-picker">
            {otherTypes.map(t => (
              <button
                key={t.key}
                className={`picker-btn ${picked === t.key ? 'active' : ''}`}
                style={{ '--bc': t.color }}
                onClick={() => setPicked(prev => prev === t.key ? null : t.key)}
              >
                <span>{t.emoji}</span> {t.label}
                <span className="picker-score">{result[t.key]?.score}%</span>
              </button>
            ))}
          </div>

          {picked && (
            <div className="compat-blocks" style={{ marginTop: '1rem' }}>
              {(() => {
                const t = COMPAT_TYPES.find(x => x.key === picked);
                return t ? (
                  <CompatBlock
                    key={t.key}
                    label={t.label}
                    emoji={t.emoji}
                    color={t.color}
                    data={result[t.key]}
                    defaultOpen
                  />
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OpenAnswers({ openAnswers, name1, name2 }) {
  if (!openAnswers?.length) return null;
  return (
    <div className="white-card">
      <h3 className="card-title">💬 In Their Own Words</h3>
      <p className="open-intro">Side-by-side answers to the open questions — see how they think in their own voice.</p>
      <div className="open-answers-list">
        {openAnswers.map((item, i) => (
          <div key={i} className="open-answer-row">
            <div className="open-question">{item.question}</div>
            <div className="open-cols">
              <div className="open-col open-col-a">
                <div className="open-who">{name1}</div>
                <p className="open-text">{item.a || <em className="open-none">Not answered</em>}</p>
              </div>
              <div className="open-col open-col-b">
                <div className="open-who">{name2}</div>
                <p className="open-text">{item.b || <em className="open-none">Not answered</em>}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="skeleton-wrap">
      <div className="skel-card tall" />
      <div className="skel-row">
        <div className="skel-card half" />
        <div className="skel-card half" />
      </div>
      <div className="skel-card" />
      <div className="skel-card" />
    </div>
  );
}

function formatTip(tip) {
  return tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Match() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [id1, setId1] = useState(searchParams.get('p1') || '');
  const [id2, setId2] = useState(searchParams.get('p2') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  const runMatch = useCallback(async (p1, p2) => {
    setError(''); setResult(null); setShowConfetti(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/match?profile1=${p1}&profile2=${p2}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch match');
      setResult(data);
      setSearchParams({ p1, p2 }, { replace: true });
      if (data.overall >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4500);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  // Auto-run if URL params present on first load
  useEffect(() => {
    const p1 = searchParams.get('p1');
    const p2 = searchParams.get('p2');
    if (p1 && p2 && p1 !== p2) {
      runMatch(p1, p2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMatch(e) {
    e.preventDefault();
    if (!id1 || !id2) return setError('Please enter both profile IDs.');
    if (id1 === id2) return setError('Please enter two different profile IDs.');
    runMatch(id1, id2);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const overallLabel = result
    ? result.overall >= 85 ? '🌟 Exceptional Match'
    : result.overall >= 70 ? '💚 Strong Match'
    : result.overall >= 55 ? '🤝 Good Potential'
    : result.overall >= 40 ? '⚡ Work Required'
    : '🔍 Significant Differences'
    : '';

  const radarData = result ? {
    a: { values: Object.values(result.profiles.a.dimensions) },
    b: { values: Object.values(result.profiles.b.dimensions) },
  } : null;

  const radarLabels = ['Commitment', 'Emo. Depth', 'Adaptability', 'Communication', 'Lifestyle'];

  return (
    <div className="match-page">
      <Confetti active={showConfetti} />

      <div className="match-header">
        <h1>Compatibility Check</h1>
        <p>A deep analytical look at how two people fit together.</p>
      </div>

      <form className="match-form" onSubmit={handleMatch}>
        <div className="id-inputs">
          <div className="id-group">
            <label>Profile ID — Person 1</label>
            <input type="number" min="1" value={id1} onChange={e => setId1(e.target.value)} placeholder="e.g. 1" />
          </div>
          <div className="vs-pill">VS</div>
          <div className="id-group">
            <label>Profile ID — Person 2</label>
            <input type="number" min="1" value={id2} onChange={e => setId2(e.target.value)} placeholder="e.g. 2" />
          </div>
        </div>
        {error && <div className="form-error">⚠️ {error}</div>}
        <button type="submit" className="match-btn" disabled={loading}>
          {loading ? '⏳ Analysing...' : '🔍 Calculate Deep Compatibility'}
        </button>
      </form>

      {loading && <Skeleton />}

      {result && (
        <div className="results">

          {/* Share button */}
          <div className="share-row">
            <button className="share-btn" onClick={handleShare}>
              {copied ? '✅ Link copied!' : '🔗 Share these results'}
            </button>
          </div>

          {/* Name Banner */}
          <div className="name-banner">
            <div className="person-tag purple">{result.profile1.name}{result.profile1.age ? `, ${result.profile1.age}` : ''}</div>
            <div className="heart-mid">💜</div>
            <div className="person-tag pink">{result.profile2.name}{result.profile2.age ? `, ${result.profile2.age}` : ''}</div>
          </div>

          {/* Overall Score Card */}
          <div className="overall-card">
            <div className="overall-top">
              <div>
                <div className="overall-label">Overall Compatibility</div>
                <div className="overall-score">{result.overall}%</div>
                <div className="overall-tag">{overallLabel}</div>
                {result.overall >= 80 && (
                  <div className="exceptional-note">🎉 This is a rare high-match score!</div>
                )}
              </div>
              <div className="score-rings">
                <ScoreRing score={result.romantic.score} label="Romantic" emoji="💕" color="#f472b6" />
                <ScoreRing score={result.roommate.score} label="Roommate" emoji="🏠" color="#7c3aed" />
                <ScoreRing score={result.friendship.score} label="Friendship" emoji="🤝" color="#06b6d4" />
              </div>
            </div>
          </div>

          {/* Personality Cards */}
          <div className="personality-grid">
            <PersonalityCard name={result.profile1.name} profile={result.profiles.a} color="#7c3aed" />
            <PersonalityCard name={result.profile2.name} profile={result.profiles.b} color="#db2777" />
          </div>

          {/* Radar Chart */}
          <div className="radar-card">
            <h3 className="card-title">Personality Dimension Comparison</h3>
            <div className="radar-wrap">
              <RadarChart a={radarData.a} b={radarData.b} labels={radarLabels} />
              <div className="radar-legend">
                <div className="legend-item"><span style={{ background: '#7c3aed' }} />{result.profile1.name}</div>
                <div className="legend-item"><span style={{ background: '#db2777' }} />{result.profile2.name}</div>
              </div>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="white-card">
            <h3 className="card-title">Section-by-Section Breakdown</h3>
            <div className="section-bars">
              {Object.entries(result.sections).map(([k, v]) => (
                <SectionBar key={k} label={SECTION_LABELS[k] || k} score={v} />
              ))}
            </div>
          </div>

          {/* Key Insights */}
          {result.insights?.length > 0 && (
            <div className="white-card">
              <h3 className="card-title">💡 Key Insights</h3>
              <div className="insights-list">
                {result.insights.map((ins, i) => (
                  <div key={i} className="insight-item"
                    dangerouslySetInnerHTML={{ __html: ins.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
          )}

          {/* Smart Compatibility Section */}
          <SmartCompatSection result={result} />

          {/* Open Answers */}
          <OpenAnswers
            openAnswers={result.openAnswers}
            name1={result.profile1.name}
            name2={result.profile2.name}
          />

          {/* Tips */}
          <div className="tips-card">
            <h3 className="card-title">🛠️ Practical Tips to Make It Work</h3>
            <ol className="tips-list">
              {result.tips.map((tip, i) => (
                <li key={i} className="tip-item">
                  <div className="tip-num">{i + 1}</div>
                  <p dangerouslySetInnerHTML={{ __html: formatTip(tip) }} />
                </li>
              ))}
            </ol>
          </div>

          <button className="reset-btn" onClick={() => {
            setResult(null); setId1(''); setId2('');
            setSearchParams({}, { replace: true });
          }}>
            Try Another Match
          </button>
        </div>
      )}
    </div>
  );
}
