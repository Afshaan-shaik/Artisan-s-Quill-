import React, { useEffect, useRef } from 'react';

interface ShootingStarsBackdropProps {
  className?: string;
  opacity?: number;
}

interface Star {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  thickness: number;
}

/**
 * Aceternity UI Shooting Stars with Concentric Gravitational Waves
 * Designed for 3D Cosmos & Celestial spotlight themes:
 * Concentric orbital rings pulsing smoothly from the center,
 * with periodic high-speed meteor shooting stars sweeping across the dark void.
 */
export const ShootingStarsBackdrop: React.FC<ShootingStarsBackdropProps> = ({
  className = '',
  opacity = 0.6
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

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Static background stars
    const staticStars = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2
    }));

    // Dynamic shooting stars array
    const shootingStars: Star[] = [];
    const spawnShootingStar = () => {
      if (shootingStars.length >= 3) return;
      shootingStars.push({
        x: Math.random() * (width * 0.8),
        y: Math.random() * (height * 0.4),
        length: Math.random() * 120 + 80,
        speed: Math.random() * 8 + 10,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // ~45 deg
        opacity: 1,
        thickness: Math.random() * 1.5 + 1
      });
    };

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Concentric Orbital Waves
      const numRings = 4;
      for (let r = 1; r <= numRings; r++) {
        const baseRadius = r * 140;
        const waveRadius = baseRadius + Math.sin(time * 0.8 + r) * 12;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201, 168, 117, ${0.04 - r * 0.006})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 16]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Static Stars
      staticStars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha + Math.sin(time + star.x) * 0.15})`;
        ctx.fill();
      });

      // 3. Spawning & Animating Shooting Stars
      if (Math.random() < 0.02) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.012;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Draw meteor trail
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(201, 168, 117, ${s.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ opacity }}
      />
      {/* Radial Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,6,8,0.85)_75%,#040507_100%)]" />
    </div>
  );
};
