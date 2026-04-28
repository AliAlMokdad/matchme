import { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/index';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingBackground from './components/FloatingBackground';
import Home from './pages/Home';
import CreateProfile from './pages/CreateProfile';
import Match from './pages/Match';

function SpotifyToast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const status = searchParams.get('spotify');
    const pid    = searchParams.get('pid');

    if (status === 'connected') {
      setToast({ ok: true,  msg: `🎵 Music DNA connected${pid ? ` for Profile #${pid}` : ''}! Get your match partner to connect theirs.` });
    } else if (status === 'denied') {
      setToast({ ok: false, msg: 'Spotify connection was cancelled — you can try again any time.' });
    } else if (status === 'error') {
      setToast({ ok: false, msg: 'Something went wrong connecting Spotify. Please try again.' });
    }

    if (status) {
      // Remove spotify params from URL without reloading
      const next = new URLSearchParams(searchParams);
      next.delete('spotify'); next.delete('pid');
      setSearchParams(next, { replace: true });
      // Auto-dismiss after 6s
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, maxWidth: '480px', width: 'calc(100% - 2rem)',
      background: toast.ok ? 'linear-gradient(135deg,#0f0e17,#1a0a2e)' : '#1f2937',
      color: 'white', padding: '14px 20px', borderRadius: '14px',
      boxShadow: toast.ok ? '0 8px 32px rgba(29,185,84,0.4)' : '0 8px 24px rgba(0,0,0,0.3)',
      border: toast.ok ? '1px solid rgba(29,185,84,0.4)' : '1px solid rgba(255,255,255,0.1)',
      fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.5,
      animation: 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {toast.msg}
      <button onClick={() => setToast(null)} style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
        float: 'right', cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
        marginLeft: '12px',
      }}>✕</button>
      <style>{`@keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-12px) scale(0.96)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <FloatingBackground />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <SpotifyToast />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateProfile />} />
            <Route path="/match" element={<Match />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </I18nextProvider>
  );
}
