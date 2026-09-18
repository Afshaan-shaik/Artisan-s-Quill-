import React, { useEffect, useRef } from 'react';

interface AuroraFluidBackdropProps {
  className?: string;
  opacity?: number;
}

/**
 * 21st.dev / Efferd UI Aurora Liquid Gradient Background
 * Designed for Fluid Videos & Volumetric Loops:
 * Liquid iridescent oil-slick dynamics blending deep violet, neon indigo,
 * warm amber gold, and electric cyan with organic harmonic undulations.
 */
export const AuroraFluidBackdrop: React.FC<AuroraFluidBackdropProps> = ({
  className = '',
  opacity = 0.85
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };

    resize();
    window.addEventListener('resize', resize);

    // Dynamic fluid blobs
    const blobs = [
      { x: 0.25, y: 0.3, r: 0.4, color: 'rgba(147, 51, 234, 0.45)', speed: 0.8 }, // Purple
      { x: 0.75, y: 0.65, r: 0.45, color: 'rgba(79, 70, 229, 0.5)', speed: 1.1 },  // Indigo
      { x: 0.5, y: 0.4, r: 0.35, color: 'rgba(217, 119, 6, 0.38)', speed: 0.9 },   // Amber Gold
      { x: 0.8, y: 0.25, r: 0.38, color: 'rgba(6, 182, 212, 0.35)', speed: 1.2 }   // Cyan
    ];

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw multi-stop glowing fluid gradients
      blobs.forEach((blob, idx) => {
        const currentX = (blob.x + Math.sin(time * blob.speed + idx * 1.5) * 0.18) * width;
        const currentY = (blob.y + Math.cos(time * blob.speed * 0.8 + idx * 2.0) * 0.18) * height;
        const currentRadius = blob.r * Math.min(width, height) * (1 + Math.sin(time + idx) * 0.15);

        const gradient = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          Math.max(10, currentRadius)
        );

        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(0.55, blob.color.replace(/[\d\.]+\)$/, '0.15)'));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, Math.max(10, currentRadius), 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Deep Obsidian Background Base */}
      <div className="absolute inset-0 bg-[#06070a]" />

      {/* Floating Canvas Fluid Waves */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block filter blur-[50px] scale-110"
      />

      {/* Subtle organic noise */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-noise" />

      {/* Soft Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,7,10,0.75)_80%,#040508_100%)]" />
    </div>
  );
};
