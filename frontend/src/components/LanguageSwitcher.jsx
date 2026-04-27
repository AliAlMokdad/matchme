import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, RTL_LANGS } from '../i18n/index';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  function select(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('matchme_lang', code);
    // Apply RTL
    document.documentElement.dir = RTL_LANGS.has(code) ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Apply RTL on mount for persisted language
  useEffect(() => {
    const lang = i18n.language || 'en';
    document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n.language]);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        className="lang-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
        aria-expanded={open}
      >
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{current.code.toUpperCase()}</span>
        <span className={`lang-arrow ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="lang-dropdown" role="listbox">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
              onClick={() => select(lang.code)}
              role="option"
              aria-selected={lang.code === i18n.language}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-name">{lang.label}</span>
              {lang.code === i18n.language && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
