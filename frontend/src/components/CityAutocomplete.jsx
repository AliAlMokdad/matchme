import { useState, useRef, useEffect, useCallback } from 'react';
import './CityAutocomplete.css';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export default function CityAutocomplete({ value, onChange, placeholder = 'Start typing a city...' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== query) setQuery(value || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const url = `${NOMINATIM}?q=${encodeURIComponent(q)}&format=json&limit=6&featureType=city&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'MatchMe/1.0' },
      });
      const data = await res.json();
      const results = data
        .filter(item => item.type === 'city' || item.type === 'administrative' || item.class === 'place')
        .slice(0, 5)
        .map(item => {
          const city = item.address?.city || item.address?.town || item.address?.village || item.name;
          const country = item.address?.country || '';
          const state = item.address?.state || '';
          const label = [city, state, country].filter(Boolean).join(', ');
          return { display_name: label, city };
        });
      // Dedupe
      const seen = new Set();
      const unique = results.filter(r => {
        if (seen.has(r.display_name)) return false;
        seen.add(r.display_name);
        return true;
      });
      setSuggestions(unique);
      setOpen(unique.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    onChange(val); // always keep parent in sync with typed text
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 380);
  }

  function select(item) {
    setQuery(item.display_name);
    onChange(item.display_name);
    setSuggestions([]);
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="city-ac" ref={containerRef}>
      <div className="city-input-wrap">
        <span className="city-icon">📍</span>
        <input
          type="text"
          className="city-input"
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <span className="city-spinner" aria-hidden="true" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="city-dropdown" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="city-option"
              role="option"
              onMouseDown={e => { e.preventDefault(); select(s); }}
            >
              <span className="city-pin">📍</span>
              <span className="city-text">{s.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
