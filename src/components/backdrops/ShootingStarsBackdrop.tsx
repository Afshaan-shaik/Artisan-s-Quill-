import React, { useEffect, useRef } from 'react';

interface ShootingStarsBackdropProps {
  className?: string;
  opacity?: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  thickness: number;
  color: string;
}

/**
 * Premium Aceternity UI 3D Cosmos & Celestial Backdrop
 * Designed for 3D Cosmos & Curatorial Spotlight:
 * - Glowing nebula atmosphere with deep indigo, violet, and obsidian gradients
 * - Concentric gravitational wave rings that pulse smoothly outward
 * - Frequent luminous meteor shooting stars with radiant tails
 * - Gravitational lens cursor interaction
 */
export const ShootingStarsBackdrop: React.FC<ShootingStarsBackdropProps> = ({
  className = '',
  opacity = 0.9
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetX = -1000;
    let targetY = -1000;
    let time = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Multi-tint static stars
    const starColors = ['#ffffff', '#dfbd87', '#38bdf8', '#c084fc'];
    const stars: Star[] = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 600),
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.6 + 0.3,
      pulseSpeed: Math.random() * 0.04 + 0.01,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    }));

    const shootingStars: ShootingStar[] = [];

    const spawnMeteor = () => {
      if (shootingStars.length >= 4) return;
      shootingStars.push({
        x: Math.random() * (width * 0.85),
        y: Math.random() * (height * 0.4),
        length: Math.random() * 140 + 90,
        speed: Math.random() * 10 + 12,
        angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15),
        opacity: 1,
        thickness: Math.random() * 2 + 1.2,
        color: Math.random() > 0.5 ? '#dfbd87' : '#38bdf8'
      });
    };

    const render = () => {
      time += 0.018;
      mouseX += (targetX - mouseX) * 0.08;
      mouseY += (targetY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Concentric Gravitational Orbit Waves
      const ringCount = 5;
      for (let r = 1; r <= ringCount; r++) {
        const baseRadius = r * 110;
        const waveRadius = baseRadius + Math.sin(time * 0.9 + r * 1.2) * 16;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        const ringAlpha = Math.max(0.04, 0.14 - r * 0.02);
        ctx.strokeStyle = `rgba(201, 168, 117, ${ringAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([10, 16]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Stars with Twinkling & Gravitational Shift
      stars.forEach((s) => {
        let px = s.x;
        let py = s.y;

        // Subtle pull towards cursor if nearby
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const factor = (1 - dist / 200) * 14;
          px -= (dx / dist) * factor;
          py -= (dy / dist) * factor;
        }

        const currentAlpha = Math.min(1, Math.max(0.2, s.alpha + Math.sin(time * 3 + s.x) * 0.35));

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        if (s.size > 1.8) {
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 3. Periodic Meteor Spawn
      if (Math.random() < 0.035) {
        spawnMeteor();
      }

      // 4. Draw Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.016;

        if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.65, s.color === '#dfbd87' ? `rgba(223, 189, 135, ${s.opacity * 0.7})` : `rgba(56, 189, 248, ${s.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thickness;
        ctx.lineCap = 'round';
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Deep Space Nebula Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05060d] via-[#0b0f1e]/60 to-[#020306]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.18)_0%,rgba(147,51,234,0.12)_45%,transparent_75%)]" />

      {/* High-Precision Cosmic Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-10"
      />

      {/* Radial Vignette Focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,4,8,0.7)_80%,#020306_100%)] z-20" />
    </div>
  );
};
