import React, { useState } from 'react';
import { AudioAmbiencePlayer } from './AudioAmbiencePlayer';

/**
 * FloatingAudioToggle
 * Wraps the full AudioAmbiencePlayer in a small floating button anchored
 * to the bottom-right corner of the viewport. Visible to all visitors.
 * The panel expands upward from the toggle icon when opened.
 */
export const FloatingAudioToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3"
      aria-label="Ambient music player"
    >
      {/* Expanded audio panel — slides up from the button */}
      {isOpen && (
        <div
          className="w-[340px] sm:w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <AudioAmbiencePlayer />
        </div>
      )}

      {/* Floating toggle button */}
      <button
        id="floating-audio-toggle-btn"
        onClick={() => setIsOpen((o) => !o)}
        className={`
          group relative w-11 h-11 rounded-full flex items-center justify-center
          border transition-all duration-300 cursor-pointer
          shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8)]
          ${isOpen
            ? 'bg-[#c9a875]/20 border-[#c9a875]/60 shadow-[0_0_20px_rgba(201,168,117,0.25)]'
            : 'bg-[#0a0c12]/90 border-white/10 hover:border-[#c9a875]/40 hover:bg-[#c9a875]/10'
          }
        `}
        title={isOpen ? 'Close music player' : 'Open ambient music sanctuary'}
        aria-expanded={isOpen}
      >
        {/* Animated waveform icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={`transition-colors duration-200 ${isOpen ? 'text-[#c9a875]' : 'text-neutral-400 group-hover:text-[#c9a875]'}`}
        >
          <rect x="1"  y="6"  width="2" height="6" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="5"  y="3"  width="2" height="12" rx="1" fill="currentColor" />
          <rect x="9"  y="1"  width="2" height="16" rx="1" fill="currentColor" />
          <rect x="13" y="4"  width="2" height="10" rx="1" fill="currentColor" />
          <rect x="17" y="7"  width="1" height="4"  rx="0.5" fill="currentColor" opacity="0.6" />
        </svg>

        {/* Active pulse ring when playing */}
        <span
          className={`absolute inset-0 rounded-full border border-[#c9a875]/30 ${isOpen ? 'animate-ping opacity-40' : 'opacity-0'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
