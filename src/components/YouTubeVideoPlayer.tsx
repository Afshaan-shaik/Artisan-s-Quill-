import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Rewind,
  FastForward,
  Repeat,
  Sparkles
} from 'lucide-react';

export interface YouTubeVideoPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
  loop?: boolean;
  initialMuted?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const YouTubeVideoPlayer: React.FC<YouTubeVideoPlayerProps> = ({
  src,
  title,
  artist,
  aspectRatio = 'wide',
  autoPlay = true,
  loop = true,
  initialMuted = false,
  className = '',
  onEnded
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isLooping, setIsLooping] = useState(loop);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Scrubber & UI states
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [centerFeedback, setCenterFeedback] = useState<{ icon: 'play' | 'pause' | 'skip-fwd' | 'skip-bwd'; key: number } | null>(null);
  const [hasAutoplayFailedMuted, setHasAutoplayFailedMuted] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset & trigger center feedback ripple
  const triggerCenterFeedback = useCallback((icon: 'play' | 'pause' | 'skip-fwd' | 'skip-bwd') => {
    setCenterFeedback({ icon, key: Date.now() });
    setTimeout(() => {
      setCenterFeedback((prev) => (prev?.icon === icon ? null : prev));
    }, 600);
  }, []);

  // Sync ambient background video with main video
  const syncAmbientVideo = useCallback(() => {
    if (!ambientVideoRef.current || !videoRef.current) return;
    ambientVideoRef.current.currentTime = videoRef.current.currentTime;
    if (videoRef.current.paused) {
      ambientVideoRef.current.pause();
    } else {
      ambientVideoRef.current.play().catch(() => {});
    }
  }, []);

  // Handle Autoplay & Initial Sound
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    if (autoPlay) {
      // Try unmuted autoplay first if initialMuted is false
      if (!initialMuted) {
        video.muted = false;
        video.play()
          .then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          })
          .catch(() => {
            // Browser autoplay policy blocked unmuted video -> fall back to muted autoplay and show tap-to-unmute
            video.muted = true;
            setIsMuted(true);
            setHasAutoplayFailedMuted(true);
            video.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          });
      } else {
        video.muted = true;
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [src, autoPlay, initialMuted]);

  // Video Event Handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    if (!isNaN(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isDragging) return;
    setCurrentTime(videoRef.current.currentTime);

    // Track buffer progress
    if (videoRef.current.buffered.length > 0) {
      try {
        const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBufferedEnd(end);
      } catch {
        // no-op
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    syncAmbientVideo();
  };

  const handlePause = () => {
    setIsPlaying(false);
    syncAmbientVideo();
  };

  const handleVideoEnded = () => {
    if (isLooping && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      setIsPlaying(false);
      if (onEnded) onEnded();
    }
  };

  // Play / Pause Toggle
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          triggerCenterFeedback('play');
          syncAmbientVideo();
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerCenterFeedback('pause');
      syncAmbientVideo();
    }
  }, [syncAmbientVideo, triggerCenterFeedback]);

  // Volume / Audio On/Off Toggle
  const toggleMute = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;

    setHasAutoplayFailedMuted(false);

    if (isMuted || volume === 0) {
      const restoreVol = volume === 0 ? 0.85 : volume;
      videoRef.current.muted = false;
      videoRef.current.volume = restoreVol;
      setIsMuted(false);
      setVolume(restoreVol);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (!videoRef.current) return;

    videoRef.current.volume = newVol;
    if (newVol === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
    setHasAutoplayFailedMuted(false);
  };

  // Seek / Scrubbing calculation
  const calculateSeekTime = useCallback((clientX: number) => {
    if (!progressTrackRef.current || duration <= 0) return 0;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    return ratio * duration;
  }, [duration]);

  const applySeek = useCallback((targetTime: number) => {
    if (!videoRef.current || duration <= 0) return;
    const clamped = Math.max(0, Math.min(targetTime, duration));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
    syncAmbientVideo();
  }, [duration, syncAmbientVideo]);

  // Mouse scrubber events
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const target = calculateSeekTime(e.clientX);
    applySeek(target);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressTrackRef.current || duration <= 0) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    setHoverPosition(ratio * 100);
    setHoverTime(ratio * duration);
  };

  const handleProgressMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  // Global drag listener for smooth scrubbing outside track bounds
  useEffect(() => {
    if (!isDragging) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const target = calculateSeekTime(e.clientX);
      applySeek(target);
    };

    const onGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [isDragging, calculateSeekTime, applySeek]);

  // Touch scrubber events for mobile
  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    if (touch) {
      const target = calculateSeekTime(touch.clientX);
      applySeek(target);
    }
  };

  const handleProgressTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) {
      const target = calculateSeekTime(touch.clientX);
      applySeek(target);
    }
  };

  const handleProgressTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Skip 10s Backward / Forward
  const handleSkipSeconds = useCallback((deltaSeconds: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current || duration <= 0) return;
    const target = Math.max(0, Math.min(videoRef.current.currentTime + deltaSeconds, duration));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    syncAmbientVideo();
    triggerCenterFeedback(deltaSeconds > 0 ? 'skip-fwd' : 'skip-bwd');
  }, [duration, syncAmbientVideo, triggerCenterFeedback]);

  // Toggle Fullscreen
  const toggleFullscreen = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard Shortcuts (YouTube standard: Space/K = pause, J/L = skip 10s, M = mute, F = fullscreen, Arrows = 5s seek/volume)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        handleSkipSeconds(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleSkipSeconds(10);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.min(1, v + 0.1);
          if (videoRef.current) {
            videoRef.current.volume = next;
            videoRef.current.muted = false;
          }
          setIsMuted(false);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, v - 0.1);
          if (videoRef.current) {
            videoRef.current.volume = next;
            if (next === 0) videoRef.current.muted = true;
          }
          if (next === 0) setIsMuted(true);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSkipSeconds, toggleMute, toggleFullscreen]);

  // Auto-hide controls timer on mouse idle
  const handleMouseMoveContainer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying && !isDragging && !isVolumeHovered && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  };

  const handleMouseLeaveContainer = () => {
    if (isPlaying && !isDragging) {
      setShowControls(false);
    }
  };

  // Playback speed cycle
  const changeSpeed = (rate: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    if (ambientVideoRef.current) ambientVideoRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  };

  // Percentages for timeline
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMoveContainer}
      onMouseLeave={handleMouseLeaveContainer}
      onClick={togglePlay}
      className={`relative w-full rounded-2xl overflow-hidden bg-black border border-[#c9a875]/40 shadow-[0_0_50px_rgba(201,168,117,0.25)] select-none group/player flex flex-col justify-center items-center ${
        isFullscreen ? 'h-screen max-h-none rounded-none border-none' : 'max-h-[78vh]'
      } ${className}`}
    >
      {/* ── 1. AMBIENT BACKDROP REFLECTION (Cinema Mode Glow) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0 bg-black">
        <video
          ref={ambientVideoRef}
          src={src}
          loop={isLooping}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover filter blur-3xl scale-125 pointer-events-none bg-black"
        />
      </div>

      {/* ── 2. PRIMARY MASTER VIDEO CANVAS ── */}
      <video
        ref={videoRef}
        src={src}
        loop={isLooping}
        muted={isMuted}
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnded}
        className={`relative z-10 w-full object-contain mx-auto transition-transform duration-300 ${
          isFullscreen ? 'h-full max-h-screen' : 'h-auto max-h-[74vh]'
        }`}
      />

      {/* ── 3. TAP TO UNMUTE CALLOUT (If Autoplayed Muted by Browser Policy) ── */}
      {hasAutoplayFailedMuted && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-[#c9a875]/60 text-xs font-mono-code uppercase tracking-wider font-bold shadow-2xl backdrop-blur-md transition-all animate-bounce cursor-pointer"
        >
          <VolumeX className="w-4 h-4" />
          <span>Tap for Audio (🔊 Sound On)</span>
        </button>
      )}

      {/* ── 4. CENTER PLAY/PAUSE/SKIP RIPPLE ANIMATION ── */}
      {centerFeedback && (
        <div
          key={centerFeedback.key}
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        >
          <div className="w-20 h-20 rounded-full bg-black/60 border border-[#c9a875]/60 backdrop-blur-md flex items-center justify-center animate-ping text-[#dfbd87] shadow-[0_0_30px_rgba(201,168,117,0.5)]">
            {centerFeedback.icon === 'play' && <Play className="w-10 h-10 fill-current ml-1" />}
            {centerFeedback.icon === 'pause' && <Pause className="w-10 h-10 fill-current" />}
            {centerFeedback.icon === 'skip-fwd' && <FastForward className="w-10 h-10 fill-current" />}
            {centerFeedback.icon === 'skip-bwd' && <Rewind className="w-10 h-10 fill-current" />}
          </div>
        </div>
      )}

      {/* ── 5. TOP VIDEO METADATA BAR ── */}
      {(title || artist) && (
        <div
          className={`absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none flex items-center justify-between ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="space-y-0.5 max-w-[80%]">
            <h4 className="text-sm font-serif-display font-bold text-white drop-shadow truncate">
              {title}
            </h4>
            {artist && (
              <p className="text-[11px] font-mono-code text-[#c9a875] tracking-wider uppercase drop-shadow">
                {artist} • High-Fidelity Motion Loop
              </p>
            )}
          </div>
          <div className="px-2.5 py-1 rounded-full bg-black/70 border border-[#c9a875]/40 text-[10px] font-mono-code text-[#dfbd87] flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3 h-3 text-[#c9a875] animate-pulse" />
            <span>4K Cinema</span>
          </div>
        </div>
      )}

      {/* ── 6. YOUTUBE BOTTOM CONTROL BAR & SCRUBBER ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 inset-x-0 z-30 pt-8 pb-3 px-3 sm:px-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
          showControls || !isPlaying || isDragging ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* ── YouTube-Style Interactive Scrubber Bar (Scroll Forward/Backward) ── */}
        <div
          ref={progressTrackRef}
          onMouseDown={handleProgressMouseDown}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={handleProgressMouseLeave}
          onTouchStart={handleProgressTouchStart}
          onTouchMove={handleProgressTouchMove}
          onTouchEnd={handleProgressTouchEnd}
          className="relative h-6 flex items-center cursor-pointer group/scrubber"
          title="Scroll or click to seek forward/backward"
        >
          {/* Background Groove */}
          <div className="w-full h-1 sm:h-1.5 group-hover/scrubber:h-2 rounded-full bg-white/20 overflow-hidden relative transition-all duration-150 shadow-inner">
            {/* Buffer line */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/35 rounded-full pointer-events-none transition-all duration-200"
              style={{ width: `${bufferPercent}%` }}
            />

            {/* Hover preview line */}
            {hoverPosition !== null && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full pointer-events-none"
                style={{ width: `${hoverPosition}%` }}
              />
            )}

            {/* Active Progress Fill (YouTube Red + Artisan Gold Gradient) */}
            <div
              className="h-full bg-gradient-to-r from-[#ff0000] via-[#df3838] to-[#c9a875] rounded-full relative shadow-[0_0_12px_rgba(255,0,0,0.8)] transition-all duration-75 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Draggable Scrubber Thumb (YouTube Circle) */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[#ff0000] border-2 border-white shadow-[0_0_10px_rgba(255,0,0,0.9)] transition-all duration-100 ease-out pointer-events-none ${
              isDragging
                ? 'w-4 h-4 scale-125 ring-4 ring-[#ff0000]/40'
                : 'w-3.5 h-3.5 scale-0 group-hover/scrubber:scale-100'
            }`}
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip (YouTube style) */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 text-[10px] font-mono-code text-white shadow-xl pointer-events-none z-40"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatVideoTime(hoverTime)}
            </div>
          )}
        </div>

        {/* ── YouTube Bottom Transport Controls ── */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play/Pause, Rewind -10s, Forward +10s, Volume On/Off + Slider, Timestamp */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (k / Space)' : 'Play (k / Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Rewind 10 Seconds */}
            <button
              type="button"
              onClick={(e) => handleSkipSeconds(-10, e)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
              title="Rewind 10s (Left Arrow / j)"
            >
              <Rewind className="w-4 h-4" />
              <span className="text-[10px] font-mono-code hidden sm:inline">-10s</span>
            </button>

            {/* Fast-Forward 10 Seconds */}
            <button
              type="button"
              onClick={(e) => handleSkipSeconds(10, e)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
              title="Fast Forward 10s (Right Arrow / l)"
            >
              <FastForward className="w-4 h-4" />
              <span className="text-[10px] font-mono-code hidden sm:inline">+10s</span>
            </button>

            {/* ── AUDIO / VOLUME ON OR OFF + EXPANDABLE SLIDER (Down Audio / Volume) ── */}
            <div
              onMouseEnter={() => setIsVolumeHovered(true)}
              onMouseLeave={() => setIsVolumeHovered(false)}
              className="flex items-center gap-1.5 group/volume relative py-1"
            >
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title={isMuted || volume === 0 ? 'Turn Audio On (Unmute - m)' : 'Turn Audio Off (Mute - m)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5 text-[#dfbd87]" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#dfbd87]" />
                )}
              </button>

              {/* Volume Slider - smoothly expands on hover */}
              <div
                className={`overflow-hidden transition-all duration-200 flex items-center ${
                  isVolumeHovered ? 'w-16 sm:w-20 opacity-100' : 'w-0 opacity-0'
                }`}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeSliderChange}
                  className="w-16 sm:w-20 h-1 bg-white/30 accent-[#dfbd87] rounded-lg cursor-pointer"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>
            </div>

            {/* Timestamp Display (e.g. 0:14 / 0:30) */}
            <div className="text-[11px] font-mono-code text-neutral-300 ml-1 select-none flex items-center gap-1">
              <span>{formatVideoTime(currentTime)}</span>
              <span className="text-neutral-500">/</span>
              <span>{formatVideoTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Loop Toggle, Playback Speed, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Loop Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLooping(!isLooping);
              }}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                isLooping
                  ? 'text-[#c9a875] bg-[#c9a875]/15'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={isLooping ? 'Looping Enabled' : 'Looping Disabled'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu(!showSpeedMenu);
                }}
                className="px-2 py-1 rounded-md text-[11px] font-mono-code bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="Playback Speed"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full right-0 mb-2 py-1.5 w-24 rounded-xl bg-black/95 border border-[#c9a875]/40 shadow-2xl backdrop-blur-xl z-50 flex flex-col"
                >
                  <div className="px-3 py-1 text-[9px] font-mono-code text-neutral-400 uppercase tracking-widest border-b border-white/10 mb-1">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={(e) => changeSpeed(rate, e)}
                      className={`px-3 py-1 text-left text-xs font-mono-code transition-colors cursor-pointer flex items-center justify-between ${
                        playbackRate === rate
                          ? 'text-[#c9a875] font-bold bg-[#c9a875]/10'
                          : 'text-neutral-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <span className="text-[#c9a875]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/15 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
            >
              {isFullscreen ? (
                <Minimize className="w-4.5 h-4.5" />
              ) : (
                <Maximize className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
