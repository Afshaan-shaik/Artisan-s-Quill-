import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Disc3,
  Music as MusicIcon,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { Artwork } from '../../types';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface UniversalFullscreenViewerProps {
  isOpen: boolean;
  artwork: Artwork;
  mediaType: 'video' | 'photo' | 'music' | 'poetry';
  mediaUrl?: string;
  posterUrl?: string;
  initialTime?: number;
  initialPlaying?: boolean;
  initialMuted?: boolean;
  onClose: (finalTime?: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const UniversalFullscreenViewer: React.FC<UniversalFullscreenViewerProps> = ({
  isOpen,
  artwork,
  mediaType,
  mediaUrl,
  posterUrl,
  initialTime = 0,
  initialPlaying = true,
  initialMuted = true,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  useBodyScrollLock(isOpen);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(initialPlaying);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Attempt native browser fullscreen if supported
  useEffect(() => {
    if (!isOpen) return;

    const elem = containerRef.current || document.documentElement;
    const requestFs =
      elem.requestFullscreen ||
      (elem as any).webkitRequestFullscreen ||
      (elem as any).mozRequestFullScreen ||
      (elem as any).msRequestFullscreen;

    if (requestFs) {
      try {
        requestFs.call(elem).then(() => {
          setIsNativeFullscreen(true);
        }).catch(() => {
          // Native fullscreen restricted (e.g., in iframe or user preference), portal fallback remains active
          setIsNativeFullscreen(false);
        });
      } catch {
        setIsNativeFullscreen(false);
      }
    }

    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsNativeFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isOpen]);

  // Handle Close & exit native fullscreen
  const handleExit = useCallback(() => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      const exitFs =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;
      if (exitFs) {
        exitFs.call(document).catch(() => {});
      }
    }
    const finalT = videoRef.current ? videoRef.current.currentTime : currentTime;
    onClose(finalT);
  }, [currentTime, onClose]);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleExit();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        e.preventDefault();
        e.stopPropagation();
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        e.stopPropagation();
        onNext();
      } else if (e.key === ' ' && mediaType === 'video') {
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
      } else if ((e.key === 'm' || e.key === 'M') && mediaType === 'video') {
        e.preventDefault();
        e.stopPropagation();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        e.stopPropagation();
        toggleNativeFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, mediaType, handleExit]);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && mediaType === 'video') {
        setShowControls(false);
      }
    }, 3500);
  };

  const toggleNativeFullscreen = () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      const exitFs =
        document.exitFullscreen ||
        (document as any).webkitExitFullscreen ||
        (document as any).mozCancelFullScreen ||
        (document as any).msExitFullscreen;
      if (exitFs) exitFs.call(document).catch(() => {});
    } else {
      const elem = containerRef.current || document.documentElement;
      const requestFs =
        elem.requestFullscreen ||
        (elem as any).webkitRequestFullscreen ||
        (elem as any).mozRequestFullScreen ||
        (elem as any).msRequestFullscreen;
      if (requestFs) requestFs.call(elem).catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (ambientVideoRef.current) ambientVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      if (ambientVideoRef.current) ambientVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleLoop = () => {
    setIsLooping((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      if (
        ambientVideoRef.current &&
        Math.abs(ambientVideoRef.current.currentTime - videoRef.current.currentTime) > 0.4
      ) {
        ambientVideoRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      if (ambientVideoRef.current) ambientVideoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const resolvedMedia = mediaUrl || artwork.mediaUrl || artwork.thumbnailUrl || '';
  const resolvedPoster = posterUrl || artwork.thumbnailUrl || resolvedMedia;
  const artistName = typeof artwork.artist === 'object' ? artwork.artist.name : (artwork.artist || 'Sanctuary Artist');

  const getPillLabel = () => {
    switch (mediaType) {
      case 'video':
        return 'MOTION LOOP';
      case 'music':
        return 'ORIGINAL MUSIC';
      case 'poetry':
        return 'POETRY SANCTUARY';
      default:
        return 'PHOTOGRAPH & DIGITAL';
    }
  };

  return createPortal(
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[999999] bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300"
      style={{ touchAction: 'manipulation' }}
    >
      {/* ── 1. Ambient Background Layer (Blurred & Scaled) ── */}
      {mediaType === 'video' ? (
        <video
          ref={ambientVideoRef}
          src={resolvedMedia}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-125 filter blur-[64px] opacity-40 brightness-75 pointer-events-none"
        />
      ) : (
        <div
          className="absolute inset-0 scale-125 filter blur-[64px] opacity-35 brightness-70 pointer-events-none"
          style={{
            backgroundImage: `url(${resolvedPoster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* ── 2. Top Floating Header Bar ── */}
      <div
        className={`relative z-30 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4 transition-all duration-300 bg-gradient-to-b from-black/90 via-black/40 to-transparent ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
          <span className="px-3 py-1 rounded-full border border-[#d9b878]/60 text-[10px] sm:text-[11px] uppercase font-mono-code font-bold tracking-[0.2em] text-[#d9b878] shrink-0 bg-[#0d0f14]/80 backdrop-blur-md">
            {getPillLabel()}
          </span>
          <h1 className="font-serif text-lg sm:text-2xl font-light tracking-wide text-white truncate">
            {artwork.title}
          </h1>
          <span className="hidden md:inline-block text-xs font-mono-code text-neutral-400">
            • {artistName}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Toggle Native Fullscreen */}
          <button
            onClick={toggleNativeFullscreen}
            className="p-2.5 sm:p-3 rounded-full bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
            title={isNativeFullscreen ? 'Exit Native Fullscreen (F)' : 'Enter Native Fullscreen (F)'}
          >
            {isNativeFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Close / Minimize */}
          <button
            onClick={handleExit}
            className="p-2.5 sm:p-3 rounded-full bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer"
            title="Close Fullscreen (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* ── 3. Center Media Chamber ── */}
      <div className="relative z-20 flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 min-h-0 overflow-hidden">
        {mediaType === 'video' ? (
          <div className="relative max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.98)] border border-white/[0.12] bg-black">
            <video
              ref={videoRef}
              src={resolvedMedia}
              autoPlay
              muted={isMuted}
              loop={isLooping}
              playsInline
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="max-h-[82vh] sm:max-h-[86vh] max-w-[96vw] object-contain rounded-2xl cursor-pointer"
            />
          </div>
        ) : mediaType === 'music' ? (
          <div className="relative max-h-full max-w-full flex flex-col items-center justify-center gap-6 p-4">
            {/* Spinning Vinyl Record with Album Cover Art */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#11131a] via-[#050608] to-[#1a1c26] border-4 border-black/80 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex items-center justify-center ${
                  isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''
                }`}
                style={{
                  boxShadow: '0 0 60px rgba(217, 184, 120, 0.25), inset 0 0 40px rgba(0,0,0,0.8)'
                }}
              >
                {/* Grooves */}
                <div className="absolute inset-4 rounded-full border border-white/[0.04]" />
                <div className="absolute inset-10 rounded-full border border-white/[0.05]" />
                <div className="absolute inset-16 rounded-full border border-white/[0.04]" />
                <div className="absolute inset-24 rounded-full border border-white/[0.05]" />

                {/* Center Label */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#d9b878]/60 shadow-inner">
                  <img
                    src={resolvedPoster}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Track Info Badge */}
            <div className="px-5 py-2.5 rounded-full bg-[#0d0f14]/85 backdrop-blur-md border border-white/10 text-center shadow-2xl">
              <span className="font-serif text-base sm:text-lg text-white font-medium">
                {artwork.title}
              </span>
              <span className="font-mono-code text-xs text-[#d9b878] block mt-0.5">
                {artistName} • Studio Master Audio
              </span>
            </div>
          </div>
        ) : (
          <div className="relative max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.98)] border border-white/[0.08]">
            <img
              src={resolvedMedia}
              alt={artwork.title}
              className="max-h-[82vh] sm:max-h-[86vh] max-w-[96vw] object-contain rounded-2xl transition-all duration-300"
              draggable={false}
            />
          </div>
        )}

        {/* Hover Prev / Next Circular Arrows */}
        {hasPrev && onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 z-30 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            title="Previous Artwork (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 z-30 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            title="Next Artwork (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── 4. Bottom Floating Video / Audio Controls Bar ── */}
      {mediaType === 'video' && (
        <div
          className={`relative z-30 px-4 sm:px-8 py-4 sm:py-6 flex flex-col items-center gap-2 transition-all duration-300 bg-gradient-to-t from-black/95 via-black/50 to-transparent ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="w-full max-w-3xl px-4 sm:px-6 py-3 rounded-2xl bg-[#0d0f14]/85 backdrop-blur-xl border border-white/[0.12] shadow-2xl flex items-center gap-4">
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Scrubber */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleScrubberChange}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                className="w-full h-1.5 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#d9b878]"
              />
            </div>

            {/* Time */}
            <span className="font-mono-code text-xs text-neutral-300 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isLooping ? 'text-[#d9b878] bg-[#d9b878]/15' : 'text-neutral-400 hover:text-white'
              }`}
              title={isLooping ? 'Looping enabled' : 'Looping disabled'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-[#d9b878]" />}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
