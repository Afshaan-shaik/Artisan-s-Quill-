import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Disc3,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  Search,
  Plus,
  Compass,
  List,
  LayoutGrid,
  Music,
  Radio,
  Clock,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Image as ImageIcon,
  ShieldCheck,
  Disc
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Artwork, ArtCategory, UserProfile } from '../types';
import { MusicArtworkCard } from './MusicArtworkCard';
import { registerCommunityTrack } from '../services/musicEngine';
import { resolveAudioUrl, getAudioFallbackUrl } from '../utils/audioResolver';

interface OriginalMusicSectionProps {
  artworks: Artwork[];
  currentUser: UserProfile;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist?: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  onOpenUpload: (category?: ArtCategory) => void;
  onSwitchToCosmos: () => void;
}

export const OriginalMusicSection: React.FC<OriginalMusicSectionProps> = ({
  artworks,
  currentUser,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onAddToMoodBoard,
  onOpenUpload,
  onSwitchToCosmos
}) => {
  // Filter only music category or tracks with musicData
  const musicArtworks = useMemo(() => {
    return artworks.filter((a) => a.category === 'music' || Boolean(a.musicData));
  }, [artworks]);

  // Audio Player State
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(215);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'tracklist'>('grid');
  const [heroViewMode, setHeroViewMode] = useState<'vinyl' | 'cover'>('vinyl');
  const [isHeroSentToAmbience, setIsHeroSentToAmbience] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active track
  const currentTrack = musicArtworks[activeTrackIndex] || musicArtworks[0];

  // Resolve audio & cover URLs
  const audioUrl = resolveAudioUrl(currentTrack);
  const coverUrl =
    currentTrack?.thumbnailUrl ||
    currentTrack?.musicData?.coverArtUrl ||
    currentTrack?.mediaUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync audio source when track changes
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    if (currentTrack) {
      registerCommunityTrack({
        id: currentTrack.id,
        title: currentTrack.title,
        artistName: currentTrack.artist?.name || 'Sanctuary Musician',
        audioUrl: audioUrl,
        coverUrl: coverUrl,
        album: currentTrack.musicData?.album || 'Atelier Masterpiece',
        genre: currentTrack.musicData?.genre || 'Original Master',
        durationSeconds: currentTrack.musicData?.durationSeconds || 215
      });
    }
  }, [currentTrack?.id, audioUrl]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else if (currentTrack?.musicData?.durationSeconds) {
        setDuration(currentTrack.musicData.durationSeconds);
      }
    };

    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack();
      }
    };

    const handleError = () => {
      const fallback = getAudioFallbackUrl(audio.src);
      if (fallback && audio.src !== fallback) {
        console.log('[OriginalMusicSection] Falling back to:', fallback);
        audio.src = fallback;
        audio.load();
        if (isPlaying) {
          audio.play().catch(() => setIsPlaying(false));
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isLooping, activeTrackIndex, musicArtworks.length, isPlaying]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
        const fallback = getAudioFallbackUrl(audioRef.current?.src);
        if (fallback && audioRef.current && audioRef.current.src !== fallback) {
          audioRef.current.src = fallback;
          audioRef.current.load();
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
        }
      });
    }
  };

  const handleNextTrack = () => {
    if (musicArtworks.length === 0) return;
    const nextIdx = (activeTrackIndex + 1) % musicArtworks.length;
    setActiveTrackIndex(nextIdx);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (musicArtworks.length === 0) return;
    const prevIdx = (activeTrackIndex - 1 + musicArtworks.length) % musicArtworks.length;
    setActiveTrackIndex(prevIdx);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.volume = nextMute ? 0 : volume;
  };

  // Select a specific track to play
  const handleSelectTrack = (idx: number) => {
    setActiveTrackIndex(idx);
    setIsPlaying(true);
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    let list = [...musicArtworks];

    if (selectedGenre !== 'all') {
      list = list.filter((t) => {
        const g = (t.musicData?.genre || t.medium || '').toLowerCase();
        return g.includes(selectedGenre.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const titleMatch = t.title?.toLowerCase().includes(q);
        const artistMatch = t.artist?.name?.toLowerCase().includes(q) || t.artist?.handle?.toLowerCase().includes(q);
        const albumMatch = t.musicData?.album?.toLowerCase().includes(q);
        const genreMatch = t.musicData?.genre?.toLowerCase().includes(q);
        const lyricsMatch = t.musicData?.lyrics?.toLowerCase().includes(q);
        return titleMatch || artistMatch || albumMatch || genreMatch || lyricsMatch;
      });
    }

    return list;
  }, [musicArtworks, selectedGenre, searchQuery]);

  // Unique genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    musicArtworks.forEach((art) => {
      const g = art.musicData?.genre;
      if (g) {
        if (g.includes('Neo-Classical') || g.includes('Piano')) set.add('Piano / Neo-Classical');
        else if (g.includes('Orchestral') || g.includes('Soundtrack')) set.add('Cinematic Orchestral');
        else if (g.includes('Synthwave') || g.includes('Retro')) set.add('Synthwave');
        else if (g.includes('Indie') || g.includes('Alternative')) set.add('Indie Alternative');
        else if (g.includes('Acoustic') || g.includes('Soul')) set.add('Acoustic Soul');
      }
    });
    return Array.from(set);
  }, [musicArtworks]);

  return (
    <div className="w-full space-y-10 py-2 sm:py-6">
      {/* Hidden Master Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO AUDIOPHILE SOUNDSTAGE & LINER NOTES CONSOLE
         ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#0d0f14] border border-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-5 sm:p-8 lg:p-10">
        {/* Subtle Warm Amber Ambient Radial Lighting */}
        <div
          className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-45 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217, 184, 120, 0.28) 0%, rgba(180, 110, 30, 0.12) 50%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left: Spinning Vinyl Turntable & Waveform Console */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full lg:w-auto">
            {heroViewMode === 'vinyl' ? (
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center group">
                {/* Turntable Outer Deck Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12131c] via-[#1a1b26] to-[#0f1017] border-2 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.9)]" />

                {/* Spinning Vinyl Record with continuous spin and graceful pause */}
                <div
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#0a0a0f] border-4 border-neutral-900 shadow-2xl flex items-center justify-center ${
                    isPlaying ? 'vinyl-spin-active' : 'vinyl-spin-paused'
                  }`}
                  style={{
                    boxShadow: isPlaying ? '0 0 45px rgba(217,184,120,0.35)' : 'none'
                  }}
                >
                  {/* Concentric Grooves Texture */}
                  <div className="w-[88%] h-[88%] rounded-full border border-white/[0.04] p-1 flex items-center justify-center">
                    <div className="w-[84%] h-[84%] rounded-full border border-white/[0.06] p-1 flex items-center justify-center">
                      <div className="w-[80%] h-[80%] rounded-full border border-white/[0.04] p-1 flex items-center justify-center">
                        {/* Center Record Label (Cover Artwork) */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#d9b878]/80 shadow-md flex items-center justify-center bg-black">
                          <img
                            src={coverUrl}
                            alt={currentTrack?.title || 'Track Art'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/curatorial-masterpiece.svg';
                            }}
                          />
                          {/* Center Spindle Hole */}
                          <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-[#040508] border border-white/40 shadow-inner flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Central Play Overlay Button */}
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/65 backdrop-blur-md border border-[#d9b878] text-[#d9b878] hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center shadow-[0_0_25px_rgba(217,184,120,0.4)] transition-all cursor-pointer z-20"
                  title={isPlaying ? 'Pause Track' : 'Play Track'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>
              </div>
            ) : (
              /* Flat High-Res Album Cover Art Card */
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(217,184,120,0.2)] border border-white/10 group">
                <img
                  src={coverUrl}
                  alt={currentTrack?.title || 'Track Art'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/curatorial-masterpiece.svg';
                  }}
                />
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-[#d9b878] text-[#d9b878] hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center shadow-xl transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>
              </div>
            )}

            {/* Mode Switcher: Vinyl vs Album Cover */}
            <div className="mt-4 flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-md">
              <button
                onClick={() => setHeroViewMode('vinyl')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-code uppercase font-semibold transition-all duration-200 cursor-pointer ${
                  heroViewMode === 'vinyl'
                    ? 'bg-[#d9b878] text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>Vinyl</span>
              </button>
              <button
                onClick={() => setHeroViewMode('cover')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono-code uppercase font-semibold transition-all duration-200 cursor-pointer ${
                  heroViewMode === 'cover'
                    ? 'bg-[#d9b878] text-black font-bold shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Cover</span>
              </button>
            </div>

            {/* Waveform Scrubber & Timers */}
            <div className="w-full max-w-xs mt-4 space-y-2">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  if (audioRef.current && duration > 0) {
                    audioRef.current.currentTime = ratio * duration;
                    setCurrentTime(ratio * duration);
                  }
                }}
                className="flex items-center justify-between gap-1 h-8 cursor-pointer group/wave px-1 py-1 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                {[0.3, 0.6, 0.9, 0.4, 0.8, 1.0, 0.7, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.9, 0.7, 1.0, 0.6, 0.8, 0.5, 0.9, 0.3, 0.7, 1.0, 0.6, 0.4, 0.8, 0.9, 0.5, 0.7, 0.3, 0.6, 0.4].map((h, i) => {
                  const barProgress = (i / 32) * (duration || 100);
                  const isPassed = currentTime >= barProgress;
                  return (
                    <div
                      key={i}
                      style={{ height: `${Math.max(4, h * 24)}px` }}
                      className={`flex-1 rounded-full transition-all duration-150 ${
                        isPassed
                          ? 'bg-[#d9b878] shadow-[0_0_8px_rgba(217,184,120,0.6)]'
                          : 'bg-white/15 group-hover/wave:bg-white/25'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-code text-neutral-400 px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-center gap-3 mt-3 w-full">
              <button
                onClick={handlePrevTrack}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#d9b878] to-[#e4cb93] text-black shadow-lg shadow-[#d9b878]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Ambience broadcast toggle */}
              <button
                onClick={() => {
                  const b = document.getElementById('toggle-ambience-music-btn');
                  if (b) b.click();
                  setIsHeroSentToAmbience(!isHeroSentToAmbience);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-code uppercase tracking-wider transition-all cursor-pointer ${
                  isHeroSentToAmbience
                    ? 'bg-[#d9b878] text-black font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-[#d9b878] border border-white/10'
                }`}
                title="Broadcast to Ambience Bar"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Ambience</span>
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isLooping ? 'bg-[#d9b878]/20 text-[#d9b878] border border-[#d9b878]/40' : 'text-neutral-400 hover:text-white'
                }`}
                title={isLooping ? 'Looping Active' : 'Loop Track'}
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={toggleMute}
                className="text-neutral-400 hover:text-white p-2 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d9b878]" />}
              </button>
            </div>
          </div>

          {/* Right: Active Track Metadata & Liner Notes Story */}
          <div className="flex-1 w-full space-y-5 max-w-xl">
            {/* Genre & Year Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-code text-[11px] uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#d9b878]/15 border border-[#d9b878]/35 text-[#d9b878] font-semibold flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5" />
                <span>{currentTrack?.musicData?.genre || currentTrack?.medium || 'Acoustic Soul'}</span>
              </span>
              {currentTrack?.year && (
                <span className="font-mono-code text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300">
                  {currentTrack.year}
                </span>
              )}
              <span className="font-mono-code text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-400">
                {currentTrack?.musicData?.album || 'Atelier Masterpiece'}
              </span>
              <span className="ml-auto text-xs font-mono-code text-neutral-400">
                Track {activeTrackIndex + 1} of {musicArtworks.length}
              </span>
            </div>

            {/* Single Large Serif Display Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-[#f4efe6] leading-[1.08] tracking-[-0.01em]">
                {currentTrack?.title || 'Sanctuary Master Session'}
              </h2>
            </div>

            {/* Creator Row */}
            <div
              onClick={(e) => currentTrack?.artist && typeof currentTrack.artist === 'object' && onSelectArtist && onSelectArtist(currentTrack.artist.id, e)}
              className="flex items-center gap-3.5 pt-1 cursor-pointer group/artist"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#d9b878]/50 shadow-[0_0_12px_rgba(217,184,120,0.25)] group-hover/artist:scale-105 transition-transform duration-250 bg-neutral-900 shrink-0">
                <img
                  src={currentTrack?.artist?.avatar || coverUrl}
                  alt={currentTrack?.artist?.name || 'Artist'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-light tracking-wide text-white group-hover/artist:text-[#d9b878] transition-colors">
                    {currentTrack?.artist?.name || 'Sanctuary Musician'}
                  </h3>
                  {currentTrack?.artist?.verified && <ShieldCheck className="w-4 h-4 text-[#d9b878]" />}
                </div>
                <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#d9b878]/80 block">
                  {currentTrack?.artist?.handle || '@artisan'}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={(e) => onToggleLike(currentTrack?.id, e)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer shadow-md ${
                  currentTrack?.isLiked
                    ? 'bg-[#d9b878] text-black font-bold shadow-[0_0_20px_rgba(217,184,120,0.4)]'
                    : 'bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${currentTrack?.isLiked ? 'fill-current' : ''}`} />
                <span>Like</span>
                {(currentTrack?.likesCount || 0) > 0 && <span>({currentTrack?.likesCount})</span>}
              </button>

              <button
                onClick={(e) => onToggleSave(currentTrack?.id, e)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-250 cursor-pointer shadow-md ${
                  currentTrack?.isSaved
                    ? 'bg-[#d9b878] text-black font-bold shadow-[0_0_20px_rgba(217,184,120,0.4)]'
                    : 'bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${currentTrack?.isSaved ? 'fill-current' : ''}`} />
                <span>{currentTrack?.isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {onShareArtwork && (
                <button
                  onClick={() => onShareArtwork(currentTrack)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.04] text-white hover:bg-white/10 border border-white/[0.08] transition-all duration-250 cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              )}

              <button
                onClick={() => onSelectArtwork(currentTrack)}
                className="ml-auto text-xs font-mono-code text-[#d9b878] hover:underline cursor-pointer flex items-center gap-1 py-1"
              >
                <span>Inspect Masterpiece</span>
                <span>→</span>
              </button>
            </div>

            {/* Liner Notes Section */}
            <div className="pt-2 border-t border-white/[0.06] space-y-3">
              <span className="font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#d9b878] font-semibold block">
                ✦ Liner Notes &amp; Acoustic Story
              </span>

              {/* Story Quote / Description */}
              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                <p className="font-serif italic text-xs leading-relaxed text-[#ded7c8]/90">
                  "{currentTrack?.description || `${currentTrack?.artist?.name || 'Sanctuary Musician'} — ${currentTrack?.title}. Emotive acoustic composition mastered for The Artisan's Quill.`}"
                </p>
                <p className="font-mono-code text-[10px] text-[#8d897f] mt-2">
                  Composer: <strong className="text-neutral-300 font-normal">{currentTrack?.artist?.name || 'Sanctuary Artist'}</strong>
                </p>
              </div>

              {/* Lyrics Toggle Button & Drawer */}
              {currentTrack?.musicData?.lyrics && (
                <div className="space-y-2">
                  <button
                    onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-code bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#d9b878]" />
                    <span>{isLyricsExpanded ? 'Hide Lyrics & Verse' : 'View Lyrics & Verse'}</span>
                    {isLyricsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <AnimatePresence>
                    {isLyricsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl bg-black/60 border border-[#d9b878]/30 max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        <p className="font-serif italic text-xs leading-relaxed text-neutral-200 whitespace-pre-line select-text">
                          {currentTrack.musicData.lyrics}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Action Hub & Cosmos Bridge */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-48">
            <button
              onClick={() => onOpenUpload('music')}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold font-mono-code text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Publish Track</span>
            </button>

            <button
              onClick={onSwitchToCosmos}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/15 hover:border-[#c9a875]/50 font-mono-code text-xs uppercase tracking-wider transition-all cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-[#c9a875] group-hover:rotate-45 transition-transform" />
              <span>3D Constellation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH CONTROL BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-white/10">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search original songs, composer, lyrics..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-900/80 border border-white/15 focus:border-[#c9a875] rounded-xl text-xs font-mono-code text-white placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll w-full md:w-auto py-1">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer whitespace-nowrap ${
              selectedGenre === 'all'
                ? 'bg-[#c9a875] text-black font-bold shadow-md'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            All Originals ({musicArtworks.length})
          </button>

          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-[#c9a875] text-black font-bold shadow-md'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* View Switcher (Grid vs Tracklist) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/90 border border-white/15 shrink-0 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#c9a875] text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('tracklist')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'tracklist' ? 'bg-[#c9a875] text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Studio Tracklist Table"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN MUSIC GALLERY DISPLAY (GRID OR TRACKLIST)
         ───────────────────────────────────────────────────────────── */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white/[0.02] border border-white/10 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif-display text-white">No Original Tracks Found</h3>
          <p className="text-xs font-mono-code text-neutral-400">
            No compositions match the current search or genre filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('all');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono-code text-white transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((artwork, idx) => (
            <div key={artwork.id} className="relative group">
              <MusicArtworkCard
                artwork={artwork}
                index={idx}
                onSelectArtwork={onSelectArtwork}
                onToggleLike={onToggleLike}
                onToggleSave={onToggleSave}
                onSelectArtist={onSelectArtist}
                onShareArtwork={onShareArtwork}
                onAddToMoodBoard={onAddToMoodBoard}
              />
              {/* Quick Jump to Turntable Console */}
              <button
                onClick={() => {
                  const masterIdx = musicArtworks.findIndex((m) => m.id === artwork.id);
                  if (masterIdx !== -1) handleSelectTrack(masterIdx);
                }}
                className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/70 hover:bg-[#c9a875] text-neutral-300 hover:text-black border border-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                title="Load into Master Turntable"
              >
                <Disc3 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Studio Tracklist Table View */
        <div className="w-full overflow-hidden rounded-2xl bg-[#080910] border border-white/10 shadow-2xl">
          <table className="w-full text-left text-xs font-mono-code">
            <thead className="bg-white/5 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Title &amp; Artist</th>
                <th className="py-3 px-4 hidden md:table-cell">Album</th>
                <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
                <th className="py-3 px-4 w-20 text-right"><Clock className="w-3.5 h-3.5 inline" /></th>
                <th className="py-3 px-4 w-28 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {filteredTracks.map((artwork, idx) => {
                const isCurrent = currentTrack?.id === artwork.id;
                return (
                  <tr
                    key={artwork.id}
                    onClick={() => {
                      const masterIdx = musicArtworks.findIndex((m) => m.id === artwork.id);
                      if (masterIdx !== -1) handleSelectTrack(masterIdx);
                    }}
                    className={`transition-colors cursor-pointer group ${
                      isCurrent ? 'bg-[#c9a875]/10 text-white font-bold' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      {isCurrent && isPlaying ? (
                        <Disc3 className="w-4 h-4 text-amber-400 animate-spin mx-auto" />
                      ) : (
                        <span className="text-neutral-500 group-hover:hidden">{idx + 1}</span>
                      )}
                      <Play className="w-3.5 h-3.5 text-white hidden group-hover:inline mx-auto" />
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={artwork.thumbnailUrl || artwork.mediaUrl || '/curatorial-masterpiece.svg'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/curatorial-masterpiece.svg';
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-serif-display font-medium text-white truncate group-hover:text-[#dfbd87] transition-colors">
                            {artwork.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {artwork.artist?.name || 'Sanctuary Musician'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-neutral-400">
                      {artwork.musicData?.album || 'Atelier Masterpiece'}
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-amber-300">
                        {artwork.musicData?.genre || 'Original Audio'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-neutral-400">
                      {formatTime(artwork.musicData?.durationSeconds || 210)}
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => onToggleLike(artwork.id, e)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Like Track"
                        >
                          <Heart className={`w-3.5 h-3.5 ${artwork.isLiked ? 'text-rose-400 fill-rose-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => onToggleSave(artwork.id, e)}
                          className="p-1.5 text-neutral-400 hover:text-[#c9a875] transition-colors cursor-pointer"
                          title="Save Track"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'text-[#c9a875] fill-[#c9a875]' : ''}`} />
                        </button>
                        <button
                          onClick={() => onSelectArtwork(artwork)}
                          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="View Details"
                        >
                          →
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
