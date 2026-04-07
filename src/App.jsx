import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Map, History, Leaf } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import MapPage from './pages/MapPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const switchLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <Leaf size={28} color="var(--primary-color)" />
          <span>{t('appName')}</span>
        </div>
        <select 
          onChange={switchLanguage} 
          value={i18n.language.split('-')[0]}
          style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
        </select>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Camera size={24} />
          <span>{t('scanCrop')}</span>
        </button>
        <button 
          className={`nav-item ${location.pathname === '/map' ? 'active' : ''}`}
          onClick={() => navigate('/map')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Map size={24} />
          <span>{t('map')}</span>
        </button>
        <button 
          className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
          onClick={() => navigate('/history')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <History size={24} />
          <span>{t('history')}</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
