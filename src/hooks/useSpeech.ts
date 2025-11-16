import { useCallback } from 'react';

export const useSpeech = () => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported.");
    }
  }, []);
  return { speak };
};

