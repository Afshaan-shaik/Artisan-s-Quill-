import React, { useEffect } from 'react';

/**
 * PrismaticLightRefractor
 * Casts subtle dynamic chromatic caustics and cursor-following specular light
 * across all ultra-glass panels without impacting UI interaction performance.
 */
export const PrismaticLightRefractor: React.FC = () => {
  useEffect(() => {
    let animId: number | null = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updateLight = () => {
      // Smooth lerp for liquid ambient movement
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      document.documentElement.style.setProperty('--prismatic-light-x', `${currentX}px`);
      document.documentElement.style.setProperty('--prismatic-light-y', `${currentY}px`);

      animId = requestAnimationFrame(updateLight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(updateLight);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      style={{
        background: `radial-gradient(650px circle at var(--prismatic-light-x, 50vw) var(--prismatic-light-y, 30vh), rgba(201, 168, 117, 0.045), rgba(136, 164, 230, 0.025) 45%, transparent 70%)`
      }}
    />
  );
};
