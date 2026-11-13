import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Award,
  Palette,
  Maximize2,
  Minimize2,
  MessageSquare
} from 'lucide-react';
import { Artwork, Comment } from '../../types';
import { Avatar } from '../Avatar';
import { UniversalFullscreenViewer } from './UniversalFullscreenViewer';

interface MotionLoopStageViewProps {
  artwork: Artwork;
  isLiked: boolean;
  likesCount: number;
  isSaved: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onShare: () => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onOpenGalleryWall?: (artwork: Artwork) => void;
  onOpenCertificate?: (artwork: Artwork) => void;
  onOpenColorStudio?: (artwork: Artwork) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  comments?: Comment[];
  newCommentText?: string;
  onCommentChange?: (text: string) => void;
  onCommentSubmit?: (e: React.FormEvent) => void;
}

export const MotionLoopStageView: React.FC<MotionLoopStageViewProps> = ({
  artwork,
  isLiked,
  likesCount,
  isSaved,
  onToggleLike,
  onToggleSave,
  onShare,
  onSelectArtist,
  onOpenGalleryWall,
  onOpenCertificate,
  onOpenColorStudio,
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  comments = [],
  newCommentText = '',
  onCommentChange,
  onCommentSubmit
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientVideoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'contemplations'>('details');

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToContemplations = () => {
    setActiveTab('contemplations');
    setTimeout(() => {
      commentInputRef.current?.focus({ preventScroll: true });
      if (rightColRef.current) {
        rightColRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  // Sync ambient video and pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (ambientVideoRef.current) ambientVideoRef.current.pause();
        if (videoRef.current) videoRef.current.pause();
      } else if (isPlaying) {
        if (videoRef.current) videoRef.current.play().catch(() => {});
        if (ambientVideoRef.current) ambientVideoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
      if (ambientVideoRef.current && Math.abs(ambientVideoRef.current.currentTime - videoRef.current.currentTime) > 0.4) {
        ambientVideoRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
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
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    if (!videoRef.current) return;
    videoRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    if (ambientVideoRef.current) {
      ambientVideoRef.current.currentTime = val;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const resolvedAvatar = typeof artwork.artist === 'object' ? artwork.artist.avatar : '';
  const artistName = typeof artwork.artist === 'object' ? artwork.artist.name : (artwork.artist || 'Sanctuary Artist');
  const artistHandle = typeof artwork.artist === 'object' ? artwork.artist.handle : '@artisan';
  const isVerified = typeof artwork.artist === 'object' ? artwork.artist.verified : false;

  const durationLabel = duration > 0 ? formatTime(duration) : (artwork.videoData?.duration || '0:15');

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col lg:flex-row select-none">
      {/* ── Ambient Blurred Glow Stage (48px blur, 40-45% dimmed) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <video
          ref={ambientVideoRef}
          src={artwork.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-125 filter blur-[48px] opacity-45 brightness-90"
        />
        <div className="absolute inset-0 bg-[#07080b]/50" />
      </div>

      {/* ── Center-Left: Video Stage ── */}
      <div
        ref={stageContainerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative z-10 lg:w-[62%] h-[60vh] sm:h-[70vh] lg:h-full flex items-center justify-center p-3 sm:p-6 lg:p-8 shrink-0 group"
      >
        <div className="relative max-h-full max-w-full flex items-center justify-center rounded-[18px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] border border-white/[0.1] bg-black">
          <video
            ref={videoRef}
            src={artwork.mediaUrl}
            autoPlay
            muted={isMuted}
            loop={isLooping}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            className="w-full h-full max-h-[58vh] sm:max-h-[68vh] lg:max-h-[88vh] max-w-full object-contain rounded-[18px] cursor-pointer"
          />

          {/* Corner Expand Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute top-3 right-3 p-2.5 rounded-xl bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer z-20"
            title="Expand Full Screen (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Floating Glass Control Bar over video */}
          <div
            className={`absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 px-3 sm:px-4 py-2.5 rounded-2xl bg-[#0d0f14]/85 backdrop-blur-xl border border-white/[0.12] shadow-2xl flex items-center gap-3 transition-opacity duration-300 ${
              isHovered || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
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
                className="w-full h-1 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#d9b878]"
              />
            </div>

            {/* Time */}
            <span className="font-mono-code text-[11px] text-neutral-300 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isLooping ? 'text-[#d9b878] bg-[#d9b878]/15' : 'text-neutral-400 hover:text-white'
              }`}
              title={isLooping ? 'Looping enabled' : 'Looping disabled'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-[#d9b878]" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full hover:bg-white/10 text-white hover:text-[#d9b878] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Full Screen (F)' : 'Full Screen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hover Prev/Next Arrows */}
        {hasPrev && onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0d0f14]/80 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-250 cursor-pointer hover:scale-105 z-20"
            title="Previous Artwork"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0d0f14]/80 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-250 cursor-pointer hover:scale-105 z-20"
            title="Next Artwork"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Right Column: Subtle Glass Details Panel (approx 38% desktop) ── */}
      <div
        ref={rightColRef}
        id="stage-right-column"
        className="relative z-10 lg:w-[38%] h-full overflow-y-auto p-6 sm:p-8 lg:p-10 pb-48 sm:pb-56 lg:pb-64 bg-[#0d0f14]/85 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/[0.08] flex flex-col space-y-5 sm:space-y-6 shadow-2xl custom-scrollbar scroll-smooth"
      >
        
        {/* 1. Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase tracking-[0.25em] text-[#d9b878] font-semibold">
            LOOP {artwork.year ? `· ${artwork.year}` : ''} {durationLabel ? `· ${durationLabel}` : ''}
          </span>
        </div>

        {/* 2. Large Serif Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-light text-[#f4efe6] leading-[1.08] tracking-[-0.01em] select-text">
          {artwork.title}
        </h1>

        {/* 3. Short Story / Caption (hidden if empty) */}
        {artwork.description && artwork.description.trim() !== '' && (
          <p className="text-sm sm:text-base font-light text-[#ded7c8]/90 leading-relaxed select-text">
            {artwork.description}
          </p>
        )}

        {/* 4. Creator Row */}
        <div
          onClick={(e) => typeof artwork.artist === 'object' && onSelectArtist(artwork.artist.id, e)}
          className="flex items-center gap-3.5 pt-1 cursor-pointer group/creator"
        >
          <Avatar
            src={resolvedAvatar}
            name={artistName}
            className="w-11 h-11 rounded-full border border-[#d9b878]/50 shadow-[0_0_12px_rgba(217,184,120,0.25)] group-hover/creator:scale-105 transition-transform duration-250"
            textSize="text-base"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-light tracking-wide text-white group-hover/creator:text-[#d9b878] transition-colors">
                {artistName}
              </h3>
              {isVerified && <ShieldCheck className="w-4 h-4 text-[#d9b878]" />}
            </div>
            <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#d9b878]/80 block">
              {artistHandle}
            </span>
          </div>
        </div>

        {/* 5. Action Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
          {/* Like */}
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer shadow-md ${
              isLiked
                ? 'bg-[#d9b878] text-black font-bold shadow-[0_0_20px_rgba(217,184,120,0.4)]'
                : 'bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
            {likesCount > 0 && <span className="opacity-90 ml-0.5">({likesCount})</span>}
          </button>

          {/* Save */}
          <button
            onClick={onToggleSave}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer shadow-md ${
              isSaved
                ? 'bg-[#d9b878] text-black font-bold shadow-[0_0_20px_rgba(217,184,120,0.4)]'
                : 'bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share */}
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08] transition-all duration-250 cursor-pointer shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* Quick Contemplate Button */}
          <button
            onClick={scrollToContemplations}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all duration-250 cursor-pointer shadow-md ${
              activeTab === 'contemplations'
                ? 'bg-[#d9b878] text-black border-[#d9b878] font-bold shadow-[0_0_15px_rgba(217,184,120,0.35)]'
                : 'bg-white/[0.04] text-[#ded7c8] hover:bg-[#d9b878]/15 hover:text-[#d9b878] border-white/[0.08] hover:border-[#d9b878]/40'
            }`}
            title="Jump to Contemplations"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contemplate {comments.length > 0 ? `(${comments.length})` : ''}</span>
          </button>
        </div>

        {/* Dual Tab Switcher: Overview vs Contemplations */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.035] border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono-code font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#d9b878] text-black shadow-md shadow-[#d9b878]/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Overview &amp; Loop Specs
          </button>
          <button
            onClick={() => {
              setActiveTab('contemplations');
              setTimeout(() => commentInputRef.current?.focus(), 150);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono-code font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'contemplations'
                ? 'bg-[#d9b878] text-black shadow-md shadow-[#d9b878]/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contemplations</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'contemplations' ? 'bg-black/25 text-black font-bold' : 'bg-white/10 text-neutral-300'
            }`}>
              {comments.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: DETAILS & SPECS ── */}
        {activeTab === 'details' ? (
          <>
            {/* Experience Row */}
            <div className="flex items-center gap-2 pt-2 pb-1 border-y border-white/[0.06]">
              {onOpenGalleryWall && (
                <button
                  onClick={() => onOpenGalleryWall(artwork)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-[#d9b878]/15 border border-white/[0.08] hover:border-[#d9b878]/40 text-[#ded7c8] hover:text-[#d9b878] text-xs font-medium tracking-wide transition-all duration-250 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#d9b878]" />
                  <span>Wall Salon</span>
                </button>
              )}

              {onOpenCertificate && (
                <button
                  onClick={() => onOpenCertificate(artwork)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-[#d9b878]/15 border border-white/[0.08] hover:border-[#d9b878]/40 text-[#ded7c8] hover:text-[#d9b878] text-xs font-medium tracking-wide transition-all duration-250 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-[#d9b878]" />
                  <span>Certificate</span>
                </button>
              )}

              {onOpenColorStudio && (
                <button
                  onClick={() => onOpenColorStudio(artwork)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-[#d9b878]/15 border border-white/[0.08] hover:border-[#d9b878]/40 text-[#ded7c8] hover:text-[#d9b878] text-xs font-medium tracking-wide transition-all duration-250 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-[#d9b878]" />
                  <span>Color Studio</span>
                </button>
              )}
            </div>

            {/* Compact Motion Specs */}
            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono-code text-[#8d897f]">
              <span>Format: <strong className="text-neutral-300 font-normal">HD Motion Loop</strong></span>
              {artwork.videoData?.resolution && (
                <span>Resolution: <strong className="text-neutral-300 font-normal">{artwork.videoData.resolution}</strong></span>
              )}
              {artwork.year && (
                <span>Year: <strong className="text-neutral-300 font-normal">{artwork.year}</strong></span>
              )}
            </div>
          </>
        ) : null}

        {/* ── EXPANDED CONTEMPLATIONS & ARTISAN INBOX (Active Tab or Bottom of Details) ── */}
        <div className={`space-y-4 pt-4 ${activeTab === 'details' ? 'border-t border-white/[0.08]' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-[11px] uppercase tracking-[0.22em] text-[#d9b878] font-semibold flex items-center gap-2">
              <span>✦ Contemplations &amp; Dialogue</span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 text-[10px]">
                {comments.length}
              </span>
            </span>
          </div>

          {onCommentSubmit && (
            <form onSubmit={onCommentSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  ref={commentInputRef}
                  value={newCommentText}
                  onChange={(e) => onCommentChange && onCommentChange(e.target.value)}
                  placeholder="Leave an artisan contemplation, fluid reflection, or motion critique..."
                  rows={4}
                  className="w-full min-h-[130px] px-4 py-3.5 rounded-2xl bg-white/[0.035] hover:bg-white/[0.05] border border-white/[0.12] text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#d9b878] focus:ring-1 focus:ring-[#d9b878]/50 focus:bg-white/[0.06] transition-all resize-y leading-relaxed shadow-inner"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono-code text-[#8d897f]">
                  Press Submit to publish contemplation
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText?.trim()}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-mono-code font-bold uppercase tracking-wider bg-gradient-to-r from-[#d9b878] to-[#e4cb93] hover:from-[#e4cb93] hover:to-[#eedab0] text-black shadow-lg shadow-[#d9b878]/25 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:scale-[1.02] active:scale-95"
                >
                  Post Contemplation
                </button>
              </div>
            </form>
          )}

          {comments.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#ded7c8] font-medium flex items-center gap-1.5">
                      {c.user.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono-code">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed select-text">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center space-y-2">
              <p className="text-xs font-mono-code text-neutral-400">
                No contemplations yet.
              </p>
              <p className="text-[11px] font-serif italic text-neutral-500">
                Be the first to grace this motion loop with your reflection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Universal Full-Viewport Fullscreen Theater (React Portal to document.body) ── */}
      <UniversalFullscreenViewer
        isOpen={isFullscreen}
        artwork={artwork}
        mediaType="video"
        mediaUrl={artwork.mediaUrl}
        posterUrl={artwork.thumbnailUrl}
        initialTime={currentTime}
        initialPlaying={isPlaying}
        initialMuted={isMuted}
        onClose={(finalTime) => {
          setIsFullscreen(false);
          if (typeof finalTime === 'number' && videoRef.current) {
            videoRef.current.currentTime = finalTime;
            setCurrentTime(finalTime);
          }
        }}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
};

