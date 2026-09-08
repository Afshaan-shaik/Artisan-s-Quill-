import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Bookmark, Play, Sparkles, Image, Film, Palette, PenTool, Share2, Layers } from 'lucide-react';
import { Artwork, ArtCategory } from '../types';
import { PoetryCard } from './PoetryCard';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';

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
    if (width >= 1024) return { cols: 2, gap: 48 };
    if (width >= 640)  return { cols: 2, gap: 36 };
    return { cols: 1, gap: 24 };
  }

  if (density === 'archive') {
    if (width >= 1280) return { cols: 4, gap: 26 };
    if (width >= 1024) return { cols: 3, gap: 24 };
    if (width >= 640)  return { cols: 2, gap: 20 };
    return { cols: 1, gap: 16 };
  }

  // Default: 'curatorial' - spacious 3-column salon layout
  if (width >= 1280) return { cols: 3, gap: 38 };
  if (width >= 1024) return { cols: 3, gap: 32 };
  if (width >= 640)  return { cols: 2, gap: 28 };
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

        {isVideoMedia(artwork) ? (
          <video
            src={artwork.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 pointer-events-none scale-105 bg-[#030407]"
            style={{
              transform: `scale(${isHovered ? 1.08 : 1.04}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
            }}
          />
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
      <div className="pt-3 px-1 pb-0.5 flex flex-col gap-1.5 select-none">
        <div className="flex items-center justify-between text-[10px] font-mono-code text-[#c9a875] tracking-wider">
          <span>#AQ-{(artwork.year || '2026')}-{artwork.id.slice(-4).toUpperCase()}</span>
          <span className="text-neutral-400 capitalize">{artwork.medium || artwork.category}</span>
        </div>
        <h3 className="text-base sm:text-lg font-serif-display font-light text-white group-hover:text-[#f8f5eb] transition-colors leading-snug truncate">
          {artwork.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono-code pt-0.5 border-t border-white/[0.06]">
          <span className="text-neutral-300 truncate max-w-[150px] sm:max-w-[200px]">
            {artwork.artist.name}
          </span>
          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'}`} />
              {artwork.likesCount || 0}
            </span>
            <span className="text-neutral-400 flex items-center gap-1">
              <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : 'text-neutral-400'}`} />
              {artwork.savesCount || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── JS Masonry Engine Hook ───────────────────────────────────────────────────

/**
 * Computes absolute (top, left, width, height) for each item using the
 * "shortest column" greedy algorithm — the same one Pinterest uses.
 * Recalculates automatically via ResizeObserver whenever container width changes.
 */
const useMasonryLayout = (
  artworks: Artwork[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  density: GridDensity = 'curatorial'
) => {
  const [positions, setPositions] = useState<
    { top: number; left: number; width: number; height: number }[]
  >([]);
  const [totalHeight, setTotalHeight] = useState(0);

  const compute = useCallback(() => {
    const container = containerRef.current;
    if (!container || artworks.length === 0) return;

    const containerWidth = container.clientWidth;
    if (containerWidth === 0) return;

    const { cols, gap } = getColumnCountAndGap(containerWidth, density);
    const colWidth = (containerWidth - gap * (cols - 1)) / cols;
    const colHeights = new Array<number>(cols).fill(0);

    const newPositions = artworks.map((artwork) => {
      // Shortest column wins
      const shortestColIdx = colHeights.reduce(
        (minIdx, h, i) => (h < colHeights[minIdx] ? i : minIdx),
        0
      );

      let itemHeight: number;
      if (artwork.category === 'poetry') {
        // Poetry cards: standardized disciplined card height for parchment matting + museum caption plaque
        itemHeight = 520;
      } else {
        const ratio = getAspectRatioValue(artwork.aspectRatio);
        // Visual container + museum plaque height
        itemHeight = colWidth * ratio + 86;
      }

      const top  = colHeights[shortestColIdx];
      const left = shortestColIdx * (colWidth + gap);
      colHeights[shortestColIdx] += itemHeight + gap;

      return { top, left, width: colWidth, height: itemHeight };
    });

    setPositions(newPositions);
    const maxColHeight = colHeights.length > 0 ? Math.max(...colHeights) : 0;
    setTotalHeight(maxColHeight > 0 ? maxColHeight + 60 : 0);
  }, [artworks, containerRef, density]);

  // Recompute whenever artworks or density change
  useEffect(() => {
    compute();
  }, [compute]);

  // Recompute whenever the container is resized (responsive)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => compute());
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, compute]);

  return { positions, totalHeight };
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
  const { positions, totalHeight } = useMasonryLayout(artworks, containerRef, density);

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
      className="relative w-full pb-16"
      style={{
        height: totalHeight > 0 ? `${totalHeight}px` : 'auto',
        minHeight: '400px'
      }}
    >
      {artworks.map((artwork, index) => {
        const pos = positions[index];
        // Don't render until positions are computed (prevents FOUC)
        if (!pos) return null;

        const itemStyle: React.CSSProperties = {
          position: 'absolute',
          top:   pos.top,
          left:  pos.left,
          width: pos.width,
        };

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
                delay: Math.min((index % 4) * 0.08, 0.28)
              }}
              style={itemStyle}
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

        return (
          <div key={artwork.id} style={itemStyle}>
            <ArtworkParallaxCard
              artwork={artwork}
              index={index}
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
  );
};