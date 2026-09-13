import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Feather,
  Palette,
  PenTool,
  ImageIcon,
  Sparkles,
  VolumeX,
  Play
} from 'lucide-react';
import { Artwork } from '../types';
import { isVideoMedia, getMediaPoster } from '../utils/mediaUtils';

interface CosmosLiveArtworkMediaProps {
  artwork: Artwork;
  accentColor?: string;
  className?: string;
}

export const CosmosLiveArtworkMedia: React.FC<CosmosLiveArtworkMediaProps> = ({
  artwork,
  accentColor = '#c9a875',
  className = ''
}) => {
  const [mediaError, setMediaError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset states if artwork changes
  useEffect(() => {
    setMediaError(false);
    setImageLoaded(false);
  }, [artwork.id]);

  // Robust medium detection
  const isVideo =
    artwork.category === 'video' ||
    isVideoMedia(artwork) ||
    Boolean(artwork.videoData && Object.keys(artwork.videoData).length > 0) ||
    Boolean(artwork.mediaUrl?.match(/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i)) ||
    Boolean(artwork.thumbnailUrl?.match(/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i));

  const isPoetry = artwork.category === 'poetry' || Boolean(artwork.poetryContent);

  // Play video reliably when mounted/active
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted by browser until user gesture, muted bypasses this
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isVideo, artwork.mediaUrl]);

  // Medium icon helper
  const getMediumIcon = () => {
    switch (artwork.category) {
      case 'painting':
        return <Palette className="w-5 h-5 text-[#f59e0b]" />;
      case 'drawing':
        return <PenTool className="w-5 h-5 text-[#f43f5e]" />;
      case 'digital':
        return <ImageIcon className="w-5 h-5 text-[#a855f7]" />;
      case 'video':
        return <Film className="w-5 h-5 text-[#10b981]" />;
      case 'poetry':
      default:
        return <Feather className="w-5 h-5 text-[#dfbd87]" />;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. VIDEO MEDIUM LIVE PREVIEW
  // ─────────────────────────────────────────────────────────────
  if (isVideo) {
    const videoSrc = artwork.mediaUrl || artwork.thumbnailUrl;

    if (!videoSrc || mediaError) {
      // Cinematic Fallback for Missing / Errored Video
      return (
        <div
          className={`relative w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#0c1f17] via-[#081310] to-[#040806] border border-emerald-500/30 overflow-hidden ${className}`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Film className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-serif italic text-white line-clamp-1">
            {artwork.title}
          </span>
          <span className="text-[9px] font-mono-code uppercase tracking-wider text-emerald-300/80 mt-0.5">
            {artwork.videoData?.duration ? `${artwork.videoData.duration} • Video Stream` : 'Celestial Motion Piece'}
          </span>
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[8px] font-mono-code text-emerald-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VIDEO</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setMediaError(true)}
          className="w-full h-full object-cover"
        />

        {/* Live Indicator Badges */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[8px] font-mono-code text-emerald-300 font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Motion</span>
        </div>

        {artwork.videoData?.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/20 text-[8px] font-mono-code text-white flex items-center gap-1 shadow-md">
            <Play className="w-2 h-2 fill-current text-[#10b981]" />
            <span>{artwork.videoData.duration}</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 p-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-neutral-400">
          <VolumeX className="w-2.5 h-2.5 text-neutral-400" />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. POETRY MEDIUM LIVE PREVIEW ("pom")
  // ─────────────────────────────────────────────────────────────
  if (isPoetry) {
    const pc = artwork.poetryContent;
    // Extract first memorable lines of the poem
    const firstLines =
      pc?.excerpt ||
      (pc?.stanzas && pc.stanzas[0]
        ? pc.stanzas[0].split('\n').filter(Boolean).slice(0, 3).join(' / ')
        : null) ||
      artwork.description ||
      'Silent thoughts inscribed upon the nocturnal cosmic vellum...';

    const poemNumber = pc?.poemNumber || 'I';
    const authorSignature = pc?.authorSignature || (artwork.artist?.name ? `— ${artwork.artist.name}` : '— Artisan Quill');

    return (
      <div
        className={`relative w-full h-full flex flex-col justify-between p-3.5 bg-gradient-to-br from-[#241c14] via-[#16120e] to-[#0a0705] border border-[#c9a875]/40 overflow-hidden select-none ${className}`}
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Parchment Fiber Micro Texture Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#c9a875 1px, transparent 1px), radial-gradient(#dfbd87 1px, transparent 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px'
          }}
        />

        {/* Ambient Golden Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,117,0.15),transparent_75%)] pointer-events-none" />

        {/* Top Header: Feather & Poem Number / Theme */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono-code uppercase tracking-wider text-[#dfbd87]">
          <span className="flex items-center gap-1.5 font-bold">
            <Feather className="w-3.5 h-3.5 text-[#c9a875]" />
            <span>Poem {poemNumber} • {artwork.medium || 'Verse'}</span>
          </span>
          {pc?.readingTimeMinutes && (
            <span className="text-neutral-400 text-[8px]">{pc.readingTimeMinutes} min lyric</span>
          )}
        </div>

        {/* Center: Live Verse Stanza Text */}
        <div className="relative z-10 my-auto py-1 text-center px-1">
          <p className="font-serif italic text-xs sm:text-[13px] text-[#f7edd8] leading-relaxed line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium">
            "{firstLines}"
          </p>
        </div>

        {/* Bottom: Signature & Parchment Style */}
        <div className="relative z-10 flex items-center justify-between text-[9px] font-mono-code text-neutral-400 pt-1.5 border-t border-[#c9a875]/25">
          <span className="truncate italic text-[#dfbd87]/90 text-[10px]">
            {authorSignature}
          </span>
          <span className="text-[8px] text-[#c9a875]/80 uppercase tracking-widest shrink-0 ml-2">
            ✦ Living Verse
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PAINTING, DRAWING, DIGITAL OR GENERAL IMAGE
  // ─────────────────────────────────────────────────────────────
  const rawImageSrc = artwork.thumbnailUrl || artwork.mediaUrl;
  // Safety guard: if rawImageSrc looks like a video URL, avoid passing to <img>
  const isSuspiciousVideoUrl =
    Boolean(rawImageSrc?.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)) ||
    (rawImageSrc && (rawImageSrc.includes('video/') || rawImageSrc.includes('videos/')));

  const imageSrc = isSuspiciousVideoUrl ? undefined : rawImageSrc;

  // Fallback for broken/missing images (Generative Curatorial Masterpiece Card)
  if (!imageSrc || mediaError) {
    const primaryColor = artwork.colorPalette?.[0] || accentColor || '#c9a875';
    const secondaryColor = artwork.colorPalette?.[1] || '#0d111c';

    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center p-3 text-center overflow-hidden ${className}`}
        style={{
          background: `radial-gradient(circle at 50% 35%, ${primaryColor}33 0%, ${secondaryColor} 70%, #06080e 100%)`,
          border: `1px solid ${primaryColor}44`
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 border shadow-[0_0_20px_rgba(0,0,0,0.7)] backdrop-blur-md"
          style={{
            backgroundColor: `${primaryColor}22`,
            borderColor: `${primaryColor}55`
          }}
        >
          {getMediumIcon()}
        </div>

        <h5 className="text-xs font-serif font-bold text-white line-clamp-1 max-w-[90%] drop-shadow-md">
          {artwork.title}
        </h5>

        <p className="text-[9px] font-mono-code uppercase tracking-wider text-neutral-300 mt-0.5">
          {artwork.medium || `${artwork.category} Masterpiece`}
        </p>

        <span className="text-[8px] font-mono-code text-[#dfbd87] mt-1 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#dfbd87]" />
          <span>Curated Sanctuary Visual</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#07090e] ${className}`}>
      {/* Shimmer Placeholder while loading */}
      {!imageLoaded && !mediaError && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse flex items-center justify-center z-0">
          <Sparkles className="w-4 h-4 text-[#c9a875]/60 animate-spin" />
        </div>
      )}

      <img
        src={imageSrc}
        alt={artwork.title}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setImageLoaded(true)}
        onError={() => setMediaError(true)}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />

      {/* Subtle bottom gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default CosmosLiveArtworkMedia;
