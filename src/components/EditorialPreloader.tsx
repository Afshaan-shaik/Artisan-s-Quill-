import React, { useState, useEffect } from 'react';

interface EditorialPreloaderProps {
  onComplete?: () => void;
}

export const EditorialPreloader: React.FC<EditorialPreloaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only display once per browser session
    try {
      const hasVisited = sessionStorage.getItem('artisan_sanctuary_entered');
      if (hasVisited) {
        return;
      }
      setIsVisible(true);
      sessionStorage.setItem('artisan_sanctuary_entered', 'true');

      // Begin fade-out at 1.4s, remove at 2.0s
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 1400);

      const removeTimer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 2000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    } catch {
      // Fallback if storage access is restricted
      setIsVisible(false);
    }
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#040507] transition-opacity duration-700 pointer-events-none select-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient background gold glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#c9a875]/6 blur-[90px] pointer-events-none" />

      {/* Quill Stroke SVG */}
      <div className="relative mb-6">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 sm:w-16 sm:h-16"
        >
          {/* Feather quill spine and barb outline drawn with CSS stroke-dashoffset */}
          <path
            d="M52 10C40 14 26 28 20 44L14 54L22 50C36 42 48 30 52 10Z"
            stroke="#c9a875"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="quill-draw-path"
          />
          <path
            d="M20 44L52 10"
            stroke="#dfbd87"
            strokeWidth="1"
            strokeLinecap="round"
            className="quill-draw-path"
            style={{ animationDelay: '0.2s' }}
          />
          <path
            d="M27 34C32 32 38 31 44 28"
            stroke="#c9a875"
            strokeWidth="0.8"
            strokeLinecap="round"
            className="quill-draw-path"
            style={{ animationDelay: '0.4s' }}
          />
        </svg>
      </div>

      {/* Editorial Title */}
      <div className="text-center space-y-2 relative z-10 px-4">
        <h1 className="font-editorial text-2xl sm:text-3xl font-light tracking-[0.14em] text-white/95 leading-none">
          The Artisan's Quill
        </h1>
        <p className="text-[9px] sm:text-[10px] uppercase font-mono-code tracking-[0.35em] text-[#c9a875]/75">
          Digital Atelier &middot; Sanctuary of Verse
        </p>
      </div>

      {/* Delicate bottom gold line */}
      <div className="mt-8 w-16 h-px bg-gradient-to-r from-transparent via-[#c9a875]/40 to-transparent" />
    </div>
  );
};
