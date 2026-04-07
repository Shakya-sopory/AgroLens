// Mock AI Service with realistic delay and Real MobileNet Image Validation
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const mockOutcomes = [
  {
    disease: "Late Blight Disease",
    confidence: 0.94,
    severity: "Critical",
    treatment: "Immediately apply fungicides containing chlorothalonil or copper. Remove and destroy infected plants. Ensure good air circulation.",
    explanation: "Spores easily spread in wet conditions. Found dark, water-soaked spots on leaves."
  },
  {
    disease: "Powdery Mildew Disease",
    confidence: 0.88,
    severity: "Medium",
    treatment: "Apply sulfur-based fungicides or neem oil. Reduce humidity around plants and prune overcrowded areas.",
    explanation: "White powdery fungal growth noticed on the leaf surface."
  },
  {
    disease: "Nitrogen Deficiency Plant",
    confidence: 0.97,
    severity: "Low",
    treatment: "Apply a nitrogen-rich fertilizer (e.g., blood meal or urea). Ensure adequate soil moisture for nutrient uptake.",
    explanation: "General yellowing observed on older leaves, extending to the rest of the plant."
  },
  {
    disease: "Healthy Crop Leaf",
    confidence: 0.99,
    severity: "Low",
    treatment: "No treatment required. Continue regular watering and maintenance.",
    explanation: "Leaf structure and colors appear normal without visible pathogen markers."
  },
  {
    disease: "Unknown Image",
    confidence: 0.45,
    severity: "Low",
    treatment: "No crop detected. Please capture an image of a plant.",
    explanation: "The uploaded image does not contain identifiable crop features."
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
    const plantKeywords = ['plant', 'leaf', 'flower', 'tree', 'crop', 'grass', 'daisy', 'pot', 'wood', 'vegetable', 'fruit', 'agriculture', 'garden', 'greenhouse', 'earthstar', 'mushroom'];
    
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
