import { useEffect, useRef } from "react";
import type { MapState } from "@/types/telemetry";

/**
 * 2D Ultrasonic Mapping / Pseudo-LiDAR tunnel map (HC-SR04 derived).
 * NOT SLAM — this is a dead-reckoned path plus ranged returns.
 * Canvas-rendered for performance; interpolates between 1 Hz frames.
 */
export function TunnelMapCanvas({ map }: { map: MapState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef(map);
  mapRef.current = map;
  const posRef = useRef({ x: map.rover.x, y: map.rover.y });
  const sweepRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const css = getComputedStyle(document.documentElement);
    const c = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    const SIGNAL = c("--signal", "#f0a04b");
    const DATA = c("--data", "#5ec8e5");
    const DANGER = c("--danger", "#e0503a");
    const NOMINAL = c("--nominal", "#4fd39a");
    const HAIR = c("--hairline", "#3a3a44");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const m = mapRef.current;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const px = (p: { x: number; y: number }) => ({ x: (p.x / 100) * W, y: (p.y / 100) * H });

      // interpolate rover position for smooth motion between frames
      posRef.current.x += (m.rover.x - posRef.current.x) * 0.08;
      posRef.current.y += (m.rover.y - posRef.current.y) * 0.08;
      sweepRef.current = (sweepRef.current + 1.4) % 360;

      ctx.clearRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = HAIR;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // tunnel boundaries
      ctx.strokeStyle = DATA;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.5;
      for (const line of m.boundaries) {
        ctx.beginPath();
        line.forEach((p, i) => {
          const q = px(p);
          if (i === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        });
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // explored trail
      if (m.trail.length > 1) {
        ctx.strokeStyle = SIGNAL;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 2;
        ctx.beginPath();
        m.trail.forEach((p, i) => {
          const q = px(p);
          if (i === 0) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      const rover = px(posRef.current);

      // ultrasonic rays
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = DATA;
      ctx.lineWidth = 1;
      for (const ray of m.rays) {
        const a = ((m.heading + ray.angle) * Math.PI) / 180;
        const len = (ray.distance / 240) * Math.min(W, H) * 0.36;
        ctx.beginPath();
        ctx.moveTo(rover.x, rover.y);
        ctx.lineTo(rover.x + Math.cos(a) * len, rover.y - Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // radar sweep
      const sweepR = Math.min(W, H) * 0.4;
      const sa = (sweepRef.current * Math.PI) / 180;
      const grad = ctx.createRadialGradient(rover.x, rover.y, 0, rover.x, rover.y, sweepR);
      grad.addColorStop(0, "rgba(255,255,255,0.001)");
      grad.addColorStop(1, "rgba(255,255,255,0.001)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rover.x, rover.y);
      ctx.arc(rover.x, rover.y, sweepR, sa - 0.42, sa);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.clip();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = SIGNAL;
      ctx.fillRect(rover.x - sweepR, rover.y - sweepR, sweepR * 2, sweepR * 2);
      ctx.restore();
      ctx.globalAlpha = 1;

      // markers
      for (const mk of m.markers) {
        const q = px(mk);
        const color = mk.kind === "worker" ? NOMINAL : mk.kind === "hazard" ? DANGER : HAIR;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;
        if (mk.kind === "worker") {
          ctx.beginPath();
          ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(q.x, q.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (mk.kind === "hazard") {
          ctx.beginPath();
          ctx.moveTo(q.x, q.y - 6);
          ctx.lineTo(q.x + 6, q.y + 5);
          ctx.lineTo(q.x - 6, q.y + 5);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(q.x - 4, q.y - 4, 8, 8);
        }
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillStyle = color;
        ctx.fillText(mk.label.toUpperCase(), q.x + 9, q.y + 3);
      }

      // rover marker
      const hr = (m.heading * Math.PI) / 180;
      ctx.save();
      ctx.translate(rover.x, rover.y);
      ctx.rotate(-hr);
      ctx.fillStyle = SIGNAL;
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = SIGNAL;
      ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(sweepRef.current / 40));
      ctx.beginPath();
      ctx.arc(rover.x, rover.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" role="img" aria-label="2D ultrasonic tunnel map" />;
}
