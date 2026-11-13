import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Artwork } from '../types';
import { MasterpieceResult } from '../services/masterpieceEngine';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';
import { useSoundEngine } from '../hooks/useSoundEngine';

interface RedesignedHeroSectionProps {
  artworks: Artwork[];
  dailyMasterpiece?: MasterpieceResult | null;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onEnterGallery?: () => void;
}

export const RedesignedHeroSection: React.FC<RedesignedHeroSectionProps> = ({
  artworks,
  dailyMasterpiece,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onEnterGallery
}) => {
  const { play: playSound } = useSoundEngine();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Spotlights list with Masterpiece of the day at #1
  const candidateSpotlights = React.useMemo(() => {
    if (!artworks || artworks.length === 0) return [];
    const validArtworks = artworks.filter((a) => !a.isDeleted);
    const result: Artwork[] = [];
    const masterpieceWork = dailyMasterpiece?.artwork || validArtworks[0];
    if (masterpieceWork) {
      result.push(masterpieceWork);
    }
    validArtworks.forEach((a) => {
      if (a.id !== masterpieceWork?.id && (a.featured || a.likesCount > 0 || result.length < 16)) {
        result.push(a);
      }
    });
    return result.slice(0, 16);
  }, [artworks, dailyMasterpiece]);

  // Auto-advance spotlight every 5 seconds (5000ms) unless user is actively hovering
  useEffect(() => {
    if (candidateSpotlights.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateSpotlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [candidateSpotlights.length, isHovered]);

  const activeIndex = candidateSpotlights.length > 0 ? currentIndex % candidateSpotlights.length : 0;
  const currentWork = candidateSpotlights[activeIndex] || artworks[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('carousel-nav');
    setCurrentIndex((prev) => (prev - 1 + candidateSpotlights.length) % candidateSpotlights.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('carousel-nav');
    setCurrentIndex((prev) => (prev + 1) % candidateSpotlights.length);
  };

  const getDisplayImage = (work: Artwork): string => {
    if (!work) return '';
    if (work.category === 'music' || isAudioMedia(work)) {
      const candidates = [
        work.musicData?.coverArtUrl,
        work.thumbnailUrl,
        work.artist?.avatar
      ].filter(
        (url): url is string =>
          Boolean(url && typeof url === 'string' && !url.toLowerCase().endsWith('.mp4') && !url.toLowerCase().endsWith('.webm'))
      );
      if (candidates.length > 0) return candidates[0];
      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
    }
    if (work.thumbnailUrl && !work.thumbnailUrl.toLowerCase().endsWith('.mp4') && !work.thumbnailUrl.toLowerCase().endsWith('.webm')) {
      return work.thumbnailUrl;
    }
    if (work.mediaUrl && work.category !== 'poetry' && !work.mediaUrl.toLowerCase().endsWith('.mp4') && !work.mediaUrl.toLowerCase().endsWith('.webm')) {
      return work.mediaUrl;
    }
    return getMediaPoster(work) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
  };

  const isVideo = currentWork ? isVideoMedia(currentWork) : false;
  const bgImageUrl = currentWork ? (getMediaPoster(currentWork) || getDisplayImage(currentWork)) : '';

  const getMediumLabel = (cat: string) => {
    switch (cat) {
      case 'poetry': return 'Poetry Card';
      case 'video': return 'Motion Loop';
      case 'painting': return 'Fine Painting';
      case 'drawing': return 'Drawing & Ink';
      case 'digital': return 'Digital Media';
      case 'music': return 'Original Music';
      default: return 'Fine Art';
    }
  };

  return (
    <header className="hero-redesign-wrapper w-full max-w-[1360px] mx-auto pt-2 sm:pt-4 pb-10 sm:pb-14 px-4 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-12 lg:gap-20 items-center">
        
        {/* ── Left Editorial Column ── */}
        <div className="space-y-6 sm:space-y-8 select-none">
          <div className="inline-flex items-center gap-2">
            <span className="mono-tag font-mono-code text-[11px] tracking-[0.32em] text-[#d8b779] uppercase font-semibold">
              ✦ Digital Fine Art &amp; Poetry Sanctuary
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-serif-cormorant font-light text-[#f4efe6] leading-[0.94] tracking-[-0.02em]">
            Where every work <em className="gt italic">breathes.</em>
          </h1>

          <div className="space-y-4 max-w-xl">
            <p className="text-base sm:text-lg font-light text-[#ded7c8] leading-relaxed">
              A candle-lit sanctuary for paintings, poetry, motion and sound. Wander slowly, immerse yourself in living creations, and keep what moves you.
            </p>

            {/* Signature Cormorant font style — matching "Where every work breathes" with full goldenish gradient */}
            <p className="gt text-gold-gradient text-2xl sm:text-3xl lg:text-[36px] font-serif-cormorant font-light italic tracking-wide leading-snug drop-shadow-[0_2px_20px_rgba(216,183,121,0.4)] pt-1 select-text">
              Share your art , get connected
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                if (onEnterGallery) onEnterGallery();
                else {
                  const el = document.getElementById('curated-works-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-aq-gold px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.16em] flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Enter the Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => currentWork && onSelectArtwork(currentWork)}
              className="btn-aq px-6 py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.16em] hover:text-[#f6e3b4] cursor-pointer"
            >
              Today’s Spotlight
            </button>
          </div>

          {/* Live Dynamic Atelier Stats */}
          <div className="flex items-center gap-8 sm:gap-14 pt-6 border-t border-[rgba(236,214,170,0.12)]">
            <div>
              <b className="block font-serif-cormorant font-light text-3xl sm:text-4xl text-[#f4efe6] leading-none mb-1">
                {artworks.length || 33}
              </b>
              <span className="mono-tag text-[10px] text-[#8d897f]">Masterpieces</span>
            </div>
            <div>
              <b className="block font-serif-cormorant font-light text-3xl sm:text-4xl text-[#f4efe6] leading-none mb-1">
                6
              </b>
              <span className="mono-tag text-[10px] text-[#8d897f]">Mediums</span>
            </div>
            <div>
              <b className="block font-serif-cormorant font-light text-3xl sm:text-4xl text-[#f4efe6] leading-none mb-1">
                24h
              </b>
              <span className="mono-tag text-[10px] text-[#8d897f]">Fresh Curation</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: The Signature Floating Arch Frame ── */}
        <div className="relative w-full max-w-[460px] mx-auto lg:max-w-none">
          <div
            className="floating-arch-frame w-full relative cursor-pointer group shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(216,183,121,0.2)] overflow-hidden rounded-t-[220px] rounded-b-2xl border border-[rgba(236,214,170,0.25)]"
            onClick={() => currentWork && onSelectArtwork(currentWork)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={currentWork ? `View Masterpiece: ${currentWork.title}` : 'Curatorial Spotlight'}
          >
            {/* 5-second Auto-Slide Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 z-40 overflow-hidden">
              <div
                key={activeIndex}
                className="h-full bg-gradient-to-r from-[#d8b779] via-[#f6e3b4] to-[#d8b779] shadow-[0_0_8px_#d8b779]"
                style={{
                  width: '100%',
                  transformOrigin: 'left',
                  animation: isHovered
                    ? 'none'
                    : 'spotlightProgress 5000ms linear forwards'
                }}
              />
            </div>

            {/* Top Floating Tag */}
            <div className="absolute right-[-10px] top-[14%] z-30 px-3.5 py-1.5 rounded-xl bg-[#0a0b0f]/85 backdrop-blur-xl border border-[rgba(236,214,170,0.2)] shadow-2xl flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#d8b779] animate-pulse" />
              <span className="mono-tag text-[10px] font-bold text-[#f6e3b4]">
                Vernissage · {activeIndex + 1 < 10 ? `0${activeIndex + 1}` : activeIndex + 1}/{candidateSpotlights.length || 16}
              </span>
            </div>

            {/* Arched Viewport Container */}
            <div className="arch-art-viewport relative w-full h-[460px] sm:h-[520px]">
              {isVideo ? (
                <video
                  key={currentWork?.id}
                  src={currentWork.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
              ) : (
                <img
                  key={currentWork?.id}
                  src={bgImageUrl}
                  alt={currentWork?.title || 'Spotlight Artwork'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
              )}

              {/* Ambient Atmosphere Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent pointer-events-none" />

              {/* Arched Frame Bottom Caption & Masterpiece Controls */}
              <div className="absolute left-6 right-6 bottom-6 z-20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="mono-tag text-[10px] text-[#d8b779] uppercase tracking-widest font-semibold">
                    Spotlight · {currentWork ? getMediumLabel(currentWork.category) : 'Fine Art'}
                  </span>

                  {/* Carousel Prev/Next Arrows */}
                  {candidateSpotlights.length > 1 && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={handlePrev}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-[#d8b779] text-white hover:text-black border border-white/10 transition-colors cursor-pointer"
                        title="Previous Spotlight"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="p-1.5 rounded-full bg-black/60 hover:bg-[#d8b779] text-white hover:text-black border border-white/10 transition-colors cursor-pointer"
                        title="Next Spotlight"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-serif-cormorant font-light text-3xl sm:text-4xl text-[#f4efe6] leading-tight truncate">
                  {currentWork ? currentWork.title : 'Humsafar'}
                </h3>

                <p className="text-xs text-neutral-300 font-mono-code truncate">
                  By {currentWork?.artist.name} {currentWork?.artist.handle && `(${currentWork.artist.handle})`}
                </p>

                {/* Quick Interactive Actions */}
                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => currentWork && onSelectArtwork(currentWork)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#f6e3b4] to-[#d8b779] text-[#171007] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Masterpiece</span>
                  </button>

                  {currentWork && (
                    <>
                      <button
                        onClick={(e) => onToggleLike(currentWork.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          currentWork.isLiked
                            ? 'bg-rose-500/20 border-rose-500/60 text-rose-400'
                            : 'bg-black/60 border-white/15 text-neutral-200 hover:text-white'
                        }`}
                        title="Applaud Masterpiece"
                      >
                        <Heart className={`w-3.5 h-3.5 ${currentWork.isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => onToggleSave(currentWork.id, e)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          currentWork.isSaved
                            ? 'bg-[#d8b779]/20 border-[#d8b779]/60 text-[#d8b779]'
                            : 'bg-black/60 border-white/15 text-neutral-200 hover:text-white'
                        }`}
                        title="Save to Vault"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${currentWork.isSaved ? 'fill-current' : ''}`} />
                      </button>

                      {onShareArtwork && (
                        <button
                          onClick={() => onShareArtwork(currentWork)}
                          className="p-2 rounded-xl bg-black/60 border border-white/15 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                          title="Share Spotlight"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

