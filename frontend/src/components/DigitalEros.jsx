import './DigitalEros.css';

// Tiny floating heart
function Heart({ style }) {
  return <span className="eros-heart" style={style}>♡</span>;
}

export default function DigitalEros() {
  // Deterministic hearts so they don't re-randomise on render
  const hearts = [
    { left: '12%',  animationDelay: '0s',    animationDuration: '3.2s', fontSize: '0.55rem', opacity: 0.6 },
    { left: '28%',  animationDelay: '1.1s',  animationDuration: '4.0s', fontSize: '0.4rem',  opacity: 0.4 },
    { left: '50%',  animationDelay: '0.4s',  animationDuration: '3.6s', fontSize: '0.65rem', opacity: 0.7 },
    { left: '70%',  animationDelay: '1.8s',  animationDuration: '2.9s', fontSize: '0.45rem', opacity: 0.5 },
    { left: '88%',  animationDelay: '0.7s',  animationDuration: '3.8s', fontSize: '0.5rem',  opacity: 0.45 },
  ];

  return (
    <div className="eros-wrap">
      {/* Floating hearts */}
      <div className="eros-hearts-field" aria-hidden="true">
        {hearts.map((h, i) => (
          <Heart key={i} style={h} />
        ))}
      </div>

      {/* Arrow + label */}
      <div className="eros-inner">
        {/* Cupid arrow SVG */}
        <div className="eros-arrow-wrap" aria-hidden="true">
          <svg className="eros-arrow-svg" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Arrow shaft */}
            <line x1="6" y1="12" x2="64" y2="12" stroke="url(#arrowGrad)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Arrowhead */}
            <path d="M58 6 L72 12 L58 18" stroke="url(#arrowGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            {/* Fletching */}
            <path d="M6 12 C2 8, 0 12, 2 12 C0 12, 2 16, 6 12Z" fill="url(#arrowGrad)" opacity="0.8"/>
            {/* Heart on tip */}
            <text x="68" y="9" fontSize="7" fill="#f9a8d4" opacity="0.9">♡</text>
            <defs>
              <linearGradient id="arrowGrad" x1="0" y1="0" x2="80" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#c084fc"/>
                <stop offset="50%"  stopColor="#f0abfc"/>
                <stop offset="100%" stopColor="#f9a8d4"/>
              </linearGradient>
            </defs>
          </svg>
          {/* Sparkles */}
          <span className="eros-spark eros-spark-1">✦</span>
          <span className="eros-spark eros-spark-2">✦</span>
          <span className="eros-spark eros-spark-3">·</span>
        </div>

        {/* Text */}
        <div className="eros-text-wrap">
          <span className="eros-powered">powered by</span>
          <span className="eros-name">Digital Eros</span>
        </div>
      </div>
    </div>
  );
}
