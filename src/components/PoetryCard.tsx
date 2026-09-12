import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart, Bookmark, BookMarked, Volume2, VolumeX, Eye,
  Share2, Sparkles, Check, X, Wind, Layers, Smartphone, Feather,
  Mic, ChevronDown
} from 'lucide-react';
import { Artwork, VoiceAccentOption } from '../types';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { detectPoemLanguage, preparePoeticTextForVoice } from '../utils/speechUtils';
import { VOICE_ACCENT_PROFILES, resolvePoeticVoice, isAfshaanShaikh } from '../utils/afshaanVoiceEngine';
import { VoiceRecitalStudioModal } from './VoiceRecitalStudioModal';
import { PoetryCardExporterModal } from './PoetryCardExporterModal';
import { GalleryService } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PoetryCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShare?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  onAddToReadingQueue?: (artwork: Artwork) => void;
  onOpenBardModal?: (poem: { title: string; author: string; authorHandle?: string; content: string }) => void;
  isCompact?: boolean;
}

// ─── Zen Mode Mist Particles ──────────────────────────────────────────────────

interface MistParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const generateMist = (count: number): MistParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 8 + 10,
    delay: Math.random() * 12,
    opacity: Math.random() * 0.35 + 0.08,
  }));

const MIST_PARTICLES = generateMist(55);

// ─── Zen Mode Overlay ─────────────────────────────────────────────────────────

export interface ActiveLineState {
  stanzaIdx: number;
  lineIdx: number;
}

interface ZenOverlayProps {
  artwork: Artwork;
  isReciting: boolean;
  activeLine: ActiveLineState | null;
  onClose: () => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onShare?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  onRecite: (e: React.MouseEvent) => void;
  onOpenStoryExporter?: () => void;
}

const ZenOverlay: React.FC<ZenOverlayProps> = ({
  artwork,
  isReciting,
  activeLine,
  onClose,
  onToggleLike,
  onToggleSave,
  onShare,
  onAddToMoodBoard,
  onRecite,
  onOpenStoryExporter,
}) => {
  const poetry = artwork.poetryContent!;
  const [isCopied, setIsCopied] = useState(false);

  // Escape key + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(artwork);
    } else {
      const text = `"${artwork.title}" by ${artwork.artist.name}\n\n${poetry.stanzas.join('\n\n')}\n\n— The Artisan's Quill\n${window.location.origin}?artwork=${encodeURIComponent(artwork.id)}`;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 }, colors: ['#c9a875', '#dfbd87', '#ffffff'] });
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!artwork.isLiked) {
      confetti({ particleCount: 24, spread: 50, origin: { y: 0.8 }, colors: ['#c9a875', '#e4d2b2', '#ffffff'] });
    }
    onToggleLike(artwork.id, e);
  };

  const overlay = (
    <AnimatePresence>
      <motion.div
        key="zen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #0d1117 0%, #060809 60%, #020304 100%)' }}
        onClick={onClose}
      >
        {/* Mist / Rain Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {MIST_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${p.x}%`,
                top: '-12px',
                width: `${p.size}px`,
                height: `${p.size * 18}px`,
                opacity: p.opacity,
                filter: 'blur(0.5px)',
              }}
              animate={{ y: ['0vh', '115vh'] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.88) 100%)' }}
        />

        {/* Poem scroll — click inside here does NOT close overlay */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative z-10 max-w-2xl w-full mx-6 max-h-[90vh] overflow-y-auto no-scrollbar text-center flex flex-col items-center gap-8 py-14 px-6 sm:px-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Controls row */}
          <div className="absolute top-4 right-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onRecite}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                isReciting
                  ? 'bg-[#c9a875] text-black border-[#dfbd87] shadow-[0_0_20px_rgba(201,168,117,0.7)]'
                  : 'bg-black/60 border-white/10 text-neutral-300 hover:text-white hover:border-[#c9a875]/50'
              }`}
              title={isReciting ? 'Stop Recitation' : 'Listen to AI Voice Recital'}
            >
              {isReciting ? <VolumeX className="w-4 h-4 text-black" /> : <Volume2 className="w-4 h-4 text-[#c9a875]" />}
            </button>
            {onOpenStoryExporter && (
              <button
                onClick={onOpenStoryExporter}
                className="p-2.5 rounded-xl border border-[#c9a875]/40 bg-black/60 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black hover:border-[#dfbd87] backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="Export Instagram Story or Wallpaper"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}
            <button
              id="zen-share-btn"
              onClick={handleShare}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-lg ${
                isCopied
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-black/60 border-[#c9a875]/40 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black hover:border-[#dfbd87]'
              }`}
              title="Share and Curate Poem"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all cursor-pointer backdrop-blur-md shadow-lg"
              title="Exit Zen Mode (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zen label & Live Recitation Indicator */}
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-mono-code select-none">
            {isReciting ? (
              <span className="flex items-center gap-2 text-[#dfbd87] px-3 py-1 rounded-full bg-[#c9a875]/20 border border-[#c9a875]/40 animate-pulse">
                <Volume2 className="w-3 h-3 text-[#c9a875]" />
                <span>AI Recital in Progress</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[#c9a875]/60">
                <Wind className="w-3 h-3" />
                <span>Zen Mode Sanctuary</span>
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-white leading-tight">
              {artwork.title}
            </h2>
            {poetry.subtitle && (
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a875]/70 mt-3 font-mono-code">
                {poetry.subtitle}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#c9a875]/50 to-transparent" />

          {/* ALL stanzas with active spoken verse tracking */}
          <div className="space-y-10 w-full">
            {poetry.stanzas.map((stanza, sIdx) => {
              const lines = stanza.split('\n');
              return (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + sIdx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3 w-full"
                >
                  {lines.map((line, lIdx) => {
                    const isLineActive = activeLine?.stanzaIdx === sIdx && activeLine?.lineIdx === lIdx;
                    return (
                      <p
                        key={lIdx}
                        className={`font-serif-display italic text-xl sm:text-2xl md:text-3xl leading-[1.85] transition-all duration-300 ease-out ${
                          isLineActive
                            ? 'text-[#f8e7c9] font-normal scale-[1.02] drop-shadow-[0_0_22px_rgba(201,168,117,0.85)] bg-gradient-to-r from-[#c9a875]/25 via-[#c9a875]/10 to-transparent px-4 py-2 rounded-xl border-l-4 border-[#dfbd87]'
                            : 'text-neutral-200'
                        }`}
                      >
                        {line}
                      </p>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#c9a875]/50 to-transparent" />

          {/* Author */}
          <p className="text-sm uppercase tracking-[0.25em] text-[#dfbd87] font-serif font-bold">
            {artwork.artist.name}
          </p>

          {/* Like / Save / Vault */}
          <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isLiked ? 'text-rose-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{artwork.likesCount}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(artwork.id, e); }}
              className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isSaved ? 'text-[#c9a875]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : ''}`} />
              <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Close hint */}
          <p className="text-[10px] text-neutral-600 font-mono-code tracking-widest select-none">
            Click backdrop or press Esc to return
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
};

// ─── PoetryCard ───────────────────────────────────────────────────────────────

export const PoetryCard: React.FC<PoetryCardProps> = ({
  artwork,
  onSelect,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShare,
  onAddToMoodBoard,
  onAddToReadingQueue,
  onOpenBardModal,
  isCompact = false
}) => {
  const [isReciting, setIsReciting] = useState(false);
  const [recitationVoiceBadge, setRecitationVoiceBadge] = useState<string>('');
  const [activeLine, setActiveLine] = useState<ActiveLineState | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isStoryExporterOpen, setIsStoryExporterOpen] = useState(false);
  const [inQueue, setInQueue] = useState(() => GalleryService.isInReadingQueue(artwork.id));
  const isRecitingRef = React.useRef(false);
  const poetry = artwork.poetryContent;

  const isAuthorAfshaan = isAfshaanShaikh(artwork.artist.name, artwork.artist.handle);
  const [selectedAccent, setSelectedAccent] = useState<VoiceAccentOption>(
    () => poetry?.preferredVoiceAccent || (isAuthorAfshaan ? 'founder-poet' : 'auto-detect')
  );
  const [isAccentMenuOpen, setIsAccentMenuOpen] = useState(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState(false);
  const [isPlayingAudioRecording, setIsPlayingAudioRecording] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    isRecitingRef.current = isReciting;
    if (!isReciting) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsPlayingAudioRecording(false);
      setActiveLine(null);
      setRecitationVoiceBadge('');
    }
  }, [isReciting]);

  // Clean up speech and audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, []);

  if (!poetry) return null;

  // Real-time recitation engine with multi-accent & founder genuine voice support
  const handleRecite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    // ── CASE 1: Genuine Recorded Oral Recital Available ──
    if (poetry.audioRecitationUrl) {
      if (isPlayingAudioRecording && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsPlayingAudioRecording(false);
        setIsReciting(false);
        setActiveLine(null);
        setRecitationVoiceBadge('');
        return;
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (!audioPlayerRef.current || audioPlayerRef.current.src !== poetry.audioRecitationUrl) {
        audioPlayerRef.current = new Audio(poetry.audioRecitationUrl);

        audioPlayerRef.current.onended = () => {
          setIsPlayingAudioRecording(false);
          setIsReciting(false);
          setActiveLine(null);
          setRecitationVoiceBadge('');
        };

        audioPlayerRef.current.onerror = () => {
          setIsPlayingAudioRecording(false);
          setIsReciting(false);
          setActiveLine(null);
          setRecitationVoiceBadge('');
        };
      }

      audioPlayerRef.current.play();
      setIsPlayingAudioRecording(true);
      setIsReciting(true);
      setRecitationVoiceBadge(
        isAuthorAfshaan
          ? "🎙️ Afshaan Shaikh (Original Voice Recital)"
          : "🎙️ Poet's Original Voice Recital"
      );
      return;
    }

    // ── CASE 2: Multi-Accent Speech Synthesis Engine ──
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isReciting) {
      window.speechSynthesis.cancel();
      setIsReciting(false);
      setActiveLine(null);
      setRecitationVoiceBadge('');
      return;
    }

    window.speechSynthesis.cancel();
    setIsReciting(true);
    isRecitingRef.current = true;

    const allPoemText = poetry.stanzas.join(' ') + ' ' + artwork.title;
    const resolvedPlan = resolvePoeticVoice(selectedAccent, allPoemText, artwork.artist.name, artwork.artist.handle);

    setRecitationVoiceBadge(`✦ ${resolvedPlan.accentLabel} • ${resolvedPlan.voiceLabel}`);

    // Flatten all lines across stanzas with coordinate mapping
    const linesToRead: { stanzaIdx: number; lineIdx: number; text: string }[] = [];
    poetry.stanzas.forEach((stanza, sIdx) => {
      const stanzaLines = stanza.split('\n').map((l) => l.trim()).filter(Boolean);
      stanzaLines.forEach((line, lIdx) => {
        linesToRead.push({ stanzaIdx: sIdx, lineIdx: lIdx, text: line });
      });
    });

    if (linesToRead.length === 0) {
      setIsReciting(false);
      setRecitationVoiceBadge('');
      return;
    }

    let linePointer = 0;

    const reciteNextLine = () => {
      if (!isRecitingRef.current || linePointer >= linesToRead.length) {
        setIsReciting(false);
        setActiveLine(null);
        setRecitationVoiceBadge('');
        return;
      }

      const item = linesToRead[linePointer];
      setActiveLine({ stanzaIdx: item.stanzaIdx, lineIdx: item.lineIdx });

      const spokenText = preparePoeticTextForVoice(
        item.text,
        resolvedPlan.accentId === 'native-urdu-hindi' || resolvedPlan.isFounder
      );
      const utterance = new SpeechSynthesisUtterance(spokenText);
      if (resolvedPlan.voice) {
        utterance.voice = resolvedPlan.voice;
      }
      utterance.rate = resolvedPlan.rate;
      utterance.pitch = resolvedPlan.pitch;

      utterance.onend = () => {
        if (!isRecitingRef.current) return;
        linePointer++;
        setTimeout(reciteNextLine, resolvedPlan.isFounder || resolvedPlan.accentId === 'native-urdu-hindi' ? 180 : 130);
      };

      utterance.onerror = () => {
        setIsReciting(false);
        setActiveLine(null);
        setRecitationVoiceBadge('');
      };

      window.speechSynthesis.speak(utterance);
    };

    reciteNextLine();
  }, [
    isReciting,
    isPlayingAudioRecording,
    poetry,
    artwork.title,
    artwork.artist.name,
    artwork.artist.handle,
    selectedAccent,
    isAuthorAfshaan
  ]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(artwork);
    } else {
      const shareText = `"${artwork.title}" by ${artwork.artist.name}\n\n${poetry.stanzas.join('\n\n')}\n\nRead on The Artisan's Quill:\n${window.location.origin}?artwork=${encodeURIComponent(artwork.id)}`;
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.7 }, colors: ['#c9a875', '#dfbd87', '#ffffff'] });
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  const handleLikeWithConfetti = (e: React.MouseEvent) => {
    if (!artwork.isLiked) {
      confetti({ particleCount: 24, spread: 50, origin: { y: 0.8 }, colors: ['#c9a875', '#e4d2b2', '#ffffff'] });
    }
    onToggleLike(artwork.id, e);
  };

  const getAuthorInitials = (name: string): string => {
    if (!name) return 'AQ';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Hover Aesthetic Theme: Option 1 (Default: Black & Gold Obsidian) vs Option 2 (Paper Aesthetic)
  const [aestheticTheme, setAestheticTheme] = useState<'obsidian' | 'parchment'>(() => {
    if (artwork.poetryContent?.theme === 'vellum') return 'parchment';
    return 'obsidian';
  });

  const getRomanNumber = (): string => {
    if (poetry.poemNumber) {
      return poetry.poemNumber.replace(/\.+$/, '');
    }
    const numMatch = artwork.id.match(/\d+/);
    if (numMatch) {
      const n = parseInt(numMatch[0], 10);
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      if (romans[n - 1]) return romans[n - 1];
    }
    return 'I';
  };
  const romanNumber = getRomanNumber();

  const getSeriesAttribution = (): string => {
    const authorUpper = (artwork.artist.name || 'AFSHAAN SHAIKH').toUpperCase();
    const year = artwork.year || 2026;
    const seriesName = aestheticTheme === 'obsidian'
      ? 'OBSIDIAN VELLUM SERIES'
      : 'COFFEE-STAINED PARCHMENT SERIES';
    return `— ${authorUpper}, ${year} • ${seriesName}`;
  };

  const accessionCode = `CAT. #AQ-POEM-${(artwork.id.match(/\d+$/)?.[0] || artwork.id.slice(-3)).padStart(3, '0').toUpperCase()}`;

  // Stanza rendering logic matching luxury format with active line recitation support
  const renderStanzas = () => {
    const isMarginalia = artwork.title.toLowerCase().includes('marginalia');
    const isSecondCup = artwork.title.toLowerCase().includes('second cup');
    const isLateKettle = artwork.title.toLowerCase().includes('late kettle') || artwork.title.toLowerCase().includes('kettle');

    if (isMarginalia) {
      return (
        <div className="poetry-stanzas space-y-3">
          <p>
            I have always written in the margins,<br />
            that narrow corridor between the printed<br />
            and the felt — a country of small addenda<br />
            where the real argument lives.
          </p>
          <p className="mt-3">
            We annotate what we cannot answer.
          </p>
        </div>
      );
    }

    if (isSecondCup) {
      return (
        <div className="poetry-stanzas space-y-3">
          <p>
            The second cup is always the honest one:<br />
            poured not from want but from the refusal<br />
            to let the morning end before<br />
            we understood what it was trying to say.
          </p>
          <p className="mt-3">
            There is still this light.
          </p>
        </div>
      );
    }

    if (isLateKettle) {
      return (
        <div className="poetry-stanzas space-y-3">
          <p>
            The kettle boils for no one now,<br />
            a thin white column, patient, spent.<br />
            I keep refilling what has gone<br />
            because the habit has not left.
          </p>
          <p className="mt-3">
            The cup I set for you grows cold<br />
            in the particular silence of the late.
          </p>
        </div>
      );
    }

    // Dynamic fallback for any other poem or creator uploads
    const s0Lines = (poetry.stanzas[0] || '').split('\n').filter(Boolean);
    return (
      <div className="poetry-stanzas space-y-3">
        <p>
          {s0Lines.slice(0, 4).map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </p>
        {poetry.stanzas.length > 1 && (
          <p className="mt-2 text-sm opacity-90 italic">
            {(poetry.stanzas[1] || '').split('\n').slice(0, 2).join('\n')}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        id={`poetry-card-${artwork.id}`}
        data-artwork-title={artwork.title}
        onClick={() => onSelect(artwork)}
        className="relative group overflow-hidden museum-shadowbox rounded-xl border border-white/10 hover:border-[#c9a875]/60 shadow-2xl cursor-pointer w-full transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_25px_rgba(201,168,117,0.2)] hover:z-10 bg-[#06080d] p-2 sm:p-2.5 flex flex-col justify-between"
      >
        {/* ── Hover 2-Option Aesthetic Switcher (Black & Gold vs Paper Aesthetic) ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 p-1 rounded-full bg-black/85 border border-[#c9a875]/50 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.85)] pointer-events-auto"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAestheticTheme('obsidian');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              aestheticTheme === 'obsidian'
                ? 'bg-[#c9a875] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.6)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title="Default View: Black & Golden Obsidian Vellum"
          >
            <span>✦ Black &amp; Gold</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAestheticTheme('parchment');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              aestheticTheme === 'parchment'
                ? 'bg-[#c9a875] text-black font-bold shadow-[0_0_12px_rgba(201,168,117,0.6)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title="Option 2: Paper Aesthetic (Coffee-Stained Parchment)"
          >
            <span>📜 Paper</span>
          </button>
        </div>

        {/* ── Hover Studio Tool Capsule (Bard, Zen, Recite, Share) ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-4 left-4 z-30 ${
            isReciting ? 'opacity-100 ring-1 ring-[#c9a875]' : 'opacity-0 group-hover:opacity-100'
          } transition-all duration-300 flex items-center gap-1 p-1 rounded-full bg-black/80 border border-white/15 backdrop-blur-md shadow-md pointer-events-auto`}
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
              className="p-1.5 rounded-full hover:bg-white/10 text-[#dfbd87] hover:text-white transition-colors cursor-pointer"
              title="Recite with AI Bard Symphony"
            >
              <Feather className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZenMode(true);
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#c9a875] hover:text-white transition-colors cursor-pointer"
            title="Enter Zen Focus Reading Mode"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRecite}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isReciting ? 'bg-[#c9a875] text-black' : 'text-neutral-300 hover:text-white hover:bg-white/10'
            }`}
            title={
              isReciting
                ? 'Stop Recital'
                : poetry.audioRecitationUrl
                ? 'Listen to Genuine Voice Recital'
                : 'Listen to Voice Recitation'
            }
          >
            {isReciting ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#c9a875]" />}
          </button>

          {/* ── Accent & Recitation Options Dropdown Trigger ── */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAccentMenuOpen(!isAccentMenuOpen);
              }}
              className="px-1.5 py-1 rounded-full hover:bg-white/10 text-[10px] font-mono-code text-[#dfbd87] flex items-center gap-0.5 transition-colors cursor-pointer"
              title="Change Recitation Voice & Accent Mode"
            >
              <span>{VOICE_ACCENT_PROFILES.find((p) => p.id === selectedAccent)?.flag || '✨'}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {/* Accent Dropdown Popover */}
            {isAccentMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-[#0d0f17]/95 border border-[#c9a875]/50 shadow-[0_10px_35px_rgba(0,0,0,0.9)] p-1.5 backdrop-blur-xl z-50 animate-in fade-in duration-150"
              >
                <div className="px-2.5 py-1 border-b border-white/10 text-[9px] font-mono-code uppercase tracking-wider text-[#c9a875] font-semibold flex items-center justify-between">
                  <span>Voice Recitation Mode</span>
                  <span className="text-[8px] text-neutral-400">Options</span>
                </div>

                <div className="py-1 space-y-0.5">
                  {VOICE_ACCENT_PROFILES.map((profile) => {
                    const isSelected = selectedAccent === profile.id;
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccent(profile.id);
                          setIsAccentMenuOpen(false);
                          if (isReciting) {
                            window.speechSynthesis?.cancel();
                            audioPlayerRef.current?.pause();
                            setIsReciting(false);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#c9a875]/25 text-white font-medium'
                            : 'hover:bg-white/10 text-neutral-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm shrink-0">{profile.flag}</span>
                          <span className="text-[11px] truncate">{profile.shortLabel}</span>
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-[#dfbd87]" />}
                      </button>
                    );
                  })}
                </div>

                {/* If author is Afshaan or user is founder, show Record Oral Recital */}
                {isAuthorAfshaan && (
                  <div className="pt-1 border-t border-white/10 mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAccentMenuOpen(false);
                        setIsVoiceStudioOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#dfbd87] hover:bg-[#c9a875]/20 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span className="text-[11px] font-medium">Record in My Voice...</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Share Poem"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#c9a875]" />}
          </button>
        </div>

        {/* ── Recitation Voice & Accent Badge (Urdu/Hindi/Indian Voice Identification) ── */}
        {isReciting && recitationVoiceBadge && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-14 left-4 z-30 animate-in fade-in slide-in-from-top-1 duration-300 pointer-events-auto"
          >
            <div className="px-2.5 py-1 rounded-full bg-black/90 border border-[#c9a875]/70 text-[#f3e3cb] text-[10px] font-mono-code flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.8),0_0_12px_rgba(201,168,117,0.35)] backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-[#c9a875] animate-pulse shrink-0" />
              <span className="truncate max-w-[210px] font-medium">{recitationVoiceBadge}</span>
            </div>
          </div>
        )}

        {/* ── 1. Upper Area: Luxury Poetry Matting ── */}
        <div className={`poetry-parchment-matting theme-${aestheticTheme}`}>
          <div>
            <div className="poetry-number">
              POEM {romanNumber}.
            </div>
            <div className="poetry-card-title">
              {artwork.title}
            </div>
            {renderStanzas()}
          </div>

          <div className="poetry-author">
            {getSeriesAttribution()}
          </div>
        </div>

        {/* ── 2. Lower Area: Museum Caption Plaque ── */}
        <div className="card-caption-plaque px-1">
          <div className="caption-top-row">
            <span className="caption-accession">{accessionCode}</span>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleLikeWithConfetti}
                className="caption-likes hover:text-rose-400 transition-colors cursor-pointer"
                title="Applaud / Like Poem"
              >
                <Heart className={`w-3 h-3 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{artwork.likesCount || 0}</span>
              </button>
            </div>
          </div>

          <div className="card-title truncate">
            {artwork.title}
          </div>

          <div className="card-artist-sub">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onSelectArtist(artwork.artist.id, e);
              }}
              className="hover:text-[#c9a875] transition-colors cursor-pointer truncate max-w-[170px]"
            >
              {artwork.artist.name}
            </span>
            <span className="dot-sep">•</span>
            <span className="truncate">
              {aestheticTheme === 'obsidian' ? 'Obsidian Lyrical Scroll' : 'Lyrical Free Verse'}
            </span>
          </div>
        </div>

        {/* Copied Feedback Pill */}
        <AnimatePresence>
          {isCopied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute inset-x-0 bottom-16 text-center z-40 pointer-events-none"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/95 border border-[#c9a875] text-[#dfbd87] text-[10px] uppercase font-mono-code tracking-widest font-bold shadow-[0_0_20px_rgba(201,168,117,0.5)] rounded-full">
                <Check className="w-3 h-3 text-[#c9a875]" />
                <span>Copied Link</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zen Mode Overlay Portal */}
      {isZenMode && (
        <ZenOverlay
          artwork={artwork}
          isReciting={isReciting}
          activeLine={activeLine}
          onClose={() => setIsZenMode(false)}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onShare={onShare}
          onAddToMoodBoard={onAddToMoodBoard}
          onRecite={handleRecite}
          onOpenStoryExporter={() => setIsStoryExporterOpen(true)}
        />
      )}

      {/* Visual Poetry Card Exporter Modal */}
      {isStoryExporterOpen && (
        <PoetryCardExporterModal
          isOpen={isStoryExporterOpen}
          artwork={artwork}
          onClose={() => setIsStoryExporterOpen(false)}
        />
      )}

      {/* Voice Recital Studio Modal (Record in My Voice) */}
      <VoiceRecitalStudioModal
        isOpen={isVoiceStudioOpen}
        onClose={() => setIsVoiceStudioOpen(false)}
        poemTitle={artwork.title}
        authorName={artwork.artist.name}
        stanzas={poetry.stanzas}
        existingAudioUrl={poetry.audioRecitationUrl}
        onSaveAudioRecital={(audioUrl, duration) => {
          GalleryService.updateArtwork(artwork.id, {
            poetryContent: {
              ...poetry,
              audioRecitationUrl: audioUrl,
              audioRecitationDuration: duration,
              reciterType: 'founder-authentic'
            }
          });
          setIsVoiceStudioOpen(false);
        }}
      />
    </>
  );
};
