// Mock AI Service with realistic delay

const mockOutcomes = [
  {
    disease: "Late Blight",
    confidence: 0.94,
    severity: "Critical",
    treatment: "Immediately apply fungicides containing chlorothalonil or copper. Remove and destroy infected plants. Ensure good air circulation.",
    explanation: "Spores easily spread in wet conditions. Found dark, water-soaked spots on leaves."
  },
  {
    disease: "Powdery Mildew",
    confidence: 0.88,
    severity: "Medium",
    treatment: "Apply sulfur-based fungicides or neem oil. Reduce humidity around plants and prune overcrowded areas.",
    explanation: "White powdery fungal growth noticed on the leaf surface."
  },
  {
    disease: "Nitrogen Deficiency",
    confidence: 0.97,
    severity: "Low",
    treatment: "Apply a nitrogen-rich fertilizer (e.g., blood meal or urea). Ensure adequate soil moisture for nutrient uptake.",
    explanation: "General yellowing observed on older leaves, extending to the rest of the plant."
  },
  {
    disease: "Healthy Leaf",
    confidence: 0.99,
    severity: "Low",
    treatment: "No treatment required. Continue regular watering and maintenance.",
    explanation: "Leaf structure and colors appear normal without visible pathogen markers."
  }
];

export async function analyzeImage(imageSrc) {
  return new Promise((resolve) => {
    // Simulate network delay (1.5s - 3s)
    const delay = Math.floor(Math.random() * 1500) + 1500;
    setTimeout(() => {
      // Create a deterministic index based on the imageSrc string
      let hash = 0;
      if (imageSrc && imageSrc.length > 0) {
        for (let i = 0; i < imageSrc.length; i++) {
          hash = ((hash << 5) - hash) + imageSrc.charCodeAt(i);
          hash |= 0; // Convert to 32bit integer
        }
      }
      
      const index = Math.abs(hash) % mockOutcomes.length;
      const outcome = mockOutcomes[index];
      
      resolve(outcome);
    }, delay);
  });
}

// Distance calculation using Haversine formula (km)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);  
  const dLon = (lon2 - lon1) * (Math.PI / 180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

// Local storage helpers
const HISTORY_KEY = 'scans';

export function saveScanToHistory(scan) {
  const current = getHistory();
  current.unshift({ ...scan, timestamp: new Date().toISOString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(current));
}

export function getHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function checkOutbreakCluster(lat, lng, disease, maxDistance = 10, minCount = 5) {
  if (!lat || !lng || !disease) return { isOutbreak: false, count: 0 };
  
  const scans = getHistory();
  let count = 0;
  
  // 24 hours ago
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const scan of scans) {
    if (scan.latitude && scan.longitude && scan.disease === disease) {
      const scanDate = new Date(scan.timestamp || 0);
      if (scanDate >= yesterday) {
         const dist = calculateDistance(lat, lng, scan.latitude, scan.longitude);
         // Dist is 0 if it's the exact same scan, which counts itself
         if (dist <= maxDistance) count++;
      }
    }
  }
  
  return {
    isOutbreak: count >= minCount,
    count: count
  };
}
