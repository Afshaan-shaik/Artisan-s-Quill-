import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Heart,
  Bookmark,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Image,
  Film,
  Palette,
  PenTool,
  Share2,
  Disc3,
  Clock,
  Eye,
  Feather,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Artwork, ArtCategory, VoiceAccentOption } from '../types';
import { isVideoMedia, isAudioMedia } from '../utils/mediaUtils';
import { resolveAudioUrl } from '../utils/audioResolver';
import { registerCommunityTrack } from '../services/musicEngine';
import { useSoundEngine } from '../hooks/useSoundEngine';
import { detectPoemLanguage, preparePoeticTextForVoice } from '../utils/speechUtils';
import { resolvePoeticVoice, isAfshaanShaikh } from '../utils/afshaanVoiceEngine';
import { ZenOverlay } from './PoetryCard';

// ─── Formatting Helpers ───────────────────────────────────────────────────────

const formatVideoTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatAudioTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
  isMasterpiece?: boolean;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist?: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  onOpenBardModal?: (poem: { title: string; author: string; authorHandle?: string; content: string }) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  index = 0,
  isMasterpiece = false,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onAddToMoodBoard,
  onOpenBardModal
}) => {
  const { play: playSound } = useSoundEngine();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);

  // Category determination
  const isVideo = isVideoMedia(artwork) || artwork.category === 'video';
  const isMusic = artwork.category === 'music' || Boolean(artwork.musicData) || isAudioMedia(artwork);
  const isPoetry = artwork.category === 'poetry' && Boolean(artwork.poetryContent);

  // ─── 1. Video Player States ───────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoProgressRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isScrubbing) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!videoProgressRef.current || videoDuration <= 0) return;
      const rect = videoProgressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
      const target = ratio * videoDuration;
      if (videoRef.current) {
        videoRef.current.currentTime = target;
        setVideoCurrentTime(target);
      }
    };
    const handleGlobalMouseUp = () => {
      setIsScrubbing(false);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isScrubbing, videoDuration]);

  // ─── 2. Music Player States ───────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number>(() => {
    return artwork.musicData?.durationSeconds || 210;
  });

  const audioUrl = resolveAudioUrl(artwork);
  const coverUrl =
    artwork.thumbnailUrl ||
    artwork.mediaUrl ||
    artwork.musicData?.coverArtUrl ||
    '/audio/M-Remix.jpg';
  const genre = artwork.musicData?.genre || artwork.medium || 'Original Composition';
  const album = artwork.musicData?.album || 'Atelier Masterpiece';

  const handleTogglePlayMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });

      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch(() => {
          setIsAudioPlaying(false);
        });

      registerCommunityTrack({
        id: artwork.id,
        title: artwork.title,
        artistName: artwork.artist?.name || 'Sanctuary Musician',
        audioUrl: audioUrl,
        coverUrl: coverUrl,
        album: album,
        genre: genre,
        durationSeconds: audioDuration
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setAudioDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsAudioPlaying(false);
      setAudioCurrentTime(0);
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

  const musicProgressPercent = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;

  // ─── 3. Poetry Literary States ────────────────────────────────────────────
  const poetry = artwork.poetryContent;
  const isAuthorAfshaan = isAfshaanShaikh(artwork.artist.name, artwork.artist.handle);
  const [poetryTheme, setPoetryTheme] = useState<'obsidian' | 'parchment'>(() => {
    if (poetry?.theme === 'vellum') return 'parchment';
    return 'obsidian';
  });
  const [isReciting, setIsReciting] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const isRecitingRef = useRef(false);

  const handleToggleRecite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isReciting) {
      isRecitingRef.current = false;
      window.speechSynthesis.cancel();
      setIsReciting(false);
      return;
    }

    const allPoemText = poetry ? `${artwork.title}. ${poetry.stanzas.join(' ')}` : artwork.title;
    const resolvedPlan = resolvePoeticVoice('auto-detect', allPoemText, artwork.artist.name, artwork.artist.handle);
    const spokenText = preparePoeticTextForVoice(
      poetry?.stanzas?.[0] || artwork.title,
      resolvedPlan.accentId === 'native-urdu-hindi' || resolvedPlan.isFounder
    );

    const utterance = new SpeechSynthesisUtterance(spokenText);
    if (resolvedPlan.voice) utterance.voice = resolvedPlan.voice;
    utterance.rate = resolvedPlan.rate;
    utterance.pitch = resolvedPlan.pitch;

    utterance.onend = () => {
      setIsReciting(false);
      isRecitingRef.current = false;
    };
    utterance.onerror = () => {
      setIsReciting(false);
      isRecitingRef.current = false;
    };

    window.speechSynthesis.cancel();
    isRecitingRef.current = true;
    setIsReciting(true);
    window.speechSynthesis.speak(utterance);
  };

  // ─── 4. Image Loading States ──────────────────────────────────────────────
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ─── Mouse Movement Parallax ──────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setParallaxOffset({ x: offsetX * 6, y: offsetY * 6 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParallaxOffset({ x: 0, y: 0 });
  };

  // ─── Like & Share Actions ─────────────────────────────────────────────────
  const handleLike = (id: string, isLiked: boolean | undefined, e: React.MouseEvent) => {
    playSound('like-action');
    if (!isLiked) {
      confetti({
        particleCount: 22,
        spread: 48,
        origin: { y: 0.8 },
        colors: ['#c9a875', '#ffffff', '#e53e3e']
      });
    }
    onToggleLike(id, e);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('share-action');
    if (onShareArtwork) {
      onShareArtwork(artwork);
    } else {
      const url = `${window.location.origin}${window.location.pathname}?artwork=${artwork.id}`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getCategoryBadge = () => {
    if (isMusic) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#dfbd87] font-mono-code font-bold rounded-md shadow-md">
          <Disc3 className="w-3 h-3 text-[#c9a875]" />
          <span>Music</span>
        </div>
      );
    }
    if (isVideo) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#f0a8d0] font-mono-code font-bold rounded-md shadow-md">
          <Film className="w-3 h-3 text-[#f0a8d0]" />
          <span>Video</span>
        </div>
      );
    }
    if (isPoetry) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#e8b482] font-mono-code font-bold rounded-md shadow-md">
          <Feather className="w-3 h-3 text-[#c9a875]" />
          <span>Poetry</span>
        </div>
      );
    }
    switch (artwork.category) {
      case 'painting':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#e8b482] font-mono-code font-bold rounded-md shadow-md">
            <Palette className="w-3 h-3 text-[#e8b482]" />
            <span>Painting</span>
          </div>
        );
      case 'drawing':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#b9c6ea] font-mono-code font-bold rounded-md shadow-md">
            <PenTool className="w-3 h-3 text-[#b9c6ea]" />
            <span>Drawing</span>
          </div>
        );
      case 'digital':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-[#8ed8b5] font-mono-code font-bold rounded-md shadow-md">
            <Image className="w-3 h-3 text-[#8ed8b5]" />
            <span>Digital</span>
          </div>
        );
    }
  };

  const isMasterpieceMarked =
    isMasterpiece ||
    artwork.id === 'spotlight-masterpiece-1' ||
    artwork.tags?.includes('Masterpiece of the Day');

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          playSound('button-hover');
        }}
        onMouseLeave={handleMouseLeave}
        id={`artwork-card-${artwork.id}`}
        data-artwork-title={artwork.title}
        data-card-category={artwork.category}
        onClick={() => {
          playSound('view-masterpiece');
          onSelectArtwork(artwork);
        }}
        className="redesign-card relative group overflow-hidden bg-[#0b0c10] cursor-pointer w-full aspect-square p-2.5 sm:p-3 rounded-[24px] border border-[rgba(236,214,170,0.12)] hover:border-[#d8b779]/60 shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(216,183,121,0.2)] hover:z-10 flex flex-col justify-between select-none"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        {/* Hidden Native Audio Element for Music */}
        {isMusic && audioUrl && (
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
        )}

        {/* ─────────────────────────────────────────────────────────────────
            UPPER MEDIA STAGE (Fills ~68-70% of the square)
           ───────────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-[16px] sm:rounded-[18px] bg-[#040508] border border-white/10 group-hover:border-[#c9a875]/40 transition-colors">
          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            {getCategoryBadge()}
          </div>

          {/* Masterpiece Badge */}
          {isMasterpieceMarked && (
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-[#c9a875] text-black text-[9px] font-extrabold tracking-widest uppercase shadow-[0_0_12px_rgba(201,168,117,0.5)] rounded-md pointer-events-none">
              <Sparkles className="w-3 h-3 text-black" />
              <span>#1 Masterpiece</span>
            </div>
          )}

          {/* ────────────────── Category A: Motion Loop / Video ──────────── */}
          {isVideo ? (
            <div className="relative w-full h-full overflow-hidden">
              <video
                ref={videoRef}
                src={artwork.mediaUrl}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  if (videoRef.current?.duration) {
                    setVideoDuration(videoRef.current.duration);
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current && !isScrubbing) {
                    setVideoCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 pointer-events-none bg-[#030407]"
                style={{
                  transform: `scale(${isHovered ? 1.05 : 1}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
                }}
              />

              {/* Video Duration Badge */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/10 text-white text-[9px] font-medium tracking-widest uppercase rounded-md shadow-md pointer-events-none">
                <Play className="w-2.5 h-2.5 fill-current text-[#f0a8d0]" />
                <span>{artwork.videoData?.duration || '0:30 (LOOP)'}</span>
              </div>

              {/* Video Bottom Floating Scrubber Bar */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-0 inset-x-0 z-30 p-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-1 transition-opacity duration-200 pointer-events-auto"
              >
                {/* Mini Scrubber Track */}
                <div
                  ref={videoProgressRef}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsScrubbing(true);
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
                    const target = ratio * (videoDuration || 1);
                    if (videoRef.current) {
                      videoRef.current.currentTime = target;
                      setVideoCurrentTime(target);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!videoProgressRef.current || videoDuration <= 0) return;
                    const rect = videoProgressRef.current.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
                    setHoverTime(ratio * videoDuration);
                  }}
                  onMouseLeave={() => setHoverTime(null)}
                  className="relative h-3.5 flex items-center cursor-pointer group/cardtrack"
                  title="Seek position"
                >
                  <div className="w-full h-1 group-hover/cardtrack:h-1.5 rounded-full bg-white/25 overflow-hidden relative transition-all">
                    <div
                      className="h-full bg-gradient-to-r from-[#df3838] to-[#c9a875] rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-75"
                      style={{
                        width: `${videoDuration > 0 ? (videoCurrentTime / videoDuration) * 100 : 0}%`
                      }}
                    />
                  </div>
                  {hoverTime !== null && (
                    <div
                      className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/95 border border-white/20 text-[8px] font-mono-code text-white pointer-events-none z-30"
                      style={{
                        left: `${videoDuration > 0 ? (hoverTime / videoDuration) * 100 : 0}%`
                      }}
                    >
                      {formatVideoTime(hoverTime)}
                    </div>
                  )}
                </div>

                {/* Video Controls Row */}
                <div className="flex items-center justify-between text-white text-[9px] font-mono-code">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!videoRef.current) return;
                        if (videoRef.current.paused) {
                          videoRef.current.play().catch(() => {});
                          setIsVideoPlaying(true);
                        } else {
                          videoRef.current.pause();
                          setIsVideoPlaying(false);
                        }
                      }}
                      className="p-1 rounded hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      title={isVideoPlaying ? 'Pause video' : 'Play video'}
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!videoRef.current) return;
                        const nextMuted = !isMuted;
                        videoRef.current.muted = nextMuted;
                        if (!nextMuted) {
                          videoRef.current.volume = 1;
                          videoRef.current.play().catch(() => {});
                        }
                        setIsMuted(nextMuted);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                        !isMuted
                          ? 'bg-[#c9a875] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.7)]'
                          : 'bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white border border-white/20'
                      }`}
                      title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-2.5 h-2.5 text-red-400" />
                          <span className="text-[7.5px] uppercase font-semibold">Muted</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-2.5 h-2.5 text-black" />
                          <span className="text-[7.5px] uppercase font-semibold">Sound On</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[8.5px] text-neutral-300 select-none">
                    <span>{formatVideoTime(videoCurrentTime)}</span>
                    <span className="text-neutral-500 mx-0.5">/</span>
                    <span>{formatVideoTime(videoDuration)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : isMusic ? (
            /* ────────────────── Category B: Original Music ──────────────── */
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#0c0d14] via-[#07090e] to-[#040508] flex items-center justify-center p-3">
              {/* Duration Badge */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono-code font-bold text-[#dfbd87] shadow-md pointer-events-none">
                <Clock className="w-2.5 h-2.5 text-[#c9a875]" />
                <span>{formatAudioTime(audioDuration)}</span>
              </div>

              {/* Dynamic Revolving Vinyl Disc */}
              <div
                className={`absolute w-[68%] aspect-square rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.9)] border border-white/15 transition-all duration-700 ease-out flex items-center justify-center ${
                  isAudioPlaying
                    ? 'translate-x-[20%] rotate-[180deg] scale-100 opacity-100'
                    : isHovered
                    ? 'translate-x-[10%] rotate-[45deg] scale-95 opacity-85'
                    : 'translate-x-0 scale-90 opacity-0 pointer-events-none'
                }`}
                style={{
                  background:
                    'radial-gradient(circle at center, #23201a 0%, #0d0e12 25%, #181920 35%, #08090d 48%, #1f202a 60%, #06070a 75%, #181920 88%, #050608 100%)'
                }}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isAudioPlaying ? 'animate-[spin_5s_linear_infinite]' : ''
                  }`}
                >
                  <div className="w-[34%] aspect-square rounded-full border border-[#c9a875]/60 bg-gradient-to-tr from-[#997945] via-[#dfbd87] to-[#73582e] p-0.5 shadow-inner flex flex-col items-center justify-center text-center">
                    <div className="w-full h-full rounded-full bg-black/85 flex flex-col items-center justify-center border border-black">
                      <Disc3 className="w-2.5 h-2.5 text-[#dfbd87]" />
                      <span className="text-[5.5px] font-mono-code font-bold text-[#dfbd87]">33 RPM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Album Cover Sleeve with Centered Play Button */}
              <div
                className={`relative z-10 w-[64%] aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/15 group-hover:border-[#c9a875]/50 transition-all duration-500 ${
                  isAudioPlaying ? '-translate-x-[10%]' : isHovered ? '-translate-x-[5%]' : 'translate-x-0'
                }`}
              >
                <img
                  src={coverUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 pointer-events-none" />

                {/* Centered Circular Play/Pause Button */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <button
                    type="button"
                    onClick={handleTogglePlayMusic}
                    className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 shadow-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 ${
                      isAudioPlaying
                        ? 'bg-[#c9a875] text-black shadow-[0_0_20px_rgba(201,168,117,0.7)]'
                        : 'bg-black/80 hover:bg-[#c9a875] text-white hover:text-black border border-white/20 hover:border-[#c9a875]'
                    }`}
                    title={isAudioPlaying ? 'Pause Track' : 'Play Track'}
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Live Frequency Equalizer Bars */}
                {isAudioPlaying && (
                  <div className="absolute bottom-1.5 right-1.5 flex items-end gap-0.5 px-1 py-0.5 rounded bg-black/85 border border-[#c9a875]/40 backdrop-blur-md">
                    <span className="w-0.5 bg-[#c9a875] h-2.5 animate-[pulse_0.6s_ease-in-out_infinite] rounded-t-sm" />
                    <span className="w-0.5 bg-[#dfbd87] h-4 animate-[pulse_0.4s_ease-in-out_infinite] rounded-t-sm" />
                    <span className="w-0.5 bg-[#c9a875] h-2 animate-[pulse_0.8s_ease-in-out_infinite] rounded-t-sm" />
                  </div>
                )}
              </div>

              {/* Audio Scrubber Bottom Strip */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#c9a875] to-[#dfbd87] h-full transition-all duration-150"
                  style={{ width: `${musicProgressPercent}%` }}
                />
              </div>
            </div>
          ) : isPoetry && poetry ? (
            /* ────────────────── Category C: Poetry / Text-Based Art ──────── */
            <div
              className={`relative w-full h-full p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden transition-colors duration-500 text-left ${
                poetryTheme === 'obsidian'
                  ? 'bg-[#191410] text-[#ede0c8] border border-[rgba(201,168,117,0.25)] shadow-[inset_0_0_35px_rgba(0,0,0,0.65)]'
                  : 'bg-[#ede0c8] text-[#2b2219] border border-[#c8b18a] shadow-[inset_0_0_30px_rgba(100,68,30,0.12)]'
              }`}
            >
              {/* Upper Literary Header */}
              <div className="flex items-center justify-between z-10">
                <span
                  className={`text-[9px] font-mono-code font-bold uppercase tracking-widest ${
                    poetryTheme === 'obsidian' ? 'text-[#c9a875]' : 'text-[#8c6331]'
                  }`}
                >
                  {poetry.poemNumber || 'POEM'}
                </span>

                {/* Literary Tools: Theme Switcher, Recite, Zen, Bard */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 p-0.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md pointer-events-auto"
                >
                  {onOpenBardModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBardModal({
                          title: artwork.title,
                          author: artwork.artist.name,
                          authorHandle: artwork.artist.handle,
                          content: poetry.stanzas.join('\n\n')
                        });
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-[#dfbd87] hover:text-white transition-colors cursor-pointer"
                      title="AI Bard Recital"
                    >
                      <Feather className="w-2.5 h-2.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZenMode(true);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-[#c9a875] hover:text-white transition-colors cursor-pointer"
                    title="Zen Reading Mode"
                  >
                    <Eye className="w-2.5 h-2.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleRecite}
                    className={`p-1 rounded-full transition-colors cursor-pointer ${
                      isReciting ? 'bg-[#c9a875] text-black' : 'text-neutral-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isReciting ? 'Stop Recital' : 'Voice Recitation'}
                  >
                    {isReciting ? (
                      <VolumeX className="w-2.5 h-2.5" />
                    ) : (
                      <Volume2 className="w-2.5 h-2.5 text-[#c9a875]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPoetryTheme(poetryTheme === 'obsidian' ? 'parchment' : 'obsidian');
                    }}
                    className="px-1.5 py-0.5 rounded-full text-[7.5px] font-mono-code uppercase font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Toggle Theme"
                  >
                    {poetryTheme === 'obsidian' ? '📜' : '✦'}
                  </button>
                </div>
              </div>

              {/* Title & Stanza Excerpt */}
              <div className="my-auto py-1">
                <h4
                  className={`font-serif-cormorant font-normal italic text-lg sm:text-xl leading-snug line-clamp-1 mb-1.5 ${
                    poetryTheme === 'obsidian' ? 'text-white' : 'text-[#1a130c]'
                  }`}
                >
                  {artwork.title}
                </h4>

                <div
                  className={`font-serif-cormorant text-xs sm:text-sm leading-relaxed italic line-clamp-3 ${
                    poetryTheme === 'obsidian' ? 'text-[#c5baa8]' : 'text-[#3b2c1f]'
                  }`}
                >
                  {poetry.excerpt ||
                    (poetry.stanzas[0] || '').split('\n').slice(0, 3).join('\n')}
                </div>
              </div>

              {/* Series Attribution */}
              <div
                className={`pt-1 border-t text-[8px] font-mono-code uppercase tracking-wider truncate ${
                  poetryTheme === 'obsidian'
                    ? 'border-white/10 text-[#c9a875]'
                    : 'border-[#c8b18a]/50 text-[#7d5c34]'
                }`}
              >
                — {artwork.artist.name}, {artwork.year || 2026} • {poetryTheme === 'obsidian' ? 'OBSIDIAN VELLUM' : 'PARCHMENT'}
              </div>
            </div>
          ) : (
            /* ────────────────── Category D: Digital, Painting, Photo, Drawing ─ */
            <div className="relative w-full h-full overflow-hidden">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800/80 to-neutral-900 animate-pulse flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border border-[#c9a875]/30 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#c9a875]/50 animate-spin" />
                  </div>
                </div>
              )}

              {imageError ? (
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
                  <Palette className="w-7 h-7 text-[#c9a875]/40 mb-1" />
                  <span className="text-xs font-serif italic text-neutral-400">{artwork.title}</span>
                  <span className="text-[9px] font-mono-code text-neutral-600 uppercase mt-0.5">Archived Visual</span>
                </div>
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
                    transform: `scale(${isHovered ? 1.05 : 1}) translate3d(${-parallaxOffset.x}px, ${-parallaxOffset.y}px, 0)`
                  }}
                />
              )}

              {/* Hover Quick Action Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(artwork.id, artwork.isLiked, e);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono-code uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer ${
                      artwork.isLiked
                        ? 'bg-rose-500/25 border border-rose-500/60 text-rose-400'
                        : 'bg-black/60 border border-white/15 text-neutral-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{artwork.likesCount || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('save-action');
                      onToggleSave(artwork.id, e);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono-code uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer ${
                      artwork.isSaved
                        ? 'bg-[#c9a875]/25 border border-[#c9a875]/60 text-[#dfbd87]'
                        : 'bg-black/60 border border-white/15 text-neutral-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Bookmark className={`w-3 h-3 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : ''}`} />
                    <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-mono-code uppercase tracking-wider bg-black/60 border border-white/15 text-[#dfbd87] hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto backdrop-blur-md"
                    title="Share Artwork"
                  >
                    <Share2 className="w-3 h-3 text-[#c9a875]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            LOWER MUSEUM PLAQUE (Fills ~30-32% of the square)
           ───────────────────────────────────────────────────────────────── */}
        <div className="pt-2 sm:pt-2.5 px-1.5 pb-0.5 flex flex-col justify-between shrink-0 select-none">
          {/* Row 1: Accession Code & Medium / Genre */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono-code text-[#c9a875] tracking-wider">
            <span>
              #AQ-{(artwork.year || '2026')}-{artwork.id.slice(-4).toUpperCase()}
            </span>
            <span className="text-neutral-400 capitalize truncate max-w-[120px] sm:max-w-[150px]">
              {isMusic
                ? artwork.musicData?.genre || 'Original Music'
                : isPoetry
                ? artwork.poetryContent?.theme || 'Lyrical Free Verse'
                : artwork.medium || artwork.category}
            </span>
          </div>

          {/* Row 2: Large Serif Title */}
          <h3 className="text-base sm:text-lg font-serif-cormorant font-light text-[#f4efe6] group-hover:text-[#f6e3b4] transition-colors leading-snug truncate my-0.5">
            {artwork.title}
          </h3>

          {/* Row 3: Artist Name on Left, Action Buttons on Right */}
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono-code pt-1 border-t border-white/[0.08]">
            <span
              onClick={(e) => {
                if (onSelectArtist && artwork.artist.id) {
                  e.stopPropagation();
                  onSelectArtist(artwork.artist.id, e);
                }
              }}
              className="text-neutral-300 truncate max-w-[110px] sm:max-w-[150px] hover:text-[#c9a875] transition-colors cursor-pointer"
            >
              {artwork.artist.name}
            </span>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 text-[10px] sm:text-[11px]">
              {/* Like Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(artwork.id, artwork.isLiked, e);
                }}
                className="text-neutral-400 hover:text-rose-400 active:scale-90 flex items-center gap-1 p-1 min-w-[28px] min-h-[28px] justify-center transition-all cursor-pointer"
                title="Like artwork"
                aria-label={`Like ${artwork.title}, currently ${artwork.likesCount || 0} likes`}
              >
                <Heart
                  className={`w-3.5 h-3.5 shrink-0 ${
                    artwork.isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-400'
                  }`}
                />
                <span>{artwork.likesCount || 0}</span>
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playSound('save-action');
                  onToggleSave(artwork.id, e);
                }}
                className="text-neutral-400 hover:text-[#dfbd87] active:scale-90 flex items-center gap-1 p-1 min-w-[28px] min-h-[28px] justify-center transition-all cursor-pointer"
                title="Save artwork to vault"
                aria-label={`Save ${artwork.title} to vault`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 shrink-0 ${
                    artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : 'text-neutral-400'
                  }`}
                />
                <span>{artwork.savesCount || 0}</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="text-neutral-400 hover:text-[#dfbd87] active:scale-90 flex items-center gap-1 p-1 min-w-[28px] min-h-[28px] justify-center transition-all cursor-pointer"
                title="Share artwork"
                aria-label={`Share ${artwork.title}`}
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 shrink-0 text-[#c9a875]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zen Mode Reading Overlay for Poetry */}
      {isZenMode && isPoetry && (
        <ZenOverlay
          artwork={artwork}
          isReciting={isReciting}
          activeLine={null}
          currentTime={0}
          duration={poetry?.audioRecitationDuration || 120}
          currentLineIndex={0}
          totalLines={poetry?.stanzas?.length || 1}
          playbackRate={1}
          selectedAccent="auto-detect"
          onClose={() => setIsZenMode(false)}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onShare={onShareArtwork}
          onRecite={handleToggleRecite}
          onSeek={() => {}}
          onSkipSeconds={() => {}}
          onSeekLine={() => {}}
          onRestart={() => {}}
          onChangePlaybackRate={() => {}}
        />
      )}
    </>
  );
};

