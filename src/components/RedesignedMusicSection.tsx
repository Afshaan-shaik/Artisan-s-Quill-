import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Volume2, Disc3 } from 'lucide-react';
import { Artwork } from '../types';

interface RedesignedMusicSectionProps {
  artworks: Artwork[];
  onOpenMusicSanctuary?: () => void;
}

export const RedesignedMusicSection: React.FC<RedesignedMusicSectionProps> = ({
  artworks,
  onOpenMusicSanctuary
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(38);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find first track with musicData
  const musicArtwork = React.useMemo(() => {
    return (
      artworks.find((a) => a.category === 'music' && a.musicData?.audioUrl) ||
      artworks.find((a) => a.category === 'music')
    );
  }, [artworks]);

  const coverUrl =
    musicArtwork?.thumbnailUrl ||
    musicArtwork?.musicData?.coverArtUrl ||
    musicArtwork?.mediaUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  const togglePlay = () => {
    if (!audioRef.current && musicArtwork?.musicData?.audioUrl) {
      audioRef.current = new Audio(musicArtwork.musicData.audioUrl);
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration) {
          setProgressPercent((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="w-full max-w-[1360px] mx-auto py-12 sm:py-16 px-4 sm:px-8" id="music">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="mono-tag text-[10.5px] font-semibold text-[#d8b779] block mb-1">
            ✦ Master Audiophile Vault
          </span>
          <h2 className="font-serif-cormorant font-light text-4xl sm:text-5xl text-[#f4efe6]">
            Now <em className="gt italic">playing</em>
          </h2>
        </div>

        {onOpenMusicSanctuary && (
          <button
            onClick={onOpenMusicSanctuary}
            className="btn-aq px-5 py-2.5 rounded-full text-xs font-mono-code uppercase tracking-wider text-[#d8b779] hover:text-white hover:border-[#d8b779] transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <Disc3 className="w-4 h-4 animate-[spin_5s_linear_infinite]" />
            <span>Open Full Studio Lounge +</span>
          </button>
        )}
      </div>

      {/* Floating Player Capsule */}
      <div className="player w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-full bg-white/[0.025] border border-[rgba(236,214,170,0.12)] shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex-wrap sm:flex-nowrap">
        {/* Spinning Mini Vinyl Preview Disc */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
          <div
            className={`w-full h-full rounded-full bg-[#0a0a0f] border-2 border-neutral-800 shadow-xl flex items-center justify-center ${
              isPlaying ? 'vinyl-spin-active' : 'vinyl-spin-paused'
            }`}
          >
            {/* Grooves ring */}
            <div className="w-[84%] h-[84%] rounded-full border border-white/[0.06] p-0.5 flex items-center justify-center">
              {/* Center Record Label */}
              <div className="w-[50%] h-[50%] rounded-full overflow-hidden border border-[#d8b779]/80 relative flex items-center justify-center bg-black">
                <img
                  src={coverUrl}
                  alt={musicArtwork?.title || 'Cover'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-black border border-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Play/Pause Gold Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-0 bg-gradient-to-br from-[#f6e3b4] to-[#d8b779] text-[#171007] text-lg flex items-center justify-center cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(216,183,121,0.4)]"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Track Metadata */}
        <div className="min-w-0 pr-2">
          <div className="font-serif-cormorant text-2xl sm:text-3xl text-[#f4efe6] font-light leading-none truncate">
            {musicArtwork?.title || 'Hum (Acoustic Soul Master)'}
          </div>
          <div className="mono-tag text-[10px] text-[#8d897f] truncate mt-1">
            {musicArtwork?.artist.name || 'Murtaza Qizilbash'} • {musicArtwork?.musicData?.genre || 'Indie Soul · Acoustic'}
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div className="flex-1 min-w-[120px] h-1 bg-[rgba(236,214,170,0.15)] relative rounded-full overflow-visible my-2 sm:my-0">
          <div
            className="absolute left-0 top-0 h-full bg-[#d8b779] rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute -right-1.5 -top-1 w-3 h-3 rounded-full bg-[#f6e3b4] shadow-[0_0_12px_#d8b779]" />
          </div>
        </div>

        {/* Duration / Timestamp */}
        <span className="mono-tag text-xs text-[#8d897f] shrink-0">
          {isPlaying ? 'Playing' : '1:24'}
        </span>
      </div>
    </section>
  );
};

