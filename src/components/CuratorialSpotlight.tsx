import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  Feather,
  Palette,
  PenTool,
  Image as ImageIcon,
  Film,
  CheckCircle2,
  Quote,
  Flame,
  Clock
} from 'lucide-react';
import { Artwork } from '../types';
import { Avatar } from './Avatar';

import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';

interface CuratorialSpotlightProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
}

export const CuratorialSpotlight: React.FC<CuratorialSpotlightProps> = ({
  artworks,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork
}) => {
  // Extract standout candidates with "I Suppose" video explicitly at #1
  const candidateSpotlights = React.useMemo(() => {
    if (!artworks || artworks.length === 0) return [];
    
    const validArtworks = artworks.filter((a) => !a.isDeleted);
    
    // Check for "I Suppose"
    const isISuppose = (a: Artwork) =>
      a.id === 'art-1787665037985-nnxxg' ||
      a.title.toLowerCase().trim() === 'i suppose' ||
      a.title.toLowerCase().includes('i suppose');

    const iSupposeWork = validArtworks.find(isISuppose);
    const otherFeatured = validArtworks.filter((a) => a.featured && !isISuppose(a));
    const regularWorks = validArtworks.filter((a) => !a.featured && !isISuppose(a));

    const result: Artwork[] = [];
    if (iSupposeWork) {
      result.push(iSupposeWork);
    }
    result.push(...otherFeatured);
    if (result.length < 5) {
      result.push(...regularWorks.slice(0, 5 - result.length));
    }

    return result.length > 0 ? result : validArtworks.slice(0, 5);
  }, [artworks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle through standout nominees every 14 seconds if user is not hovering
  useEffect(() => {
    if (candidateSpotlights.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % candidateSpotlights.length);
    }, 14000);
    return () => clearInterval(timer);
  }, [candidateSpotlights.length, isHovered]);

  if (candidateSpotlights.length === 0) {
    return null;
  }

  const activeIndex = currentIndex % candidateSpotlights.length;
  const currentWork = candidateSpotlights[activeIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + candidateSpotlights.length) % candidateSpotlights.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % candidateSpotlights.length);
  };

  // Determine imagery
  const getDisplayImage = (work: Artwork): string => {
    if (work.thumbnailUrl) return work.thumbnailUrl;
    if (work.mediaUrl && work.category !== 'poetry') return work.mediaUrl;
    
    // Poetry or abstract backdrop
    if (work.category === 'poetry') {
      const theme = work.poetryContent?.theme || 'obsidian';
      if (theme === 'midnight') return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80';
      if (theme === 'vellum') return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=80';
      if (theme === 'emerald') return 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1600&q=80';
      if (theme === 'crimson') return 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1600&q=80';
      return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80';
    }

    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
  };

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'poetry':
        return <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />;
      case 'painting':
        return <Palette className="w-3.5 h-3.5 text-[#e8b482]" />;
      case 'drawing':
        return <PenTool className="w-3.5 h-3.5 text-[#b9c6ea]" />;
      case 'digital':
        return <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />;
      case 'video':
        return <Film className="w-3.5 h-3.5 text-[#f0a8d0]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#c9a875]" />;
    }
  };

  const isVideo = isVideoMedia(currentWork);
  const isAudio = isAudioMedia(currentWork);
  const bgImageUrl = getMediaPoster(currentWork) || getDisplayImage(currentWork);
  const isPoetry = currentWork.category === 'poetry';
  const poemFirstStanza = currentWork.poetryContent?.stanzas?.[0] || '';

  return (
    <section
      id="curatorial-spotlight-hero"
      aria-label="Curatorial Spotlight Hero Section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#c9a875]/30 bg-[#06070a] shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(201,168,117,0.12)] transition-all duration-300 group"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Continuous Ken Burns Background Image Layer / Live Video Background
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#06070a]">
        {isVideo ? (
          <video
            key={currentWork.id}
            src={currentWork.mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center scale-105 filter brightness-95 contrast-105 transition-opacity duration-700 bg-[#06070a]"
          />
        ) : (
          <img
            key={currentWork.id}
            src={bgImageUrl}
            alt={currentWork.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center animate-ken-burns scale-105 filter brightness-95 contrast-105"
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Dark Gradient Overlay & Cinematic Vignette
          (Ensures all text pops with crisp contrast and luxury depth)
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#06070a] via-[#06070a]/75 to-[#06070a]/40 sm:to-black/30 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#06070a]/90 via-[#06070a]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 radial-vignette opacity-60 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          3. Interactive Content Layer
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] md:min-h-[480px]">
        
        {/* Top Header Ribbon in Spotlight */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Spotlight of the Day Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c9a875]/25 border border-[#c9a875]/70 backdrop-blur-md text-[#f8f5eb] shadow-[0_0_20px_rgba(201,168,117,0.4)]">
              <Sparkles className="w-3.5 h-3.5 text-[#e8ca95] animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] font-sans flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-[#c9a875] text-black font-extrabold text-[10px] font-mono-code">
                  #{activeIndex + 1}
                </span>
                <span>{activeIndex === 0 ? 'Masterpiece of the Day • Curatorial Spotlight' : 'Curatorial Spotlight'}</span>
              </span>
            </div>

            {/* Category Tag */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-xs text-neutral-300 font-medium capitalize">
              {categoryIcon(currentWork.category)}
              <span>{currentWork.category}</span>
            </div>

            {currentWork.exhibitionName && (
              <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs text-[#dfbd87]">
                <span>Exhibition: {currentWork.exhibitionName}</span>
              </div>
            )}
          </div>

          {/* Carousel Controls for Nominations */}
          {candidateSpotlights.length > 1 && (
            <div className="flex items-center gap-2 bg-black/60 border border-white/15 backdrop-blur-md px-2 py-1 rounded-full">
              <span className="text-[11px] font-mono-code text-neutral-400 px-1.5">
                {activeIndex + 1} / {candidateSpotlights.length}
              </span>
              <button
                id="spotlight-prev-btn"
                onClick={handlePrev}
                aria-label="Previous Spotlight Masterpiece"
                className="p-1.5 rounded-full hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="spotlight-next-btn"
                onClick={handleNext}
                aria-label="Next Spotlight Masterpiece"
                className="p-1.5 rounded-full hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Center / Body Section: Cinematic Title, Verse / Curator Notes, and Details */}
        <div className="my-6 sm:my-8 max-w-3xl space-y-4">
          {/* Artist Byline */}
          <div
            onClick={(e) => onSelectArtist(currentWork.artist.id, e)}
            className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 hover:border-[#c9a875]/50 transition-all cursor-pointer backdrop-blur-md"
            title={`View profile of ${currentWork.artist.name}`}
          >
            <Avatar
              src={currentWork.artist.avatar}
              name={currentWork.artist.name}
              size="sm"
              className="border border-[#c9a875]/40"
            />
            <div className="flex items-center gap-1.5 text-xs text-neutral-200">
              <span className="font-semibold hover:text-[#c9a875] transition-colors">
                {currentWork.artist.name}
              </span>
              {currentWork.artist.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a875] fill-[#c9a875]/20" />
              )}
              <span className="text-neutral-400 font-mono-code text-[11px] hidden sm:inline">
                {currentWork.artist.handle}
              </span>
            </div>
          </div>

          {/* Masterpiece Title */}
          <h1
            onClick={() => onSelectArtwork(currentWork)}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif-display tracking-[0.04em] text-white hover:text-[#f8f0de] transition-colors cursor-pointer leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          >
            {currentWork.title}
          </h1>

          {/* Medium, Year & Dimensions */}
          <p className="text-xs sm:text-sm font-mono-code text-[#c9a875] flex flex-wrap items-center gap-2">
            <span>{currentWork.medium || 'Curated Atelier Medium'}</span>
            <span>•</span>
            <span>{currentWork.year}</span>
            {currentWork.dimensions && (
              <>
                <span>•</span>
                <span>{currentWork.dimensions}</span>
              </>
            )}
          </p>

          {/* If Poetry: Evocative Stanza Quote */}
          {isPoetry && poemFirstStanza ? (
            <div className="relative pl-4 sm:pl-5 border-l-2 border-[#c9a875]/70 my-3 py-1">
              <Quote className="w-4 h-4 text-[#c9a875]/60 absolute -top-2 left-0 -translate-x-1/2 bg-[#06070a] rounded-full" />
              <p className="font-cormorant text-base sm:text-lg md:text-xl text-neutral-200 italic leading-relaxed whitespace-pre-line line-clamp-3">
                "{poemFirstStanza}"
              </p>
              {currentWork.poetryContent?.authorSignature && (
                <span className="block text-xs font-mono-code text-neutral-400 mt-1">
                  {currentWork.poetryContent.authorSignature}
                </span>
              )}
            </div>
          ) : (
            /* If Art/Video/Drawing: Curator Note or Description */
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-2xl drop-shadow">
              {currentWork.curatorNote || currentWork.description}
            </p>
          )}
        </div>

        {/* Bottom Actions Suite: "View Masterpiece" Primary Button + Social Counters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sleek 'View Masterpiece' Button */}
            <button
              id="view-masterpiece-spotlight-btn"
              onClick={() => onSelectArtwork(currentWork)}
              className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-[#c9a875] to-[#e4cb9c] text-black text-xs sm:text-sm font-bold uppercase tracking-[0.16em] shadow-[0_0_25px_rgba(201,168,117,0.5)] hover:shadow-[0_0_35px_rgba(201,168,117,0.75)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-black" />
              <span>View Masterpiece</span>
            </button>

            {/* Like Counter Button */}
            <button
              id={`spotlight-like-${currentWork.id}`}
              onClick={(e) => onToggleLike(currentWork.id, e)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                currentWork.isLiked
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-black/50 border-white/15 text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  currentWork.isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                }`}
              />
              <span>{currentWork.likesCount || 0}</span>
            </button>

            {/* Bookmark / Save Button */}
            <button
              id={`spotlight-save-${currentWork.id}`}
              onClick={(e) => onToggleSave(currentWork.id, e)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                currentWork.isSaved
                  ? 'bg-[#c9a875]/20 border-[#c9a875]/60 text-[#dfbd87] shadow-[0_0_15px_rgba(201,168,117,0.3)]'
                  : 'bg-black/50 border-white/15 text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  currentWork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : 'text-neutral-400'
                }`}
              />
              <span>{currentWork.savesCount || 0}</span>
            </button>

            {/* Curatorial Share Button */}
            <button
              id={`spotlight-share-${currentWork.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onShareArtwork) {
                  onShareArtwork(currentWork);
                } else {
                  const url = `${window.location.origin}${window.location.pathname}?artwork=${currentWork.id}`;
                  navigator.clipboard.writeText(url);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#c9a875]/60 bg-black/70 text-[#dfbd87] hover:bg-gradient-to-r hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black hover:shadow-[0_0_20px_rgba(201,168,117,0.5)] text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Share and Curate Artwork"
            >
              <Share2 className="w-4 h-4 text-[#c9a875] group-hover:text-black" />
              <span>Share</span>
            </button>
          </div>

          {/* Category-Specific Badge or Reading/Viewing indicator */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono-code">
            {isPoetry && currentWork.poetryContent?.readingTimeMinutes && (
              <span className="flex items-center gap-1.5 text-[#e0c49a]">
                <Clock className="w-3.5 h-3.5" />
                {currentWork.poetryContent.readingTimeMinutes} min lyric read
              </span>
            )}
            {currentWork.category === 'video' && currentWork.videoData?.duration && (
              <span className="flex items-center gap-1.5 text-[#f0a8d0]">
                <Film className="w-3.5 h-3.5" />
                {currentWork.videoData.duration}
              </span>
            )}
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="hidden sm:inline text-neutral-400">{currentWork.viewsCount || 0} Atelier Views</span>
          </div>
        </div>
      </div>

      {/* Carousel dots indicator if multiple nominees */}
      {candidateSpotlights.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 py-1">
          {candidateSpotlights.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to spotlight nomination ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex ? 'w-6 bg-[#c9a875]' : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
