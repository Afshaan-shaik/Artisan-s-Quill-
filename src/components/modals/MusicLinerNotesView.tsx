import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc,
  Image as ImageIcon,
  Radio,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Award,
  Palette,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Artwork, Comment } from '../../types';
import { Avatar } from '../Avatar';
import { resolveAudioUrl } from '../../utils/audioResolver';
import { registerCommunityTrack } from '../../services/musicEngine';
import { UniversalFullscreenViewer } from './UniversalFullscreenViewer';

interface MusicLinerNotesViewProps {
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

export const MusicLinerNotesView: React.FC<MusicLinerNotesViewProps> = ({
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(artwork.musicData?.durationSeconds || 215);
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState<'vinyl' | 'cover'>('vinyl');
  const [isSentToAmbience, setIsSentToAmbience] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCoverZoomed, setIsCoverZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'contemplations'>('story');

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'z' || e.key === 'Z' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsCoverZoomed((prev) => !prev);
      } else if (e.key === 'Escape' && isCoverZoomed) {
        e.preventDefault();
        setIsCoverZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCoverZoomed]);

  const audioSrc = resolveAudioUrl(artwork);

  const fallbackCover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';
  const coverArt =
    (artwork.musicData?.coverArtUrl && !artwork.musicData.coverArtUrl.endsWith('.mp4') ? artwork.musicData.coverArtUrl : '') ||
    (artwork.thumbnailUrl && !artwork.thumbnailUrl.endsWith('.mp4') ? artwork.thumbnailUrl : '') ||
    (artwork.artist?.avatar && !artwork.artist.avatar.endsWith('.mp4') ? artwork.artist.avatar : '') ||
    fallbackCover;

  const [coverSrc, setCoverSrc] = useState(coverArt);

  useEffect(() => {
    setCoverSrc(coverArt);
  }, [coverArt, artwork.id]);

  useEffect(() => {
    if (artwork.musicData?.durationSeconds) {
      setDuration(artwork.musicData.durationSeconds);
    }
  }, [artwork.id, artwork.musicData?.durationSeconds]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAmbienceToggle = () => {
    registerCommunityTrack({
      id: artwork.id,
      title: artwork.title,
      artistName: typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || 'Sanctuary Artist',
      audioUrl: audioSrc,
      coverUrl: coverSrc,
      album: artwork.musicData?.album || artwork.dimensions || 'Atelier Master Sessions',
      genre: artwork.musicData?.genre || 'Original Composition',
      durationSeconds: duration
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sanctuary:play-track', {
          detail: {
            track: {
              id: artwork.id,
              title: artwork.title,
              artist: typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || 'Sanctuary Artist',
              streamUrl: audioSrc,
              artworkUrl: coverSrc,
              durationSeconds: duration,
              genre: artwork.musicData?.genre || 'Original Composition',
              isOriginal: true
            }
          }
        })
      );
    }

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#d9b878', '#f6e3b4', '#ffffff']
      });
    } catch {}

    setIsSentToAmbience(true);
    setTimeout(() => setIsSentToAmbience(false), 3000);
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

  const genre = artwork.musicData?.genre || 'Original Music';
  const lyrics = artwork.musicData?.lyrics;
  const composer = artwork.musicData?.composer || artistName;
  const album = artwork.musicData?.album;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* ── Left Column: Listening Side with Spinning Vinyl (approx 58% desktop) ── */}
      <div className="lg:w-[58%] h-[54vh] sm:h-[62vh] lg:h-full relative flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-black/40 shrink-0 group">
        
        {/* Corner Expand Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCoverZoomed(true);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer z-20"
          title="Expand Full Screen (Z)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Warm Amber/Gold Radial Glow behind vinyl */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] sm:w-[460px] h-[300px] sm:h-[460px] rounded-full bg-radial from-[#d9b878]/25 via-[#d9b878]/05 to-transparent blur-3xl opacity-75 animate-pulse" />
        </div>

        {/* Vinyl / Cover Mode Viewport */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
          {viewMode === 'vinyl' ? (
            /* Luxury Vinyl Record with Album Art Center Label */
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88 flex items-center justify-center">
              {/* Outer Vinyl Disc with grooves */}
              <div
                className={`w-full h-full rounded-full shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(217,184,120,0.2)] border-4 border-[#121318] p-1 flex items-center justify-center transition-transform duration-700 ${
                  isPlaying ? 'vinyl-spin-active' : 'vinyl-spin-paused'
                }`}
                style={{
                  background: 'radial-gradient(circle at center, #1b1c24 0%, #0a0b0e 45%, #181920 50%, #08090b 70%, #15161d 90%, #050507 100%)'
                }}
              >
                {/* Vinyl Grooves concentric rings */}
                <div className="w-[88%] h-[88%] rounded-full border border-white/[0.04] p-1 flex items-center justify-center">
                  <div className="w-[84%] h-[84%] rounded-full border border-white/[0.06] p-1 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] rounded-full border border-white/[0.04] p-1 flex items-center justify-center">
                      
                      {/* Center Spindle Label: Album Art */}
                      <div
                        onClick={() => setIsCoverZoomed(true)}
                        className="w-28 h-28 sm:w-34 sm:h-34 rounded-full overflow-hidden border-2 border-[#d9b878]/60 shadow-lg relative flex items-center justify-center bg-black cursor-pointer hover:scale-105 transition-transform"
                        title="Click to view full cover art (Z)"
                      >
                        <img
                          src={coverSrc}
                          alt={artwork.title}
                          onError={() => setCoverSrc(fallbackCover)}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        {/* Spindle Center Hole */}
                        <div className="absolute w-5 h-5 rounded-full bg-[#0a0b0e] border border-[#d9b878]/70 shadow-inner flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Flat Full-Res Album Cover Art Card */
            <div
              onClick={() => setIsCoverZoomed(true)}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88 rounded-[18px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(217,184,120,0.2)] border border-white/[0.1] cursor-zoom-in group/cover"
              title="Click to view full screen (Z)"
            >
              <img
                src={coverSrc}
                alt={artwork.title}
                onError={() => setCoverSrc(fallbackCover)}
                className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
                draggable={false}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCoverZoomed(true);
                }}
                className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer"
                title="Expand Full Screen (Z)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mode Switcher: Vinyl vs Album Cover Pills */}
          <div className="mt-5 flex items-center gap-1.5 p-1 rounded-full bg-[#0d0f14]/85 border border-white/[0.08] shadow-lg">
            <button
              onClick={() => setViewMode('vinyl')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-code uppercase font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === 'vinyl'
                  ? 'bg-[#d9b878] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Vinyl</span>
            </button>
            <button
              onClick={() => setViewMode('cover')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-code uppercase font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === 'cover'
                  ? 'bg-[#d9b878] text-black font-bold shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Cover</span>
            </button>
          </div>

          {/* Waveform Scrubber & Controls */}
          <div className="w-full mt-6 space-y-3">
            {/* Scrubber Bar */}
            <div className="flex items-center gap-3">
              <span className="font-mono-code text-[11px] text-neutral-400 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleScrubberChange}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                className="flex-1 h-1 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#d9b878]"
              />
              <span className="font-mono-code text-[11px] text-neutral-400 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Play / Pause & Ambience Row */}
            <div className="flex items-center justify-between pt-1 px-2">
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-[#d9b878]" />}
              </button>

              {/* Large Gold Circular Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#d9b878] to-[#f4e4b5] text-black flex items-center justify-center shadow-[0_0_25px_rgba(217,184,120,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                title={isPlaying ? 'Pause Studio Audio' : 'Play Studio Audio'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>

              {/* Ambience Broadcast Toggle Pill */}
              <button
                onClick={handleAmbienceToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono-code uppercase font-semibold transition-all duration-200 cursor-pointer shadow-md ${
                  isSentToAmbience
                    ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-white/[0.04] hover:bg-[#d9b878]/20 text-[#d9b878] border border-[#d9b878]/40 hover:border-[#d9b878]'
                }`}
                title="Broadcast this master track to the global sanctuary player"
              >
                <Radio className={`w-3.5 h-3.5 ${isSentToAmbience ? 'animate-spin' : ''}`} />
                <span>{isSentToAmbience ? 'Broadcasting' : 'Ambience'}</span>
              </button>
            </div>
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
            title="Previous Track"
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
            title="Next Track"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Right Column: Story & Liner Notes (approx 42% desktop) ── */}
      <div
        ref={rightColRef}
        id="liner-notes-right-column"
        className="lg:w-[42%] h-full overflow-y-auto p-6 sm:p-8 lg:p-10 pb-48 sm:pb-56 lg:pb-64 bg-[#0d0f14] border-t lg:border-t-0 lg:border-l border-white/[0.08] flex flex-col space-y-5 sm:space-y-6 custom-scrollbar scroll-smooth"
      >
        
        {/* Genre & Year Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-[#d9b878]/15 border border-[#d9b878]/35 text-[#d9b878] font-semibold">
            {genre}
          </span>
          {artwork.year && (
            <span className="font-mono-code text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300">
              {artwork.year}
            </span>
          )}
          {album && (
            <span className="font-mono-code text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400">
              {album}
            </span>
          )}
        </div>

        {/* Large Serif Title (rendered once) */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-light text-[#f4efe6] leading-[1.08] tracking-[-0.01em] select-text">
          {artwork.title}
        </h1>

        {/* Creator Row */}
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

        {/* Action Row */}
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
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono-code font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-[#d9b878] text-black shadow-md shadow-[#d9b878]/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Liner Notes &amp; Story
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

        {/* ── TAB 1: LINER NOTES & STORY ── */}
        {activeTab === 'story' ? (
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

            {/* Liner Notes Section: Lyrics, Story & Credits */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-[11px] uppercase tracking-[0.25em] text-[#d9b878] font-semibold">
                  ✦ Liner Notes &amp; Acoustic Story
                </span>
              </div>

              {/* Story / Description */}
              {artwork.description && (
                <p className="text-sm font-light text-[#ded7c8]/90 leading-relaxed select-text">
                  {artwork.description}
                </p>
              )}

              {/* Curator Note */}
              {artwork.curatorNote && (
                <div className="p-4 rounded-xl bg-white/[0.02] border-l-2 border-[#d9b878] text-xs font-serif italic text-neutral-300">
                  "{artwork.curatorNote}"
                </div>
              )}

              {/* Credits */}
              <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono-code text-[#8d897f]">
                <span>Composer: <strong className="text-neutral-300 font-normal">{composer}</strong></span>
                {artwork.musicData?.duration && (
                  <span>Duration: <strong className="text-neutral-300 font-normal">{artwork.musicData.duration}</strong></span>
                )}
              </div>

              {/* Lyrics (if available) */}
              {lyrics && lyrics.trim() !== '' && (
                <div className="pt-3 space-y-2">
                  <span className="font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#8d897f] block">
                    Lyrics &amp; Verses
                  </span>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] max-h-40 overflow-y-auto">
                    <p className="font-serif italic text-xs leading-relaxed text-neutral-300 whitespace-pre-line select-text">
                      {lyrics}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* ── EXPANDED CONTEMPLATIONS & ARTISAN INBOX (Active Tab or Bottom of Details) ── */}
        <div className={`space-y-4 pt-4 ${activeTab === 'story' ? 'border-t border-white/[0.08]' : ''}`}>
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
                  placeholder="Leave an artisan contemplation, musical reflection, or acoustic critique..."
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
                Be the first to grace this musical master with your reflection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Universal Full-Viewport Fullscreen Theater (React Portal to document.body) ── */}
      <UniversalFullscreenViewer
        isOpen={isCoverZoomed}
        artwork={artwork}
        mediaType="music"
        mediaUrl={coverSrc}
        posterUrl={coverSrc}
        onClose={() => setIsCoverZoomed(false)}
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />
    </div>
  );
};

