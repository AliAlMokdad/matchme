import { useState } from 'react';
import RadarChart from '../components/RadarChart';
import './Match.css';

const SECTION_LABELS = {
  values: '💎 Values', eq: '🧠 Emotional IQ', behavioral: '⚡ Behavioral',
  lifestyle: '🎯 Lifestyle', communication: '💬 Communication',
  partnership: '🤝 Partnership', daily: '☀️ Daily Life',
};

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
      <div className="pc-eq">EQ Score: <strong>{eq}/100</strong></div>
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
  return { commitment: 'Commitment', emotionalDepth: 'Emotional Depth', adaptability: 'Adaptability', communication: 'Communication', lifestyle: 'Lifestyle' }[k] || k;
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

function CompatBlock({ label, emoji, color, data }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const tag = data.score >= 80 ? 'Excellent' : data.score >= 65 ? 'Good' : data.score >= 45 ? 'Moderate' : data.score >= 25 ? 'Low' : 'Not Applicable';
  return (
    <div className="compat-block" style={{ '--bc': color }}>
      <button className="compat-header" onClick={() => setOpen(o => !o)}>
        <div className="compat-hl">
          <span className="compat-em">{emoji}</span>
          <div>
            <div className="compat-title">{label}</div>
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
        </div>
      )}
    </div>
  );
}

function formatTip(tip) {
  return tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export default function Match() {
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleMatch(e) {
    e.preventDefault();
    setError(''); setResult(null);
    if (!id1 || !id2) return setError('Please enter both profile IDs.');
    if (id1 === id2) return setError('Please enter two different profile IDs.');
    setLoading(true);
    try {
      const res = await fetch(`/api/match?profile1=${id1}&profile2=${id2}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch match');
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
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

      {result && (
        <div className="results">

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
              <RadarChart
                a={radarData.a}
                b={radarData.b}
                labels={radarLabels}
              />
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
                  <div key={i} className="insight-item" dangerouslySetInnerHTML={{ __html: ins.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
          )}

          {/* Category Compatibility */}
          <div className="white-card">
            <h3 className="card-title">Compatibility by Relationship Type</h3>
            <div className="compat-blocks">
              <CompatBlock label="Romantic" emoji="💕" color="#f472b6" data={result.romantic} />
              <CompatBlock label="Roommate" emoji="🏠" color="#7c3aed" data={result.roommate} />
              <CompatBlock label="Friendship" emoji="🤝" color="#06b6d4" data={result.friendship} />
            </div>
          </div>

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

          <button className="reset-btn" onClick={() => { setResult(null); setId1(''); setId2(''); }}>
            Try Another Match
          </button>
        </div>
      )}
    </div>
  );
}
