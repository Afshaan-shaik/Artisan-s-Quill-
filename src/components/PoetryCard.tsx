import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Heart, Bookmark, BookMarked, Volume2, VolumeX, Eye,
  Share2, Sparkles, Check, X, Wind, Layers, Smartphone, Feather
} from 'lucide-react';
import { Artwork } from '../types';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { getSoothingFemaleVoice } from '../utils/speechUtils';
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
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.01em] text-white leading-tight">
              {artwork.title}
            </h2>
            {poetry.subtitle && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a875]/60 mt-3 font-mono-code">
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
                        className={`font-editorial font-light text-xl sm:text-2xl md:text-3xl leading-[1.85] transition-all duration-300 ease-out ${
                          isLineActive
                            ? 'text-[#f8e7c9] border-l-2 border-[#dfbd87] pl-4 drop-shadow-[0_0_18px_rgba(201,168,117,0.6)]'
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
  const [activeLine, setActiveLine] = useState<ActiveLineState | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isStoryExporterOpen, setIsStoryExporterOpen] = useState(false);
  const [inQueue, setInQueue] = useState(() => GalleryService.isInReadingQueue(artwork.id));
  const isRecitingRef = React.useRef(false);
  const poetry = artwork.poetryContent;

  useEffect(() => {
    isRecitingRef.current = isReciting;
    if (!isReciting && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveLine(null);
    }
  }, [isReciting]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!poetry) return null;

  // Real-time line-by-line speech recitation engine with soothing female voice
  const handleRecite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isReciting) {
      window.speechSynthesis.cancel();
      setIsReciting(false);
      setActiveLine(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsReciting(true);
    isRecitingRef.current = true;

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
      return;
    }

    let linePointer = 0;

    const reciteNextLine = () => {
      if (!isRecitingRef.current || linePointer >= linesToRead.length) {
        setIsReciting(false);
        setActiveLine(null);
        return;
      }

      const item = linesToRead[linePointer];
      setActiveLine({ stanzaIdx: item.stanzaIdx, lineIdx: item.lineIdx });

      const utterance = new SpeechSynthesisUtterance(item.text);
      const femaleVoice = getSoothingFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      utterance.rate = 0.88; // Soothing, gentle poetic cadence
      utterance.pitch = 1.05; // Calm female timbre

      utterance.onend = () => {
        if (!isRecitingRef.current) return;
        linePointer++;
        setTimeout(reciteNextLine, 120); // Seamless, natural breath between verses
      };

      utterance.onerror = () => {
        setIsReciting(false);
        setActiveLine(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    reciteNextLine();
  }, [isReciting, poetry]);

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

  const authorInitials = getAuthorInitials(artwork.artist.name);
  const firstStanza = poetry.stanzas[0] || '';
  const firstLetter = firstStanza.charAt(0);
  const restOfFirstStanza = firstStanza.slice(1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        id={`poetry-card-${artwork.id}`}
        data-artwork-title={artwork.title}
        onClick={() => onSelect(artwork)}
        className="group poetry-tile p-7 sm:p-9 md:p-10 flex flex-col justify-between items-center text-center relative cursor-pointer transition-all duration-500 ease-out overflow-hidden min-h-[420px] max-h-[520px]"
      >
        {/* Author Watermark */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="font-serif-display text-[9rem] sm:text-[11rem] md:text-[13rem] font-light text-[#c9a875] opacity-[0.03] tracking-tighter leading-none transform translate-y-2">
            {authorInitials}
          </span>
        </div>

        {/* Poetry tag — editorial monochrome */}
        <div className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.18em] text-[#c9a875]/70 font-mono-code z-10">
          Verse
        </div>

        {/* Top-Right Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
          {/* Bard Symphony Studio */}
          {onOpenBardModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenBardModal({
                  title: artwork.title,
                  author: artwork.artist.name,
                  authorHandle: artwork.artist.handle,
                  content: poetry.stanzas.join('\n\n')
                });
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[#dfbd87]/50 bg-gradient-to-r from-[#c9a875]/25 via-white/5 to-[#c9a875]/10 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black transition-all duration-300 cursor-pointer backdrop-blur-md text-[9px] uppercase tracking-widest font-mono-code font-bold shadow-md hover:shadow-[0_0_18px_rgba(201,168,117,0.45)]"
              title="Recite with AI Bard Symphony"
            >
              <Feather className="w-3 h-3 text-[#dfbd87]" />
              <span>Bard</span>
            </button>
          )}

          {/* Zen Mode Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsZenMode(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#c9a875]/40 bg-black/70 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black transition-all duration-300 cursor-pointer backdrop-blur-md text-[9px] uppercase tracking-widest font-mono-code font-bold shadow-md hover:shadow-[0_0_18px_rgba(201,168,117,0.45)]"
            title="Enter Zen Focus Mode"
          >
            <Eye className="w-3 h-3 text-[#c9a875] group-hover:text-black" />
            <span>Zen</span>
          </button>

          {/* Recite */}
          <button
            onClick={handleRecite}
            className={`p-1.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isReciting
                ? 'bg-[#c9a875] text-black border-[#dfbd87] shadow-[0_0_15px_rgba(201,168,117,0.6)]'
                : 'bg-black/70 border-white/10 text-neutral-300 hover:text-white hover:bg-black/90 hover:border-[#c9a875]/40'
            }`}
            title={isReciting ? 'Stop Recitation' : 'Listen to Recital'}
          >
            {isReciting ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#c9a875]" />}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`group/btn relative p-1.5 rounded-xl border backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md ${
              isCopied
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105'
                : 'bg-black/80 border-[#c9a875]/40 text-[#dfbd87] hover:bg-gradient-to-r hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black hover:border-[#dfbd87] hover:shadow-[0_0_20px_rgba(201,168,117,0.4)] hover:scale-105'
            }`}
            title="Share and Curate Artwork"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-black" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Poem Header */}
        <div className="mt-6 mb-5 relative z-10 w-full">
          <h3 className="font-editorial text-xl sm:text-2xl font-light tracking-[-0.01em] text-white mb-1 leading-tight">
            {artwork.title}
          </h3>
          {poetry.subtitle && (
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#c9a875]/60 font-mono-code">
              {poetry.subtitle}
            </p>
          )}
        </div>

        {/* Poem Body (Curated Gallery Preview) */}
        <div className="space-y-4 relative z-10 w-full flex-1 flex flex-col justify-center overflow-hidden">
          <div className="font-editorial font-light text-lg sm:text-xl leading-[1.8] text-neutral-200 whitespace-pre-line text-center line-clamp-4">
            {firstStanza.split('\n').map((line, lIdx) => {
              const isLineActive = activeLine?.stanzaIdx === 0 && activeLine?.lineIdx === lIdx;
              return (
                <span
                  key={lIdx}
                  className={`block transition-all duration-300 ${
                    isLineActive
                      ? 'text-[#f5dfb8] font-normal drop-shadow-[0_0_18px_rgba(201,168,117,0.8)] bg-[#c9a875]/20 px-2 py-0.5 rounded border-l-2 border-[#dfbd87]'
                      : 'text-neutral-200'
                  }`}
                >
                  {lIdx === 0 ? (
                    <>
                      <span className="inline-block float-left font-editorial text-4xl sm:text-5xl text-[#c9a875] font-light leading-[0.85] mr-2 -mt-0.5 select-none">
                        {firstLetter}
                      </span>
                      <span>{restOfFirstStanza.split('\n')[0]}</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              );
            })}
          </div>

          {poetry.stanzas.length > 1 && (
            <div className="font-editorial font-light text-base sm:text-lg leading-[1.75] text-neutral-400 whitespace-pre-line line-clamp-3">
              {poetry.stanzas[1].split('\n').map((line, lIdx) => {
                const isLineActive = activeLine?.stanzaIdx === 1 && activeLine?.lineIdx === lIdx;
                return (
                  <span
                    key={lIdx}
                    className={`block transition-all duration-300 ${
                      isLineActive
                        ? 'text-[#f5dfb8] font-normal drop-shadow-[0_0_18px_rgba(201,168,117,0.8)] bg-[#c9a875]/20 px-2 py-0.5 rounded border-l-2 border-[#dfbd87]'
                        : 'text-neutral-400'
                    }`}
                  >
                    {line}
                  </span>
                );
              })}
            </div>
          )}

          {poetry.stanzas.length > 2 && (
            <div className="pt-1">
              <span 
                onClick={(e) => { e.stopPropagation(); setIsZenMode(true); }}
                className="inline-flex items-center gap-1 text-[10px] uppercase font-mono-code tracking-widest text-[#c9a875] hover:text-white transition-colors cursor-pointer border-b border-[#c9a875]/40 hover:border-white pb-0.5"
              >
                + {poetry.stanzas.length - 2} more stanza{poetry.stanzas.length - 2 > 1 ? 's' : ''} in Zen Mode →
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 h-[1px] w-14 bg-gradient-to-r from-transparent via-[#c9a875]/60 to-transparent relative z-10 shrink-0" />

        <div className="mt-3 flex flex-col items-center gap-2 w-full relative z-10 shrink-0">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[#dfbd87] hover:text-white transition-colors z-10 font-serif font-bold cursor-pointer"
            onClick={(e) => onSelectArtist(artwork.artist.id, e)}
          >
            {artwork.artist.name}
          </p>

          <div className="flex items-center gap-4 sm:gap-6 mt-2 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleLikeWithConfetti}
              className={`flex items-center gap-1.5 text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isLiked ? 'text-rose-400' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${artwork.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{artwork.likesCount}</span>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(artwork.id, e); }}
              className={`flex items-center gap-1.5 text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                artwork.isSaved ? 'text-[#c9a875]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'fill-[#c9a875] text-[#c9a875]' : ''}`} />
              <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#dfbd87] hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#c9a875]" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isCopied && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute inset-x-0 bottom-4 text-center z-30 pointer-events-none"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black/95 border border-[#c9a875] text-[#dfbd87] text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(201,168,117,0.5)] rounded-full">
                <Check className="w-3 h-3 text-[#c9a875]" />
                <span>Copied Link to Clipboard</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
    </>
  );
};
