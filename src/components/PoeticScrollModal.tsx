import React, { useState, useEffect } from 'react';
import { X, Sparkles, Download, Feather, User } from 'lucide-react';
import { Artwork } from '../types';
import confetti from 'canvas-confetti';

interface PoeticScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poem: {
    title: string;
    author: string;
    authorHandle?: string;
    stanzas: string[];
    subtitle?: string;
  } | null;
}

export const PoeticScrollModal: React.FC<PoeticScrollModalProps> = ({
  isOpen,
  onClose,
  poem
}) => {
  const [isUnrolled, setIsUnrolled] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsUnrolled(false);
      const timer = setTimeout(() => {
        setIsUnrolled(true);
        confetti({
          particleCount: 22,
          spread: 50,
          origin: { y: 0.4 },
          colors: ['#c9a875', '#dfbd87', '#ffffff']
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !poem) return null;

  return (
    <div
      id="poetic-scroll-modal"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30"
          title="Roll up scroll"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Scroll Wooden Roller Handle */}
        <div className="w-full max-w-lg h-5 sm:h-6 rounded-full bg-gradient-to-r from-[#2c1d11] via-[#5c3e24] to-[#2c1d11] border border-[#c9a875]/40 shadow-2xl relative z-20 flex items-center justify-between px-3">
          <span className="w-3 h-3 rounded-full bg-[#c9a875] border border-black shadow-sm" />
          <span className="text-[8px] uppercase tracking-widest font-mono-code text-[#dfbd87]">Ancient Vellum Scroll</span>
          <span className="w-3 h-3 rounded-full bg-[#c9a875] border border-black shadow-sm" />
        </div>

        {/* Unrolling Vellum Parchment Body */}
        <div
          className={`w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#211a13] via-[#15110c] to-[#0d0a07] border-x-2 border-[#c9a875]/40 shadow-[0_0_60px_rgba(201,168,117,0.35)] overflow-y-auto px-6 sm:px-10 py-8 text-center transition-all duration-700 ease-out origin-top relative ${
            isUnrolled ? 'max-h-[75vh] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'
          }`}
        >
          {/* Subtle Gilded Side Margins */}
          <div className="absolute inset-y-0 left-2 w-px bg-gradient-to-b from-transparent via-[#c9a875]/40 to-transparent" />
          <div className="absolute inset-y-0 right-2 w-px bg-gradient-to-b from-transparent via-[#c9a875]/40 to-transparent" />

          {/* Header */}
          <div className="mb-6 pb-4 border-b border-[#c9a875]/30">
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono-code text-[#c9a875] font-bold block mb-1">
              Sanctuary Illuminated Verse
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#fdf8ee] tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(201,168,117,0.3)]">
              {poem.title}
            </h2>
            {poem.subtitle && (
              <p className="text-[10px] uppercase tracking-widest text-[#dfbd87] font-mono-code mt-1">
                {poem.subtitle}
              </p>
            )}
          </div>

          {/* Stanzas */}
          <div className="space-y-6 text-base sm:text-lg font-serif italic leading-relaxed text-[#f4ecd8] select-text">
            {poem.stanzas.map((stanza, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {stanza}
              </p>
            ))}
          </div>

          {/* Footer Hallmark Wax Seal & Signature */}
          <div className="mt-8 pt-6 border-t border-[#c9a875]/30 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a875] via-[#dfbd87] to-[#8a6b32] p-1 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#1b140d] border border-white/20 flex items-center justify-center text-xs font-serif font-bold text-[#f5dfb8]">
                AQ
              </div>
            </div>
            <div>
              <p className="text-xs uppercase font-serif font-bold tracking-widest text-white">
                {poem.author}
              </p>
              {poem.authorHandle && (
                <span className="text-[9px] font-mono-code text-[#c9a875] block mt-0.5">
                  {poem.authorHandle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Scroll Wooden Roller Handle */}
        <div className="w-full max-w-lg h-5 sm:h-6 rounded-full bg-gradient-to-r from-[#2c1d11] via-[#5c3e24] to-[#2c1d11] border border-[#c9a875]/40 shadow-2xl relative z-20 flex items-center justify-between px-3 -mt-1">
          <span className="w-3 h-3 rounded-full bg-[#c9a875] border border-black shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-[#c9a875] border border-black shadow-sm" />
        </div>
      </div>
    </div>
  );
};
