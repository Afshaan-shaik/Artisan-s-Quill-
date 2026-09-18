import React, { useEffect, useRef } from 'react';

interface InteractiveGridDotsBackdropProps {
  className?: string;
  opacity?: number;
  gridSpacing?: number;
  highlightColor?: string;
}

/**
 * Aceternity UI Interactive Background Grid with Dots & 3D Cursor Distortion
 * Designed for Digital Art & Generative Shaders:
 * High-tech coordinate plane with parabolic gravity displacement around the cursor,
 * illuminating node points in neon cyberpunk cyan.
 */
export const InteractiveGridDotsBackdrop: React.FC<InteractiveGridDotsBackdropProps> = ({
  className = '',
  opacity = 0.6,
  gridSpacing = 32,
  highlightColor = '#06b6d4'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const parent = canvas.parentElement;
    let width = (canvas.width = parent?.clientWidth || 800);
    let height = (canvas.height = parent?.clientHeight || 600);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetX = -1000;
    let targetY = -1000;
    let time = 0;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      targetX = -1000;
      targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    parent?.addEventListener('mousemove', handleMouseMove);
    parent?.addEventListener('mouseleave', handleMouseLeave);

    const spacing = gridSpacing;

    const render = () => {
      time += 0.015;
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const maxDist = 200;

      // Draw lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';

      // Vertical grid lines
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
            const push = Math.sin(factor * Math.PI) * 24;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }

          py += Math.sin(time + x * 0.3) * 1.5;

          if (y === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Horizontal grid lines
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
            const push = Math.sin(factor * Math.PI) * 24;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
          }

          py += Math.sin(time + x * 0.3) * 1.5;

          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw Coordinate Dots
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const baseX = x * spacing;
          const baseY = y * spacing;
          const dx = baseX - mouseX;
          const dy = baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let px = baseX;
          let py = baseY;
          let isHovered = false;

          if (dist < maxDist && dist > 0) {
            const factor = 1 - dist / maxDist;
            const push = Math.sin(factor * Math.PI) * 24;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
            isHovered = true;
          }

          py += Math.sin(time + x * 0.3) * 1.5;

          ctx.beginPath();
          if (isHovered) {
            const factor = 1 - dist / maxDist;
            ctx.arc(px, py, 1.8 + factor * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${0.45 + factor * 0.55})`;
            ctx.shadowColor = highlightColor;
            ctx.shadowBlur = 8 * factor;
          } else {
            ctx.arc(px, py, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
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
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSpacing, highlightColor]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ opacity }}
      />
      {/* Radial Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,8,13,0.85)_75%,#050608_100%)]" />
    </div>
  );
};
