import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProfile from './pages/CreateProfile';
import Match from './pages/Match';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateProfile />} />
        <Route path="/match" element={<Match />} />
      </Routes>
    </>
  );
}
