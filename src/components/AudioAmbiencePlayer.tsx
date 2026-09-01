import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Play,
  Pause,
  Headphones,
  Search,
  Maximize2,
  Minimize2,
  X,
  Radio,
  RotateCcw,
  SkipBack,
  SkipForward,
  ArrowLeft,
  RadioTower,
  Disc3
} from 'lucide-react';
import {
  UniversalTrack,
  UniversalSearchResult,
  UniversalMusicEngine,
  MASTER_SANCTUARY_TRACKS,
  VAULT_MUSIC_COLLECTION,
  MusicPlatform
} from '../services/musicEngine';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          videoId?: string;
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            disablekb?: 0 | 1;
            enablejsapi?: 0 | 1;
            fs?: 0 | 1;
            iv_load_policy?: 3;
            loop?: 0 | 1;
            modestbranding?: 0 | 1;
            playsinline?: 0 | 1;
            rel?: 0 | 1;
            start?: number;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (
    videoId: string | { videoId: string; startSeconds?: number; suggestedQuality?: string }
  ) => void;
  cueVideoById: (
    videoId: string | { videoId: string; startSeconds?: number; suggestedQuality?: string }
  ) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export const AudioAmbiencePlayer: React.FC = () => {
  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<UniversalTrack | null>(null);
  const [volume, setVolume] = useState<number>(0.75); // 0.0 to 1.0
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(270);

  // UI Modal & Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);

  // Search & Multi-Platform Tab State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePlatformTab, setActivePlatformTab] = useState<'all' | MusicPlatform>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Aggregated Search Results
  const [searchResults, setSearchResults] = useState<UniversalSearchResult>({
    query: '',
    all: MASTER_SANCTUARY_TRACKS,
    vault: VAULT_MUSIC_COLLECTION,
    youtube: [],
    spotify: [],
    jiosaavn: [],
    sanctuary: MASTER_SANCTUARY_TRACKS
  });

  const [recentTracks, setRecentTracks] = useState<UniversalTrack[]>([]);

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const progressIntervalRef = useRef<number | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const loadedVideoIdRef = useRef<string>('');

  // 1. Initialize HTML5 Audio Element for Direct Streams (JioSaavn / Spotify Lossless Streams)
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.onplay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    audio.onpause = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    audio.onended = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentTime(0);
    };

    audio.ontimeupdate = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onerror = () => {
      console.warn('Audio stream error, falling back to YouTube audio...');
      handlePlaybackFallback();
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 2. Initialize YouTube IFrame API for Universal Full-Length Playback
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const initYT = () => {
      if (!window.YT || !window.YT.Player) return;
      if (ytPlayerRef.current) return;

      const playerContainer = document.getElementById('universal-youtube-audio-host');
      if (playerContainer) {
        try {
          ytPlayerRef.current = new window.YT.Player('universal-youtube-audio-host', {
            videoId: loadedVideoIdRef.current || 'tvcaYU7uofY',
            playerVars: {
              autoplay: 0,
              controls: 1,
              disablekb: 0,
              enablejsapi: 1,
              fs: 1,
              iv_load_policy: 3,
              loop: 1,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              start: 0
            },
            events: {
              onReady: (event) => {
                event.target.setVolume(Math.round(volume * 100));
                try {
                  const dur = event.target.getDuration();
                  if (dur && dur > 0) setDuration(dur);
                } catch {
                  // ignore
                }
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                  isPlayingRef.current = true;
                  try {
                    const dur = ytPlayerRef.current?.getDuration();
                    if (dur && dur > 0) setDuration(dur);
                  } catch {
                    // ignore
                  }
                } else if (
                  event.data === window.YT.PlayerState.PAUSED ||
                  event.data === window.YT.PlayerState.ENDED
                ) {
                  setIsPlaying(false);
                  isPlayingRef.current = false;
                  if (event.data === window.YT.PlayerState.ENDED) {
                    setCurrentTime(0);
                  }
                }
              },
              onError: (event) => {
                console.warn('YouTube player error code:', event.data);
                handlePlaybackFallback();
              }
            }
          });
        } catch {
          // fallback
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initYT();
      };
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Update YouTube timer polling
  useEffect(() => {
    if (isPlaying && currentTrack?.sourceType === 'youtube-iframe' && ytPlayerRef.current) {
      progressIntervalRef.current = window.setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || duration || 270;
            setCurrentTime(cur);
            if (dur && dur > 0) setDuration(dur);
          } catch {
            // ignore
          }
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentTrack, duration]);

  // Synchronize Volume across HTML5 Audio & YouTube Player
  useEffect(() => {
    const effectiveVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(Math.round(effectiveVol * 100));
      } catch {
        // ignore
      }
    }
  }, [volume, isMuted]);

  // Load / Save persistent custom user tracks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('atelier_music_history_v1');
      if (saved) {
        setRecentTracks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click & Handle ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExpandedModal) setIsExpandedModal(false);
        else if (isDropdownOpen) setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpandedModal, isDropdownOpen]);

  // Master Playback Trigger for ANY Track from ANY Platform
  const handlePlayTrack = (track: UniversalTrack) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.durationSeconds || 270);

    // Save to history
    setRecentTracks((prev) => {
      const updated = [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 20);
      try {
        localStorage.setItem('atelier_music_history_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 1. Direct HTML5 Audio Stream (JioSaavn / Spotify direct MP3/AAC)
    if (track.sourceType === 'audio-stream' && track.streamUrl) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // ignore
        }
      }

      if (audioRef.current) {
        audioRef.current.src = track.streamUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          setIsPlaying(true);
        });
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    // 2. YouTube IFrame Stream (Full-length official tracks)
    if (track.youtubeId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (ytPlayerRef.current) {
        try {
          if (loadedVideoIdRef.current !== track.youtubeId) {
            if (typeof ytPlayerRef.current.loadVideoById === 'function') {
              ytPlayerRef.current.loadVideoById({
                videoId: track.youtubeId,
                startSeconds: 0
              });
              loadedVideoIdRef.current = track.youtubeId;
            }
          } else {
            if (typeof ytPlayerRef.current.seekTo === 'function') {
              ytPlayerRef.current.seekTo(0, true);
            }
          }
          if (typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo();
          }
          setIsPlaying(true);
          isPlayingRef.current = true;
        } catch {
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(true);
      }
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
  };

  const togglePlay = () => {
    if (!isPlaying) {
      if (currentTrack) {
        if (currentTrack.sourceType === 'audio-stream' && audioRef.current && audioRef.current.src) {
          audioRef.current.play();
          setIsPlaying(true);
          isPlayingRef.current = true;
        } else if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
          isPlayingRef.current = true;
        } else {
          handlePlayTrack(currentTrack);
        }
      } else {
        setIsDropdownOpen(true);
      }
    } else {
      handlePause();
    }
  };

  const handleSeek = (timeSec: number) => {
    setCurrentTime(timeSec);
    if (currentTrack?.sourceType === 'audio-stream' && audioRef.current) {
      audioRef.current.currentTime = timeSec;
    } else if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(timeSec, true);
      } catch {
        // ignore
      }
    }
  };

  const handleRestartFromBeginning = () => {
    handleSeek(0);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const handleNextTrack = () => {
    const list = getDisplayTracks();
    if (list.length === 0) return;
    const currentIndex = list.findIndex((t) => t.id === currentTrack?.id);
    const nextTrack = list[(currentIndex + 1) % list.length];
    if (nextTrack) {
      handlePlayTrack(nextTrack);
    }
  };

  const handlePreviousTrack = () => {
    const list = getDisplayTracks();
    if (list.length === 0) return;
    const currentIndex = list.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    const prevTrack = list[prevIndex];
    if (prevTrack) {
      handlePlayTrack(prevTrack);
    }
  };

  const handlePlaybackFallback = () => {
    const available = getDisplayTracks().filter((t) => t.id !== currentTrack?.id);
    if (available.length > 0) {
      handlePlayTrack(available[0]);
    }
  };

  // Multi-Platform Universal Search Trigger
  const executeUniversalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({
        query: '',
        all: MASTER_SANCTUARY_TRACKS,
        vault: VAULT_MUSIC_COLLECTION,
        youtube: [],
        spotify: [],
        jiosaavn: [],
        sanctuary: MASTER_SANCTUARY_TRACKS
      });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await UniversalMusicEngine.searchAll(query);
      setSearchResults(results);
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    if (!val.trim()) {
      executeUniversalSearch('');
      return;
    }
    searchDebounceRef.current = window.setTimeout(() => {
      executeUniversalSearch(val);
    }, 280);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get active tracks filtered by tab
  const getDisplayTracks = (): UniversalTrack[] => {
    switch (activePlatformTab) {
      case 'vault':
        return searchResults.vault.length > 0 ? searchResults.vault : VAULT_MUSIC_COLLECTION;
      case 'youtube':
        return searchResults.youtube.length > 0 ? searchResults.youtube : searchResults.all;
      case 'spotify':
        return searchResults.spotify.length > 0 ? searchResults.spotify : searchResults.all;
      case 'jiosaavn':
        return searchResults.jiosaavn.length > 0 ? searchResults.jiosaavn : searchResults.all;
      case 'sanctuary':
        return searchResults.sanctuary;
      default:
        return searchResults.all;
    }
  };

  // Platform Badge Helper
  const renderPlatformBadge = (platform: MusicPlatform) => {
    switch (platform) {
      case 'vault':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold bg-gradient-to-r from-[#c9a875]/30 to-[#dfbd87]/30 text-[#fcedd2] border border-[#dfbd87] shadow-[0_0_10px_rgba(201,168,117,0.4)] shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-[#dfbd87]" />
            Vault Exclusive
          </span>
        );
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            YouTube
          </span>
        );
      case 'spotify':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Spotify
          </span>
        );
      case 'jiosaavn':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            JioSaavn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono-code font-bold bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-[#c9a875]" />
            Sanctuary
          </span>
        );
    }
  };

  const currentDisplayTracks = getDisplayTracks();

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. HIDDEN AUDIO HOSTS (HTML5 Audio + YouTube IFrame Engine)
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed -top-[9999px] -left-[9999px] w-1 h-1 overflow-hidden opacity-0 pointer-events-none -z-50">
        <div id="universal-youtube-audio-host" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP NAVIGATION CAPSULE PILL
         ───────────────────────────────────────────────────────────── */}
      <div id="ambient-audio-suite" className="relative inline-flex items-center" ref={dropdownRef}>
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-[#0a0c10]/90 hover:bg-[#0a0c10] border border-[#c9a875]/45 hover:border-[#c9a875] transition-all duration-200 shadow-lg backdrop-blur-md">
          {/* Play/Pause / Open Studio Trigger */}
          <button
            id="toggle-ambience-music-btn"
            onClick={togglePlay}
            className={`flex items-center gap-2 pl-3.5 pr-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              isPlaying && currentTrack
                ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-extrabold shadow-[0_0_16px_rgba(201,168,117,0.6)]'
                : 'text-[#e4be88] hover:text-white hover:bg-white/10'
            }`}
            title={
              isPlaying && currentTrack
                ? `Pause ${currentTrack.title}`
                : currentTrack
                ? `Play ${currentTrack.title}`
                : 'Open Universal Music Sanctuary'
            }
          >
            {/* Music Equalizer Wave */}
            <div className="flex items-center gap-1">
              <Music
                className={`w-3.5 h-3.5 ${
                  isPlaying && currentTrack ? 'animate-bounce text-black' : 'text-[#c9a875]'
                }`}
              />
              {isPlaying && currentTrack && (
                <div className="flex items-end gap-0.5 h-3 w-3 px-0.5">
                  <span className="w-0.5 bg-black animate-[pulse_0.8s_ease-in-out_infinite] h-full rounded-full" />
                  <span className="w-0.5 bg-black animate-[pulse_1.1s_ease-in-out_infinite_0.2s] h-2/3 rounded-full" />
                  <span className="w-0.5 bg-black animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-5/6 rounded-full" />
                </div>
              )}
            </div>

            <span className="text-xs uppercase tracking-widest whitespace-nowrap font-bold max-w-[125px] truncate">
              {isPlaying && currentTrack ? currentTrack.title : 'Music Sanctuary'}
            </span>
          </button>

          {/* Quick Dropdown Toggle */}
          <button
            id="open-soundscape-menu-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer ${
              isDropdownOpen ? 'bg-white/20 text-white' : ''
            }`}
            title="Music Menu"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#c9a875] transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Floating Quick Dropdown (Default Non-Maximized State) */}
        {isDropdownOpen && (
          <div
            id="music-ambience-popover"
            className="absolute top-full right-0 mt-2 w-84 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[80vh] bg-[#0c0e14]/98 border border-[#c9a875]/40 rounded-xl shadow-2xl backdrop-blur-2xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden"
            style={{ transformOrigin: 'top right' }}
          >
            {/* Popover Header (Protected flex-shrink-0) */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#c9a875]/15 text-[#c9a875]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white truncate">
                    {currentTrack ? currentTrack.title : 'Universal Music Search'}
                  </h4>
                  <p className="text-[10px] text-[#c9a875] font-mono-code truncate">
                    {currentTrack ? currentTrack.artist : 'YouTube • Spotify • JioSaavn'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsExpandedModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="p-1.5 rounded-lg bg-[#c9a875]/20 hover:bg-[#c9a875] text-[#c9a875] hover:text-black transition-all cursor-pointer border border-[#c9a875]/40"
                  title="Expand Studio"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={togglePlay}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isPlaying && currentTrack
                      ? 'bg-[#c9a875] text-black shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Quick Search & Suggestions (Protected flex-shrink-0) */}
            <div className="space-y-2 py-2.5 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search any song (e.g. Hum Murtaza)..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                      executeUniversalSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-black/60 border border-white/10 focus:border-[#c9a875] rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              {/* Quick Collection / Platform Pills in Dropdown */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'vault', label: '👑 Vault Music' },
                  { id: 'sanctuary', label: 'Sanctuary' },
                  { id: 'youtube', label: 'YouTube' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePlatformTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code font-bold transition-all cursor-pointer shrink-0 border ${
                      activePlatformTab === tab.id
                        ? 'bg-[#c9a875] text-black border-[#dfbd87] shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {['Blinding Lights', 'Starboy', 'IT Theme', 'M. Anıl Emre', 'Hum Murtaza', 'Kesariya', 'Interstellar'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setSearchQuery(sug);
                      executeUniversalSearch(sug);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-[#c9a875]/20 text-[10px] text-neutral-300 hover:text-[#dfbd87] font-mono-code transition-colors shrink-0 cursor-pointer border border-white/10"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Track List Area (flex-1 min-h-0 overflow-y-auto) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5 my-1">
              {isSearching && (
                <div className="py-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-spin text-[#c9a875]" />
                  Searching YouTube, Spotify & JioSaavn...
                </div>
              )}
              {currentDisplayTracks.map((track) => {
                const isSelected = currentTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className={`w-full text-left p-2 rounded-lg border transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-sm'
                        : 'bg-black/40 border-white/5 hover:border-white/20 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded bg-black/60 shrink-0 overflow-hidden border border-white/10">
                      <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold truncate">{track.title}</span>
                        {renderPlatformBadge(track.platform)}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expand View Footer (Protected flex-shrink-0) */}
            <div className="pt-2 shrink-0">
              <button
                onClick={() => {
                  setIsExpandedModal(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full py-2 bg-[#c9a875]/10 hover:bg-[#c9a875]/20 border border-[#c9a875]/40 text-[#dfbd87] text-xs font-mono-code font-bold uppercase tracking-wider rounded-lg transition-all text-center cursor-pointer"
              >
                Open Full Studio Lounge +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FULL EXPANDED UNIVERSAL MUSIC STUDIO LOUNGE MODAL (ALL VISIBLE AT ONCE)
         ───────────────────────────────────────────────────────────── */}
      {isExpandedModal && (
        <div
          id="expanded-music-lounge-modal"
          className="fixed inset-0 z-[999999] bg-black/92 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-150"
          style={{ width: '100vw', height: '100vh' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExpandedModal(false);
          }}
        >
          <div
            className="relative w-full max-w-5xl flex flex-col bg-[#080a0f] border border-[#c9a875]/40 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden text-neutral-100"
            style={{ height: 'calc(100vh - 36px)', maxHeight: '820px', minHeight: '480px' }}
          >
            {/* 1. Sleek Single-Line Top Header (shrink-0) */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-[#0c0e15] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  id="music-modal-go-back-btn"
                  onClick={() => setIsExpandedModal(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#c9a875] text-white hover:text-black font-semibold text-xs transition-all cursor-pointer border border-white/15 hover:border-[#c9a875] shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Gallery</span>
                </button>

                <div className="h-4 w-px bg-white/15 hidden sm:block shrink-0" />

                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-xs sm:text-sm font-serif font-bold text-white tracking-wide truncate">
                    Universal Music Sanctuary
                  </h3>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[9px] uppercase tracking-widest font-mono-code font-bold bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 rounded-full shrink-0">
                    YouTube • Spotify • JioSaavn • Gaana
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsExpandedModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Fixed Top Search & Filter Station (Always 100% Visible, shrink-0) */}
            <div className="p-3 bg-[#0a0c12] border-b border-white/10 space-y-2 shrink-0">
              {/* Universal Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search any song (e.g. Hum Murtaza, Kesariya, Interstellar, Pasoori)..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                      executeUniversalSearch(searchQuery);
                    }
                  }}
                  className="w-full pl-10 pr-9 py-2 bg-black/70 border border-white/15 focus:border-[#c9a875] rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      executeUniversalSearch('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Trending Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[9px] uppercase font-mono-code text-[#c9a875] font-bold shrink-0">
                  Trending Vault:
                </span>
                {['Blinding Lights', 'Starboy', 'IT Theme', 'M. Anıl Emre', 'Hum Murtaza', 'Kesariya', 'Interstellar', 'Humsafar', 'Belki', 'Experience', 'Pasoori'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setSearchQuery(sug);
                      executeUniversalSearch(sug);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#c9a875]/25 text-[10px] text-neutral-300 hover:text-white font-mono-code transition-colors shrink-0 cursor-pointer border border-white/10 hover:border-[#c9a875]/50"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Multi-Platform & Collection Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                {[
                  { id: 'all', label: 'All Tracks', count: searchResults.all.length },
                  { id: 'vault', label: '👑 Vault Music Collection', count: searchResults.vault.length },
                  { id: 'sanctuary', label: 'Sanctuary Classics', count: searchResults.sanctuary.length },
                  { id: 'youtube', label: 'YouTube Music', count: searchResults.youtube.length },
                  { id: 'spotify', label: 'Spotify Releases', count: searchResults.spotify.length },
                  { id: 'jiosaavn', label: 'JioSaavn Streams', count: searchResults.jiosaavn.length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePlatformTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      activePlatformTab === tab.id
                        ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[9px] font-mono-code">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Compact Active Playing Strip (If track is loaded, shrink-0) */}
            {currentTrack && (
              <div className="px-4 py-2 bg-gradient-to-r from-neutral-950 via-[#101420] to-neutral-950 border-b border-[#c9a875]/30 flex items-center justify-between gap-3 shrink-0">
                {/* Left: Artwork + Title */}
                <div className="flex items-center gap-2.5 min-w-0 w-1/3">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-black shrink-0 border border-[#c9a875]/40">
                    <img
                      src={currentTrack.artworkUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875] animate-ping" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                      {renderPlatformBadge(currentTrack.platform)}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate">{currentTrack.artist}</p>
                  </div>
                </div>

                {/* Center: Controls & Scrubber */}
                <div className="flex items-center gap-2.5 justify-center flex-1">
                  <button
                    onClick={handleRestartFromBeginning}
                    className="p-1 text-neutral-400 hover:text-[#c9a875] cursor-pointer"
                    title="0:00 Restart"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handlePreviousTrack}
                    className="p-1 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-full bg-[#c9a875] hover:bg-[#dfbd87] text-black font-bold cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-1 text-neutral-300 hover:text-white cursor-pointer"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  {/* Scrubber */}
                  <div className="hidden sm:flex items-center gap-1.5 w-36 md:w-48">
                    <span className="text-[9px] font-mono-code text-[#c9a875]">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full h-1 accent-[#c9a875] bg-white/10 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] font-mono-code text-neutral-400">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right: Volume */}
                <div className="hidden md:flex items-center gap-1.5 justify-end w-1/4">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-neutral-400 hover:text-[#c9a875] cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#c9a875]" />}
                  </button>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="w-16 h-1 accent-[#c9a875] bg-neutral-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 4. Scrollable Song Results Grid (Guaranteed flex-1 min-h-0 overflow-y-auto) */}
            <div
              className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2"
              style={{ flexGrow: 1, flexShrink: 1, minHeight: '220px' }}
            >
              {isSearching && (
                <div className="py-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <Radio className="w-4 h-4 animate-spin text-[#c9a875]" />
                  Searching YouTube, Spotify, JioSaavn & Gaana...
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-4">
                {currentDisplayTracks.map((track) => {
                  const isSelected = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handlePlayTrack(track)}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                        isSelected
                          ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-md'
                          : 'bg-black/50 border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10">
                          <img
                            src={track.artworkUrl}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-[#c9a875] animate-ping" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                          <p className="text-[10px] text-neutral-300 truncate">{track.artist}</p>
                          <div className="mt-0.5">{renderPlatformBadge(track.platform)}</div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track);
                        }}
                        className={`p-2 rounded-full transition-all shrink-0 cursor-pointer ${
                          isSelected && isPlaying
                            ? 'bg-[#c9a875] text-black shadow-md'
                            : 'bg-white/10 hover:bg-[#c9a875] text-white hover:text-black'
                        }`}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Sleek Fixed Modal Bottom Footer (shrink-0) */}
            <div className="px-4 py-2 bg-neutral-950 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
              <div className="flex items-center gap-2">
                <RadioTower className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Multi-platform music streaming across all gallery views.</span>
                <span className="sm:hidden">Continuous background playback.</span>
              </div>
              <button
                onClick={() => setIsExpandedModal(false)}
                className="px-3.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
