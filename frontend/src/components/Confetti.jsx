import { useEffect, useRef } from 'react';
import './Confetti.css';

const COLORS = ['#7c3aed', '#db2777', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#60a5fa'];
const COUNT = 90;

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function makeParticle(i) {
  return {
    id: i,
    x: randomBetween(10, 90),        // vw start
    delay: randomBetween(0, 0.9),    // s
    duration: randomBetween(2.2, 3.8),
    size: randomBetween(7, 14),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: randomBetween(0, 360),
    drift: randomBetween(-60, 60),   // px sideways drift
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  };
}

export default function Confetti({ active }) {
  const particles = useRef(Array.from({ length: COUNT }, (_, i) => makeParticle(i)));

  if (!active) return null;

  return (
    <div className="confetti-root" aria-hidden="true">
      {particles.current.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.shape}`}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.45 : p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rot': `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
