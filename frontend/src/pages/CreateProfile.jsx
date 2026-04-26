import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SECTIONS } from '../data/questions';
import QuestionStep from '../components/QuestionStep';
import './CreateProfile.css';

const STORAGE_KEY = 'matchme_draft';

const BASIC_FIELDS = [
  { id: 'name', label: 'Your First Name', type: 'text', placeholder: 'e.g. Alex', required: true },
  { id: 'age',  label: 'Age',             type: 'number', placeholder: 'e.g. 27', required: true },
  { id: 'gender', label: 'Gender', type: 'select', options: ['', 'Man', 'Woman', 'Non-binary', 'Other / Prefer not to say'] },
  { id: 'city', label: 'City / Location', type: 'text', placeholder: 'e.g. New York' },
];

const LOOKING_FOR = [
  { value: 'romantic', label: '💕 Romantic Partner' },
  { value: 'roommate', label: '🏠 Roommate' },
  { value: 'friend',   label: '🤝 Friend' },
];

export default function CreateProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = basic, 1–7 = sections, 8 = submit
  const [basic, setBasic] = useState({ name: '', age: '', gender: '', city: '', looking_for: [], what_i_bring: '', deal_breakers: '' });
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (draft) { setBasic(draft.basic || basic); setAnswers(draft.answers || {}); }
    } catch {}
  }, []);

  // Autosave draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ basic, answers }));
  }, [basic, answers]);

  const totalSteps = SECTIONS.length + 1; // +1 for basic
  const progress = Math.round((step / totalSteps) * 100);
  const currentSection = step > 0 ? SECTIONS[step - 1] : null;

  function setAnswer(qid, val) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  }

  function toggleLookingFor(val) {
    setBasic(b => ({
      ...b,
      looking_for: b.looking_for.includes(val) ? b.looking_for.filter(v => v !== val) : [...b.looking_for, val],
    }));
  }

  function validateStep() {
    if (step === 0) {
      if (!basic.name.trim()) return 'Please enter your name.';
      if (!basic.age || basic.age < 16) return 'Please enter a valid age (16+).';
      if (basic.looking_for.length === 0) return 'Please select at least one thing you are looking for.';
    }
    // For section steps, required = all non-text questions should be answered
    if (currentSection) {
      const required = currentSection.questions.filter(q => q.type !== 'text');
      const unanswered = required.filter(q => answers[q.id] == null);
      if (unanswered.length > 0) {
        return `Please answer all questions in this section (${unanswered.length} remaining).`;
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

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="create-page">
        <div className="success-card">
          <div className="success-burst">🎉</div>
          <h2>You're all set, {basic.name}!</h2>
          <p>Your deep profile has been created. Share your ID with the person you want to check compatibility with.</p>
          <div className="id-display">
            <div className="id-label">Your Profile ID</div>
            <div className="id-number">#{created}</div>
            <button className="copy-btn" onClick={copyId}>{copied ? '✓ Copied!' : 'Copy ID'}</button>
          </div>
          <div className="success-hint">
            Ask them to go to <strong>Find Match</strong>, enter both profile IDs, and see your results.
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/match')}>Find Match →</button>
            <button className="btn btn-outline" onClick={() => { setCreated(null); setStep(0); setBasic({ name:'',age:'',gender:'',city:'',looking_for:[],what_i_bring:'',deal_breakers:'' }); setAnswers({}); }}>
              Create Another
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
        <h1>{step === 0 ? 'Create Your Profile' : currentSection?.title}</h1>
        <p>{step === 0 ? 'A deep look at who you really are.' : currentSection?.description}</p>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-steps">
          {['You', ...SECTIONS.map(s => s.icon)].map((label, i) => (
            <button
              key={i}
              className={`progress-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              onClick={() => i < step && setStep(i)}
              title={i === 0 ? 'Basic Info' : SECTIONS[i - 1]?.title}
            >
              {i < step ? '✓' : label}
            </button>
          ))}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">{step === 0 ? 'Step 1 of 8' : `Step ${step + 1} of 8 — ${currentSection?.title}`}</div>
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="form-card">
          <div className="form-grid-2">
            {BASIC_FIELDS.map(f => (
              <div key={f.id} className="form-group">
                <label>{f.label}{f.required && <span className="req"> *</span>}</label>
                {f.type === 'select' ? (
                  <select value={basic[f.id]} onChange={e => setBasic(b => ({ ...b, [f.id]: e.target.value }))}>
                    {f.options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={basic[f.id]} placeholder={f.placeholder}
                    min={f.type === 'number' ? 16 : undefined} max={f.type === 'number' ? 99 : undefined}
                    onChange={e => setBasic(b => ({ ...b, [f.id]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>What are you looking for? <span className="req">*</span></label>
            <p className="field-hint">Select all that apply.</p>
            <div className="looking-for-group">
              {LOOKING_FOR.map(l => (
                <label key={l.value} className={`lf-card ${basic.looking_for.includes(l.value) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={basic.looking_for.includes(l.value)} onChange={() => toggleLookingFor(l.value)} />
                  {l.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label>What do you bring to a relationship, roommate situation, or friendship?</label>
            <textarea value={basic.what_i_bring} rows={3} placeholder="Loyalty, humour, great cooking, calm energy..."
              onChange={e => setBasic(b => ({ ...b, what_i_bring: e.target.value }))} />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Your deal breakers</label>
            <textarea value={basic.deal_breakers} rows={3} placeholder="Smoking, dishonesty, different life goals..."
              onChange={e => setBasic(b => ({ ...b, deal_breakers: e.target.value }))} />
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

      {/* Final step — review */}
      {step === SECTIONS.length + 1 && (
        <div className="form-card review-card">
          <div className="review-icon">🏁</div>
          <h3>You're done!</h3>
          <p>You've answered {Object.keys(answers).length} questions across 7 sections. Your profile is ready to be created.</p>
          <div className="review-summary">
            <div className="review-item"><strong>Name:</strong> {basic.name}</div>
            <div className="review-item"><strong>Age:</strong> {basic.age}</div>
            <div className="review-item"><strong>City:</strong> {basic.city || '—'}</div>
            <div className="review-item"><strong>Looking for:</strong> {basic.looking_for.join(', ')}</div>
          </div>
        </div>
      )}

      {error && <div className="form-error">⚠️ {error}</div>}

      {/* Navigation */}
      <div className="form-nav">
        {step > 0 && (
          <button className="btn btn-outline" onClick={back}>← Back</button>
        )}
        {step < SECTIONS.length + 1 ? (
          <button className="btn btn-primary" onClick={next}>
            {step === 0 ? 'Start Assessment →' : step === SECTIONS.length ? 'Review & Finish →' : 'Next Section →'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Creating...' : '✨ Create My Profile'}
          </button>
        )}
      </div>
    </div>
  );
}
