import React from 'react';
import { CanvasRevealBackdrop } from './CanvasRevealBackdrop';
import { AuroraFluidBackdrop } from './AuroraFluidBackdrop';
import { InteractiveGridDotsBackdrop } from './InteractiveGridDotsBackdrop';
import { NoiseBoxesBackdrop } from './NoiseBoxesBackdrop';
import { ShootingStarsBackdrop } from './ShootingStarsBackdrop';

interface ModalMediumBackdropProps {
  category?: string;
  medium?: string;
  title?: string;
  isVideo?: boolean;
  lightingMode?: string;
  className?: string;
}

/**
 * Universal Curatorial Modal Backdrop Resolver
 * Automatically and intelligently matches each artwork to its dedicated
 * rich motion backdrop and vibrant gradient atmosphere:
 *
 * 1. Digital Art & Generative Shaders:
 *    - Interactive 3D Perspective Grid with Cyan Cursor Distortion & Matrix Sparks
 * 2. Fluid Videos & Volumetric Loops:
 *    - Aurora Liquid Gradient with dynamic Iridescent Oil Slick colors
 * 3. Charcoal, Ink, Drawing & Traditional Art:
 *    - Washi Noise Paper Texture with dynamic geometric Snapping Silver Boxes
 * 4. 3D Cosmos & Celestial Spotlight:
 *    - Nebula Atmosphere, Pulsing Orbital Waves & High-Speed Meteor Trails
 * 5. Poetry & Spoken Verse:
 *    - Preserved untouched Canvas Reveal Dot Matrix
 */
export const ModalMediumBackdrop: React.FC<ModalMediumBackdropProps> = ({
  category = 'digital',
  medium = '',
  title = '',
  isVideo = false,
  lightingMode = 'obsidian',
  className = ''
}) => {
  const normCategory = (category || '').toLowerCase().trim();
  const normMedium = (medium || '').toLowerCase().trim();
  const normTitle = (title || '').toLowerCase().trim();

  // 1. Fluid Videos & Volumetric Loops
  const isVideoDiscipline =
    isVideo ||
    normCategory === 'video' ||
    normCategory === 'motion' ||
    normMedium.includes('video') ||
    normMedium.includes('volumetric') ||
    normMedium.includes('loop');

  if (isVideoDiscipline) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
        <AuroraFluidBackdrop opacity={lightingMode === 'spotlight' ? 0.95 : 0.85} />
      </div>
    );
  }

  // 2. Poetry & Spoken Verse (Preserved untouched as requested)
  if (normCategory === 'poetry' || normMedium.includes('poetry') || normMedium.includes('verse')) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
        <CanvasRevealBackdrop opacity={lightingMode === 'spotlight' ? 0.75 : 0.6} />
      </div>
    );
  }

  // 3. 3D Cosmos & Celestial Work
  const isCosmosDiscipline =
    normCategory === 'cosmos' ||
    normCategory === 'celestial' ||
    normCategory === 'astronomy' ||
    normMedium.includes('cosmos') ||
    normMedium.includes('celestial') ||
    normMedium.includes('astronom') ||
    normTitle.includes('cosmos') ||
    normTitle.includes('galaxy') ||
    normTitle.includes('orbit');

  if (isCosmosDiscipline) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
        <ShootingStarsBackdrop opacity={lightingMode === 'spotlight' ? 0.95 : 0.88} />
      </div>
    );
  }

  // 4. Charcoal, Ink, Drawing & Traditional Art
  const isTraditionalDiscipline =
    normCategory === 'drawing' ||
    normCategory === 'painting' ||
    normCategory === 'charcoal' ||
    normCategory === 'ink' ||
    normCategory === 'traditional' ||
    normMedium.includes('charcoal') ||
    normMedium.includes('ink') ||
    normMedium.includes('graphite') ||
    normMedium.includes('canvas') ||
    normMedium.includes('oil') ||
    normMedium.includes('acrylic') ||
    normMedium.includes('watercolor');

  if (isTraditionalDiscipline) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
        <NoiseBoxesBackdrop opacity={lightingMode === 'spotlight' ? 0.95 : 0.85} />
      </div>
    );
  }

  // 5. Digital Art & Generative Shaders (Default for digital, 3D render, shader art)
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <InteractiveGridDotsBackdrop opacity={lightingMode === 'spotlight' ? 0.95 : 0.88} />
    </div>
  );
};
