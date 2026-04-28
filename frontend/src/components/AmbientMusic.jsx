import { useState, useEffect, useRef } from 'react';
import './AmbientMusic.css';

// ── Web Audio ambient engine ──────────────────────────────────────────────────
// Inspired by slowed / lofi desert-night vibes: deep pad, slow arpeggio, delay reverb
class AmbientEngine {
  constructor() {
    this.ctx    = null;
    this.master = null;
    this.nodes  = [];
    this.timers = [];
    this.alive  = false;
  }

  _t() { return this.ctx.currentTime; }

  _osc(type, freq, detune = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value    = detune;
    return o;
  }

  _gain(val) {
    const g = this.ctx.createGain();
    g.gain.value = val;
    return g;
  }

  _lpf(freq, q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type            = 'lowpass';
    f.frequency.value = freq;
    f.Q.value         = q;
    return f;
  }

  // Build a feedback delay (pseudo-reverb)
  _buildDelay() {
    const delay    = this.ctx.createDelay(3.0);
    const feedback = this._gain(0.42);
    const colour   = this._lpf(600);
    delay.delayTime.value = 0.38;
    delay.connect(colour);
    colour.connect(feedback);
    feedback.connect(delay);
    return delay;
  }

  start() {
    this.ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this._gain(0);
    this.alive  = true;

    const delay = this._buildDelay();
    const warmth = this._lpf(1100);

    this.master.connect(warmth);
    warmth.connect(this.ctx.destination);
    delay.connect(this.ctx.destination);

    // Slow fade-in over 5s
    this.master.gain.linearRampToValueAtTime(0.38, this._t() + 5);

    // ── Pad: A-minor chord stack (A2 E3 A3 C4 E4 A4) ─────────────────────────
    const padFreqs = [110, 164.81, 220, 261.63, 329.63, 440];
    padFreqs.forEach((freq, i) => {
      const osc  = this._osc('sine', freq, (i - 2.5) * 4);
      const g    = this._gain(0.12);
      // Slow tremolo via LFO
      const lfo  = this._osc('sine', 0.18 + i * 0.03);
      const lfoG = this._gain(0.03);
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      osc.connect(g);
      g.connect(this.master);
      g.connect(delay);
      osc.start(); lfo.start();
      this.nodes.push(osc, lfo);
    });

    // ── Bass pulse every 4 beats @ 64 BPM ────────────────────────────────────
    const beat = 60 / 64;
    const bass = () => {
      if (!this.alive) return;
      const notes = [55, 55, 49, 55]; // A1 A1 G1 A1
      notes.forEach((freq, idx) => {
        const t   = this._t() + idx * beat;
        const osc = this._osc('triangle', freq);
        const g   = this._gain(0.001);
        const lpf = this._lpf(180);
        osc.connect(lpf); lpf.connect(g); g.connect(this.master);
        g.gain.linearRampToValueAtTime(0.28,  t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
        osc.start(t); osc.stop(t + beat * 2);
        this.nodes.push(osc);
      });
      const id = setTimeout(bass, beat * 4 * 1000);
      this.timers.push(id);
    };
    const bassTimer = setTimeout(bass, 2800);
    this.timers.push(bassTimer);

    // ── Slow arpeggio enters after ~7s ────────────────────────────────────────
    // A-minor pentatonic: A4 C5 E5 G5 A5
    const arpFreqs = [440, 523.25, 659.25, 783.99, 880];
    const arp = () => {
      if (!this.alive) return;
      arpFreqs.forEach((freq, idx) => {
        const t      = this._t() + idx * beat * 1.5;
        const osc    = this._osc('sine', freq, -8);
        const g      = this._gain(0.001);
        const lpf    = this._lpf(900, 2);
        osc.connect(lpf); lpf.connect(g);
        g.connect(this.master);
        g.connect(delay);
        g.gain.linearRampToValueAtTime(0.09, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, t + beat * 2.5);
        osc.start(t); osc.stop(t + beat * 3);
        this.nodes.push(osc);
      });
      const id = setTimeout(arp, beat * arpFreqs.length * 1.5 * 1000 + beat * 4000);
      this.timers.push(id);
    };
    const arpTimer = setTimeout(arp, 7200);
    this.timers.push(arpTimer);

    // ── Subtle high shimmer ───────────────────────────────────────────────────
    const shimmerFreqs = [1760, 2093, 2637];
    const shimmer = () => {
      if (!this.alive) return;
      const freq = shimmerFreqs[Math.floor(Math.random() * shimmerFreqs.length)];
      const osc  = this._osc('sine', freq);
      const g    = this._gain(0.001);
      const lpf  = this._lpf(3000);
      osc.connect(lpf); lpf.connect(g);
      g.connect(delay);
      g.gain.linearRampToValueAtTime(0.025, this._t() + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, this._t() + 2.4);
      osc.start(); osc.stop(this._t() + 3);
      this.nodes.push(osc);
      const nextMs = 2500 + Math.random() * 3500;
      const id = setTimeout(shimmer, nextMs);
      this.timers.push(id);
    };
    const shimmerTimer = setTimeout(shimmer, 10000);
    this.timers.push(shimmerTimer);
  }

  fadeOut() {
    if (!this.master || !this.ctx) return;
    this.master.gain.linearRampToValueAtTime(0, this._t() + 2.5);
  }

  fadeIn() {
    if (!this.master || !this.ctx) return;
    this.master.gain.linearRampToValueAtTime(0.38, this._t() + 2.5);
  }

  stop() {
    this.alive = false;
    this.timers.forEach(clearTimeout);
    this.nodes.forEach(n => { try { n.stop(); } catch {} });
    if (this.ctx) this.ctx.close();
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AmbientMusic() {
  const [playing, setPlaying]   = useState(false);
  const [started, setStarted]   = useState(false);
  const [visible, setVisible]   = useState(false);
  const engineRef = useRef(null);
  const hasInteracted = useRef(false);

  // Show button after 1.5s
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Auto-start on first user interaction anywhere on the page
  useEffect(() => {
    const handler = () => {
      if (hasInteracted.current) return;
      hasInteracted.current = true;
      const engine = new AmbientEngine();
      engineRef.current = engine;
      engine.start();
      setPlaying(true);
      setStarted(true);
    };
    window.addEventListener('click',      handler, { once: true, passive: true });
    window.addEventListener('scroll',     handler, { once: true, passive: true });
    window.addEventListener('touchstart', handler, { once: true, passive: true });
    return () => {
      window.removeEventListener('click',      handler);
      window.removeEventListener('scroll',     handler);
      window.removeEventListener('touchstart', handler);
    };
  }, []);

  function toggle() {
    if (!started) {
      const engine = new AmbientEngine();
      engineRef.current = engine;
      engine.start();
      setPlaying(true);
      setStarted(true);
      hasInteracted.current = true;
      return;
    }
    if (playing) {
      engineRef.current?.fadeOut();
      setPlaying(false);
    } else {
      engineRef.current?.fadeIn();
      setPlaying(true);
    }
  }

  return (
    <button
      className={`ambient-btn ${visible ? 'ambient-btn-visible' : ''} ${playing ? 'ambient-btn-playing' : ''}`}
      onClick={toggle}
      title={playing ? 'Pause ambiance' : 'Play ambiance'}
      aria-label={playing ? 'Pause ambient music' : 'Play ambient music'}
    >
      <span className="ambient-icon">
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 4.804A.75.75 0 0 0 8 5.5v13a.75.75 0 0 0 1.153.633L20 12 9.153 4.17A.75.75 0 0 0 9 4.804z"/>
          </svg>
        )}
      </span>
      {playing && <span className="ambient-bars"><i/><i/><i/><i/></span>}
      <span className="ambient-label">{playing ? 'Ambiance' : 'Play'}</span>
    </button>
  );
}
