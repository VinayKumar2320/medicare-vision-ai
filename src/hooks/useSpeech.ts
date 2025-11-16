import { useCallback } from 'react';

export const useSpeech = () => {
  const speak = useCallback((text: string) => {
    if (!text || text.trim().length === 0) {
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
        };

        utterance.onend = () => {
          console.log('✅ Speech synthesis completed');
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error with speech synthesis:', error);
      }
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  }, []);
  return { speak };
};

