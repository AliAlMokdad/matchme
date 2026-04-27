import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RadarChart from '../components/RadarChart';
import Confetti from '../components/Confetti';
import './Match.css';

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

function PersonalityCard({ name, profile, color, dimLabels }) {
  if (!profile) return null;
  const { personality, eq, dimensions } = profile;
  return (
    <div className="personality-card" style={{ '--pc': color }}>
      <div className="pc-emoji">{personality.emoji}</div>
      <div className="pc-name-label">{name}</div>
      <div className="pc-type">{personality.name}</div>
      <div className="pc-eq">
        EQ: <strong>{eq}/100</strong>
      </div>
      <p className="pc-desc">{personality.desc}</p>
      <div className="pc-dims">
        {Object.entries(dimensions).map(([dim, val]) => (
          <div key={dim} className="dim-row">
            <span className="dim-label">{dimLabels[dim] || dim}</span>
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

function CompatBlock({ label, emoji, color, data, defaultOpen = false, badge, t }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!data) return null;
  const score = data.score;
  const tag = score >= 80 ? t('match.tagExcellent') : score >= 65 ? t('match.tagGood')
    : score >= 45 ? t('match.tagModerate') : score >= 25 ? t('match.tagLow') : t('match.tagMinimal');
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
            <div className="compat-subtag" style={{ color }}>{score}% — {tag}</div>
          </div>
        </div>
        <div className="compat-right">
          <div className="mini-bar"><div style={{ width: `${score}%`, background: color }} /></div>
          <span>{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="compat-body">
          {data.reasons?.length > 0 && (
            <div className="cb-section">
              <div className="cb-head">{t('match.whatWorks')}</div>
              <ul>{data.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          {data.concerns?.length > 0 && (
            <div className="cb-section">
              <div className="cb-head">{t('match.watchOut')}</div>
              <ul className="concerns">{data.concerns.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {(!data.reasons?.length && !data.concerns?.length) && (
            <p className="cb-empty">{t('match.noAnalysis')}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SmartCompatSection({ result, t }) {
  const [picked, setPicked] = useState(null);

  const COMPAT_TYPES = [
    { key: 'romantic',   label: t('match.romantic'),   emoji: '💕', color: '#f472b6' },
    { key: 'roommate',   label: t('match.roommate'),   emoji: '🏠', color: '#7c3aed' },
    { key: 'friendship', label: t('match.friendship'), emoji: '🤝', color: '#06b6d4' },
    { key: 'travel',     label: t('match.travel'),     emoji: '✈️', color: '#f59e0b' },
  ].filter(tp => result[tp.key] != null);

  const sharedTypes = COMPAT_TYPES.filter(tp => result[tp.key]?.bothSelected);
  const otherTypes  = COMPAT_TYPES.filter(tp => !result[tp.key]?.bothSelected);

  return (
    <div className="white-card">
      <h3 className="card-title">{t('match.compatTitle')}</h3>

      {sharedTypes.length > 0 && (
        <>
          <div className="shared-badge-row">
            <span className="shared-icon">✨</span>
            <span className="shared-text">
              {t('match.sharedText')}{' '}
              {sharedTypes.length === 1 ? t('match.sharedThing') : t('match.sharedThings')}{' '}
              {t('match.sharedSuffix')}
            </span>
          </div>
          <div className="compat-blocks">
            {sharedTypes.map(tp => (
              <CompatBlock key={tp.key} label={tp.label} emoji={tp.emoji} color={tp.color}
                data={result[tp.key]} defaultOpen badge={t('match.bothSelected')} t={t} />
            ))}
          </div>
        </>
      )}

      {otherTypes.length > 0 && (
        <div className={sharedTypes.length > 0 ? 'explore-other' : ''}>
          <p className="explore-label">
            {sharedTypes.length > 0 ? t('match.explore') : t('match.pickExplore')}
          </p>
          <div className="compat-picker">
            {otherTypes.map(tp => (
              <button
                key={tp.key}
                className={`picker-btn ${picked === tp.key ? 'active' : ''}`}
                style={{ '--bc': tp.color }}
                onClick={() => setPicked(prev => prev === tp.key ? null : tp.key)}
              >
                <span>{tp.emoji}</span> {tp.label}
                <span className="picker-score">{result[tp.key]?.score}%</span>
              </button>
            ))}
          </div>
          {picked && (
            <div className="compat-blocks" style={{ marginTop: '1rem' }}>
              {(() => {
                const tp = COMPAT_TYPES.find(x => x.key === picked);
                return tp ? (
                  <CompatBlock key={tp.key} label={tp.label} emoji={tp.emoji} color={tp.color}
                    data={result[tp.key]} defaultOpen t={t} />
                ) : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OpenAnswers({ openAnswers, name1, name2, t }) {
  if (!openAnswers?.length) return null;
  return (
    <div className="white-card">
      <h3 className="card-title">{t('match.openAnswers')}</h3>
      <p className="open-intro">{t('match.openIntro')}</p>
      <div className="open-answers-list">
        {openAnswers.map((item, i) => (
          <div key={i} className="open-answer-row">
            <div className="open-question">{item.question}</div>
            <div className="open-cols">
              <div className="open-col open-col-a">
                <div className="open-who">{name1}</div>
                <p className="open-text">{item.a || <em className="open-none">{t('match.notAnswered')}</em>}</p>
              </div>
              <div className="open-col open-col-b">
                <div className="open-who">{name2}</div>
                <p className="open-text">{item.b || <em className="open-none">{t('match.notAnswered')}</em>}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AISection({ result, lang, t }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile1: result.profile1,
          profile2: result.profile2,
          result: {
            overall: result.overall,
            sections: result.sections,
            openAnswers: result.openAnswers,
          },
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI failed');
      setAiData(data);
      setGenerated(true);
    } catch (e) {
      setError(t('match.aiError'));
    } finally {
      setLoading(false);
    }
  }

  if (!generated && !loading) {
    return (
      <div className="ai-teaser-card">
        <div className="ai-teaser-icon">🤖</div>
        <div className="ai-teaser-text">
          <strong>{t('match.aiNarrative')}</strong>
          <p>Get a personalised, AI-written analysis of this match — unique insights, an icebreaker message, and communication style profiles.</p>
        </div>
        <button className="ai-gen-btn" onClick={generate}>{t('match.aiBtn')}</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ai-loading-card">
        <div className="ai-spinner" />
        <p>{t('match.aiGenerating')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-error-card">
        <p>⚠️ {error}</p>
        <button className="ai-retry-btn" onClick={generate}>{t('match.aiBtn')}</button>
      </div>
    );
  }

  return (
    <div className="ai-result-card">
      {/* Narrative */}
      <div className="ai-section-head">
        <span className="ai-badge">✨ AI</span>
        <h3>{t('match.aiNarrative')}</h3>
      </div>
      <div className="ai-narrative">
        {aiData.narrative.split('\n').filter(Boolean).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Personalities */}
      {aiData.personalities && (
        <div className="ai-personalities">
          <h4>{t('match.aiPersonalities')}</h4>
          <div className="ai-pers-grid">
            <div className="ai-pers-item">
              <div className="ai-pers-name">{result.profile1.name}</div>
              <p>{aiData.personalities.a}</p>
            </div>
            <div className="ai-pers-item">
              <div className="ai-pers-name">{result.profile2.name}</div>
              <p>{aiData.personalities.b}</p>
            </div>
          </div>
        </div>
      )}

      {/* Open Similarity */}
      {aiData.openSimilarity != null && (
        <div className="ai-similarity">
          <span className="ai-sim-label">{t('match.aiSimilarity')}</span>
          <div className="ai-sim-bar-wrap">
            <div className="ai-sim-bar">
              <div className="ai-sim-fill" style={{ width: `${aiData.openSimilarity}%` }} />
            </div>
            <span className="ai-sim-val">{aiData.openSimilarity}%</span>
          </div>
        </div>
      )}

      {/* Icebreaker */}
      {aiData.icebreaker && (
        <div className="ai-icebreaker">
          <h4>{t('match.aiIcebreaker')}</h4>
          <div className="ai-ice-bubble">
            <span className="ai-ice-quote">"</span>
            {aiData.icebreaker}
            <span className="ai-ice-quote">"</span>
          </div>
        </div>
      )}
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
  const { t, i18n } = useTranslation();

  const [id1, setId1] = useState(searchParams.get('p1') || '');
  const [id2, setId2] = useState(searchParams.get('p2') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  const sectionLabels = t('match.sectionLabels', { returnObjects: true });
  const dimLabels = t('match.dimLabels', { returnObjects: true });

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

  useEffect(() => {
    const p1 = searchParams.get('p1');
    const p2 = searchParams.get('p2');
    if (p1 && p2 && p1 !== p2) runMatch(p1, p2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMatch(e) {
    e.preventDefault();
    if (!id1 || !id2) return setError(t('match.errEnterIds'));
    if (id1 === id2) return setError(t('match.errDifferentIds'));
    runMatch(id1, id2);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  const overallLabel = result
    ? result.overall >= 85 ? t('match.labelExcellent')
    : result.overall >= 70 ? t('match.labelStrong')
    : result.overall >= 55 ? t('match.labelGood')
    : result.overall >= 40 ? t('match.labelWork')
    : t('match.labelDiff')
    : '';

  const radarData = result ? {
    a: { values: Object.values(result.profiles.a.dimensions) },
    b: { values: Object.values(result.profiles.b.dimensions) },
  } : null;

  const radarLabels = Object.values(dimLabels || {
    commitment: 'Commitment', emotionalDepth: 'Emo. Depth',
    adaptability: 'Adaptability', communication: 'Communication', lifestyle: 'Lifestyle',
  });

  // Determine which score rings to show (only show travel if both selected it)
  const rings = result ? [
    { score: result.romantic.score,   label: t('match.romantic'),   emoji: '💕', color: '#f472b6' },
    { score: result.roommate.score,   label: t('match.roommate'),   emoji: '🏠', color: '#7c3aed' },
    { score: result.friendship.score, label: t('match.friendship'), emoji: '🤝', color: '#06b6d4' },
    ...(result.travel?.bothSelected ? [{ score: result.travel.score, label: t('match.travel'), emoji: '✈️', color: '#f59e0b' }] : []),
  ] : [];

  return (
    <div className="match-page">
      <Confetti active={showConfetti} />

      <div className="match-header">
        <h1>{t('match.title')}</h1>
        <p>{t('match.subtitle')}</p>
      </div>

      <form className="match-form" onSubmit={handleMatch}>
        <div className="id-inputs">
          <div className="id-group">
            <label>{t('match.person1')}</label>
            <input type="number" min="1" value={id1} onChange={e => setId1(e.target.value)}
              placeholder={t('match.placeholder')} />
          </div>
          <div className="vs-pill">{t('match.vs')}</div>
          <div className="id-group">
            <label>{t('match.person2')}</label>
            <input type="number" min="1" value={id2} onChange={e => setId2(e.target.value)}
              placeholder={t('match.placeholder')} />
          </div>
        </div>
        {error && <div className="form-error">⚠️ {error}</div>}
        <button type="submit" className="match-btn" disabled={loading}>
          {loading ? t('match.calculating') : t('match.calculate')}
        </button>
      </form>

      {loading && <Skeleton />}

      {result && (
        <div className="results">

          {/* Share */}
          <div className="share-row">
            <button className="share-btn" onClick={handleShare}>
              {copied ? t('match.copied') : t('match.shareBtn')}
            </button>
          </div>

          {/* Name Banner */}
          <div className="name-banner">
            <div className="person-tag purple">
              {result.profile1.name}{result.profile1.age ? `, ${result.profile1.age}` : ''}
            </div>
            <div className="heart-mid">💜</div>
            <div className="person-tag pink">
              {result.profile2.name}{result.profile2.age ? `, ${result.profile2.age}` : ''}
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="overall-card">
            <div className="overall-top">
              <div>
                <div className="overall-label">{t('match.overall')}</div>
                <div className="overall-score">{result.overall}%</div>
                <div className="overall-tag">{overallLabel}</div>
                {result.overall >= 80 && (
                  <div className="exceptional-note">{t('match.exceptional')}</div>
                )}
              </div>
              <div className="score-rings">
                {rings.map(r => (
                  <ScoreRing key={r.label} score={r.score} label={r.label} emoji={r.emoji} color={r.color} />
                ))}
              </div>
            </div>
          </div>

          {/* Personality Cards */}
          <div className="personality-grid">
            <PersonalityCard name={result.profile1.name} profile={result.profiles.a}
              color="#7c3aed" dimLabels={dimLabels} />
            <PersonalityCard name={result.profile2.name} profile={result.profiles.b}
              color="#db2777" dimLabels={dimLabels} />
          </div>

          {/* Radar Chart */}
          <div className="radar-card">
            <h3 className="card-title">{t('match.personalityDimensions')}</h3>
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
            <h3 className="card-title">{t('match.sectionBreakdown')}</h3>
            <div className="section-bars">
              {Object.entries(result.sections).map(([k, v]) => (
                <SectionBar key={k} label={(sectionLabels && sectionLabels[k]) || k} score={v} />
              ))}
            </div>
          </div>

          {/* Key Insights */}
          {result.insights?.length > 0 && (
            <div className="white-card">
              <h3 className="card-title">{t('match.keyInsights')}</h3>
              <div className="insights-list">
                {result.insights.map((ins, i) => (
                  <div key={i} className="insight-item"
                    dangerouslySetInnerHTML={{ __html: ins.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </div>
            </div>
          )}

          {/* Smart Compatibility Section */}
          <SmartCompatSection result={result} t={t} />

          {/* AI Section */}
          <AISection result={result} lang={i18n.language || 'en'} t={t} />

          {/* Open Answers */}
          <OpenAnswers
            openAnswers={result.openAnswers}
            name1={result.profile1.name}
            name2={result.profile2.name}
            t={t}
          />

          {/* Tips */}
          <div className="tips-card">
            <h3 className="card-title">{t('match.tipsTitle')}</h3>
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
            {t('match.tryAnother')}
          </button>
        </div>
      )}
    </div>
  );
}
