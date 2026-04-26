import './QuestionStep.css';

export default function QuestionStep({ question, value, onChange }) {
  if (question.type === 'scale') {
    return (
      <div className="question-wrap">
        <p className="question-text">{question.text}</p>
        <div className="scale-group">
          <span className="scale-label scale-label-low">{question.low}</span>
          <div className="scale-buttons">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n} type="button"
                className={`scale-btn ${value === n ? 'selected' : ''}`}
                onClick={() => onChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="scale-label scale-label-high">{question.high}</span>
        </div>
        {value && (
          <div className="scale-selected-label">
            {['', '1 — ' + question.low, '2', '3 — Neutral', '4', '5 — ' + question.high][value]}
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'choice') {
    return (
      <div className="question-wrap">
        <p className="question-text">{question.text}</p>
        <div className="choice-grid">
          {question.options.map(opt => (
            <label key={opt.value} className={`choice-card ${value === opt.value ? 'selected' : ''}`}>
              <input type="radio" name={question.id} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} />
              <div className="choice-content">
                <span className="choice-label">{opt.label}</span>
                {opt.desc && <span className="choice-desc">{opt.desc}</span>}
              </div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'text') {
    return (
      <div className="question-wrap">
        <p className="question-text">{question.text}</p>
        <textarea
          className="text-answer"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={question.placeholder || 'Share your thoughts...'}
          rows={4}
        />
      </div>
    );
  }

  return null;
}
