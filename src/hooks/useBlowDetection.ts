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
  const [gusting, setGusting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef(0);
  const extinguishTimerRef = useRef(0);
  const strongBlowFramesRef = useRef(0);
  const smoothedIntensityRef = useRef(0);
  const reportedIntensityRef = useRef(0);
  const lastIntensityReportRef = useRef(0);
  const noiseFloorRef = useRef(0.018);
  const remainingRef = useRef(candleCount);
  const requestIdRef = useRef(0);

  const stopListening = useCallback(() => {
    requestIdRef.current += 1;
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = 0;
    window.clearTimeout(extinguishTimerRef.current);
    extinguishTimerRef.current = 0;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (contextRef.current) {
      void contextRef.current.close();
      contextRef.current = null;
    }
    strongBlowFramesRef.current = 0;
    smoothedIntensityRef.current = 0;
    reportedIntensityRef.current = 0;
    lastIntensityReportRef.current = 0;
    noiseFloorRef.current = 0.018;
    setGusting(false);
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
    const AudioContextClass =
      typeof window === "undefined"
        ? undefined
        : window.AudioContext ??
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !AudioContextClass ||
      !active ||
      pageIsHidden()
    ) {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        !AudioContextClass
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
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", pauseListening, { once: true });
      });
      const context = new AudioContextClass();
      contextRef.current = context;
      await context.resume();
      if (requestId !== requestIdRef.current || pageIsHidden()) {
        stopListening();
        return;
      }
      const analyser = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.68;
      const samples = new Uint8Array(analyser.fftSize);
      source.connect(analyser);
      setStatus("listening");
      const calibrationUntil = performance.now() + 420;

      const analyze = () => {
        if (requestId !== requestIdRef.current || pageIsHidden()) {
          pauseListening();
          return;
        }

        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        let roughness = 0;
        for (let index = 0; index < samples.length; index += 1) {
          const sample = samples[index];
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
          if (index > 0) {
            roughness += Math.abs(sample - samples[index - 1]) / 128;
          }
        }
        const rms = Math.sqrt(sum / samples.length);
        const averageRoughness = roughness / Math.max(1, samples.length - 1);
        const now = performance.now();

        if (
          now < calibrationUntil ||
          (rms < noiseFloorRef.current * 1.7 && averageRoughness < 0.025)
        ) {
          noiseFloorRef.current =
            noiseFloorRef.current * 0.985 + Math.min(rms, 0.045) * 0.015;
        }

        const signal = Math.max(0, rms - noiseFloorRef.current - 0.006);
        const visualTarget = Math.min(1, signal * 11.5);
        const smoothing =
          visualTarget > smoothedIntensityRef.current ? 0.34 : 0.13;
        smoothedIntensityRef.current +=
          (visualTarget - smoothedIntensityRef.current) * smoothing;

        if (
          Math.abs(
            smoothedIntensityRef.current - reportedIntensityRef.current,
          ) > 0.025 ||
          now - lastIntensityReportRef.current > 110
        ) {
          reportedIntensityRef.current = smoothedIntensityRef.current;
          lastIntensityReportRef.current = now;
          setIntensity(smoothedIntensityRef.current);
        }

        const isBreathLike =
          averageRoughness > 0.018 &&
          rms > Math.max(0.075, noiseFloorRef.current * 3.15);
        if (
          now > calibrationUntil &&
          isBreathLike &&
          smoothedIntensityRef.current > 0.56
        ) {
          strongBlowFramesRef.current += 1;
        } else {
          strongBlowFramesRef.current = Math.max(
            0,
            strongBlowFramesRef.current - 2,
          );
        }

        if (
          strongBlowFramesRef.current >= 7 &&
          remainingRef.current > 0
        ) {
          strongBlowFramesRef.current = 0;
          setGusting(true);
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = 0;
          extinguishTimerRef.current = window.setTimeout(() => {
            if (requestId !== requestIdRef.current) return;

            extinguishTimerRef.current = 0;
            remainingRef.current = 0;
            setRemaining(0);
            onCandleOut(0);
            setStatus("complete");
            stopListening();
            onComplete();
          }, 190);
          return;
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
    gusting,
    pauseMicrophone: pauseListening,
    remaining,
    requestMicrophone,
  };
}
