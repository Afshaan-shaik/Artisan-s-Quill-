import React, { useEffect, useRef } from 'react';

/**
 * ArtisticCursor
 * Ultra-smooth, 0ms latency hardware-accelerated precision cursor
 * with silky 0.18 liquid trailing physics and mix-blend-difference expansion.
 */
export const ArtisticCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Disable on mobile / touch screens
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window
    ) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let isHovering = false;
    let isMouseDown = false;
    let animId: number;

    const updateHoverState = (target: HTMLElement | null) => {
      if (!target) {
        isHovering = false;
        return;
      }
      const isClickable = Boolean(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer') ||
        target.closest('#curatorial-spotlight-hero') ||
        target.closest('[id^="artwork-card-"]') ||
        target.closest('[id^="poetry-card-"]')
      );

      if (isClickable !== isHovering) {
        isHovering = isClickable;
        if (isHovering) {
          ring.className =
            'fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-[#dfbd87] bg-[#c9a875]/25 shadow-[0_0_20px_rgba(201,168,117,0.45)] mix-blend-difference w-14 h-14 transition-[width,height,background-color,border-color,box-shadow,transform] duration-300 ease-out';
          dot.style.opacity = '0.4';
        } else {
          ring.className =
            'fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-[#c9a875]/80 bg-transparent shadow-[0_0_8px_rgba(201,168,117,0.2)] w-7 h-7 transition-[width,height,background-color,border-color,box-shadow,transform] duration-300 ease-out';
          dot.style.opacity = '1';
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        ringX = mouseX;
        ringY = mouseY;
      }

      // TRUE 0MS LATENCY: Immediate hardware GPU repositioning for center dot
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) ${
        isMouseDown ? 'scale(0.8)' : 'scale(1)'
      }`;

      updateHoverState(e.target as HTMLElement | null);
    };

    const onMouseDown = () => {
      isMouseDown = true;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(0.75)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(0.9)`;
    };

    const onMouseUp = () => {
      isMouseDown = false;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(1)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(1)`;
    };

    const onMouseLeave = () => {
      isVisible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      dot.style.opacity = isHovering ? '0.4' : '1';
      ring.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Silky Smooth Lerp Loop (0.18 Liquid Trailing Glide)
    const render = () => {
      if (isVisible) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) ${
          isMouseDown ? 'scale(0.9)' : 'scale(1)'
        }`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* Precision Golden Center Dot (0ms latency hardware GPU lock) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-1.5 h-1.5 rounded-full bg-[#c9a875] opacity-0 transition-opacity duration-200"
        style={{ willChange: 'transform' }}
      />

      {/* Silky 0.18 Trailing Liquid Outer Ring with Mix-Blend-Difference */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-[#c9a875]/80 bg-transparent shadow-[0_0_8px_rgba(201,168,117,0.2)] w-7 h-7 opacity-0 transition-[width,height,background-color,border-color,box-shadow,transform] duration-300 ease-out"
        style={{ willChange: 'transform' }}
      />
    </>
  );
};
