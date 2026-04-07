import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/aiService';
import SeverityBadge from '../components/SeverityBadge';
import { Calendar, ChevronRight } from 'lucide-react';

const HistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>{t('history')}</h2>
        {history.length > 0 && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all history?")) {
                localStorage.removeItem("scans");
                setHistory([]);
              }
            }}
            style={{
              background: 'transparent',
              color: 'var(--severity-critical)',
              border: '1px solid var(--severity-critical)',
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Clear History
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <p>No scan history yet. Scan crops to see history.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((scan, index) => (
            <div 
              key={index} 
              className="card" 
              style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '0', cursor: 'pointer', alignItems: 'center' }}
              onClick={() => navigate('/results', { state: { ...scan, isFromHistory: true, imageSrc: scan.image, lat: scan.latitude, lng: scan.longitude } })}
            >
              {scan.image ? (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={scan.image} alt="Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: 'var(--border-color)', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{t(scan.disease)}</h3>
                  <SeverityBadge level={scan.severity} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  <Calendar size={14} />
                  <span>{new Date(scan.timestamp).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</span>
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-light)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
