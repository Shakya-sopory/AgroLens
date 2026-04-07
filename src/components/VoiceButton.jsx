import { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VoiceButton = ({ textToRead }) => {
  const { t, i18n } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Stop any ongoing speech if component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Match browser languages
        const langMap = {
          en: 'en-US',
          hi: 'hi-IN',
          ta: 'ta-IN',
          te: 'te-IN'
        };
        
        const langPrefix = i18n.language.split('-')[0];
        utterance.lang = langMap[langPrefix] || 'en-US';
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-speech not supported in this browser.");
      }
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`} 
      style={{ 
        marginTop: '1rem', 
        width: '100%', 
        gap: '8px', 
        position: 'sticky', 
        bottom: '20px', 
        zIndex: 10,
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {isPlaying ? <Square size={20} /> : <Volume2 size={20} />}
      {isPlaying ? t('stopAudio') : t('playAudio')}
    </button>
  );
};

export default VoiceButton;
