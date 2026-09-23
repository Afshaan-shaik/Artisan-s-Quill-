import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, Bookmark, Play, Pause, Volume2, VolumeX, Sparkles, Image, Film, Palette, PenTool, Share2, Layers } from 'lucide-react';
import { Artwork, ArtCategory } from '../types';
import { PoetryCard } from './PoetryCard';
import { MusicArtworkCard } from './MusicArtworkCard';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';

const formatCardVideoTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type GridDensity = 'grande' | 'curatorial' | 'archive';

interface MasonryGridProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  selectedCategory: ArtCategory;
  onOpenUpload: (category?: ArtCategory) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  onOpenBardModal?: (poem: { title: string; author: string; authorHandle?: string; content: string }) => void;
  density?: GridDensity;
}

interface ArtworkParallaxCardProps {
  artwork: Artwork;
  index: number;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Returns height/width ratio for a given aspectRatio string. */
const getAspectRatioValue = (ratio: Artwork['aspectRatio']): number => {
  switch (ratio) {
    case 'tall':      return 5 / 4;
    case 'portrait':  return 4 / 3;
    case 'wide':      return 10 / 16;
    case 'ultrawide': return 9 / 21;
    case 'square':
    default:          return 1;
  }
};

/** Responsive column count and gutter gap matching curatorial density mode. */
const getColumnCountAndGap = (
  width: number,
  density: GridDensity = 'curatorial'
): { cols: number; gap: number } => {
  if (density === 'grande') {
    if (width >= 1024) return { cols: 2, gap: 36 };
    if (width >= 640)  return { cols: 2, gap: 28 };
    return { cols: 1, gap: 20 };
  }

  if (density === 'archive') {
    if (width >= 1280) return { cols: 4, gap: 24 };
    if (width >= 1024) return { cols: 3, gap: 22 };
    if (width >= 640)  return { cols: 2, gap: 20 };
    return { cols: 1, gap: 16 };
  }

  // Default: 'curatorial' - spacious 3-column salon layout
  if (width >= 1280) return { cols: 3, gap: 32 };
  if (width >= 1024) return { cols: 3, gap: 28 };
  if (width >= 640)  return { cols: 2, gap: 24 };
  return { cols: 1, gap: 20 };
};

// ─── Individual Artwork Card ──────────────────────────────────────────────────

const ArtworkParallaxCard: React.FC<ArtworkParallaxCardProps> = ({
  artwork,
  index,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onShareArtwork,
  onAddToMoodBoard
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Video playback & scrubber states for uploaded videos
  const isVideo = isVideoMedia(artwork);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardProgressRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Smooth dragging across timeline
  useEffect(() => {
    if (!isScrubbing) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!cardProgressRef.current || duration <= 0) return;
      const rect = cardProgressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      const target = ratio * duration;
      if (videoRef.current) {
        videoRef.current.currentTime = target;
        setCurrentTime(target);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsScrubbing(false);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isScrubbing, duration]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'painting': return <Palette className="w-3 h-3 text-[#e8b482]" />;
      case 'drawing':  return <PenTool  className="w-3 h-3 text-[#b9c6ea]" />;
      case 'digital':  return <Image    className="w-3 h-3 text-[#8ed8b5]" />;
      case 'video':    return <Film     className="w-3 h-3 text-[#f0a8d0]" />;
      default:         return <Sparkles className="w-3 h-3 text-[#c9a875]" />;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const offsetY = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    setParallaxOffset({ x: offsetX * 10, y: offsetY * 10 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParallaxOffset({ x: 0, y: 0 });
  };

  const handleLike = (id: string, isLiked: boolean | undefined, e: React.MouseEvent) => {
    if (!isLiked) {
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#c9a875', '#ffffff', '#e53e3e']
      });
    }
    onToggleLike(id, e);
  };

  const isTall = artwork.aspectRatio === 'tall' || artwork.aspectRatio === 'portrait';
  const isWide = artwork.aspectRatio === 'wide' || artwork.aspectRatio === 'ultrawide';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min((index % 4) * 0.08, 0.28)
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      id={`artwork-card-${artwork.id}`}
      data-artwork-title={artwork.title}
      onClick={() => onSelectArtwork(artwork)}
      className="relative group overflow-hidden museum-shadowbox rounded-xl border border-white/10 hover:border-[#c9a875]/60 shadow-2xl cursor-pointer w-full transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(201,168,117,0.2)] hover:z-10 bg-[#06080d]"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {/* 1. Museum Passe-Partout Inset Frame */}
      <div
        className={`relative w-full overflow-hidden bg-[#030407] rounded-lg border border-white/10 group-hover:border-[#c9a875]/40 transition-colors ${
          isTall ? 'aspect-[3/4]' : isWide ? 'aspect-[16/10]' : 'aspect-square'
        }`}
      >
        {/* Shimmer Skeleton Placeholder while loading */}
        {!imageLoaded && !imageError && artwork.category !== 'video' && (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800/80 to-neutral-900 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border border-[#c9a875]/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#c9a875]/50 animate-spin" />
            </div>
          </div>
        )}

        {/* Fallback for failed image load */}
        {imageError && (
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
            <Palette className="w-8 h-8 text-[#c9a875]/40 mb-2" />
            <span className="text-xs font-serif italic text-neutral-400">{artwork.title}</span>
            <span className="text-[10px] font-mono-code text-neutral-600 uppercase mt-1">Archived Visual</span>
          </div>
        )}

        {isVideo ? (
          <div className="relative w-full h-full overflow-hidden">
            <video
              ref={videoRef}
              src={artwork.mediaUrl}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="auto"
              onLoadedMetadata={() => {
                if (videoRef.current?.duration) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current && !isScrubbing) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 pointer-events-none scale-105 bg-[#030407]"
              style={{
                transform: `scale(${isHovered ? 1.08 : 1.04}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
              }}
            />

            {/* Down Audio / Volume On or Off & YouTube-Style Scrubber for Uploaded Videos */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 z-30 p-2.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-1.5 transition-opacity duration-200 pointer-events-auto"
            >
              {/* YouTube-Style Mini Scrubber Track */}
              <div
                ref={cardProgressRef}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsScrubbing(true);
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
                  const target = ratio * (duration || 1);
                  if (videoRef.current) {
                    videoRef.current.currentTime = target;
                    setCurrentTime(target);
                  }
                }}
                onMouseMove={(e) => {
                  if (!cardProgressRef.current || duration <= 0) return;
                  const rect = cardProgressRef.current.getBoundingClientRect();
                  const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
                  setHoverTime(ratio * duration);
                }}
                onMouseLeave={() => setHoverTime(null)}
                className="relative h-4 flex items-center cursor-pointer group/cardtrack"
                title="Scroll or click to seek forward/backward"
              >
                <div className="w-full h-1 group-hover/cardtrack:h-1.5 rounded-full bg-white/25 overflow-hidden relative transition-all">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff0000] via-[#df3838] to-[#c9a875] rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-75"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#ff0000] border border-white shadow scale-0 group-hover/cardtrack:scale-100 transition-transform pointer-events-none"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                {hoverTime !== null && (
                  <div
                    className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/95 border border-white/20 text-[8px] font-mono-code text-white pointer-events-none z-30"
                    style={{ left: `${duration > 0 ? (hoverTime / duration) * 100 : 0}%` }}
                  >
                    {formatCardVideoTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Down Controls Row: Play/Pause, Down Audio / Volume On or Off Button, Timestamp */}
              <div className="flex items-center justify-between text-white text-[10px] font-mono-code">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!videoRef.current) return;
                      if (videoRef.current.paused) {
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      } else {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      }
                    }}
                    className="p-1 rounded hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                  </button>

                  {/* DOWN AUDIO / VOLUME ON OR OFF BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!videoRef.current) return;
                      const nextMuted = !isMuted;
                      videoRef.current.muted = nextMuted;
                      if (!nextMuted) {
                        videoRef.current.volume = 1;
                        videoRef.current.play().catch(() => {});
                      }
                      setIsMuted(nextMuted);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      !isMuted
                        ? 'bg-[#c9a875] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.7)]'
                        : 'bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white border border-white/20'
                    }`}
                    title={isMuted ? 'Turn Audio On (🔊)' : 'Turn Audio Off (🔇)'}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3 h-3 text-red-400" />
                        <span className="text-[8px] uppercase tracking-wider font-semibold">Sound Off</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-black" />
                        <span className="text-[8px] uppercase tracking-wider font-semibold">Sound On</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[9px] text-neutral-300 select-none">
                  <span>{formatCardVideoTime(currentTime)}</span>
                  <span className="text-neutral-500 mx-0.5">/</span>
                  <span>{formatCardVideoTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <img
            src={artwork.thumbnailUrl || artwork.mediaUrl}
            alt={artwork.title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              imageLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `scale(${isHovered ? 1.08 : 1.04}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
            }}
          />
        )}

        {/* Category Tag */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-neutral-200 z-10 flex items-center gap-1.5 shadow-md rounded-md">
          {getCategoryIcon(artwork.category)}
          <span>{artwork.category}</span>
        </div>

        {/* Masterpiece Badge */}
        {(artwork.id === 'spotlight-masterpiece-1' || artwork.tags?.includes('Masterpiece of the Day')) && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-[#c9a875] text-black text-[9px] font-extrabold tracking-widest uppercase shadow-[0_0_12px_rgba(201,168,117,0.5)] rounded-md">
            <Sparkles className="w-3 h-3 text-black" />
            <span>#1 Masterpiece</span>
          </div>
        )}

        {/* Video Duration Badge */}
        {artwork.category === 'video' && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-medium tracking-widest uppercase shadow-md rounded-md">
            <Play className="w-3 h-3 fill-current text-[#f0a8d0]" />
            <span>{artwork.videoData?.duration}</span>
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(artwork.id, artwork.isLiked, e); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono-code uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer ${
                artwork.isLiked
                  ? 'bg-rose-500/25 border border-rose-500/60 text-rose-400'
                  : 'bg-black/60 border border-white/15 text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{artwork.likesCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(artwork.id, e); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono-code uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer ${
                artwork.isSaved
                  ? 'bg-[#c9a875]/25 border border-[#c9a875]/60 text-[#dfbd87]'
                  : 'bg-black/60 border border-white/15 text-neutral-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : ''}`} />
              <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onShareArtwork) {
                  onShareArtwork(artwork);
                } else {
                  const url = `${window.location.origin}${window.location.pathname}?artwork=${artwork.id}`;
                  navigator.clipboard.writeText(url);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono-code uppercase tracking-wider bg-black/60 border border-white/15 text-[#dfbd87] hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto backdrop-blur-md"
              title="Share and Curate Artwork"
            >
              <Share2 className="w-3.5 h-3.5 text-[#c9a875]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Museum Caption Plaque */}
      <div className="pt-3 px-3.5 pb-3 flex flex-col gap-1.5 select-none">
        <div className="flex items-center justify-between text-[10px] font-mono-code text-[#c9a875] tracking-wider">
          <span>#AQ-{(artwork.year || '2026')}-{artwork.id.slice(-4).toUpperCase()}</span>
          <span className="text-neutral-400 capitalize">{artwork.medium || artwork.category}</span>
        </div>
        <h3 className="text-base sm:text-lg font-serif-display font-light text-white group-hover:text-[#f8f5eb] transition-colors leading-snug truncate">
          {artwork.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono-code pt-1 border-t border-white/[0.08]">
          <span className="text-neutral-300 truncate max-w-[140px] sm:max-w-[200px]">
            {artwork.artist.name}
          </span>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(artwork.id, artwork.isLiked, e);
              }}
              className="text-neutral-400 hover:text-rose-400 active:scale-90 flex items-center gap-1 p-1.5 min-w-[36px] min-h-[36px] justify-center transition-all cursor-pointer"
              title="Like artwork"
              aria-label={`Like ${artwork.title}, currently ${artwork.likesCount || 0} likes`}
            >
              <Heart className={`w-3.5 h-3.5 shrink-0 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
              <span>{artwork.likesCount || 0}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(artwork.id, e);
              }}
              className="text-neutral-400 hover:text-[#dfbd87] active:scale-90 flex items-center gap-1 p-1.5 min-w-[36px] min-h-[36px] justify-center transition-all cursor-pointer"
              title="Save artwork to vault"
              aria-label={`Save ${artwork.title} to vault`}
            >
              <Bookmark className={`w-3.5 h-3.5 shrink-0 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : 'text-neutral-400'}`} />
              <span>{artwork.savesCount || 0}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onShareArtwork) {
                  onShareArtwork(artwork);
                } else {
                  const url = `${window.location.origin}${window.location.pathname}?artwork=${artwork.id}`;
                  navigator.clipboard.writeText(url);
                }
              }}
              className="text-neutral-400 hover:text-[#dfbd87] active:scale-90 flex items-center gap-1 p-1.5 min-w-[36px] min-h-[36px] justify-center transition-all cursor-pointer"
              title="Share artwork"
              aria-label={`Share ${artwork.title}`}
            >
              <Share2 className="w-3.5 h-3.5 shrink-0 text-[#c9a875]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── MasonryGrid Component ────────────────────────────────────────────────────

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  artworks,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  selectedCategory,
  onOpenUpload,
  onAddToMoodBoard,
  onOpenBardModal,
  density = 'curatorial'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      return window.innerWidth;
    }
    return 1280;
  });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setContainerWidth(containerRef.current.clientWidth);
      } else if (typeof window !== 'undefined' && window.innerWidth > 0) {
        setContainerWidth(window.innerWidth);
      }
    };

    updateWidth();

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateWidth);
      observer.observe(container);
    }

    window.addEventListener('resize', updateWidth);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const { cols, gap } = useMemo(
    () => getColumnCountAndGap(containerWidth, density),
    [containerWidth, density]
  );

  // Distribute artworks across columns using balanced height estimation
  // This guarantees natural document flow (0% overlap, 100% equal horizontal and vertical gap)
  const columns = useMemo(() => {
    if (cols <= 1) {
      return [artworks.map((artwork, originalIndex) => ({ artwork, originalIndex }))];
    }

    const colsArr: { artwork: Artwork; originalIndex: number }[][] = Array.from(
      { length: cols },
      () => []
    );
    const colHeights = new Array<number>(cols).fill(0);

    artworks.forEach((artwork, originalIndex) => {
      // Find column with smallest current accumulated height
      let shortestColIdx = 0;
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[shortestColIdx]) {
          shortestColIdx = c;
        }
      }

      colsArr[shortestColIdx].push({ artwork, originalIndex });

      // Approximate visual weight to keep bottoms balanced
      let weight = 1.0;
      if (artwork.category === 'poetry') {
        const stanzaCount = artwork.poetryContent?.stanzas?.length || 2;
        weight = Math.min(1.4, 0.95 + stanzaCount * 0.1);
      } else {
        switch (artwork.aspectRatio) {
          case 'tall': weight = 1.35; break;
          case 'portrait': weight = 1.25; break;
          case 'wide': weight = 0.75; break;
          case 'ultrawide': weight = 0.6; break;
          case 'square': default: weight = 1.0; break;
        }
      }
      colHeights[shortestColIdx] += weight;
    });

    return colsArr;
  }, [artworks, cols]);

  if (artworks.length === 0) {
    return (
      <div className="py-24 text-center bg-neutral-900/50 rounded-sm p-12 max-w-2xl mx-auto border border-white/5 my-8">
        <Palette className="w-12 h-12 text-neutral-600 mx-auto mb-6" />
        <h3 className="text-2xl font-light tracking-tight text-white mb-2 uppercase">The Sanctuary Awaits</h3>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 font-light">
          No works found under this filter. Be the visionary to inaugurate this collection.
        </p>
        <button
          onClick={() => onOpenUpload(selectedCategory !== 'all' ? selectedCategory : 'painting')}
          className="px-5 py-2 text-[10px] uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer text-white bg-transparent"
        >
          Submit Work
        </button>
      </div>
    );
  }

  return (
    <div
      id="gallery-masonry-container"
      ref={containerRef}
      className="w-full pb-16 grid items-start"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {columns.map((columnArtworks, colIdx) => (
        <div
          key={`gallery-col-${colIdx}`}
          className="flex flex-col w-full min-w-0"
          style={{ gap: `${gap}px` }}
        >
          {columnArtworks.map(({ artwork, originalIndex }) => {
            if (artwork.category === 'poetry' && artwork.poetryContent) {
              return (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.75,
                    ease: [0.16, 1, 0.3, 1],
                    delay: Math.min((originalIndex % 4) * 0.08, 0.28)
                  }}
                  className="w-full"
                >
                  <PoetryCard
                    artwork={artwork}
                    onSelect={onSelectArtwork}
                    onToggleLike={onToggleLike}
                    onToggleSave={onToggleSave}
                    onSelectArtist={onSelectArtist}
                    onShare={onShareArtwork}
                    onAddToMoodBoard={onAddToMoodBoard}
                    onOpenBardModal={onOpenBardModal}
                  />
                </motion.div>
              );
            }

            if (artwork.category === 'music' || artwork.musicData) {
              return (
                <div key={artwork.id} className="w-full">
                  <MusicArtworkCard
                    artwork={artwork}
                    index={originalIndex}
                    onSelectArtwork={onSelectArtwork}
                    onToggleLike={onToggleLike}
                    onToggleSave={onToggleSave}
                    onSelectArtist={onSelectArtist}
                    onShareArtwork={onShareArtwork}
                    onAddToMoodBoard={onAddToMoodBoard}
                  />
                </div>
              );
            }

            return (
              <div key={artwork.id} className="w-full">
                <ArtworkParallaxCard
                  artwork={artwork}
                  index={originalIndex}
                  onSelectArtwork={onSelectArtwork}
                  onToggleLike={onToggleLike}
                  onToggleSave={onToggleSave}
                  onShareArtwork={onShareArtwork}
                  onAddToMoodBoard={onAddToMoodBoard}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};