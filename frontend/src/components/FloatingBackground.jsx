import { useEffect, useRef } from 'react';
import './FloatingBackground.css';

// Elegant floating particles — stars, snowflakes, hearts, planes
const PARTICLES = [
  { emoji: '⭐', count: 8 },
  { emoji: '✦',  count: 6 },
  { emoji: '❄️', count: 5 },
  { emoji: '💜', count: 4 },
  { emoji: '✈️', count: 3 },
  { emoji: '✨', count: 5 },
  { emoji: '🌟', count: 3 },
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FloatingBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles = [];

    PARTICLES.forEach(({ emoji, count }) => {
      for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'fb-particle';
        el.textContent = emoji;

        const size = randomBetween(12, 26);
        const startX = randomBetween(0, 100);
        const delay = randomBetween(0, 18);
        const duration = randomBetween(18, 36);
        const drift = randomBetween(-60, 60);
        const rotateAmt = randomBetween(-180, 180);
        const opacity = randomBetween(0.12, 0.35);

        el.style.cssText = `
          font-size: ${size}px;
          left: ${startX}%;
          animation-delay: ${delay}s;
          animation-duration: ${duration}s;
          --drift: ${drift}px;
          --rotate: ${rotateAmt}deg;
          opacity: ${opacity};
        `;

        container.appendChild(el);
        particles.push(el);
      }
    });

    return () => {
      particles.forEach(el => {
        if (el.parentNode === container) container.removeChild(el);
      });
    };
  }, []);

  return <div ref={containerRef} className="floating-bg" aria-hidden="true" />;
}
