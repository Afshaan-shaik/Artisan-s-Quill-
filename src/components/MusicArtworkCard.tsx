import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  Music,
  FolderPlus,
  Radio,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Artwork } from '../types';
import { Avatar } from './Avatar';
import { registerCommunityTrack } from '../services/musicEngine';

interface MusicArtworkCardProps {
  artwork: Artwork;
  index: number;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist?: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
}

export const MusicArtworkCard: React.FC<MusicArtworkCardProps> = ({
  artwork,
  index,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onAddToMoodBoard
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(() => {
    return artwork.musicData?.durationSeconds || 210;
  });
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = artwork.musicData?.audioUrl || artwork.mediaUrl;
  const coverUrl =
    artwork.thumbnailUrl ||
    artwork.mediaUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  const genre = artwork.musicData?.genre || artwork.medium || 'Original Composition';
  const album = artwork.musicData?.album || 'Atelier Masterpiece';

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Toggle inline playback
  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause any other playing audio on the page
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });

      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback or external link
        setIsPlaying(false);
      });

      // Register with global music engine & queue
      registerCommunityTrack({
        id: artwork.id,
        title: artwork.title,
        artistName: artwork.artist?.name || 'Sanctuary Musician',
        audioUrl: audioUrl,
        coverUrl: coverUrl,
        album: album,
        genre: genre,
        durationSeconds: duration
      });
    }
  };

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handleLike = (id: string, isLiked: boolean | undefined, e: React.MouseEvent) => {
    if (!isLiked) {
      confetti({
        particleCount: 24,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#c9a875', '#ffffff', '#e53e3e']
      });
    }
    onToggleLike(id, e);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
        delay: Math.min((index % 4) * 0.08, 0.28)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`music-card-${artwork.id}`}
      data-artwork-title={artwork.title}
      onClick={() => onSelectArtwork(artwork)}
      className="relative group overflow-hidden museum-shadowbox rounded-2xl border border-white/10 hover:border-[#c9a875]/70 shadow-2xl cursor-pointer w-full transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(201,168,117,0.22)] hover:z-10 bg-gradient-to-b from-[#0b0d14] via-[#07090e] to-[#040508]"
    >
      {/* Hidden Native Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. VINYL TURNTABLE & ALBUM SLEEVE SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#030407] rounded-t-xl p-3 sm:p-4 flex items-center justify-center border-b border-white/5">
        
        {/* Dynamic Vinyl Groove Disc */}
        <div
          className={`absolute w-[80%] aspect-square rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.9)] border border-white/15 transition-all duration-700 ease-out flex items-center justify-center ${
            isPlaying
              ? 'translate-x-[22%] rotate-[180deg] scale-100 opacity-100'
              : isHovered
              ? 'translate-x-[12%] rotate-[45deg] scale-95 opacity-85'
              : 'translate-x-0 scale-90 opacity-0 pointer-events-none'
          }`}
          style={{
            background:
              'radial-gradient(circle at center, #23201a 0%, #0d0e12 25%, #181920 35%, #08090d 48%, #1f202a 60%, #06070a 75%, #181920 88%, #050608 100%)'
          }}
        >
          {/* Revolving Grooves Texture */}
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              isPlaying ? 'animate-[spin_5s_linear_infinite]' : ''
            }`}
          >
            {/* Center Vinyl Label */}
            <div className="w-[32%] aspect-square rounded-full border border-[#c9a875]/60 bg-gradient-to-tr from-[#997945] via-[#dfbd87] to-[#73582e] p-1 shadow-inner flex flex-col items-center justify-center text-center">
              <div className="w-full h-full rounded-full bg-black/85 flex flex-col items-center justify-center p-1 border border-black">
                <Disc3 className="w-3.5 h-3.5 text-[#dfbd87] mb-0.5" />
                <span className="text-[7px] font-mono-code font-bold text-[#dfbd87] tracking-tighter truncate max-w-[90%]">
                  ATELIER
                </span>
                <span className="text-[6px] font-mono-code text-white/60">33 RPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outer Album Sleeve Frame */}
        <div
          className={`relative z-10 w-[84%] aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/15 group-hover:border-[#c9a875]/50 transition-all duration-500 ${
            isPlaying ? '-translate-x-[10%]' : isHovered ? '-translate-x-[5%]' : 'translate-x-0'
          }`}
        >
          <img
            src={coverUrl}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />

          {/* Album Cover Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 pointer-events-none" />

          {/* Quick Play/Pause Badge Button Overlay */}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <button
              onClick={handleTogglePlay}
              className={`p-3.5 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 ${
                isPlaying
                  ? 'bg-[#c9a875] text-black shadow-[0_0_25px_rgba(201,168,117,0.6)]'
                  : 'bg-black/80 hover:bg-[#c9a875] text-white hover:text-black border border-white/20 hover:border-[#c9a875]'
              }`}
              title={isPlaying ? 'Pause Track' : 'Play Original Song'}
              aria-label={isPlaying ? 'Pause Track' : 'Play Original Song'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Duration Badge Bottom Left */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono-code font-bold text-[#dfbd87] flex items-center gap-1 shadow-md">
            <Clock className="w-2.5 h-2.5 text-[#c9a875]" />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Live Frequency Equalizer Bars (When Playing) */}
          {isPlaying && (
            <div className="absolute bottom-2 right-2 flex items-end gap-0.5 px-1.5 py-1 rounded bg-black/85 border border-[#c9a875]/40 backdrop-blur-md">
              <span className="w-1 bg-[#c9a875] h-3 animate-[pulse_0.6s_ease-in-out_infinite] rounded-t-sm" />
              <span className="w-1 bg-[#dfbd87] h-5 animate-[pulse_0.4s_ease-in-out_infinite] rounded-t-sm" />
              <span className="w-1 bg-[#c9a875] h-2.5 animate-[pulse_0.8s_ease-in-out_infinite] rounded-t-sm" />
              <span className="w-1 bg-[#dfbd87] h-4 animate-[pulse_0.5s_ease-in-out_infinite] rounded-t-sm" />
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. AUDIO SCRUBBER PROGRESS STRIP
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white/5 h-1 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#c9a875] to-[#dfbd87] h-full transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ARTWORK & TRACK PLAQUE DETAILS
         ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Category & Genre Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 text-[9px] uppercase font-mono-code font-bold tracking-wider flex items-center gap-1">
              <Disc3 className="w-2.5 h-2.5" />
              <span>Original Music</span>
            </span>

            {genre && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-neutral-300 border border-white/10 text-[9px] font-mono-code truncate max-w-[120px]">
                {genre}
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono-code text-neutral-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Track Title & Album Byline */}
        <div>
          <h3 className="text-base sm:text-lg font-serif-display font-bold text-white group-hover:text-[#f8ecd5] transition-colors leading-tight truncate">
            {artwork.title}
          </h3>
          <p className="text-xs text-neutral-400 font-mono-code truncate mt-0.5">
            {album}
          </p>
        </div>

        {/* Artist Profile Row */}
        <div
          className="flex items-center gap-2.5 pt-2 border-t border-white/5 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectArtist && artwork.artist?.id) {
              onSelectArtist(artwork.artist.id, e);
            }
          }}
        >
          <Avatar
            src={artwork.artist?.avatar}
            name={artwork.artist?.name || 'Artist'}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-medium text-neutral-200 truncate group-hover:text-white flex items-center gap-1">
              <span>{artwork.artist?.name}</span>
              {artwork.artist?.verified && (
                <span className="text-[#c9a875] text-[10px]" title="Verified Musician">✦</span>
              )}
            </h4>
            <p className="text-[10px] font-mono-code text-neutral-400 truncate">
              {artwork.artist?.handle || '@artist'}
            </p>
          </div>
        </div>

        {/* Interaction Action Suite (Like, Comment, Share, MoodBoard) */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleLike(artwork.id, artwork.isLiked, e)}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                artwork.isLiked
                  ? 'text-rose-400 hover:text-rose-300'
                  : 'hover:text-neutral-200 hover:bg-white/5'
              }`}
              title="Like Composition"
            >
              <Heart
                className={`w-3.5 h-3.5 ${artwork.isLiked ? 'fill-current text-rose-500' : ''}`}
              />
              <span className="font-mono-code text-[11px]">{artwork.likesCount || 0}</span>
            </button>

            {onShareArtwork && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareArtwork(artwork);
                }}
                className="p-1.5 rounded-lg hover:text-neutral-200 hover:bg-white/5 transition-colors cursor-pointer"
                title="Share Music Link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onAddToMoodBoard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToMoodBoard(artwork);
                }}
                className="p-1.5 rounded-lg hover:text-neutral-200 hover:bg-white/5 transition-colors cursor-pointer"
                title="Save to Vault Moodboard"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(artwork.id, e);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              artwork.isSaved
                ? 'text-[#c9a875]'
                : 'hover:text-neutral-200 hover:bg-white/5'
            }`}
            title="Save Track to Collection"
          >
            <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
