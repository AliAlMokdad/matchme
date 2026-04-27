import { Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/index';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingBackground from './components/FloatingBackground';
import Home from './pages/Home';
import CreateProfile from './pages/CreateProfile';
import Match from './pages/Match';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <FloatingBackground />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
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
