import { useEffect, useState, useRef } from 'react';
import './Footer.css';

function useCountUp(target, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!target) return;
    let start = null;
    const from = 0;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(from + eased * (target - from)));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    }

    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return val;
}

export default function Footer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {}); // silent fail — footer is cosmetic
  }, []);

  const profiles = useCountUp(stats?.profiles ?? 0);
  const matches  = useCountUp(stats?.matches  ?? 0);

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-brand">💜 MatchMe</span>

        {stats && (
          <div className="footer-stats">
            <div className="fstat">
              <span className="fstat-num">{profiles.toLocaleString()}</span>
              <span className="fstat-lbl">profiles created</span>
            </div>
            <div className="fstat-sep">·</div>
            <div className="fstat">
              <span className="fstat-num">{matches.toLocaleString()}</span>
              <span className="fstat-lbl">connections made</span>
            </div>
          </div>
        )}

        <span className="footer-tagline">Find your person.</span>
      </div>
    </footer>
  );
}
