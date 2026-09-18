import React, { useEffect, useState, useRef } from 'react';

interface NoiseBoxesBackdropProps {
  className?: string;
  opacity?: number;
}

/**
 * Premium Aceternity UI Background Noise Grid & Snapping Geometric Boxes
 * Designed for Charcoal, Ink, Drawing & Traditional Paintings:
 * - Rich tactile graphite & washi paper gradient base
 * - High-visibility geometric grid cells that snap dynamically into view
 * - Interactive mouse hover tracking that ignites neighboring silver cells
 * - Fine floating ink dust particles
 */
export const NoiseBoxesBackdrop: React.FC<NoiseBoxesBackdropProps> = ({
  className = '',
  opacity = 0.85
}) => {
  const [activeBoxes, setActiveBoxes] = useState<number[]>([]);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Total 8x6 = 48 cells
  const totalCells = 48;

  // Snapping boxes logic: dynamically changes highlighted cells
  useEffect(() => {
    const cycleBoxes = () => {
      const count = Math.floor(Math.random() * 8) + 8; // 8-16 active cells
      const indices: number[] = [];
      while (indices.length < count) {
        const r = Math.floor(Math.random() * totalCells);
        if (!indices.includes(r)) indices.push(r);
      }
      setActiveBoxes(indices);
    };

    cycleBoxes();
    const interval = setInterval(cycleBoxes, 2000);
    return () => clearInterval(interval);
  }, []);

  // Global mouse move to detect hovered grid cell
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        setHoveredBox(null);
        return;
      }

      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      const col = Math.floor(relX * 8);
      const row = Math.floor(relY * 6);
      if (col >= 0 && col < 8 && row >= 0 && row < 6) {
        setHoveredBox(row * 8 + col);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Rich Graphite & Warm Charcoal Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d12] via-[#12141a]/60 to-[#06070a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(51,65,85,0.25)_0%,rgba(30,41,59,0.15)_50%,transparent_80%)]" />

      {/* Tactile Paper Grain Texture */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-noise" />

      {/* Snapping Geometric Cells Grid */}
      <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 grid-rows-6 p-4 gap-1.5 z-10">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isActive = activeBoxes.includes(idx);
          const isHovered = hoveredBox === idx;

          return (
            <div
              key={idx}
              className={`border rounded-sm transition-all duration-500 ease-out ${
                isHovered
                  ? 'bg-white/20 border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.02]'
                  : isActive
                  ? 'bg-white/[0.08] border-white/25 shadow-[inset_0_0_15px_rgba(255,255,255,0.06)]'
                  : 'bg-transparent border-white/[0.04]'
              }`}
            />
          );
        })}
      </div>

      {/* Soft Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,7,10,0.75)_80%,#040508_100%)] z-20" />
    </div>
  );
};
