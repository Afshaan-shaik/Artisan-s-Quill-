import React, { useEffect, useRef } from 'react';

interface InteractiveGridDotsBackdropProps {
  className?: string;
  opacity?: number;
  highlightColor?: string;
}

/**
 * Premium Aceternity UI Interactive Digital Grid with 3D Cursor Distortion
 * Designed for Digital Art & Generative Shaders:
 * - Rich ambient cyberpunk cyan & deep navy radial gradient atmosphere
 * - DevicePixelRatio-aware HTML5 Canvas for razor-sharp rendering
 * - Window-level mouse tracking with magnetic 3D coordinate distortion
 * - Continuous ambient harmonic undulation so it NEVER looks static or dead
 * - Glowing neon cyan node points with bloom
 */
export const InteractiveGridDotsBackdrop: React.FC<InteractiveGridDotsBackdropProps> = ({
  className = '',
  opacity = 0.9,
  highlightColor = '#06b6d4'
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
    let dpr = window.devicePixelRatio || 1;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let isMouseOver = false;
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

    // Global pointer tracking ensures responsiveness across the entire modal stage
    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;

      if (
        targetMouseX >= -50 &&
        targetMouseX <= width + 50 &&
        targetMouseY >= -50 &&
        targetMouseY <= height + 50
      ) {
        isMouseOver = true;
      } else {
        isMouseOver = false;
      }
    };

    const handlePointerLeave = () => {
      isMouseOver = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    const spacing = 36;

    // Digital floating dust / matrix spark particles
    const sparks = Array.from({ length: 24 }).map(() => ({
      x: Math.random() * (width || 800),
      y: Math.random() * (height || 600),
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.3
    }));

    const render = () => {
      time += 0.02;

      // Smooth mouse interpolation
      if (isMouseOver) {
        mouseX += (targetMouseX - mouseX) * 0.12;
        mouseY += (targetMouseY - mouseY) * 0.12;
      } else {
        // Natural ambient roaming attractor when idle
        const idleX = width / 2 + Math.sin(time * 0.8) * (width * 0.25);
        const idleY = height / 2 + Math.cos(time * 0.6) * (height * 0.2);
        mouseX += (idleX - mouseX) * 0.04;
        mouseY += (idleY - mouseY) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const maxDist = 260;

      // 1. Draw 3D Distorted Grid Lines
      ctx.lineWidth = 1.2;

      // Vertical lines
      for (let x = 0; x < cols; x++) {
        ctx.beginPath();
        for (let y = 0; y < rows; y++) {
          const baseX = x * spacing;
          const baseY = y * spacing;
          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let px = baseX;
          let py = baseY;

          if (dist < maxDist && dist > 0) {
            const factor = 1 - dist / maxDist;
            const push = Math.sin(factor * Math.PI) * 32;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }

          // Gentle persistent organic undulation
          py += Math.sin(time + x * 0.35) * 3;
          px += Math.cos(time + y * 0.35) * 2;

          if (y === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Distance of line to mouse determines line brightness
        const lineDist = Math.abs(x * spacing - mouseX);
        const lineAlpha = lineDist < maxDist ? 0.35 + (1 - lineDist / maxDist) * 0.3 : 0.15;
        ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < rows; y++) {
        ctx.beginPath();
        for (let x = 0; x < cols; x++) {
          const baseX = x * spacing;
          const baseY = y * spacing;
          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let px = baseX;
          let py = baseY;

          if (dist < maxDist && dist > 0) {
            const factor = 1 - dist / maxDist;
            const push = Math.sin(factor * Math.PI) * 32;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }

          py += Math.sin(time + x * 0.35) * 3;
          px += Math.cos(time + y * 0.35) * 2;

          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        const lineDist = Math.abs(y * spacing - mouseY);
        const lineAlpha = lineDist < maxDist ? 0.35 + (1 - lineDist / maxDist) * 0.3 : 0.15;
        ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
        ctx.stroke();
      }

      // 2. Draw Interactive Dots & Glowing Intersection Nodes
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const baseX = x * spacing;
          const baseY = y * spacing;
          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let px = baseX;
          let py = baseY;
          let isHighlighted = false;
          let highlightFactor = 0;

          if (dist < maxDist && dist > 0) {
            highlightFactor = 1 - dist / maxDist;
            const push = Math.sin(highlightFactor * Math.PI) * 32;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
            isHighlighted = true;
          }

          py += Math.sin(time + x * 0.35) * 3;
          px += Math.cos(time + y * 0.35) * 2;

          ctx.beginPath();
          if (isHighlighted) {
            const dotRadius = 2.2 + highlightFactor * 3.5;
            ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = highlightFactor > 0.6 ? '#ffffff' : highlightColor;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 14 * highlightFactor;
          } else {
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }

      // 3. Ambient Floating Sparks
      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.y < 0) {
          s.y = height + 10;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${s.alpha + Math.sin(time * 2 + s.x) * 0.2})`;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [highlightColor]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Deep Cyberpunk Dark Navy & Cyan Ambient Aura */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#041d2e]/40 to-[#020617]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.22)_0%,rgba(14,116,144,0.12)_45%,transparent_75%)]" />

      {/* High-Precision Interactive Canvas Grid */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-10"
      />

      {/* Gentle Radial Vignette Focus so Artwork remains spotlit */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(3,7,18,0.7)_80%,#020617_100%)] z-20" />
    </div>
  );
};
