import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Sparkles,
  Layers
} from 'lucide-react';

export interface SpotifyRecitalPlayerProps {
  mode: 'authentic-audio' | 'speech-synthesis';
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number; // in seconds
  currentLineIndex?: number;
  totalLines?: number;
  currentLineText?: string;
  reciterBadge?: string;
  isUrduHindi?: boolean;
  accentFlag?: string;
  playbackRate?: number;
  onTogglePlay: () => void;
  onSeek: (targetSeconds: number) => void;
  onSkipSeconds: (deltaSeconds: number) => void;
  onSeekLine?: (lineIndex: number) => void;
  onRestart: () => void;
  onChangePlaybackRate?: (rate: number) => void;
  isCompact?: boolean;
  className?: string;
}

// Format seconds into m:ss (e.g. 1:04, 0:08)
export function formatRecitalTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const SpotifyRecitalPlayer: React.FC<SpotifyRecitalPlayerProps> = ({
  mode,
  isPlaying,
  currentTime,
  duration,
  currentLineIndex = 0,
  totalLines = 1,
  currentLineText,
  reciterBadge,
  isUrduHindi = false,
  accentFlag,
  playbackRate = 1.0,
  onTogglePlay,
  onSeek,
  onSkipSeconds,
  onSeekLine,
  onRestart,
  onChangePlaybackRate,
  isCompact = false,
  className = ''
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  // Effective progress percentage [0..100]
  const effectiveDuration = duration > 0 ? duration : Math.max(totalLines * 3.5, 1);
  const progressPercent = Math.min(Math.max((currentTime / effectiveDuration) * 100, 0), 100);

  // Handle clicking or dragging on progress track
  const calculateSeekTime = useCallback((clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    return ratio * effectiveDuration;
  }, [effectiveDuration]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    const seekTime = calculateSeekTime(e.clientX);
    onSeek(seekTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    setHoverPosition(ratio * 100);
    setHoverTime(ratio * effectiveDuration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  // Global mouse up / move while dragging
  useEffect(() => {
    if (!isDragging) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const seekTime = calculateSeekTime(e.clientX);
      onSeek(seekTime);
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
  }, [isDragging, calculateSeekTime, onSeek]);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    if (touch) {
      const seekTime = calculateSeekTime(touch.clientX);
      onSeek(seekTime);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) {
      const seekTime = calculateSeekTime(touch.clientX);
      onSeek(seekTime);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  // Skip verse in speech synthesis mode
  const handleVersePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'authentic-audio') {
      onSkipSeconds(-5);
    } else if (onSeekLine) {
      onSeekLine(Math.max(0, currentLineIndex - 1));
    }
  };

  const handleVerseNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'authentic-audio') {
      onSkipSeconds(5);
    } else if (onSeekLine) {
      onSeekLine(Math.min(totalLines - 1, currentLineIndex + 1));
    }
  };

  // Rate cycles between 0.85x, 1.0x, 1.15x
  const handleCycleRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChangePlaybackRate) return;
    if (playbackRate === 1.0) onChangePlaybackRate(1.15);
    else if (playbackRate === 1.15) onChangePlaybackRate(0.85);
    else onChangePlaybackRate(1.0);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-full rounded-2xl bg-gradient-to-b from-[#12141c]/98 via-[#0b0c13]/98 to-[#07080b]/98 border border-[#c9a875]/40 shadow-[0_12px_45px_rgba(0,0,0,0.9),0_0_20px_rgba(201,168,117,0.15)] backdrop-blur-2xl transition-all duration-300 ${
        isCompact ? 'p-3 text-xs' : 'p-4 sm:p-5'
      } ${className}`}
    >
      {/* ── Top Header Bar: Reciter Identity Badge & Mode Info ── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dfbd87] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPlaying ? 'bg-[#c9a875]' : 'bg-neutral-600'
              }`}
            />
          </span>

          <span className="text-[11px] font-mono-code text-[#f8e7c9] truncate font-medium flex items-center gap-1.5">
            {accentFlag && <span>{accentFlag}</span>}
            <span className="text-neutral-400">
              {mode === 'authentic-audio' ? '🎙️ Authentic Recital:' : '✦ AI Recital:'}
            </span>
            <strong className="text-[#dfbd87] font-semibold truncate">
              {reciterBadge || (mode === 'authentic-audio' ? "Poet's Original Audio" : 'Native Cadence')}
            </strong>
          </span>
        </div>

        {/* Verse Counter / Mode Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {mode === 'speech-synthesis' && totalLines > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-[#c9a875]/15 text-[#dfbd87] border border-[#c9a875]/30">
              Verse {currentLineIndex + 1}/{totalLines}
            </span>
          )}

          {onChangePlaybackRate && (
            <button
              type="button"
              onClick={handleCycleRate}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono-code bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Toggle Recitation Cadence Speed"
            >
              {playbackRate}x
            </button>
          )}
        </div>
      </div>

      {/* ── Active Spoken Snippet Preview (if available) ── */}
      {currentLineText && mode === 'speech-synthesis' && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-center">
          <p className="text-xs sm:text-sm font-serif italic text-[#f8e7c9] truncate drop-shadow-sm">
            "{currentLineText}"
          </p>
        </div>
      )}

      {/* ── Spotify Interactive Scrubber Track ── */}
      <div className="space-y-1.5 select-none">
        <div
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative h-6 flex items-center cursor-pointer group/track"
        >
          {/* Background Track Groove */}
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-neutral-800/90 overflow-hidden relative border border-white/5 shadow-inner">
            {/* Hover preview fill */}
            {hoverPosition !== null && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full pointer-events-none transition-all duration-75"
                style={{ width: `${hoverPosition}%` }}
              />
            )}

            {/* Active Gold Progress Fill */}
            <div
              className="h-full bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#f5ebd7] rounded-full relative shadow-[0_0_12px_rgba(201,168,117,0.7)] transition-all duration-100 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Draggable Scrubber Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#c9a875] shadow-[0_0_10px_rgba(201,168,117,0.9)] transition-transform duration-100 ease-out pointer-events-none ${
              isDragging
                ? 'scale-125 ring-4 ring-[#c9a875]/40'
                : 'scale-90 group-hover/track:scale-125'
            }`}
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && hoverPosition !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 border border-[#c9a875]/60 text-[10px] font-mono-code text-[#f8e7c9] shadow-lg pointer-events-none z-20"
              style={{ left: `${hoverPosition}%` }}
            >
              {mode === 'authentic-audio'
                ? formatRecitalTime(hoverTime)
                : `Verse ${Math.min(
                    totalLines,
                    Math.max(1, Math.round((hoverPosition / 100) * totalLines))
                  )}`}
            </div>
          )}
        </div>

        {/* Timestamp Range Display (e.g. 0:14 / 1:32) */}
        <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400 px-0.5">
          <span>{formatRecitalTime(currentTime)}</span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
            {mode === 'authentic-audio' ? 'Interactive Seek' : 'Verse Scrubber'}
          </span>
          <span>{formatRecitalTime(effectiveDuration)}</span>
        </div>
      </div>

      {/* ── Spotify Transport Bar (Controls Row) ── */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
        {/* Left: Replay / Restart from 0:00 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRestart();
          }}
          className="p-2 rounded-xl text-neutral-400 hover:text-[#dfbd87] hover:bg-white/5 transition-colors cursor-pointer"
          title="Restart Recital from Beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Center Main Controls: ⏪ -5s / Prev, Play/Pause, ⏩ +5s / Next */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Rewind 5s or Previous Verse */}
          <button
            type="button"
            onClick={handleVersePrev}
            className="p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            title={mode === 'authentic-audio' ? 'Rewind 5 Seconds (⏪ -5s)' : 'Previous Verse'}
          >
            <Rewind className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#dfbd87]" />
            {mode === 'authentic-audio' && <span className="text-[10px] font-mono-code font-bold">-5s</span>}
          </button>

          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold flex items-center justify-center shadow-[0_0_25px_rgba(201,168,117,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause Recital' : 'Resume Recital'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black translate-x-0.5" />
            )}
          </button>

          {/* Fast Forward 5s or Next Verse */}
          <button
            type="button"
            onClick={handleVerseNext}
            className="p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            title={mode === 'authentic-audio' ? 'Fast-Forward 5 Seconds (⏩ +5s)' : 'Next Verse'}
          >
            {mode === 'authentic-audio' && <span className="text-[10px] font-mono-code font-bold">+5s</span>}
            <FastForward className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#dfbd87]" />
          </button>
        </div>

        {/* Right: Sound Wave Indicator */}
        <div className="flex items-center gap-1 text-neutral-400">
          <Volume2 className="w-4 h-4 text-[#c9a875]" />
          <span className="hidden sm:inline text-[10px] font-mono-code text-neutral-500">
            {mode === 'authentic-audio' ? 'Audio' : 'Voice'}
          </span>
        </div>
      </div>
    </div>
  );
};
