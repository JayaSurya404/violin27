"use client";
import { useEffect, useRef } from "react";
import { useReducedMotionPreference } from "@/hooks/useReducedMotion";

export function Atmosphere({ warm = false }: { warm?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const context = canvas.getContext("2d"); if (!context) return;
    let frame = 0; let animation = 0;
    const stars = Array.from({ length: 115 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .2, phase: Math.random() * Math.PI * 2 }));
    const render = () => {
      const { innerWidth: width, innerHeight: height, devicePixelRatio: pixelRatio } = window;
      if (canvas.width !== width * pixelRatio || canvas.height !== height * pixelRatio) { canvas.width = width * pixelRatio; canvas.height = height * pixelRatio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); }
      context.clearRect(0, 0, width, height);
      const wash = context.createRadialGradient(width * .72, height * .2, 0, width * .72, height * .2, width * .8);
      wash.addColorStop(0, warm ? "rgba(190,121,255,.20)" : "rgba(119,61,214,.16)"); wash.addColorStop(.45, "rgba(82,34,150,.07)"); wash.addColorStop(1, "rgba(8,6,17,0)"); context.fillStyle = wash; context.fillRect(0, 0, width, height);
      stars.forEach((star) => { const alpha = .22 + (Math.sin(frame * .012 + star.phase) + 1) * .22; context.beginPath(); context.fillStyle = `rgba(232,225,255,${alpha})`; context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2); context.fill(); });
      if (!reduced) { frame += 1; animation = requestAnimationFrame(render); }
    };
    render(); return () => cancelAnimationFrame(animation);
  }, [reduced, warm]);
  return <><canvas ref={canvasRef} className="atmosphere" aria-hidden="true"/><div className={`aurora ${warm ? "aurora--warm" : ""}`} aria-hidden="true"/></>;
}
