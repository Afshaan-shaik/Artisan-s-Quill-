import React, { useEffect, useState } from 'react';

interface NoiseBoxesBackdropProps {
  className?: string;
  opacity?: number;
}

/**
 * Aceternity UI Background Noise Grid & Snapping Background Boxes
 * Designed for Charcoal, Ink, Drawing & Traditional Paintings:
 * High-density washi/cotton paper grain texture overlaid with an understated
 * geometric grid where subtle silver and parchment boxes snap dynamically into view.
 */
export const NoiseBoxesBackdrop: React.FC<NoiseBoxesBackdropProps> = ({
  className = '',
  opacity = 0.6
}) => {
  const [activeBoxes, setActiveBoxes] = useState<number[]>([]);

  // Randomly snap 6-12 subtle geometric boxes every 2.5 seconds
  useEffect(() => {
    const totalCells = 48; // 8x6 grid
    const pickRandomCells = () => {
      const count = Math.floor(Math.random() * 6) + 6;
      const indices: number[] = [];
      while (indices.length < count) {
        const r = Math.floor(Math.random() * totalCells);
        if (!indices.includes(r)) indices.push(r);
      }
      setActiveBoxes(indices);
    };

    pickRandomCells();
    const interval = setInterval(pickRandomCells, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Monochromatic Stone/Charcoal Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0c10] via-[#07080a] to-[#040507]" />

      {/* Tactile Washi Paper Noise Texture */}
      <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay bg-noise" />

      {/* Geometric Snapping Cells Grid */}
      <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 grid-rows-6 p-4 gap-[1px]">
        {Array.from({ length: 48 }).map((_, idx) => {
          const isActive = activeBoxes.includes(idx);
          return (
            <div
              key={idx}
              className={`border border-white/[0.025] rounded-[2px] transition-all duration-700 ease-out ${
                isActive
                  ? 'bg-white/[0.045] border-white/[0.1] shadow-[inset_0_0_12px_rgba(255,255,255,0.03)] scale-[0.98]'
                  : 'bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {/* Radial Vignette Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(5,6,8,0.85)_75%,#040507_100%)]" />
    </div>
  );
};
