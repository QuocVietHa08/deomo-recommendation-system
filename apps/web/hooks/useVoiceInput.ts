"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceState = "idle" | "listening" | "unsupported";

interface Options {
  onTranscript: (text: string) => void;
}

export function useVoiceInput({ onTranscript }: Options) {
  const [state, setState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stoppedManuallyRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setState("unsupported");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      // Collect all new final results from this event
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          transcript += e.results[i][0].transcript;
        }
      }
      if (transcript.trim()) onTranscriptRef.current(transcript.trim());
    };

    recognition.onend = () => {
      // Restart automatically unless the user manually stopped
      if (!stoppedManuallyRef.current) {
        try { recognition.start(); } catch {}
      } else {
        setState("idle");
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech") return; // ignore silence, keep going
      setState("idle");
    };

    recognitionRef.current = recognition;
  }, []);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (state === "listening") {
      stoppedManuallyRef.current = true;
      recognition.stop();
    } else {
      stoppedManuallyRef.current = false;
      recognition.start();
      setState("listening");
    }
  }, [state]);

  const stop = useCallback(() => {
    stoppedManuallyRef.current = true;
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  return { voiceState: state, toggleVoice: toggle, stopVoice: stop };
}
