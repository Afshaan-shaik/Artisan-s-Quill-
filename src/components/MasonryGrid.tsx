import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, Bookmark, Play, Sparkles, Image, Film, Palette, PenTool, Share2, Layers } from 'lucide-react';
import { Artwork, ArtCategory } from '../types';
import { PoetryCard } from './PoetryCard';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

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

/** Responsive column count matching Tailwind breakpoints. */
const getColumnCount = (width: number): number => {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640)  return 2;
  return 1;
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
      className="relative group overflow-hidden ultra-glass-panel glass-holographic-sheen card-3d-tilt rounded-xl border border-white/10 shadow-2xl cursor-pointer w-full transition-all duration-500 ease-out hover:scale-[1.02] hover:border-[#c9a875]/60 hover:z-10"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      {/* Image / Video Container */}
      <div
        className={`relative w-full overflow-hidden bg-[#050608] ${
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
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 pointer-events-none scale-105 bg-[#050608]"
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
              imageLoaded ? 'opacity-85 group-hover:opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `scale(${isHovered ? 1.09 : 1.04}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
            }}
          />
        )}

        {/* Category Tag */}
        <div className="absolute top-5 left-5 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-neutral-200 z-10 flex items-center gap-1.5 shadow-md">
          {getCategoryIcon(artwork.category)}
          <span>{artwork.category}</span>
        </div>

        {/* Masterpiece of the Day Badge */}
        {(artwork.id === 'spotlight-masterpiece-1' || artwork.tags?.includes('Masterpiece of the Day')) && (
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-[#c9a875]/90 backdrop-blur-md border border-[#dfbd87] text-black text-[9px] font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(201,168,117,0.5)]">
            <Sparkles className="w-3 h-3 text-black" />
            <span>#1 Masterpiece</span>
          </div>
        )}

        {/* Video Duration Badge */}
        {artwork.category === 'video' && (
          <div className="absolute top-5 right-5 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-medium tracking-widest uppercase shadow-md">
            <Play className="w-3 h-3 fill-current text-[#f0a8d0]" />
            <span>{artwork.videoData?.duration}</span>
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6 sm:p-8 transition-opacity duration-300">
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white mb-1 leading-snug drop-shadow-md">
            {artwork.title}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a875] mb-5 font-mono-code">
            {artwork.artist.name} • {artwork.medium || artwork.category}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleLike(artwork.id, artwork.isLiked, e)}
              className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isLiked ? 'text-rose-400' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{artwork.likesCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(artwork.id, e); }}
              className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isSaved ? 'text-[#c9a875]' : 'text-neutral-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : ''}`} />
              <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToMoodBoard) onAddToMoodBoard(artwork);
              }}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#dfbd87] hover:text-white transition-colors cursor-pointer ml-auto"
              title="Add to Vault"
            >
              <Layers className="w-3.5 h-3.5 text-[#c9a875]" />
              <span className="hidden sm:inline">Vault</span>
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
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#dfbd87] hover:text-white transition-colors cursor-pointer ml-auto"
              title="Share and Curate Artwork"
            >
              <Share2 className="w-3.5 h-3.5 text-[#c9a875]" />
              <span>Share</span>
            </button>
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
  gap: number = 24
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

    const cols = getColumnCount(containerWidth);
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
        // Poetry cards: standardized disciplined card height
        itemHeight = 460;
      } else {
        const ratio = getAspectRatioValue(artwork.aspectRatio);
        itemHeight = colWidth * ratio;
      }

      const top  = colHeights[shortestColIdx];
      const left = shortestColIdx * (colWidth + gap);
      colHeights[shortestColIdx] += itemHeight + gap;

      return { top, left, width: colWidth, height: itemHeight };
    });

    setPositions(newPositions);
    const maxColHeight = colHeights.length > 0 ? Math.max(...colHeights) : 0;
    setTotalHeight(maxColHeight > 0 ? maxColHeight + 60 : 0);
  }, [artworks, containerRef, gap]);

  // Recompute whenever artworks change
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
  onOpenBardModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const GAP = 24;
  const { positions, totalHeight } = useMasonryLayout(artworks, containerRef, GAP);

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