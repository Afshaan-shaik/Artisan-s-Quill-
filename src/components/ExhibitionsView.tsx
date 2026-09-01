import React from 'react';
import { Sparkles, Calendar, MapPin, ArrowRight, Layers, Feather, Palette, Plus, Trash2 } from 'lucide-react';
import { Exhibition, Artwork } from '../types';
import { isVideoMedia } from '../utils/mediaUtils';

interface ExhibitionsViewProps {
  exhibitions: Exhibition[];
  artworks: Artwork[];
  onSelectExhibition: (exhibitionId: string) => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onAddExhibition?: () => void;
  onDeleteExhibition?: (id: string) => void;
}

export const ExhibitionsView: React.FC<ExhibitionsViewProps> = ({
  exhibitions,
  artworks,
  onSelectExhibition,
  onSelectArtwork,
  onAddExhibition,
  onDeleteExhibition
}) => {
  return (
    <div id="exhibitions-view" className="space-y-12 py-4">
      {/* Hero Exhibition Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4 relative">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Curatorial Salons & Thematic Rooms
        </span>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white uppercase">
          Current Exhibitions
        </h1>
        <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-xl mx-auto">
          Immersive dialogues between physical oil pigments, generative shader canvases, and classical verse literature.
        </p>
        
        {onAddExhibition && (
          <button 
            onClick={onAddExhibition}
            className="absolute top-0 right-0 sm:right-4 flex items-center gap-2 px-4 py-2 border border-[#c9a875]/40 text-[#c9a875] hover:bg-[#c9a875] hover:text-black transition-colors text-[10px] uppercase tracking-widest rounded-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Curate New
          </button>
        )}
      </div>

      {/* Exhibitions List */}
      <div className="space-y-10">
        {exhibitions.map((exh, idx) => {
          const featuredArt = artworks.filter((a) => exh.artworkIds.includes(a.id));

          return (
            <div
              key={exh.id}
              className="relative bg-neutral-900 border border-white/5 rounded-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Exhibition Info */}
                <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                  <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {exh.dates}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {exh.location}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                      {exh.title}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                      {exh.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    {exh.description}
                  </p>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                      Curated by {exh.curator}
                    </span>

                    <div className="flex items-center gap-4">
                      {onDeleteExhibition && (
                        <button
                          onClick={() => onDeleteExhibition(exh.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Exhibition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectExhibition(exh.id)}
                        className="px-5 py-2 text-[10px] uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer text-white bg-transparent flex items-center gap-2"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Exhibition Artworks Strip */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-0">
                  {featuredArt.slice(0, 3).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onSelectArtwork(art)}
                      className="group relative overflow-hidden aspect-[3/4] bg-neutral-800 cursor-pointer border-l border-white/5 first:border-l-0 lg:first:border-l"
                    >
                      {art.category === 'poetry' ? (
                        <div className="w-full h-full p-6 flex flex-col justify-between bg-neutral-800/40">
                          <Feather className="w-5 h-5 text-neutral-600" />
                          <div>
                            <p className="text-sm font-light text-white mb-2 line-clamp-2">
                              {art.title}
                            </p>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Verse</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          {isVideoMedia(art) ? (
                            <video
                              src={art.mediaUrl}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[1200ms] pointer-events-none"
                            />
                          ) : (
                            <img
                              src={art.thumbnailUrl || art.mediaUrl}
                              alt={art.title}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-[1200ms]"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6 transition-opacity duration-300">
                            <p className="text-sm font-light text-white mb-1 truncate">
                              {art.title}
                            </p>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                              {art.artist.name}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
