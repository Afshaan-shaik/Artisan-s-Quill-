import React from 'react';
import { CanvasRevealBackdrop } from './CanvasRevealBackdrop';
import { AuroraFluidBackdrop } from './AuroraFluidBackdrop';
import { InteractiveGridDotsBackdrop } from './InteractiveGridDotsBackdrop';
import { NoiseBoxesBackdrop } from './NoiseBoxesBackdrop';
import { ShootingStarsBackdrop } from './ShootingStarsBackdrop';

interface ModalMediumBackdropProps {
  category?: string;
  isVideo?: boolean;
  lightingMode?: string;
  className?: string;
}

/**
 * Universal Curatorial Modal Backdrop Resolver
 * Automatically renders the exact artistic backdrop corresponding to the artwork medium:
 * - Poetry -> Canvas Reveal Dot Matrix (warm gold / silver breathing)
 * - Video / Loops -> Efferd UI Aurora Liquid Gradient (indigo / metallic purple / amber)
 * - Digital Art -> Aceternity 3D Grid with Dots & Cyan Cursor Distortion
 * - Charcoal, Ink & Traditional Painting -> Washi Noise Grid & Snapping Boxes
 * - Cosmos & 3D Celestial -> Concentric Waves & Shooting Stars
 */
export const ModalMediumBackdrop: React.FC<ModalMediumBackdropProps> = ({
  category = 'digital',
  isVideo = false,
  lightingMode = 'obsidian',
  className = ''
}) => {
  const normalizedCategory = (category || '').toLowerCase();

  // Determine which backdrop component fits the medium
  const renderBackdrop = () => {
    if (isVideo || normalizedCategory === 'video') {
      return <AuroraFluidBackdrop opacity={lightingMode === 'spotlight' ? 0.65 : 0.5} />;
    }

    if (normalizedCategory === 'poetry') {
      return <CanvasRevealBackdrop opacity={lightingMode === 'spotlight' ? 0.7 : 0.55} />;
    }

    if (
      normalizedCategory === 'digital' ||
      normalizedCategory === 'generative' ||
      normalizedCategory === 'shader'
    ) {
      return <InteractiveGridDotsBackdrop opacity={lightingMode === 'spotlight' ? 0.75 : 0.6} />;
    }

    if (
      normalizedCategory === 'drawing' ||
      normalizedCategory === 'painting' ||
      normalizedCategory === 'charcoal' ||
      normalizedCategory === 'ink' ||
      normalizedCategory === 'traditional'
    ) {
      return <NoiseBoxesBackdrop opacity={lightingMode === 'spotlight' ? 0.7 : 0.55} />;
    }

    if (
      normalizedCategory === 'cosmos' ||
      normalizedCategory === 'celestial' ||
      normalizedCategory === '3d'
    ) {
      return <ShootingStarsBackdrop opacity={lightingMode === 'spotlight' ? 0.75 : 0.6} />;
    }

    // Default for any other visual medium: High-tech interactive grid
    return <InteractiveGridDotsBackdrop opacity={0.5} />;
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700 ${className}`}
      aria-hidden="true"
    >
      {renderBackdrop()}
    </div>
  );
};
