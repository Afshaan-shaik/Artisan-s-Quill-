import React, { useEffect, useRef } from 'react';

interface CanvasRevealBackdropProps {
  className?: string;
  speed?: number;
  dotSize?: number;
  colors?: string[];
  opacity?: number;
}

/**
 * Aceternity UI Canvas Reveal Effect
 * Designed for Poetry Reading Chamber:
 * Smoothly breathes a subtle dot matrix in muted silvertone,
 * radiating into warm burning gold and white constellation particles.
 */
export const CanvasRevealBackdrop: React.FC<CanvasRevealBackdropProps> = ({
  className = '',
  speed = 0.6,
  dotSize = 1.4,
  opacity = 0.55
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);
    let time = 0;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const spacing = 28;

    const render = () => {
      time += 0.012 * speed;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;

          // Wave equation for breathing poetic rhythm
          const distFromCenter = Math.sqrt(
            Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2)
          );
          const wave = Math.sin(time + distFromCenter * 0.008);
          const secondaryWave = Math.cos(time * 0.8 + (i + j) * 0.15);

          // Alternating color matrix between subtle silver and warm gold
          const isGold = (i + j) % 5 === 0 || wave > 0.6;
          const currentRadius = dotSize * (0.8 + wave * 0.45);

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.5, currentRadius), 0, Math.PI * 2);

          if (isGold) {
            const goldAlpha = Math.min(0.65, Math.max(0.1, 0.3 + wave * 0.35));
            ctx.fillStyle = `rgba(223, 189, 135, ${goldAlpha})`;
            ctx.shadowColor = '#c9a875';
            ctx.shadowBlur = wave > 0.4 ? 6 : 0;
          } else {
            const silverAlpha = Math.min(0.3, Math.max(0.04, 0.12 + secondaryWave * 0.1));
            ctx.fillStyle = `rgba(241, 245, 249, ${silverAlpha})`;
            ctx.shadowBlur = 0;
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed, dotSize]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ opacity }}
      />
      {/* Central focus radial vignette so poem text remains effortlessly legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(6,8,13,0.85)_75%,#050608_100%)]" />
    </div>
  );
};
