import React from 'react';
import { Feather, BookOpen, PenTool } from 'lucide-react';
import { Artwork } from '../types';

interface RedesignedPoetrySectionProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onOpenInkStudio?: () => void;
}

export const RedesignedPoetrySection: React.FC<RedesignedPoetrySectionProps> = ({
  artworks,
  onSelectArtwork,
  onOpenInkStudio
}) => {
  // Find featured poem or fallback to first poetry artwork
  const poem = React.useMemo(() => {
    return (
      artworks.find((a) => a.category === 'poetry' && a.poetryContent?.stanzas?.length) ||
      artworks.find((a) => a.category === 'poetry')
    );
  }, [artworks]);

  const stanzas = poem?.poetryContent?.stanzas || [];
  const lines = stanzas[0] ? stanzas[0].split('\n').filter(Boolean) : [];

  return (
    <section className="w-full max-w-[1360px] mx-auto py-16 px-4 sm:px-8" id="poetry">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 rounded-[36px] sm:rounded-[44px] overflow-hidden border border-[rgba(236,214,170,0.14)] bg-gradient-to-br from-[#0d0e13] via-[#090a0f] to-[#07080b] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(216,183,121,0.08)]">
        
        {/* Left Column: Verse & Reading Interaction */}
        <div className="p-8 sm:p-14 lg:p-16 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="mono-tag text-[10.5px] font-semibold text-[#d8b779]">
                ✦ Poetry Card · {poem?.poetryContent?.theme || 'Lyrical Free Verse'}
              </span>
            </div>

            <h2 className="font-serif-cormorant font-light text-4xl sm:text-5xl lg:text-6xl text-[#f4efe6] leading-tight">
              {poem?.title || 'Late Kettle'}
            </h2>

            <blockquote className="font-serif-cormorant font-light italic text-2xl sm:text-3xl lg:text-4xl text-[#f4efe6]/90 leading-relaxed my-6 relative pl-6 border-l-2 border-[#d8b779]/40">
              <span className="absolute -left-2 -top-4 text-5xl font-serif text-[#d8b779]/40 select-none">
                “
              </span>
              {lines.length > 0 ? (
                <>
                  {lines.slice(0, 3).map((l, i) => (
                    <React.Fragment key={i}>
                      {l}
                      <br />
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  The kettle boils for no one now,
                  <br />
                  a thin white column, patient, spent.
                </>
              )}
            </blockquote>

            <p className="text-xs text-[#8d897f] font-mono-code">
              Penned by {poem?.artist.name || 'Afshaan Shaikh'} {poem?.artist.handle && `(${poem.artist.handle})`}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {poem && (
              <button
                onClick={() => onSelectArtwork(poem)}
                className="btn-aq-gold px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Full Poem</span>
              </button>
            )}

            {onOpenInkStudio && (
              <button
                onClick={onOpenInkStudio}
                className="btn-aq px-5 py-3 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:text-[#f6e3b4]"
              >
                <PenTool className="w-3.5 h-3.5 text-[#d8b779]" />
                <span>Compose in Ink Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Visual Concentric Hallmark Ring */}
        <div className="vis bg-[radial-gradient(circle_at_50%_50%,rgba(216,183,121,0.22),transparent_55%)] flex items-center justify-center p-12 min-h-[300px] sm:min-h-[380px]">
          <div className="concentric-poetry-ring">
            <div className="text-center space-y-1">
              <span className="mono-tag text-xs tracking-[0.36em] text-[#d8b779] block">
                {poem?.year || '2026'}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono-code block">
                ILLUMINATED VERSE
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

