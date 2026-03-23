import { useCallback, useRef, useState } from "react";

interface TextToSpeechResult {
  speak: (text: string, lang?: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
}

export function useTextToSpeech(): TextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback(
    (text: string, lang = "en-IN") => {
      if (!isSupported) {
        setError("Text-to-speech is not supported in this browser.");
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setError(null);
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError("Speech synthesis error");
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported, error };
}
