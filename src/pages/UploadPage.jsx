import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

const UploadPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target.result;
      
      // Attempt to get location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
             navigate('/results', { state: { imageSrc, lat: position.coords.latitude, lng: position.coords.longitude } });
          },
          (error) => {
             console.warn("Geolocation denied or failed", error);
             navigate('/results', { state: { imageSrc, lat: null, lng: null } }); // Proceed without location explicitly
          },
          { timeout: 5000 }
        );
      } else {
        navigate('/results', { state: { imageSrc, lat: null, lng: null } });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '1rem', textAlign: 'center' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>{t('takePhoto')}</h2>
        <p style={{ marginTop: '0.5rem' }}>{t('ensureVisibility')}</p>
      </div>

      {isProcessing ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
          <p className="text-semibold" style={{ fontSize: '1.25rem' }}>{t('uploading')}</p>
        </div>
      ) : (
        <>
          <div className="video-container" style={{ background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px dashed var(--border-color)', cursor: 'pointer' }} onClick={handleCaptureClick}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a0aec0' }}>
               <ImageIcon size={64} style={{ marginBottom: '1rem' }} />
               <span>{t('tapOpen')}</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleCaptureClick} style={{ padding: '1.25rem', fontSize: '1.25rem' }}>
            <Camera size={24} style={{ marginRight: '8px' }} />
            {t('scanCrop')}
          </button>
          
          {/* Hidden file input focusing on camera on mobile */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </>
      )}

      {/* Add spin animation to global CSS if not added yet */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default UploadPage;
