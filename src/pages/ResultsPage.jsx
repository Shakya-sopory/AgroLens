import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analyzeImage, saveScanToHistory, getHistory, calculateDistance, checkOutbreakCluster } from '../services/aiService';
import SeverityBadge from '../components/SeverityBadge';
import VoiceButton from '../components/VoiceButton';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, Info, MapPin } from 'lucide-react';

const ResultsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [nearbyRisk, setNearbyRisk] = useState('Low');
  const [outbreakData, setOutbreakData] = useState(null);
  const [isValidImage, setIsValidImage] = useState(true);

  useEffect(() => {
    if (!state?.imageSrc) return;

    let mounted = true;
    const runAnalysis = async () => {
      try {
        // Yield to browser and compositor thread to safely establish the animation layer
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Enforce 800ms minimum duration for spinner visibility
        const [outcome] = await Promise.all([
          analyzeImage(state.imageSrc),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        
        if (mounted) {
          setResult(outcome);
          setLoading(false);
          
          // Validate if class contains keywords: leaf, plant, crop, disease
          const isValidPlant = ['leaf', 'plant', 'crop', 'disease'].some(keyword => outcome.disease.toLowerCase().includes(keyword));
          
          if (!isValidPlant) {
            setIsValidImage(false);
            setLoading(false);
            return;
          }

          // Save to history only for NEW scans
          if (!state.isFromHistory) {
            saveScanToHistory({
              disease: outcome.disease,
              severity: outcome.severity,
              confidence: outcome.confidence,
              latitude: state.lat,
              longitude: state.lng,
              image: state.imageSrc
            });
          }
          
          // Calculate Nearby Risk (Check other history items within 50km)
          if (state.lat && state.lng) {
            const history = getHistory();
            let nearbyCount = 0;
            for (const item of history) {
              // Compare if distance < 50km and it's not strictly 'this exact scan' (though deduplication handles this mostly)
              if (item.latitude && item.longitude && item.image !== state.imageSrc) {
                const dist = calculateDistance(state.lat, state.lng, item.latitude, item.longitude);
                if (dist < 50) {
                  nearbyCount++;
                }
              }
            }
            if (nearbyCount >= 2) {
              setNearbyRisk('High');
            } else {
              setNearbyRisk('Low');
            }
            
            // Check Outbreak Cluster
            const cluster = checkOutbreakCluster(state.lat, state.lng, outcome.disease);
            if (cluster.isOutbreak) {
              setOutbreakData(cluster);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    runAnalysis();
    return () => { mounted = false; };
  }, [state]);

  if (!state?.imageSrc) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
        <div className="animate-spin" style={{ display: 'flex' }}>
          <Loader2 size={64} color="var(--primary-color)" />
        </div>
        <h2 style={{ textAlign: 'center' }}>Analyzing...</h2>
      </div>
    );
  }

  const confidencePct = Math.round(result.confidence * 100);
  const textForVoice = `${t('diagnosis')}: ${t(result.disease) || result.disease}. ${t('severity')}: ${t(result.severity.toLowerCase()) || result.severity}. ${t('treatment')}: ${t(result.treatment)}`;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', padding: '0.5rem 0', marginBottom: '1rem', cursor: 'pointer', color: 'var(--text-light)', fontWeight: '600' }}
      >
        <ArrowLeft size={20} />
        {t('retake')}
      </button>

      {/* Image Preview */}
      <div style={{ width: '100%', height: '200px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <img src={state.imageSrc} alt="Crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {!isValidImage ? (
        <div className="card" style={{ border: '1px solid var(--severity-critical)', background: '#FFF5F5' }}>
          <h2 style={{ color: 'var(--severity-critical)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={24} />
            {t('invalidImage')}
          </h2>
          <p style={{ color: 'var(--text-dark)' }}>
            {t('noCropDetected')}
          </p>
          {result?.explanation && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '12px', borderTop: '1px solid #FECACA', paddingTop: '8px' }}>
              {result.explanation.replace('Real AI classified this as:', t('realAIClassified'))}
            </p>
          )}
        </div>
      ) : (
        <>
          {outbreakData && (
            <div style={{ padding: '1rem', background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <AlertTriangle size={20} />
                  {t('outbreakDetected')}
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  {outbreakData.count} {t('similarCases')}
                </div>
              </div>
              <button onClick={() => setOutbreakData(null)} style={{ background: 'transparent', border: '1px solid #991B1B', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', color: '#991B1B' }}>
                {t('dismiss')}
              </button>
            </div>
          )}

          {/* Diagnosis Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{t('diagnosis')}</p>
                <h2 style={{ color: 'var(--text-dark)', margin: 0 }}>{t(result.disease) || result.disease}</h2>
              </div>
              <SeverityBadge level={result.severity} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <CheckCircle size={18} color="var(--primary-color)" />
              <span className="text-semibold" style={{ fontSize: '0.875rem' }}>{confidencePct}% {t('confidence')}</span>
            </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px' }}>
          <MapPin size={18} color={nearbyRisk === 'High' ? "var(--severity-critical)" : "var(--primary-color)"} />
          <span className="text-semibold" style={{ fontSize: '0.875rem' }}>{t('nearbyRisk')}: {nearbyRisk === 'High' ? t('riskHigh') : t('riskLow')}</span>
        </div>
      </div>

      {/* Treatment Card */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <AlertTriangle size={20} color="var(--severity-medium)" />
          {t('treatment')}
        </h3>
        <p style={{ color: 'var(--text-dark)', fontSize: '1.05rem' }}>{t(result.treatment)}</p>
        
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
           <Info size={18} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
           <p style={{ fontSize: '0.9rem' }}>{t(result.explanation)}</p>
        </div>
      </div>

          {/* Voice Output */}
          <VoiceButton textToRead={textForVoice} />
        </>
      )}
      
      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg) translateZ(0); } 
          to { transform: rotate(360deg) translateZ(0); } 
        }
        .animate-spin { 
          animation: spin 1s linear infinite; 
          transform-origin: center;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;
