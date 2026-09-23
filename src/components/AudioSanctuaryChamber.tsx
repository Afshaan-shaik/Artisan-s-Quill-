import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Disc3,
  Radio,
  FileText,
  Sparkles,
  Music,
  Check,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Artwork } from '../types';
import { UniversalTrack, registerCommunityTrack } from '../services/musicEngine';

interface AudioSanctuaryChamberProps {
  artwork: Artwork;
}

export const AudioSanctuaryChamber: React.FC<AudioSanctuaryChamberProps> = ({ artwork }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(() => {
    return artwork.musicData?.durationSeconds || 215;
  });
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics'>('player');
  const [isSentToAmbience, setIsSentToAmbience] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = artwork.musicData?.audioUrl || artwork.mediaUrl;
  const coverUrl =
    artwork.thumbnailUrl ||
    artwork.musicData?.coverArtUrl ||
    artwork.mediaUrl ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
  const genre = artwork.musicData?.genre || artwork.medium || 'Original Composition';
  const album = artwork.musicData?.album || 'Atelier Master Sessions';
  const lyrics = artwork.musicData?.lyrics;

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Pause when unmounting or switching artwork
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  }, [artwork.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[AudioSanctuaryChamber] Playback error:', err);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const handleSendToAmbience = () => {
    const track: UniversalTrack = {
      id: artwork.id.startsWith('community-') ? artwork.id : `community-${artwork.id}`,
      title: artwork.title,
      artist: artwork.artist?.name || 'Sanctuary Artist',
      album: album,
      platform: 'vault',
      sourceType: 'audio-stream',
      streamUrl: audioUrl,
      artworkUrl: coverUrl,
      durationSeconds: duration,
      genre: genre,
      isOriginal: true,
      collection: 'Vault Music',
      isVaultExclusive: true
    };

    // Register into memory and broadcast
    registerCommunityTrack({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artist?.name || 'Sanctuary Artist',
      audioUrl: audioUrl,
      coverUrl: coverUrl,
      album: album,
      genre: genre,
      durationSeconds: duration
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sanctuary:play-track', {
          detail: { track }
        })
      );
    }

    // Trigger celebrative confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#dfba88', '#ffffff', '#eab308']
      });
    } catch {
      // ignore
    }

    setIsSentToAmbience(true);
    setTimeout(() => setIsSentToAmbience(false), 3000);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative z-10 w-full max-w-3xl rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#141620]/95 via-[#0e1017]/95 to-[#08090d]/95 border border-[#c9a875]/40 shadow-[0_30px_90px_rgba(0,0,0,0.9)] my-auto text-white backdrop-blur-2xl">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onDurationChange={() => {
          if (audioRef.current && audioRef.current.duration) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      {/* Chamber Header & Mode Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/40 flex items-center justify-center text-[#c9a875]">
            <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#c9a875] block font-semibold">
              Original Sound Sanctuary Master
            </span>
            <span className="text-xs text-white/50 font-mono-code">
              High-Fidelity Studio Pressing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lyrics && (
            <div className="flex rounded-lg bg-black/40 border border-white/10 p-0.5 text-xs font-mono-code">
              <button
                type="button"
                onClick={() => setActiveTab('player')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'player'
                    ? 'bg-[#c9a875] text-[#0a0b0e] font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Vinyl Master
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lyrics')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTab === 'lyrics'
                    ? 'bg-[#c9a875] text-[#0a0b0e] font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                Liner Notes
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleSendToAmbience}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono-code transition-all cursor-pointer shadow-lg ${
              isSentToAmbience
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-[#c9a875]/15 border-[#c9a875]/60 text-[#c9a875] hover:bg-[#c9a875] hover:text-[#0a0b0e]'
            }`}
            title="Stream this track in the background floating player"
          >
            {isSentToAmbience ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Playing in Sanctuary</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Send to Ambience</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'player' ? (
        /* Vinyl Turntable & Interactive Player */
        <div className="space-y-6">
          {/* Main Visual Chamber: Sleeve & Rotating Vinyl Record */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-4">
            {/* Album Sleeve */}
            <div className="relative group w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#c9a875]/40 shrink-0 bg-black">
              <img
                src={coverUrl}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <p className="text-[10px] text-[#c9a875] font-mono-code uppercase tracking-wider truncate">
                  {album}
                </p>
                <p className="text-xs font-serif font-bold text-white truncate">
                  {artwork.artist.name}
                </p>
              </div>
            </div>

            {/* Revolving Vinyl Record */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-[#0a0a0d] via-[#1a1b24] to-[#0a0a0d] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex items-center justify-center shrink-0">
              {/* Spinning Disc Groove Layers */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center transition-transform"
                style={{
                  animation: isPlaying ? 'spin 6s linear infinite' : 'none'
                }}
              >
                {/* Concentric Gold-Toned Grooves */}
                <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/5" />
                <div className="absolute inset-5 sm:inset-7 rounded-full border border-white/5" />
                <div className="absolute inset-8 sm:inset-11 rounded-full border border-white/5" />
                <div className="absolute inset-11 sm:inset-15 rounded-full border border-white/5" />
                <div className="absolute inset-14 sm:inset-19 rounded-full border border-white/5" />

                {/* Vinyl Light Sheen Cone */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

                {/* Center Label Badge */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#c9a875] shadow-lg bg-[#11131a] flex items-center justify-center p-1 text-center">
                  <img
                    src={coverUrl}
                    alt="Center Label"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="relative z-10 w-4 h-4 rounded-full bg-[#0a0b0e] border-2 border-[#c9a875]" />
                </div>
              </div>
            </div>
          </div>

          {/* Track Details & Visualizer Bars */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-serif-display font-bold text-white tracking-tight">
              {artwork.title}
            </h3>
            <p className="text-xs sm:text-sm font-mono-code text-[#c9a875] uppercase tracking-widest">
              {artwork.artist.name} • {genre}
            </p>

            {/* Live Frequency Equalizer Bars */}
            <div className="flex items-end justify-center gap-1.5 h-8 pt-2">
              {[0.3, 0.7, 0.45, 0.95, 0.6, 0.85, 0.4, 1.0, 0.55, 0.75, 0.35, 0.9, 0.5, 0.8, 0.4].map(
                (bar, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-[#c9a875] to-[#f8e7c9] shadow-[0_0_8px_rgba(201,168,117,0.5)]'
                        : 'bg-white/20'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, bar * 100)}%` : '20%',
                      animation: isPlaying ? `pulse 1.2s ease-in-out infinite` : 'none',
                      animationDelay: `${(i % 5) * 150}ms`
                    }}
                  />
                )
              )}
            </div>
          </div>

          {/* Interactive Scrubber Bar */}
          <div className="space-y-1.5 px-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-[#c9a875] focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #c9a875 ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%)`
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono-code text-white/50">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-between pt-2">
            {/* Volume Slider */}
            <div className="flex items-center gap-2 w-32">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#c9a875]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#c9a875]"
              />
            </div>

            {/* Central Play / Skip Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSkip(-15)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Rewind 15 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-[#c9a875] to-[#dfba88] text-[#0a0b0e] flex items-center justify-center shadow-xl shadow-[#c9a875]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play Master Audio'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSkip(15)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Forward 15 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metadata Pill */}
            <div className="text-right w-32 hidden sm:block">
              {artwork.musicData?.key && (
                <span className="text-[10px] font-mono-code text-[#c9a875] block">
                  Key: {artwork.musicData.key}
                </span>
              )}
              {artwork.musicData?.bpm && (
                <span className="text-[10px] font-mono-code text-white/40 block">
                  {artwork.musicData.bpm}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Lyrics & Liner Notes View */
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 font-serif leading-relaxed text-neutral-200 whitespace-pre-line text-sm sm:text-base">
            <h4 className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875] mb-3 font-semibold">
              Original Composition Lyrics & Verse
            </h4>
            {lyrics || 'No lyrics provided for this instrumental composition.'}
          </div>

          {artwork.description && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/70 leading-relaxed font-sans">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-white/40 block mb-1">
                Curatorial Liner Notes
              </span>
              {artwork.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
