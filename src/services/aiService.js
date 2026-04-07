// Mock AI Service with realistic delay and Real MobileNet Image Validation
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const mockOutcomes = [
  {
    disease: "Late Blight Disease",
    confidence: 0.94,
    severity: "Critical",
    treatment: "treatment_lateBlight",
    explanation: "explanation_lateBlight"
  },
  {
    disease: "Powdery Mildew Disease",
    confidence: 0.88,
    severity: "Medium",
    treatment: "treatment_powderyMildew",
    explanation: "explanation_powderyMildew"
  },
  {
    disease: "Nitrogen Deficiency Plant",
    confidence: 0.97,
    severity: "Low",
    treatment: "treatment_nitrogen",
    explanation: "explanation_nitrogen"
  },
  {
    disease: "Healthy Crop Leaf",
    confidence: 0.99,
    severity: "Low",
    treatment: "treatment_healthy",
    explanation: "explanation_healthy"
  }
];

let mobileNetModel = null;

export async function validateImageWithMobileNet(imageSrc) {
  try {
    if (!mobileNetModel) {
      mobileNetModel = await mobilenet.load();
    }
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const predictions = await mobileNetModel.classify(img);
    
    // Plant related keywords in Imagenet 1000
    const plantKeywords = [
      'plant', 'leaf', 'flower', 'tree', 'crop', 'grass', 'daisy', 'pot', 'wood', 'vegetable', 
      'fruit', 'agriculture', 'garden', 'greenhouse', 'earthstar', 'mushroom', 'ear', 'spike', 
      'capitulum', 'pineapple', 'cardoon', 'corn', 'wheat', 'grain', 'rice', 'seed', 'field', 
      'hay', 'straw', 'vine', 'weed', 'fern', 'moss', 'fungus', 'stalk', 'stem', 'root', 
      'branch', 'log', 'forest', 'meadow', 'pasture', 'spore', 'apple', 'orange', 'lemon', 
      'banana', 'pepper', 'tomato', 'potato', 'cabbage', 'broccoli', 'cauliflower', 'zucchini', 
      'cucumber', 'squash', 'pumpkin', 'melon', 'berry', 'grape', 'cherry', 'plum', 'peach', 
      'pear', 'apricot', 'nut', 'almond', 'bean', 'pea', 'soybean', 'cotton', 'tobacco', 
      'rose', 'orchid', 'lily', 'tulip', 'sunflower', 'dandelion', 'cactus', 'succulent', 
      'palm', 'bamboo', 'reed', 'shrub', 'bush', 'herb', 'spice', 'ananas'
    ];
    
    for (let p of predictions) {
      const className = p.className.toLowerCase();
      if (plantKeywords.some(kw => className.includes(kw))) {
        return { isValid: true, predictions };
      }
    }
    
    return { isValid: false, predictions };
  } catch (e) {
    console.error("MobileNet validation failed:", e);
    return { isValid: true, predictions: [] }; // Fallback
  }
}

export async function analyzeImage(imageSrc) {
  // Real Image-Based MobileNet Validation
  const validation = await validateImageWithMobileNet(imageSrc);
  if (!validation.isValid) {
      return {
        disease: "Unknown Image",
        confidence: 0.45,
        severity: "Low",
        treatment: "No crop detected. Please capture an image of a plant.",
        explanation: `Real AI classified this as: ${validation.predictions.map(p => p.className).join(', ')}`
      };
  }

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
