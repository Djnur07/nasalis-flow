"use client";

import { useEffect, useRef } from "react";

type FlowFieldCanvasProps = {
  className?: string;
  /** RGB triplet for the flowing lines, e.g. "178, 85, 46" for terracotta. */
  color?: string;
  /** RGB triplet for the background fade-trail — should match the section's background. */
  fadeColor?: string;
};

/**
 * A live, looping flow-field particle animation — a literal, lightweight
 * echo of the algorithm that generates each Nasalis Flow portrait (hash →
 * noise field → flowing lines). Purely decorative; respects
 * prefers-reduced-motion by drawing a single still frame instead of looping.
 */
export function FlowFieldCanvas({
  className = "",
  color = "178, 85, 46",
  fadeColor = "243, 236, 220",
}: FlowFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let particles: { x: number; y: number; life: number }[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth ?? canvas.clientWidth;
      height = parent?.clientHeight ?? canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      particles = Array.from({ length: 90 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        life: 60 + Math.random() * 160,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const noise = (x: number, y: number, t: number) =>
      Math.sin(x * 0.0035 + t) + Math.cos(y * 0.004 - t * 0.8);

    let raf = 0;
    let t = Math.random() * 10;

    const step = () => {
      t += 0.004;
      ctx.fillStyle = `rgba(${fadeColor}, 0.06)`;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = `rgba(${color}, 0.4)`;
      ctx.lineWidth = 1;

      particles.forEach((p) => {
        const angle = noise(p.x, p.y, t) * Math.PI;
        const nx = p.x + Math.cos(angle) * 1.4;
        const ny = p.y + Math.sin(angle) * 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        p.life -= 1;
        if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 120 + Math.random() * 120;
        }
      });

      raf = requestAnimationFrame(step);
    };

    if (reduceMotion) {
      ctx.strokeStyle = `rgba(${color}, 0.4)`;
      ctx.lineWidth = 1;
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 20, p.y + 8);
        ctx.stroke();
      });
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [color, fadeColor]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
