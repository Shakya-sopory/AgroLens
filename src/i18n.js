import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      appName: "AgroLens",
      scanCrop: "Scan Crop",
      retake: "Retake",
      analyze: "Analyze Disease",
      history: "History",
      map: "Map",
      uploading: "Analyzing with AI...",
      diagnosis: "Diagnosis",
      confidence: "Confidence",
      severity: "Severity",
      treatment: "Treatment Recommendation",
      playAudio: "Play Audio",
      stopAudio: "Stop Audio",
      low: "Low",
      medium: "Medium",
      critical: "Critical",
      noHistory: "No scans yet. Start by scanning a crop!",
      communityMap: "Community Disease Map",
      takePhoto: "Take a photo to detect diseases",
      languageReady: "Language automatically detected"
    }
  },
  hi: {
    translation: {
      appName: "AgroLens",
      scanCrop: "फसल स्कैन करें",
      retake: "फिर से लें",
      analyze: "बीमारी का विश्लेषण करें",
      history: "इतिहास",
      map: "नक्शा",
      uploading: "AI से विश्लेषण हो रहा है...",
      diagnosis: "निदान",
      confidence: "सटीकता",
      severity: "गंभीरता",
      treatment: "उपचार की सलाह",
      playAudio: "ऑडियो चलाएं",
      stopAudio: "ऑडियो रोकें",
      low: "कम",
      medium: "मध्यम",
      critical: "गंभीर",
      noHistory: "अभी तक कोई स्कैन नहीं। फसल स्कैन करके शुरुआत करें!",
      communityMap: "सामुदायिक बीमारी मानचित्र",
      takePhoto: "बीमारियों का पता लगाने के लिए एक फोटो लें",
      languageReady: "भाषा स्वतः पहचानी गई"
    }
  },
  ta: {
    translation: {
      appName: "AgroLens",
      scanCrop: "பயிரை ஸ்கேன் செய்",
      retake: "மீண்டும் எடு",
      analyze: "நோயை பகுப்பாய்வு செய்",
      history: "வரலாறு",
      map: "வரைபடம்",
      uploading: "AI மூலம் பகுப்பாய்வு செய்யப்படுகிறது...",
      diagnosis: "கண்டறிதல்",
      confidence: "நம்பிக்கை",
      severity: "தீவிரம்",
      treatment: "சிகிச்சை பரிந்துரை",
      playAudio: "ஆடியோவை இயக்கு",
      stopAudio: "ஆடியோவை நிறுத்து",
      low: "குறைவு",
      medium: "நடுத்தரம்",
      critical: "தீவிரம்",
      noHistory: "இதுவரை ஸ்கேன் இல்லை. பயிரை ஸ்கேன் செய்து தொடங்கவும்!",
      communityMap: "சமூக நோய் வரைபடம்",
      takePhoto: "நோய்களைக் கண்டறிய புகைப்படம் எடுக்கவும்",
      languageReady: "மொழி தானாகவே கண்டறியப்பட்டது"
    }
  },
  te: {
    translation: {
      appName: "AgroLens",
      scanCrop: "పంటను స్కాన్ చేయండి",
      retake: "మళ్లీ తీయండి",
      analyze: "వ్యాధిని విశ్లేషించండి",
      history: "చరిత్ర",
      map: "మ్యాప్",
      uploading: "AI ద్వారా విశ్లేషించబడుతోంది...",
      diagnosis: "రోగ నిర్ధారణ",
      confidence: "నమ్మకం",
      severity: "తీవ్రత",
      treatment: "చికిత్స సిఫార్సు",
      playAudio: "ఆడియో ప్లే చేయండి",
      stopAudio: "ఆడియో ఆపండి",
      low: "తక్కువ",
      medium: "మధ్యస్థం",
      critical: "క్లిష్టమైన",
      noHistory: "ఇంకా స్కాన్‌లు లేవు. పంటను స్కాన్ చేసి ప్రారంభించండి!",
      communityMap: "కమ్యూనిటీ వ్యాధి మ్యాప్",
      takePhoto: "వ్యాధులను గుర్తించడానికి ఫోటో తీయండి",
      languageReady: "భాష స్వయంచాలకంగా కనుగొనబడింది"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
