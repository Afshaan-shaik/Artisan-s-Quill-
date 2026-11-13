import React from 'react';

interface RedesignedFooterProps {
  onOpenUpload: () => void;
  onOpenAbout?: () => void;
}

export const RedesignedFooter: React.FC<RedesignedFooterProps> = ({
  onOpenUpload,
  onOpenAbout
}) => {
  return (
    <footer className="w-full max-w-[1360px] mx-auto pt-24 pb-16 px-4 sm:px-8 text-center" id="atelier-footer">
      <div className="space-y-6 select-none">
        <span className="mono-tag text-xs tracking-[0.38em] text-[#d8b779] uppercase block font-semibold">
          ✦ The Artisan’s Quill ✦
        </span>

        <h2 className="font-serif-cormorant font-light text-4xl sm:text-6xl lg:text-7xl text-[#f4efe6] leading-[1.05]">
          Make something slowly.
          <br />
          <em className="gt italic">Share it beautifully.</em>
        </h2>

        <div className="pt-4">
          <button
            onClick={onOpenUpload}
            className="btn-aq-gold px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.18em] cursor-pointer shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Begin Your Collection
          </button>
        </div>

        <div className="pt-16 border-t border-[rgba(236,214,170,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code text-[#8d897f]">
          <p>
            Original works belong to their respective creators &amp; visionaries · © 2026
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (onOpenAbout) onOpenAbout();
                else {
                  window.location.hash = 'about';
                }
              }}
              className="hover:text-[#f6e3b4] transition-colors cursor-pointer"
            >
              Curatorial Charter
            </button>
            <a href="#works" className="hover:text-[#f6e3b4] transition-colors">
              The Vault
            </a>
            <a href="#music" className="hover:text-[#f6e3b4] transition-colors">
              Soundscape
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

