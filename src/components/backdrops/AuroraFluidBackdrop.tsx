import React from 'react';

interface AuroraFluidBackdropProps {
  className?: string;
  opacity?: number;
}

/**
 * 21st.dev / Efferd UI Aurora Liquid Gradient Background
 * Designed for Fluid Videos and Volumetric Loops:
 * Continuous, organic fluid mesh flowing from obsidian/zinc
 * into an iridescent oil slick palette of deep indigo, metallic purple, and warm amber.
 */
export const AuroraFluidBackdrop: React.FC<AuroraFluidBackdropProps> = ({
  className = '',
  opacity = 0.5
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      {/* Background Deep Zinc/Obsidian Base */}
      <div className="absolute inset-0 bg-[#07080c]" />

      {/* Floating Animated Fluid Blobs (CSS GPU-accelerated) */}
      <div className="absolute inset-0 filter blur-[90px] transform-gpu">
        {/* Blob 1: Metallic Purple / Violet */}
        <div
          className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-900/60 to-indigo-600/40 -top-24 -left-20 animate-pulse"
          style={{
            animationDuration: '10s',
            animationIterationCount: 'infinite'
          }}
        />

        {/* Blob 2: Deep Indigo & Cyan */}
        <div
          className="absolute w-[520px] h-[520px] rounded-full bg-gradient-to-br from-indigo-900/50 via-sky-900/40 to-cyan-950/30 -bottom-28 -right-20 animate-pulse"
          style={{
            animationDuration: '14s',
            animationIterationCount: 'infinite',
            animationDelay: '2s'
          }}
        />

        {/* Blob 3: Iridescent Amber / Warm Gold Core Accent */}
        <div
          className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-r from-amber-600/30 to-yellow-500/20 top-1/3 left-1/3 animate-pulse"
          style={{
            animationDuration: '12s',
            animationIterationCount: 'infinite',
            animationDelay: '4s'
          }}
        />

        {/* Blob 4: Obsidian Shadow Wave */}
        <div
          className="absolute w-[600px] h-[400px] rounded-full bg-zinc-950/70 top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2"
        />
      </div>

      {/* Subtle Noise Texture for tactile organic grain */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay bg-noise" />

      {/* Radial Vignette Focus Mask */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(7,8,12,0.8)_75%,#050608_100%)]" />
    </div>
  );
};
