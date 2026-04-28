import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RadarChart from '../components/RadarChart';
import Confetti from '../components/Confetti';
import useCountUp from '../hooks/useCountUp';
import './Match.css';

// ─── Attention: Score Tier System ────────────────────────────────────────────
// Each tier has its own visual DNA — colour, label, emoji, tagline.
const TIERS = [
  { min: 88, emoji: '🔥', label: 'Exceptional Match',   color: '#f43f5e', glow: 'rgba(244,63,94,0.35)',   tagline: 'Rare. This is what people spend years searching for.' },
  { min: 75, emoji: '💚', label: 'Strong Match',         color: '#22c55e', glow: 'rgba(34,197,94,0.3)',    tagline: 'Real alignment. You have something worth building on.' },
  { min: 60, emoji: '🤝', label: 'Good Potential',       color: '#3b82f6', glow: 'rgba(59,130,246,0.3)',   tagline: 'Solid foundation. With intention, this could thrive.' },
  { min: 42, emoji: '⚡', label: 'Work Required',        color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',   tagline: 'Real differences exist — but awareness is the first step.' },
  { min:  0, emoji: '🔍', label: 'Significant Differences', color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)', tagline: 'Very different people. That can be growth — if you both choose it.' },
];

function getTier(score) {
  return TIERS.find(t => score >= t.min) || TIERS[TIERS.length - 1];
}

// ─── Animated Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, label, emoji, color, delay = 0 }) {
  const displayed = useCountUp(score, 1200, delay);
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (displayed / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 0.05s linear' }} />
        <text x="55" y="50" textAnchor="middle" dominantBaseline="middle"
          fontSize="18" fontWeight="800" fill="#1f2937">{displayed}</text>
        <text x="55" y="66" textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fill="#9ca3af">/ 100</text>
      </svg>
      <div className="ring-emoji">{emoji}</div>
      <div className="ring-label">{label}</div>
    </div>
  );
}

// ─── Personality Card ─────────────────────────────────────────────────────────
function PersonalityCard({ name, profile, color, dimLabels }) {
  if (!profile) return null;
  const { personality, eq, dimensions } = profile;
  return (
    <div className="personality-card" style={{ '--pc': color }}>
      <div className="pc-emoji">{personality.emoji}</div>
      <div className="pc-name-label">{name}</div>
      <div className="pc-type">{personality.name}</div>
      <div className="pc-eq">EQ <strong>{eq}/100</strong></div>
      <p className="pc-desc">{personality.desc}</p>
      <div className="pc-dims">
        {Object.entries(dimensions).map(([dim, val]) => (
          <DimBar key={dim} label={dimLabels[dim] || dim} val={val} color={color} />
        ))}
      </div>
    </div>
  );
}

function DimBar({ label, val, color }) {
  const displayed = useCountUp(val, 900, 200);
  return (
    <div className="dim-row">
      <span className="dim-label">{label}</span>
      <div className="dim-bar-track">
        <div className="dim-bar-fill" style={{ width: `${displayed}%`, background: color }} />
      </div>
      <span className="dim-val">{displayed}</span>
    </div>
  );
}

// ─── Section Bar ──────────────────────────────────────────────────────────────
function SectionBar({ label, score, delay = 0 }) {
  const displayed = useCountUp(score, 900, delay);
  const color = score >= 75 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div className="section-bar-row">
      <span className="section-bar-label">{label}</span>
      <div className="section-bar-track">
        <div className="section-bar-fill" style={{ width: `${displayed}%`, background: color }} />
      </div>
      <span className="section-bar-score" style={{ color }}>{displayed}%</span>
    </div>
  );
}

// ─── Compat Block ─────────────────────────────────────────────────────────────
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
          <span className="compat-arrow">{open ? '▲' : '▼'}</span>
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

// ─── Smart Compat Section ─────────────────────────────────────────────────────
function SmartCompatSection({ result, t }) {
  const [picked, setPicked] = useState(null);

  const COMPAT_TYPES = [
    { key: 'romantic',   label: t('match.romantic'),   emoji: '💕', color: '#f43f5e' },
    { key: 'roommate',   label: t('match.roommate'),   emoji: '🏠', color: '#7c3aed' },
    { key: 'friendship', label: t('match.friendship'), emoji: '🤝', color: '#06b6d4' },
    { key: 'travel',     label: t('match.travel'),     emoji: '✈️', color: '#f59e0b' },
  ].filter(tp => result[tp.key] != null);

  const sharedTypes = COMPAT_TYPES.filter(tp => result[tp.key]?.bothSelected);
  const otherTypes  = COMPAT_TYPES.filter(tp => !result[tp.key]?.bothSelected);

  return (
    <div className="white-card reveal-card">
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
              <button key={tp.key}
                className={`picker-btn ${picked === tp.key ? 'active' : ''}`}
                style={{ '--bc': tp.color }}
                onClick={() => setPicked(prev => prev === tp.key ? null : tp.key)}>
                <span>{tp.emoji}</span> {tp.label}
                <span className="picker-score">{result[tp.key]?.score}%</span>
              </button>
            ))}
          </div>
          {picked && (
            <div className="compat-blocks" style={{ marginTop: '1rem' }}>
              {(() => {
                const tp = COMPAT_TYPES.find(x => x.key === picked);
                return tp ? <CompatBlock key={tp.key} label={tp.label} emoji={tp.emoji}
                  color={tp.color} data={result[tp.key]} defaultOpen t={t} /> : null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Open Answers ─────────────────────────────────────────────────────────────
function OpenAnswers({ openAnswers, name1, name2, t }) {
  if (!openAnswers?.length) return null;
  return (
    <div className="white-card reveal-card">
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

// ─── AI Section ───────────────────────────────────────────────────────────────
function AISection({ result, lang, t }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile1: result.profile1,
          profile2: result.profile2,
          result: { overall: result.overall, sections: result.sections, openAnswers: result.openAnswers },
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI failed');
      setAiData(data); setGenerated(true);
    } catch {
      setError(t('match.aiError'));
    } finally {
      setLoading(false);
    }
  }

  if (!generated && !loading) return (
    <div className="ai-teaser-card">
      <div className="ai-teaser-icon">🤖</div>
      <div className="ai-teaser-text">
        <strong>{t('match.aiNarrative')}</strong>
        <p>Personalised AI analysis — unique insights, a handcrafted icebreaker, and communication style profiles written just for these two people.</p>
      </div>
      <button className="ai-gen-btn" onClick={generate}>{t('match.aiBtn')}</button>
    </div>
  );

  if (loading) return (
    <div className="ai-loading-card">
      <div className="ai-pulse-dots"><span /><span /><span /></div>
      <p>{t('match.aiGenerating')}</p>
    </div>
  );

  if (error) return (
    <div className="ai-error-card">
      <p>⚠️ {error}</p>
      <button className="ai-retry-btn" onClick={generate}>{t('match.aiBtn')}</button>
    </div>
  );

  return (
    <div className="ai-result-card reveal-card">
      <div className="ai-section-head">
        <span className="ai-badge">✨ AI</span>
        <h3>{t('match.aiNarrative')}</h3>
      </div>
      <div className="ai-narrative">
        {aiData.narrative.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
      </div>
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

// ─── Calculating Screen (builds anticipation) ─────────────────────────────────
function CalculatingScreen() {
  const steps = [
    '🧠 Reading personality signatures...',
    '💬 Matching communication styles...',
    '💎 Weighing values alignment...',
    '⚡ Running behavioural analysis...',
    '✨ Generating compatibility score...',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < steps.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 650);
      return () => clearTimeout(t);
    }
  }, [step, steps.length]);

  return (
    <div className="calculating-screen">
      <div className="calc-orb" />
      <div className="calc-steps">
        {steps.map((s, i) => (
          <div key={i} className={`calc-step ${i <= step ? 'visible' : ''} ${i < step ? 'done' : ''}`}>
            {i < step ? '✓ ' : i === step ? '⟳ ' : '  '}{s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Intersection Observer for scroll reveals ─────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function RevealCard({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`reveal-wrapper ${visible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function formatTip(tip) {
  return tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// ─── Main Match Page ──────────────────────────────────────────────────────────
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
  const [revealed, setRevealed] = useState(false);

  const sectionLabels = t('match.sectionLabels', { returnObjects: true });
  const dimLabels = t('match.dimLabels', { returnObjects: true });

  const runMatch = useCallback(async (p1, p2) => {
    setError(''); setResult(null); setShowConfetti(false); setRevealed(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/match?profile1=${p1}&profile2=${p2}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch match');
      setResult(data);
      setSearchParams({ p1, p2 }, { replace: true });
      // Delay reveal for dramatic effect
      setTimeout(() => setRevealed(true), 100);
      if (data.overall >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
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

  const tier = result ? getTier(result.overall) : null;
  const overallDisplayed = useCountUp(result ? result.overall : 0, 1600, 300);

  const radarLabels = Object.values(dimLabels || {
    commitment: 'Commitment', emotionalDepth: 'Emo. Depth',
    adaptability: 'Adaptability', communication: 'Communication', lifestyle: 'Lifestyle',
  });

  const rings = result ? [
    { score: result.romantic.score,   label: t('match.romantic'),   emoji: '💕', color: '#f43f5e', delay: 200 },
    { score: result.roommate.score,   label: t('match.roommate'),   emoji: '🏠', color: '#7c3aed', delay: 400 },
    { score: result.friendship.score, label: t('match.friendship'), emoji: '🤝', color: '#06b6d4', delay: 600 },
    ...(result.travel?.bothSelected ? [{ score: result.travel.score, label: t('match.travel'), emoji: '✈️', color: '#f59e0b', delay: 800 }] : []),
  ] : [];

  return (
    <div className="match-page">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="match-header">
        <h1>{t('match.title')}</h1>
        <p>{t('match.subtitle')}</p>
      </div>

      {/* Form */}
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

      {/* Calculating screen — builds anticipation */}
      {loading && <CalculatingScreen />}

      {result && revealed && (
        <div className={`results ${revealed ? 'results-visible' : ''}`}>

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

          {/* Overall Score — centrepiece, full tier identity */}
          <div className="overall-card tier-card" style={{ '--tier-color': tier.color, '--tier-glow': tier.glow }}>
            <div className="tier-glow-ring" />
            <div className="overall-top">
              <div className="overall-left">
                <div className="tier-emoji-large">{tier.emoji}</div>
                <div className="overall-score-num">{overallDisplayed}%</div>
                <div className="overall-label">{t('match.overall')}</div>
                <div className="tier-label" style={{ color: tier.color }}>{tier.label}</div>
                <div className="tier-tagline">"{tier.tagline}"</div>
                {result.overall >= 80 && (
                  <div className="exceptional-note">🎉 {t('match.exceptional')}</div>
                )}
              </div>
              <div className="score-rings">
                {rings.map(r => (
                  <ScoreRing key={r.label} score={r.score} label={r.label}
                    emoji={r.emoji} color={r.color} delay={r.delay} />
                ))}
              </div>
            </div>
          </div>

          {/* Personality Cards */}
          <RevealCard delay={0}>
            <div className="personality-grid">
              <PersonalityCard name={result.profile1.name} profile={result.profiles.a}
                color="#7c3aed" dimLabels={dimLabels} />
              <PersonalityCard name={result.profile2.name} profile={result.profiles.b}
                color="#db2777" dimLabels={dimLabels} />
            </div>
          </RevealCard>

          {/* Radar Chart */}
          <RevealCard delay={100}>
            <div className="radar-card">
              <h3 className="card-title">{t('match.personalityDimensions')}</h3>
              <div className="radar-wrap">
                <RadarChart
                  a={{ values: Object.values(result.profiles.a.dimensions) }}
                  b={{ values: Object.values(result.profiles.b.dimensions) }}
                  labels={radarLabels}
                />
                <div className="radar-legend">
                  <div className="legend-item"><span style={{ background: '#7c3aed' }} />{result.profile1.name}</div>
                  <div className="legend-item"><span style={{ background: '#db2777' }} />{result.profile2.name}</div>
                </div>
              </div>
            </div>
          </RevealCard>

          {/* Section Breakdown */}
          <RevealCard delay={150}>
            <div className="white-card">
              <h3 className="card-title">{t('match.sectionBreakdown')}</h3>
              <div className="section-bars">
                {Object.entries(result.sections).map(([k, v], i) => (
                  <SectionBar key={k} label={(sectionLabels && sectionLabels[k]) || k}
                    score={v} delay={i * 80} />
                ))}
              </div>
            </div>
          </RevealCard>

          {/* Key Insights */}
          {result.insights?.length > 0 && (
            <RevealCard delay={200}>
              <div className="white-card">
                <h3 className="card-title">{t('match.keyInsights')}</h3>
                <div className="insights-list">
                  {result.insights.map((ins, i) => (
                    <div key={i} className="insight-item"
                      dangerouslySetInnerHTML={{ __html: ins.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </div>
              </div>
            </RevealCard>
          )}

          {/* Smart Compat */}
          <RevealCard delay={250}>
            <SmartCompatSection result={result} t={t} />
          </RevealCard>

          {/* AI Section */}
          <RevealCard delay={300}>
            <AISection result={result} lang={i18n.language || 'en'} t={t} />
          </RevealCard>

          {/* Open Answers */}
          <RevealCard delay={350}>
            <OpenAnswers openAnswers={result.openAnswers}
              name1={result.profile1.name} name2={result.profile2.name} t={t} />
          </RevealCard>

          {/* Tips */}
          <RevealCard delay={400}>
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
          </RevealCard>

          <button className="reset-btn" onClick={() => {
            setResult(null); setId1(''); setId2('');
            setSearchParams({}, { replace: true });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}>
            {t('match.tryAnother')}
          </button>
        </div>
      )}
    </div>
  );
}
