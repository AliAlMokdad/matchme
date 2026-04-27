import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSectionsFor } from '../data/questions';
import QuestionStep from '../components/QuestionStep';
import CityAutocomplete from '../components/CityAutocomplete';
import './CreateProfile.css';

const STORAGE_KEY = 'matchme_draft';

export default function CreateProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(0);
  const [basic, setBasic] = useState({
    name: '', age: '', gender: '', city: '',
    looking_for: [], what_i_bring: '', deal_breakers: '',
  });
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Adaptive sections based on looking_for selection
  const sections = useMemo(() => getSectionsFor(basic.looking_for), [basic.looking_for]);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (draft) {
        if (draft.basic) setBasic(draft.basic);
        if (draft.answers) setAnswers(draft.answers);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ basic, answers }));
  }, [basic, answers]);

  const totalSteps = sections.length + 1; // +1 for basic info
  const progress = Math.round((step / totalSteps) * 100);
  const currentSection = step > 0 ? sections[step - 1] : null;

  function setAnswer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  }

  function toggleLookingFor(val) {
    setBasic(b => ({
      ...b,
      looking_for: b.looking_for.includes(val)
        ? b.looking_for.filter(v => v !== val)
        : [...b.looking_for, val],
    }));
    // Reset to step 0 if user changes looking_for to avoid invalid section index
    if (step > 0) {
      setStep(0);
      setError('');
    }
  }

  function validateStep() {
    if (step === 0) {
      if (!basic.name.trim()) return t('create.errorName');
      if (!basic.age || Number(basic.age) < 16) return t('create.errorAge');
      if (basic.looking_for.length === 0) return t('create.errorLookingFor');
    }
    if (currentSection) {
      const required = currentSection.questions.filter(q => q.type !== 'text');
      const unanswered = required.filter(q => answers[q.id] == null);
      if (unanswered.length > 0) {
        return `${t('create.errorAnswers')} (${unanswered.length} ${t('create.remaining')}).`;
      }
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    setError('');
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: basic.name,
          age: parseInt(basic.age),
          gender: basic.gender,
          city: basic.city,
          looking_for: basic.looking_for,
          what_i_bring: basic.what_i_bring,
          deal_breakers: basic.deal_breakers,
          responses: { ...answers, looking_for: basic.looking_for },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');
      localStorage.removeItem(STORAGE_KEY);
      setCreated(data.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(String(created));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const LOOKING_FOR_OPTIONS = [
    { value: 'romantic', label: t('create.romantic') },
    { value: 'roommate', label: t('create.roommate') },
    { value: 'friend',   label: t('create.friend') },
    { value: 'travel',   label: t('create.travel') },
  ];

  const GENDER_OPTIONS = t('create.genderOptions', { returnObjects: true });

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="create-page">
        <div className="success-card">
          <div className="success-burst">🎉</div>
          <h2>{t('create.successTitle')} {basic.name}!</h2>
          <p>{t('create.successDesc')}</p>
          <div className="id-display">
            <div className="id-label">{t('create.profileId')}</div>
            <div className="id-number">#{created}</div>
            <button className="copy-btn" onClick={copyId}>
              {copied ? t('create.copied') : t('create.copyId')}
            </button>
          </div>
          <div className="success-hint">
            {t('create.successHint')}
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/match')}>
              {t('create.findMatchBtn')}
            </button>
            <button className="btn btn-outline" onClick={() => {
              setCreated(null); setStep(0);
              setBasic({ name:'',age:'',gender:'',city:'',looking_for:[],what_i_bring:'',deal_breakers:'' });
              setAnswers({});
            }}>
              {t('create.createAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      {/* Header */}
      <div className="create-header">
        <h1>{step === 0 ? t('create.title') : currentSection?.title}</h1>
        <p>{step === 0 ? t('create.subtitle') : currentSection?.description}</p>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-steps">
          {['👤', ...sections.map(s => s.icon)].map((label, i) => (
            <button
              key={i}
              className={`progress-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => i < step && setStep(i)}
              title={i === 0 ? t('create.title') : sections[i - 1]?.title}
            >
              {i < step ? '✓' : label}
            </button>
          ))}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          {t('create.stepOf')} {step + 1} {t('create.of')} {totalSteps}
          {currentSection ? ` — ${currentSection.title}` : ''}
        </div>
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="form-card">
          <div className="form-grid-2">
            {/* Name */}
            <div className="form-group">
              <label>{t('create.name')}<span className="req"> *</span></label>
              <input
                type="text"
                value={basic.name}
                placeholder="e.g. Alex"
                onChange={e => setBasic(b => ({ ...b, name: e.target.value }))}
              />
            </div>

            {/* Age */}
            <div className="form-group">
              <label>{t('create.age')}<span className="req"> *</span></label>
              <input
                type="number"
                value={basic.age}
                placeholder="e.g. 27"
                min={16} max={99}
                onChange={e => setBasic(b => ({ ...b, age: e.target.value }))}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label>{t('create.gender')}</label>
              <select value={basic.gender} onChange={e => setBasic(b => ({ ...b, gender: e.target.value }))}>
                {(Array.isArray(GENDER_OPTIONS) ? GENDER_OPTIONS : ['', 'Man', 'Woman', 'Non-binary', 'Other / Prefer not to say'])
                  .map((o, i) => <option key={i} value={o}>{o || 'Select...'}</option>)}
              </select>
            </div>

            {/* City — autocomplete */}
            <div className="form-group">
              <label>{t('create.city')}</label>
              <CityAutocomplete
                value={basic.city}
                onChange={val => setBasic(b => ({ ...b, city: val }))}
                placeholder={t('create.cityPlaceholder')}
              />
            </div>
          </div>

          {/* Looking for */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>{t('create.lookingFor')}<span className="req"> *</span></label>
            <p className="field-hint">{t('create.lookingForHint')}</p>
            <div className="looking-for-group">
              {LOOKING_FOR_OPTIONS.map(l => (
                <label key={l.value} className={`lf-card ${basic.looking_for.includes(l.value) ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={basic.looking_for.includes(l.value)}
                    onChange={() => toggleLookingFor(l.value)}
                  />
                  {l.label}
                </label>
              ))}
            </div>
            {basic.looking_for.includes('travel') && (
              <p className="travel-hint">✈️ Travel sections will be added to your assessment.</p>
            )}
          </div>

          {/* What I bring */}
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>{t('create.whatIBring')}</label>
            <textarea
              value={basic.what_i_bring}
              rows={3}
              placeholder={t('create.whatIBringPlaceholder')}
              onChange={e => setBasic(b => ({ ...b, what_i_bring: e.target.value }))}
            />
          </div>

          {/* Deal breakers */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>{t('create.dealBreakers')}</label>
            <textarea
              value={basic.deal_breakers}
              rows={3}
              placeholder={t('create.dealBreakersPlaceholder')}
              onChange={e => setBasic(b => ({ ...b, deal_breakers: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Section steps */}
      {currentSection && (
        <div className="form-card questions-card">
          <div className="section-icon-large">{currentSection.icon}</div>
          {currentSection.questions.map(q => (
            <div key={q.id} className="question-item">
              <QuestionStep question={q} value={answers[q.id]} onChange={val => setAnswer(q.id, val)} />
            </div>
          ))}
        </div>
      )}

      {/* Final review step */}
      {step === sections.length + 1 && (
        <div className="form-card review-card">
          <div className="review-icon">🏁</div>
          <h3>{t('create.doneTitle')}</h3>
          <p>
            {Object.keys(answers).length} {t('create.answered')}.{' '}
            {t('create.doneDesc')}
          </p>
          <div className="review-summary">
            <div className="review-item"><strong>{t('create.nameLabel')}:</strong> {basic.name}</div>
            <div className="review-item"><strong>{t('create.ageLabel')}:</strong> {basic.age}</div>
            <div className="review-item"><strong>{t('create.cityLabel')}:</strong> {basic.city || '—'}</div>
            <div className="review-item">
              <strong>{t('create.lookingForLabel')}:</strong> {basic.looking_for.join(', ')}
            </div>
          </div>
        </div>
      )}

      {error && <div className="form-error">⚠️ {error}</div>}

      {/* Navigation */}
      <div className="form-nav">
        {step > 0 && (
          <button className="btn btn-outline" onClick={back}>{t('create.back')}</button>
        )}
        {step < sections.length + 1 ? (
          <button className="btn btn-primary" onClick={next}>
            {step === 0
              ? t('create.start')
              : step === sections.length
              ? t('create.reviewFinish')
              : t('create.nextSection')}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? t('create.creating') : t('create.createProfile')}
          </button>
        )}
      </div>
    </div>
  );
}
