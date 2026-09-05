import React from 'react';
import { Feather, ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
  onReturnToFeed: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onReturnToFeed }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      {/* Delicate torn page aesthetic container */}
      <div className="relative max-w-xl mx-auto p-8 sm:p-12 rounded-sm border border-[#c9a875]/20 bg-[#07090e]/80 backdrop-blur-md shadow-2xl">
        {/* Subtle illuminated corner accent */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c9a875]/40" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c9a875]/40" />

        <div className="w-12 h-12 mx-auto rounded-full border border-[#c9a875]/30 flex items-center justify-center mb-6">
          <Feather className="w-5 h-5 text-[#c9a875]" />
        </div>

        <p className="text-[10px] font-mono-code uppercase tracking-[0.35em] text-[#c9a875]/60 mb-3">
          404 &mdash; Untraced Manuscript
        </p>

        <h1 className="font-editorial text-3xl sm:text-4xl font-light text-white tracking-[-0.01em] mb-4">
          Lost to the Margins
        </h1>

        <p className="font-editorial italic text-base sm:text-lg text-neutral-300 leading-relaxed max-w-md mx-auto mb-8">
          &ldquo;The page you seek has faded into the quiet dust of time, or perhaps the scribe&rsquo;s hand has not yet etched its lines.&rdquo;
        </p>

        <div className="flex justify-center">
          <button
            onClick={onReturnToFeed}
            className="btn-ghost-gold flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Atelier Sanctuary</span>
          </button>
        </div>
      </div>
    </div>
  );
};
