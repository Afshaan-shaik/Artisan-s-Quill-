import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Film,
  Feather,
  Palette,
  PenTool,
  Image as ImageIcon,
  Video,
  Music as MusicIcon
} from 'lucide-react';
import { Artwork } from '../types';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';
import { isDerryArtwork } from '../utils/audioResolver';

interface CinemaModePlayerProps {
  artworks: Artwork[];
  startIndex?: number;
  onClose: () => void;
}

const SLIDE_INTERVAL_MS = 5500;

const getCategoryIcon = (category: Artwork['category']) => {
  switch (category) {
    case 'poetry':  return <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />;
    case 'painting':return <Palette className="w-3.5 h-3.5 text-[#e8b482]" />;
    case 'drawing': return <PenTool className="w-3.5 h-3.5 text-[#b9c6ea]" />;
    case 'digital': return <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />;
    case 'video':   return <Video className="w-3.5 h-3.5 text-[#f0a8d0]" />;
    case 'music':   return <MusicIcon className="w-3.5 h-3.5 text-[#d8b779]" />;
    default:        return <Film className="w-3.5 h-3.5 text-[#c9a875]" />;
  }
};

const getArtworkImage = (artwork: Artwork | null | undefined): string => {
  if (!artwork) return '';
  if (artwork.category === 'music' || isAudioMedia(artwork)) {
    // Specifically handle Anıl Emre Daldal - M. with our local high-res artwork asset
    if (
      artwork.id === 'music-anil-emre-daldal-m' ||
      artwork.id === 'music-m-remix' ||
      artwork.title === 'M.' ||
      (artwork.mediaUrl && artwork.mediaUrl.includes('wsKhe5rTKw8'))
    ) {
      return '/audio/M-Remix.jpg';
    }

    const candidates = [
      artwork.musicData?.coverArtUrl,
      artwork.thumbnailUrl,
      artwork.artist?.avatar
    ].filter(
      (url): url is string =>
        Boolean(url && typeof url === 'string' && !url.toLowerCase().endsWith('.mp4') && !url.toLowerCase().endsWith('.webm'))
    );
    if (candidates.length > 0) return candidates[0];
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
  }

  if (isVideoMedia(artwork)) {
    const poster = getMediaPoster(artwork);
    if (poster && !poster.toLowerCase().endsWith('.mp4') && !poster.toLowerCase().endsWith('.webm')) {
      return poster;
    }
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
  }

  if (artwork.thumbnailUrl && !artwork.thumbnailUrl.toLowerCase().endsWith('.mp4') && !artwork.thumbnailUrl.toLowerCase().endsWith('.webm')) {
    return artwork.thumbnailUrl;
  }
  if (artwork.mediaUrl && !artwork.mediaUrl.toLowerCase().endsWith('.mp4') && !artwork.mediaUrl.toLowerCase().endsWith('.webm')) {
    return artwork.mediaUrl;
  }
  return getMediaPoster(artwork) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
};

export const CinemaModePlayer: React.FC<CinemaModePlayerProps> = ({
  artworks,
  startIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Include all valid artworks: paintings, drawings, digital media, poetry, original music, and motion loops
  const validArtworks = useMemo(() => {
    return artworks.filter(
      (a) => !a.isDeleted && !isDerryArtwork(a)
    );
  }, [artworks]);

  const current = validArtworks[currentIndex] ?? validArtworks[0];

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(((index % validArtworks.length) + validArtworks.length) % validArtworks.length);
      setProgress(0);
      setIsTransitioning(false);
    }, 400);
  }, [isTransitioning, validArtworks.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    setProgress(0);

    const progressStep = 100 / (SLIDE_INTERVAL_MS / 80);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressStep, 100));
    }, 80);

    timerRef.current = setTimeout(() => {
      goNext();
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, isPlaying, goNext]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  const isPoetry = current.category === 'poetry';
  const isVideo = isVideoMedia(current);
  const isMusic = current.category === 'music' || isAudioMedia(current);
  const displayImage = getArtworkImage(current);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      style={{ fontFamily: 'inherit' }}
    >
      {/* ─── Full-screen Media ─── */}
      <div
        className={`absolute inset-0 transition-opacity duration-400 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isPoetry ? (
          // Poetry: render stanzas on a textured dark background
          <div
            className="w-full h-full flex items-center justify-center px-8 sm:px-20"
            style={{
              background: 'radial-gradient(ellipse at center, #12100e 0%, #07060a 70%, #000 100%)'
            }}
          >
            <div className="max-w-2xl text-center space-y-6">
              <div className="text-[#c9a875]/60 text-[10px] uppercase tracking-[0.4em] font-mono-code mb-8">
                The Poetic Archive
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.05em] mb-6">
                {current.title}
              </h2>
              <div className="space-y-4">
                {current.poetryContent?.stanzas.slice(0, 3).map((stanza, i) => (
                  <p
                    key={i}
                    className="font-serif italic text-neutral-200 text-base sm:text-lg leading-loose whitespace-pre-line"
                  >
                    {stanza.split('\n').slice(0, 4).join('\n')}
                  </p>
                ))}
              </div>
              <div className="pt-4 text-[#c9a875]/70 text-xs font-mono-code tracking-widest">
                — {current.artist.name}
              </div>
            </div>
          </div>
        ) : isVideo ? (
          // Motion Loop: full-bleed background blur + high-def auto-looping video
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(36px) brightness(0.22)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-14">
              <video
                key={current.id}
                src={current.mediaUrl || 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/artworks-1787665014401-qbv149.mp4'}
                poster={displayImage}
                autoPlay
                muted
                loop
                playsInline
                ref={(el) => {
                  if (el) {
                    el.muted = true;
                    el.play().catch(() => {});
                  }
                }}
                onLoadedData={(e) => {
                  const el = e.currentTarget;
                  el.muted = true;
                  el.play().catch(() => {});
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/artworks-1787665014401-qbv149.mp4') {
                    target.src = 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/artworks-1787665014401-qbv149.mp4';
                    target.muted = true;
                    target.play().catch(() => {});
                  }
                }}
                className={`max-h-full max-w-full object-contain rounded-xl shadow-[0_20px_90px_rgba(0,0,0,0.95)] border border-white/10 transition-opacity duration-400 ${
                  isTransitioning ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
                }`}
              />
            </div>
          </>
        ) : isMusic ? (
          // Music Masterpiece: Full-res Album Cover + Studio Vinyl Disc Treatment
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px) brightness(0.22)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-16">
              <div className="relative group max-h-full max-w-full flex items-center justify-center">
                {/* Vinyl Disc Backdrop Shadow / Glow */}
                <div className="absolute w-[90%] aspect-square rounded-full bg-gradient-to-tr from-[#c9a875]/20 to-transparent blur-2xl pointer-events-none" />

                <img
                  key={current.id}
                  src={displayImage}
                  alt={current.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/audio/M-Remix.jpg';
                  }}
                  className={`max-h-[68vh] max-w-[85vw] sm:max-w-[500px] aspect-square object-cover rounded-2xl shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(201,168,117,0.25)] border border-[rgba(236,214,170,0.25)] transition-all duration-400 ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                  draggable={false}
                />
                <div className="absolute -bottom-4 right-4 sm:-bottom-5 sm:right-6 px-4 py-1.5 rounded-full bg-[#0d0e14]/90 border border-[#d8b779]/40 backdrop-blur-md shadow-2xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d8b779] shadow-[0_0_8px_#d8b779] animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-mono-code font-semibold tracking-wider text-[#f6e3b4] uppercase">
                    Studio Master Audio
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Artwork: full-bleed image with blur backdrop
          <>
            {/* Blurred backdrop */}
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${displayImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(32px) brightness(0.25)',
              }}
            />
            {/* Sharp centred image */}
            <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-16">
              <img
                key={current.id}
                src={displayImage}
                alt={current.title}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
                }}
                className={`max-h-full max-w-full object-contain rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.9)] transition-opacity duration-400 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                draggable={false}
              />
            </div>
          </>
        )}
      </div>

      {/* ─── Top Bar: Exit + Title ─── */}
      <div className="relative z-10 flex items-start justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-mono-code text-[#c9a875]/80">
          <Film className="w-4 h-4" />
          <span>Cinema Mode</span>
          <span className="text-neutral-500 ml-2">
            {currentIndex + 1} / {validArtworks.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/20 transition-all backdrop-blur-sm cursor-pointer hover:scale-110"
          title="Exit Cinema Mode (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Left / Right Navigation Arrows ─── */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 z-10 pointer-events-none">
        <button
          onClick={goPrev}
          className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-110 backdrop-blur-sm"
          title="Previous (←)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={goNext}
          className="pointer-events-auto p-3 sm:p-4 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-110 backdrop-blur-sm"
          title="Next (→)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ─── Bottom: Lower-third Info + Controls ─── */}
      <div className="relative z-10 mt-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 sm:px-12 pb-6 pt-20">
        {/* Artwork Info */}
        <div
          className={`transition-all duration-400 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.3em] font-mono-code text-[#c9a875]/80">
            {getCategoryIcon(current.category)}
            <span>{isVideo ? 'Motion Loop' : isMusic ? 'Original Music' : current.category}</span>
            {current.year && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">{current.year}</span>
              </>
            )}
            {isMusic && current.musicData?.genre && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="text-[#d8b779]">{current.musicData.genre}</span>
              </>
            )}
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-serif tracking-[0.06em] mb-1">
            {current.title}
          </h3>
          <p className="text-neutral-300 text-xs font-mono-code tracking-wider">
            {current.artist.name}
            {current.artist.handle && (
              <span className="text-[#c9a875]/70 ml-2">{current.artist.handle}</span>
            )}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between mt-5">
          {/* Dot Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
            {validArtworks.slice(0, 12).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all cursor-pointer rounded-full ${
                  i === currentIndex
                    ? 'w-5 h-1.5 bg-[#c9a875]'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
            {validArtworks.length > 12 && (
              <span className="text-[9px] text-neutral-500 font-mono-code ml-1">
                +{validArtworks.length - 12}
              </span>
            )}
          </div>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white text-xs font-mono-code uppercase tracking-wider transition-all cursor-pointer backdrop-blur-sm"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* ─── Gold Progress Bar at the very bottom ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div
          className="h-full bg-[#c9a875] transition-none"
          style={{ width: `${isPlaying ? progress : 0}%` }}
        />
      </div>
    </div>,
    document.body
  );
};
