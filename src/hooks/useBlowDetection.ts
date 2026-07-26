"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MicrophoneState =
  | "idle"
  | "requesting"
  | "listening"
  | "denied"
  | "unavailable"
  | "complete";

type BlowDetectionOptions = {
  active: boolean;
  candleCount: number;
  onCandleOut: (remaining: number) => void;
  onComplete: () => void;
};

const pageIsHidden = () => document.visibilityState === "hidden";

export function useBlowDetection({
  active,
  candleCount,
  onCandleOut,
  onComplete,
}: BlowDetectionOptions) {
  const [status, setStatus] = useState<MicrophoneState>("idle");
  const [intensity, setIntensity] = useState(0);
  const [remaining, setRemaining] = useState(candleCount);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef(0);
  const blowingFramesRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const remainingRef = useRef(candleCount);
  const requestIdRef = useRef(0);

  const stopListening = useCallback(() => {
    requestIdRef.current += 1;
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = 0;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (contextRef.current) {
      void contextRef.current.close();
      contextRef.current = null;
    }
    blowingFramesRef.current = 0;
    setIntensity(0);
  }, []);

  const pauseListening = useCallback(() => {
    stopListening();
    setStatus((current) =>
      current === "requesting" || current === "listening" ? "idle" : current,
    );
  }, [stopListening]);

  const dismissMicrophoneNotice = useCallback(() => {
    stopListening();
    setStatus("idle");
  }, [stopListening]);

  const requestMicrophone = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof window.AudioContext === "undefined" ||
      !active ||
      pageIsHidden()
    ) {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof window.AudioContext === "undefined"
      ) {
        setStatus("unavailable");
      }
      return;
    }

    stopListening();
    const requestId = requestIdRef.current;
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: true,
          noiseSuppression: false,
        },
      });

      if (requestId !== requestIdRef.current || pageIsHidden()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.72;
      const samples = new Uint8Array(analyser.fftSize);
      source.connect(analyser);
      setStatus("listening");

      const analyze = () => {
        if (requestId !== requestIdRef.current || pageIsHidden()) {
          pauseListening();
          return;
        }

        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / samples.length);
        const visualIntensity = Math.min(1, Math.max(0, (rms - 0.025) * 7.5));
        setIntensity(visualIntensity);

        if (rms > 0.095) {
          blowingFramesRef.current += 1;
        } else {
          blowingFramesRef.current = Math.max(0, blowingFramesRef.current - 2);
        }

        const now = performance.now();
        if (
          blowingFramesRef.current > 9 &&
          now > cooldownUntilRef.current &&
          remainingRef.current > 0
        ) {
          blowingFramesRef.current = 0;
          cooldownUntilRef.current = now + 420;
          remainingRef.current -= 1;
          setRemaining(remainingRef.current);
          onCandleOut(remainingRef.current);

          if (remainingRef.current === 0) {
            setStatus("complete");
            stopListening();
            onComplete();
            return;
          }
        }

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      animationFrameRef.current = requestAnimationFrame(analyze);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      const errorName =
        error instanceof DOMException ? error.name.toLowerCase() : "";
      setStatus(
        errorName.includes("denied") || errorName.includes("allowed")
          ? "denied"
          : "unavailable",
      );
      stopListening();
    }
  }, [active, onCandleOut, onComplete, pauseListening, stopListening]);

  useEffect(() => {
    if (!active) return;
    return pauseListening;
  }, [active, pauseListening]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (pageIsHidden()) pauseListening();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pauseListening]);

  useEffect(() => stopListening, [stopListening]);

  return {
    dismissMicrophoneNotice,
    status,
    intensity,
    pauseMicrophone: pauseListening,
    remaining,
    requestMicrophone,
  };
}
