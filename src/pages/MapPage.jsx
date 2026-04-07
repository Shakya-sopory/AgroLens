import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import { checkOutbreakCluster } from '../services/aiService';
import { AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MOCK_COMMUNITY_PINS = [
  { id: 1, lat: 28.6139, lng: 77.2090, disease: "Late Blight", severity: "Critical" }, 
  { id: 2, lat: 19.0760, lng: 72.8777, disease: "Powdery Mildew", severity: "Medium" }, 
  { id: 3, lat: 13.0827, lng: 80.2707, disease: "Nitrogen Deficiency", severity: "Low" }, 
  { id: 4, lat: 17.3850, lng: 78.4867, disease: "Late Blight", severity: "Medium" }, 
];

const MapPage = () => {
  const { t } = useTranslation();
  const [historyPins, setHistoryPins] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default to India
  const [outbreakData, setOutbreakData] = useState(null);

  useEffect(() => {
    // 3. Load scan history from localStorage
    const scans = JSON.parse(localStorage.getItem("scans")) || [];
    
    // 4. Filter entries with coordinates
    const withLocation = scans.filter(s => s.latitude && s.longitude);
    
    let overallOutbreak = null;
    const evaluatedPins = withLocation.map(pin => {
      const cluster = checkOutbreakCluster(pin.latitude, pin.longitude, pin.disease);
      if (cluster.isOutbreak && !overallOutbreak) {
        overallOutbreak = { disease: pin.disease, count: cluster.count };
      }
      return { ...pin, isOutbreak: cluster.isOutbreak };
    });

    setHistoryPins(evaluatedPins);
    if (overallOutbreak) setOutbreakData(overallOutbreak);

    // 2. Initialize map center 
    if (withLocation.length > 0) {
      setCenter([withLocation[0].latitude, withLocation[0].longitude]);
    }
  }, []);

  const getSeverityColor = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'critical') return '#E53E3E'; // Red
    if (s === 'medium') return '#DD6B20';  // Orange/Yellow
    return '#38A169';                      // Green
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <div>
         <h2>{t('communityMap')}</h2>
         
         {outbreakData && (
           <div style={{ padding: '1rem', background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
         
         {/* 6. Add fallback message */}
         {historyPins.length === 0 && (
           <div style={{ padding: '1rem', background: '#FFFBEB', color: '#B45309', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #FDE68A' }}>
             No reports yet. Scan crops to populate map.
           </div>
         )}
      </div>

      <div style={{ flex: 1, borderRadius: 'var(--border-radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {/* 1. Ensure the map container has explicit height / 5. Render markers */}
        <MapContainer center={center} zoom={6} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render Community Mock Pins */}
          {MOCK_COMMUNITY_PINS.map(pin => (
             <CircleMarker 
               key={`community-${pin.id}`} 
               center={[pin.lat, pin.lng]}
               radius={25}
               pathOptions={{
                 color: getSeverityColor(pin.severity),
                 weight: 1,
                 fillColor: getSeverityColor(pin.severity),
                 fillOpacity: 0.3
               }}
             >
               <Popup>
                 <b>Community Report</b><br />
                 {pin.disease}<br />
                 Severity: {pin.severity}
               </Popup>
             </CircleMarker>
          ))}

          {/* Render Your History Pins */}
          {historyPins.map((pin, i) => (
             <CircleMarker 
               key={`history-${i}`} 
               center={[pin.latitude, pin.longitude]}
               radius={pin.isOutbreak ? 12 : 8}
               pathOptions={{
                 color: pin.isOutbreak ? '#991B1B' : '#ffffff',
                 weight: 2,
                 fillColor: pin.isOutbreak ? '#E53E3E' : getSeverityColor(pin.severity),
                 fillOpacity: 1
               }}
             >
               <Popup>
                 {pin.isOutbreak && <><b style={{ color: '#E53E3E' }}>⚠️ {t('outbreakCluster')}</b><br /></>}
                 <b>Your Scan</b><br />
                 {t(pin.disease) || pin.disease}<br />
                 Severity: {t(pin.severity.toLowerCase()) || pin.severity}<br />
                 {new Date(pin.timestamp).toLocaleDateString()}
               </Popup>
             </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
