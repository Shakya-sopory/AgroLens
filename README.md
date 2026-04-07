# 🌾 AgroLens 

<div align="center">
  <h3><strong>Empowering Farmers with AI-Driven Crop Intelligence</strong></h3>
  <p>AgroLens is a mobile-first, edge-computing Progressive Web App built to democratize agricultural diagnostics. By combining in-browser deep learning with highly accessible multilingual voice interactions, AgroLens allows farmers without advanced technical literacy to safely diagnose crop diseases, view treatments, and monitor local outbreak maps natively on their phones.</p>
</div>

---

## 🎯 Key Features

- **Real-Time Edge AI Validation:** Utilizes strict TensorFlow.js (`MobileNet`) biological classification heuristics locally in the browser to safely reject bad camera images/non-plants before wasting resources parsing actual botanical pathology.
- **Robust Treatment Pipeline:** Parses visually confirmed pathogenic metrics returning clear Actionable Treatments, Disease Explanations, visual Confidence Metrics, and Triage Severities (Low/Med/Critical).
- **Multilingual Read-Aloud (TTS):** Engineered for raw accessibility. Dynamically reads diagnosis and complex chemical treatment instructions out loud natively across **English, Hindi, Tamil, and Telugu**. 
- **Community Outbreak Radar:** Tracks regional scans passively generating an interactive `react-leaflet` Geospatial Map. Utilizes Haversine geographic mathematical clustering to dynamically trigger UI Warning Banners if a critical mass of identical disease vectors are detected under a 10km radius within recent time blocks.
- **Offline Resilient:** Operates without forcing users to sign in. Tracks histories completely through browser-secured LocalStorage with high-contrast UI touch targets designed deliberately for harsh field environments and extreme lighting.

## 🛠 Tech Stack
- **Frontend Core:** React.js / Vite
- **Styling Hooks:** Deep CSS Custom Profiles / Glassmorphism Banners / Lucide Icons
- **ML / AI Architecture:** `@tensorflow/tfjs` + `@tensorflow-models/mobilenet`
- **Geospatial Processing:** `react-leaflet` / `leaflet` / Browser Geolocation API
- **Translation & Localization Engine:** `i18next` / Web SpeechSynthesis API

### 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/your-username/AgroLens.git
cd AgroLens
```

2. **Install dependencies**
```bash
npm install
```

3. **Spin up your local dev server**
```bash
npm run dev
```

*AgroLens targets ultra-lightweight operations specifically optimized for Android Webview and local PWA caching. Ensure standard Camera and Location permissions are enabled!*
