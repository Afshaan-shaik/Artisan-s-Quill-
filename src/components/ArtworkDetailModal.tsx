import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Heart,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Send,
  Eye,
  Info,
  Calendar,
  Layers,
  Sun,
  Moon,
  Copy,
  Check,
  Compass,
  Edit3,
  Trash2,
  RotateCcw,
  Sliders,
  Lock,
  ShieldCheck,
  Award,
  Palette,
  ChevronLeft,
  ChevronRight,
  Command,
  Smartphone,
  Feather
} from 'lucide-react';
import { Artwork, Comment, UserProfile } from '../types';
import { GalleryService } from '../services/api';
import { useGalleryStore } from '../store/useGalleryStore';
import { realtimeBroker } from '../services/realtimeBroker';
import { Avatar } from './Avatar';
import { CuratorialToolkit } from './CuratorialToolkit';
import { PoetryCardExporterModal } from './PoetryCardExporterModal';
import { MarginReflectionsDrawer } from './MarginReflectionsDrawer';
import confetti from 'canvas-confetti';
import { getSoothingFemaleVoice } from '../utils/speechUtils';
import { isVideoMedia, isAudioMedia, getMediaPoster } from '../utils/mediaUtils';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  currentUser: UserProfile;
  allArtworks?: Artwork[];
  onNavigateArtwork?: (artwork: Artwork) => void;
  onClose: () => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShare?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
  activeView?: string;
  onEdit?: (artwork: Artwork) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onOpenGalleryWall?: (artwork: Artwork) => void;
  onOpenCertificate?: (artwork: Artwork) => void;
  onOpenColorStudio?: (artwork: Artwork) => void;
  onOpenFragmentInspector?: (artwork: Artwork) => void;
  onOpenBardModal?: (poem: { title: string; author: string; authorHandle?: string; content: string }) => void;
  onOpenScrollModal?: (poem: { title: string; author: string; authorHandle?: string; stanzas: string[]; subtitle?: string }) => void;
}

type GalleryLightingMode = 'obsidian' | 'spotlight' | 'twilight' | 'whitecube';

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  currentUser,
  allArtworks = [],
  onNavigateArtwork,
  onClose,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShare,
  onAddToMoodBoard,
  activeView,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onOpenGalleryWall,
  onOpenCertificate,
  onOpenColorStudio,
  onOpenFragmentInspector,
  onOpenBardModal,
  onOpenScrollModal
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isReciting, setIsReciting] = useState(false);
  const [activeLine, setActiveLine] = useState<{ stanzaIdx: number; lineIdx: number } | null>(null);
  const [lightingMode, setLightingMode] = useState<GalleryLightingMode>('obsidian');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSharedCopied, setIsSharedCopied] = useState(false);
  const [isStoryExporterOpen, setIsStoryExporterOpen] = useState(false);
  const [isMarginDrawerOpen, setIsMarginDrawerOpen] = useState(false);
  const [marginStanzaIdx, setMarginStanzaIdx] = useState<number>(0);
  const [marginVerseSnippet, setMarginVerseSnippet] = useState<string>('');
  const isRecitingRef = React.useRef(false);

  useEffect(() => {
    isRecitingRef.current = isReciting;
    if (!isReciting && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveLine(null);
    }
  }, [isReciting]);

  // Clean up speech synthesis on artwork change or modal close
  useEffect(() => {
    setIsReciting(false);
    setActiveLine(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [artwork?.id]);

  const currentIndex = artwork && allArtworks.length > 0 
    ? allArtworks.findIndex((a) => a.id === artwork.id) 
    : -1;

  const handlePrev = useCallback(() => {
    if (!allArtworks || allArtworks.length <= 1 || !onNavigateArtwork || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + allArtworks.length) % allArtworks.length;
    setIsZoomed(false);
    onNavigateArtwork(allArtworks[prevIdx]);
  }, [allArtworks, currentIndex, onNavigateArtwork]);

  const handleNext = useCallback(() => {
    if (!allArtworks || allArtworks.length <= 1 || !onNavigateArtwork || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allArtworks.length;
    setIsZoomed(false);
    onNavigateArtwork(allArtworks[nextIdx]);
  }, [allArtworks, currentIndex, onNavigateArtwork]);

  const handleShareClick = () => {
    if (!artwork) return;
    if (onShare) {
      onShare(artwork);
    } else {
      const url = `${window.location.origin}${window.location.pathname}?artwork=${artwork.id}`;
      navigator.clipboard.writeText(url);
      setIsSharedCopied(true);
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#dfbd87', '#ffffff']
      });
      setTimeout(() => setIsSharedCopied(false), 2200);
    }
  };

  const resolveArtworkImage = useCallback((art: Artwork | null): string => {
    if (!art) return '/curatorial-masterpiece.svg';
    if (art.mediaUrl && art.mediaUrl.trim() !== '') return art.mediaUrl;
    if (art.thumbnailUrl && art.thumbnailUrl.trim() !== '') return art.thumbnailUrl;
    if (art.id === 'spotlight-masterpiece-1' || art.category === 'digital') return '/curatorial-masterpiece.svg';
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
  }, []);

  const [activeImageSrc, setActiveImageSrc] = useState<string>(() => resolveArtworkImage(artwork));
  const [liveLikesCount, setLiveLikesCount] = useState<number>(() => artwork?.likesCount || 0);
  const [isLikedState, setIsLikedState] = useState<boolean>(() => Boolean(artwork?.isLiked));

  useEffect(() => {
    if (artwork) {
      setActiveImageSrc(resolveArtworkImage(artwork));
      setIsZoomed(false);
      setLiveLikesCount(artwork.likesCount || 0);
      setIsLikedState(Boolean(artwork.isLiked));
      const storeComments = useGalleryStore.getState().getCommentsForArtwork(artwork.id);
      setComments(storeComments.length > 0 ? storeComments : GalleryService.getComments(artwork.id));
    }
  }, [artwork, resolveArtworkImage]);

  // Subscribe to real-time incoming comments and likes across all tabs
  useEffect(() => {
    if (!artwork?.id) return;
    const unsubscribe = realtimeBroker.subscribe((event) => {
      if (event.type === 'COMMENT_ADDED' && event.payload.artworkId === artwork.id) {
        setComments((prev) => {
          if (prev.some((c) => c.id === event.payload.comment.id)) return prev;
          return [event.payload.comment, ...prev];
        });
      } else if (event.type === 'LIKE_UPDATED' && event.payload.artworkId === artwork.id) {
        setLiveLikesCount(event.payload.likesCount);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [artwork?.id]);

  const handleRecite = useCallback(() => {
    if (!artwork) return;
    const poetry = artwork.poetryContent;
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !poetry) return;

    if (isReciting) {
      window.speechSynthesis.cancel();
      setIsReciting(false);
      setActiveLine(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsReciting(true);
    isRecitingRef.current = true;

    // Flatten all lines with coordinate mapping
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
      utterance.rate = 0.88; // Gentle, soothing poetic cadence
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
  }, [artwork, isReciting]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (artwork) {
          onToggleLike(artwork.id, e as any);
          confetti({
            particleCount: 20,
            spread: 45,
            origin: { y: 0.7 },
            colors: ['#c9a875', '#ffffff', '#e53e3e']
          });
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (artwork) onToggleSave(artwork.id, e as any);
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (artwork && onAddToMoodBoard) onAddToMoodBoard(artwork);
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setIsZoomed((prev) => !prev);
      } else if ((e.key === 'r' || e.key === 'R') && artwork?.category === 'poetry') {
        e.preventDefault();
        handleRecite();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [artwork, handlePrev, handleNext, onClose, onToggleLike, onToggleSave, onAddToMoodBoard, handleRecite]);

  if (!artwork) return null;

  const isAuthor = GalleryService.canUserManageArtwork(artwork, currentUser);
  const poetry = artwork.poetryContent;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const added = GalleryService.addComment(artwork.id, newCommentText);
    setComments((prev) => [added, ...prev.filter((c) => c.id !== added.id)]);
    setNewCommentText('');
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const getLightingBackground = () => {
    switch (lightingMode) {
      case 'spotlight':
        return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a2215] via-[#100f0d] to-[#08080a]';
      case 'twilight':
        return 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#172338] via-[#0b101c] to-[#06080e]';
      case 'whitecube':
        return 'bg-[#22242c]';
      case 'obsidian':
      default:
        return 'bg-[#08090d]';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-[#050608]/95 backdrop-blur-2xl">
      <div
        id="artwork-detail-modal"
        className="relative w-full max-w-[90rem] h-full max-h-[95vh] bg-[#050608] border border-white/5 shadow-2xl overflow-hidden flex flex-col font-sans rounded-sm text-neutral-200"
      >
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-noise z-0"></div>
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#050608]/95 backdrop-blur-2xl z-30 shrink-0 min-h-[4.25rem]">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 pr-2">
            <span className="px-2.5 py-1 rounded bg-[#c9a875]/20 backdrop-blur-md border border-[#c9a875]/50 text-[10px] uppercase font-bold tracking-widest text-[#dfbd87] shrink-0">
              {artwork.category}
            </span>
            <h2 className="font-serif-display text-lg sm:text-2xl font-medium tracking-wide text-white truncate uppercase">
              {artwork.title}
            </h2>
            {allArtworks.length > 1 && currentIndex >= 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 border border-[#c9a875]/30 text-[10px] uppercase font-mono-code text-neutral-400 rounded-lg shrink-0">
                <span className="text-[#dfbd87] font-bold">{currentIndex + 1}</span> of {allArtworks.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Gallery Atmosphere Switcher */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/90 border border-[#c9a875]/50 px-3 py-1.5 rounded-xl shadow-[0_0_20px_rgba(201,168,117,0.25)] backdrop-blur-md">
              <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#e8c690] mr-1">
                <Sun className="w-3.5 h-3.5 text-[#c9a875] animate-pulse" />
                LIGHT:
              </span>
              <button
                onClick={() => setLightingMode('obsidian')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  lightingMode === 'obsidian'
                    ? 'bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-extrabold shadow-[0_0_14px_rgba(201,168,117,0.7)] scale-[1.04]'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title="Obsidian Pure Dark"
              >
                Dark
              </button>
              <button
                onClick={() => setLightingMode('spotlight')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  lightingMode === 'spotlight'
                    ? 'bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-extrabold shadow-[0_0_14px_rgba(201,168,117,0.7)] scale-[1.04]'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title="Warm Amber Spotlight"
              >
                Spot
              </button>
              <button
                onClick={() => setLightingMode('twilight')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  lightingMode === 'twilight'
                    ? 'bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-extrabold shadow-[0_0_14px_rgba(201,168,117,0.7)] scale-[1.04]'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title="Twilight Indigo"
              >
                Twilight
              </button>
            </div>

            {/* Consolidated Curatorial Toolkit Ribbon */}
            <CuratorialToolkit
              artwork={artwork}
              onOpenColorStudio={onOpenColorStudio}
              onOpenWallView={onOpenGalleryWall}
              onOpenFragmentInspector={onOpenFragmentInspector}
              onOpenCertificate={onOpenCertificate}
              onOpenStoryExporter={() => setIsStoryExporterOpen(true)}
              onOpenMoodboard={onAddToMoodBoard}
              onShare={handleShareClick}
            />

            {/* Quick Share Button */}
            <button
              id="detail-top-share-btn"
              onClick={handleShareClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-black/90 border border-[#c9a875] text-[#e8c690] hover:bg-gradient-to-r hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black shadow-[0_0_15px_rgba(201,168,117,0.35)] transition-all cursor-pointer"
              title="Share and Curate Artwork"
            >
              {isSharedCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{isSharedCopied ? 'COPIED' : 'SHARE'}</span>
            </button>

            {/* STRICT AUTHOR ACCESS CONTROLS VS PROTECTED BADGE */}
            {activeView === 'recycle-bin' ? (
              <div className="flex items-center gap-2 border-l border-[#c9a875]/40 pl-3 sm:pl-4">
                {isAuthor && onRestore && (
                  <button
                    onClick={() => onRestore(artwork.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-black/90 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-600 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTORE</span>
                  </button>
                )}
                {isAuthor && onPermanentDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Permanently purge this artwork? This cannot be undone.')) {
                        onPermanentDelete(artwork.id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 hover:bg-rose-600 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>PURGE</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-[#c9a875]/40 pl-3 sm:pl-4">
                {isAuthor ? (
                  <>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(artwork)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-black/90 border border-[#c9a875] text-[#e8c690] hover:bg-gradient-to-r hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black shadow-[0_0_15px_rgba(201,168,117,0.35)] transition-all cursor-pointer"
                        title="Edit artwork details (Author privileges)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>EDIT</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Move "${artwork.title}" to your Recycle Bin?`)) {
                            onDelete(artwork.id);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-black/90 border border-rose-500/70 text-rose-300 hover:bg-rose-600 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] transition-all cursor-pointer"
                        title="Delete this creation (Author privileges)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>DELETE</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1017] border border-[#c9a875]/40 text-[#dfbd87] text-[11px] font-mono-code shadow-xs"
                    title={`Created by ${artwork.artist.name}. Only the verified author has permission to edit or delete this artwork.`}
                  >
                    <Lock className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span className="hidden sm:inline">Protected Creator Work</span>
                  </div>
                )}
              </div>
            )}

            {/* Sequential Prev/Next Buttons in Top Bar */}
            {allArtworks.length > 1 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  id="nav-prev-artwork-btn"
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-black/90 border border-[#c9a875]/40 text-[#e8c690] hover:text-white hover:bg-[#c9a875]/30 hover:border-[#dfbd87] transition-all cursor-pointer shrink-0"
                  title="Previous Artwork (Left Arrow ←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="nav-next-artwork-btn"
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-black/90 border border-[#c9a875]/40 text-[#e8c690] hover:text-white hover:bg-[#c9a875]/30 hover:border-[#dfbd87] transition-all cursor-pointer shrink-0"
                  title="Next Artwork (Right Arrow →)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              id="close-detail-modal"
              onClick={onClose}
              className="p-2 sm:p-2 rounded-xl bg-black/90 border border-[#c9a875]/40 text-[#e8c690] hover:text-white hover:bg-[#c9a875]/30 hover:border-[#dfbd87] shadow-[0_0_15px_rgba(201,168,117,0.25)] transition-all cursor-pointer shrink-0"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Viewport: Artwork or Poetry Presentation */}
          <div
            className={`lg:col-span-7 xl:col-span-8 relative flex flex-col items-center justify-start p-6 sm:p-8 md:p-12 overflow-y-auto transition-all duration-700 ${getLightingBackground()}`}
          >
            {/* Floating Left/Right Chevron Navigation Over Viewport */}
            {allArtworks.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/70 border border-[#c9a875]/40 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all cursor-pointer"
                  title="Previous Artwork (← Arrow Key)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-black/70 border border-[#c9a875]/40 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all cursor-pointer"
                  title="Next Artwork (→ Arrow Key)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {artwork.category === 'poetry' && poetry ? (
              /* Dedicated Poetry Reading Chamber */
              <div className="w-full max-w-2xl bg-neutral-900/95 border border-[#c9a875]/20 rounded-xl p-8 sm:p-12 md:p-14 shadow-2xl flex flex-col items-center text-center my-auto">
                <div className="mb-8 w-full flex flex-col items-center">
                  <span className="px-3 py-1 mb-4 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/40 text-[#dfbd87] text-[10px] uppercase font-bold tracking-[0.25em] shadow-[0_0_12px_rgba(201,168,117,0.2)]">
                    Poetry Masterpiece
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-display font-medium tracking-tight text-white mb-3 uppercase max-w-xl leading-tight">
                    {artwork.title}
                  </h1>
                  {poetry.subtitle && (
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c9a875] font-medium">
                      {poetry.subtitle}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {onOpenBardModal && (
                      <button
                        onClick={() => {
                          onOpenBardModal({
                            title: artwork.title,
                            author: typeof artwork.artist === 'string' ? artwork.artist : artwork.artist.name,
                            authorHandle: typeof artwork.artist === 'object' ? artwork.artist.handle : undefined,
                            content: poetry.stanzas.join('\n\n')
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold border border-[#dfbd87] bg-gradient-to-r from-[#c9a875]/35 via-[#dfbd87]/20 to-[#c9a875]/15 text-white hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_25px_rgba(201,168,117,0.35)] hover:scale-105 active:scale-95"
                        title="Launch AI Poetic Bard Symphony Studio"
                      >
                        <Feather className="w-4 h-4 text-[#dfbd87]" />
                        <span>Bard Symphony</span>
                      </button>
                    )}

                    <button
                      onClick={handleRecite}
                      className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold border transition-all cursor-pointer flex items-center gap-2.5 shadow-lg ${
                        isReciting 
                          ? 'bg-[#c9a875] text-black border-[#dfbd87] shadow-[0_0_20px_rgba(201,168,117,0.5)]' 
                          : 'bg-black/60 border-[#c9a875]/50 text-[#e8c690] hover:bg-[#c9a875] hover:text-black'
                      }`}
                    >
                      {isReciting ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#c9a875]" />}
                      <span>{isReciting ? 'Pause Recital' : 'Listen Recital'}</span>
                    </button>

                    {onOpenScrollModal && (
                      <button
                        onClick={() => {
                          onOpenScrollModal({
                            title: artwork.title,
                            author: typeof artwork.artist === 'string' ? artwork.artist : artwork.artist.name,
                            authorHandle: typeof artwork.artist === 'object' ? artwork.artist.handle : undefined,
                            stanzas: poetry.stanzas,
                            subtitle: poetry.subtitle
                          });
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold border border-[#c9a875]/50 bg-black/60 text-[#e8c690] hover:bg-[#c9a875] hover:text-black transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                        title="Unroll poem as an Ancient Illuminated Vellum Scroll"
                      >
                        <Layers className="w-4 h-4 text-[#c9a875]" />
                        <span>Ancient Scroll</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsStoryExporterOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold border border-[#c9a875]/50 bg-black/60 text-[#e8c690] hover:bg-[#c9a875] hover:text-black transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                      title="Transform stanza into 9:16 Instagram Story or Wallpaper"
                    >
                      <Smartphone className="w-4 h-4 text-[#c9a875]" />
                      <span>Export Story Card</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-8 text-lg md:text-xl leading-relaxed text-neutral-200 font-serif italic max-w-xl mx-auto w-full">
                  {poetry.stanzas.map((stanza, sIdx) => {
                    const lines = stanza.split('\n');
                    const stanzaReflections = GalleryService.getMarginReflections(artwork.id).filter(
                      (m) => m.stanzaIndex === sIdx
                    );
                    return (
                      <div
                        key={sIdx}
                        className="space-y-2.5 w-full relative group/stanza p-3 sm:p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-[#c9a875]/20 transition-all text-center"
                      >
                        {/* Margin Whisper Pill */}
                        <button
                          onClick={() => {
                            setMarginStanzaIdx(sIdx);
                            setMarginVerseSnippet(lines[0] || '');
                            setIsMarginDrawerOpen(true);
                          }}
                          className="opacity-0 group-hover/stanza:opacity-100 absolute -right-2 sm:-right-6 top-3 px-2 py-1 rounded-full bg-black/90 border border-[#c9a875]/50 text-[#dfbd87] hover:bg-[#c9a875] hover:text-black transition-all cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center gap-1 text-[10px] font-mono-code z-10"
                          title="Inscribe margin note or read community marginalia"
                        >
                          <Feather className="w-3 h-3 text-[#c9a875]" />
                          <span>{stanzaReflections.length > 0 ? `${stanzaReflections.length} Notes` : 'Note'}</span>
                        </button>

                        {lines.map((line, lIdx) => {
                          const isLineActive = activeLine?.stanzaIdx === sIdx && activeLine?.lineIdx === lIdx;
                          return (
                            <p
                              key={lIdx}
                              onClick={() => {
                                setMarginStanzaIdx(sIdx);
                                setMarginVerseSnippet(line);
                                setIsMarginDrawerOpen(true);
                              }}
                              className={`transition-all duration-300 cursor-pointer hover:text-[#f8e7c9] ${
                                isLineActive
                                  ? 'text-[#f8e7c9] font-normal scale-[1.02] drop-shadow-[0_0_20px_rgba(201,168,117,0.85)] bg-gradient-to-r from-[#c9a875]/25 via-[#c9a875]/10 to-transparent px-3 py-1.5 rounded-lg border-l-4 border-[#dfbd87]'
                                  : 'text-neutral-200'
                              }`}
                              title="Click verse to read or write margin notes"
                            >
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 h-[1px] w-24 bg-gradient-to-r from-transparent via-[#c9a875] to-transparent"></div>

                <div className="mt-8 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
                  <span className="text-[#dfbd87] font-serif font-bold">{poetry.authorSignature || `— ${artwork.artist.name}`}</span>
                  <span className="text-neutral-500 font-mono-code">{poetry.readingTimeMinutes} min read</span>
                </div>
              </div>
            ) : isVideoMedia(artwork) ? (
              /* High-Res Video / Digital Motion Loop with Ambient Video Glow */
              <div className="relative w-full max-w-4xl rounded-xl overflow-hidden border border-[#c9a875]/40 shadow-[0_0_50px_rgba(201,168,117,0.25)] bg-black my-auto">
                {/* Ambient Backdrop Video Reflection */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0 bg-black">
                  <video
                    src={artwork.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover filter blur-2xl scale-125 pointer-events-none bg-black"
                  />
                </div>
                <video
                  src={artwork.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="auto"
                  className="w-full h-auto max-h-[72vh] object-contain mx-auto relative z-10 bg-black"
                />
              </div>
            ) : isAudioMedia(artwork) ? (
              /* Audio / Sound Art Composition with Visual Equalizer */
              <div className="relative w-full max-w-2xl rounded-2xl p-8 sm:p-12 bg-black/80 border border-[#c9a875]/40 shadow-2xl my-auto text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-[#c9a875]/20 border-2 border-[#c9a875] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(201,168,117,0.3)] animate-pulse">
                  <Volume2 className="w-10 h-10 text-[#c9a875]" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif-display font-bold text-white mb-2">{artwork.title}</h3>
                  <p className="text-xs font-mono-code text-[#c9a875] uppercase tracking-widest">{artwork.artist.name} • Master Audio Composition</p>
                </div>
                <audio
                  src={artwork.mediaUrl}
                  controls
                  className="w-full mx-auto"
                />
              </div>
            ) : (
              /* High Resolution Visual Artwork (Painting / Drawing / Digital) */
              <div className="relative group max-h-[75vh] w-full flex items-center justify-center my-auto">
                <img
                  key={`${artwork.id}-${activeImageSrc}`}
                  src={activeImageSrc}
                  alt={artwork.title}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (activeImageSrc !== artwork.thumbnailUrl && artwork.thumbnailUrl) {
                      setActiveImageSrc(artwork.thumbnailUrl);
                    } else if (activeImageSrc !== '/curatorial-masterpiece.svg') {
                      setActiveImageSrc('/curatorial-masterpiece.svg');
                    }
                  }}
                  className={`w-auto h-auto max-w-full max-h-[72vh] object-contain border border-[#c9a875]/25 shadow-2xl rounded-lg transition-transform duration-500 cursor-zoom-in ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Interactive Deep View Fragment Button */}
                <button
                  id="view-fragment-btn"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenFragmentInspector) {
                      onOpenFragmentInspector(artwork);
                    } else {
                      setIsZoomed(!isZoomed);
                    }
                  }}
                  className="absolute bottom-6 right-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#dfbd87] bg-black/90 hover:bg-[#c9a875] hover:text-black backdrop-blur-md px-4 py-2.5 border border-[#c9a875]/60 hover:border-[#dfbd87] rounded-xl shadow-[0_0_25px_rgba(201,168,117,0.35)] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 z-20 group"
                  title="Open High-Resolution Deep Fragment Inspector"
                >
                  <Maximize2 className="w-4 h-4 text-[#c9a875] group-hover:text-black transition-colors" />
                  <span className="font-bold font-mono-code">{isZoomed ? 'MINIMIZE' : 'VIEW FRAGMENT'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Curatorial Statement, Metadata, Features & Critique */}
          <div className="lg:col-span-5 xl:col-span-4 border-l border-white/10 bg-[#0d0f14] flex flex-col overflow-y-auto p-6 sm:p-8 space-y-8">
            
            {/* Artwork Master Header */}
            <div className="pb-6 border-b border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 text-[10px] uppercase font-bold tracking-widest font-mono-code">
                  {artwork.category}
                </span>
                {artwork.year && (
                  <span className="text-xs text-neutral-400 font-mono-code">
                    Circa {artwork.year}
                  </span>
                )}
                {isAuthor && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] uppercase font-bold tracking-widest font-mono-code ml-auto">
                    Your Artwork
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-white tracking-wide leading-tight">
                {artwork.title}
              </h1>
            </div>

            {/* Artist Card */}
            <div className="flex flex-col gap-5 pb-6 border-b border-white/10">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={(e) => onSelectArtist(artwork.artist.id, e)}
              >
                <Avatar
                  src={artwork.artist.avatar}
                  name={artwork.artist.name}
                  className="w-12 h-12 rounded-full border border-[#c9a875]/50 grayscale opacity-90"
                  textSize="text-lg"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-light tracking-[0.1em] text-white uppercase text-lg">
                      {artwork.artist.name}
                    </h3>
                    {artwork.artist.verified && (
                      <ShieldCheck className="w-4 h-4 text-[#c9a875]" />
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a875] font-mono-code">
                    {artwork.artist.handle}
                  </span>
                </div>
              </div>

              {/* Like / Save / Share Actions */}
              <div className="flex items-center gap-3">
                <button
                  id="detail-like-btn"
                  onClick={(e) => onToggleLike(artwork.id, e)}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors cursor-pointer rounded-sm ${
                    isLikedState
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/20 bg-transparent text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLikedState ? 'fill-current' : ''}`} />
                  <span>{liveLikesCount}</span>
                </button>

                <button
                  id="detail-save-btn"
                  onClick={(e) => onToggleSave(artwork.id, e)}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-colors cursor-pointer rounded-sm ${
                    artwork.isSaved
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/20 bg-transparent text-white hover:bg-white hover:text-black'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${artwork.isSaved ? 'fill-current' : ''}`} />
                  <span>{artwork.isSaved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  id="detail-share-btn"
                  onClick={handleShareClick}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] border transition-all duration-200 cursor-pointer rounded-sm shadow-md ${
                    isSharedCopied
                      ? 'border-emerald-500 bg-emerald-500 text-black font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'border-[#c9a875]/50 bg-black/60 text-[#e8c690] hover:bg-gradient-to-r hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black hover:border-[#dfbd87] hover:shadow-[0_0_15px_rgba(201,168,117,0.4)]'
                  }`}
                  title="Share and Curate Artwork"
                >
                  {isSharedCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{isSharedCopied ? 'Copied' : 'Share'}</span>
                </button>

                {onAddToMoodBoard && (
                  <button
                    id="detail-vault-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToMoodBoard(artwork);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] border border-[#c9a875]/50 bg-black/60 text-[#e8c690] hover:bg-[#c9a875] hover:text-black hover:border-[#dfbd87] hover:shadow-[0_0_15px_rgba(201,168,117,0.4)] transition-all duration-200 cursor-pointer rounded-sm shadow-md"
                    title="Add to Vault"
                  >
                    <Layers className="w-3.5 h-3.5 text-current" />
                    <span>Vault</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Masterpiece Actions Ribbon */}
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/10">
              {onOpenGalleryWall && (
                <button
                  onClick={() => onOpenGalleryWall(artwork)}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-black/40 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-white/10 hover:border-[#c9a875] text-[10px] font-mono-code uppercase font-bold transition-all cursor-pointer group"
                >
                  <Eye className="w-3.5 h-3.5 text-[#c9a875] group-hover:text-black" />
                  <span>Wall Salon</span>
                </button>
              )}
              {onOpenCertificate && (
                <button
                  onClick={() => onOpenCertificate(artwork)}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-black/40 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-white/10 hover:border-[#c9a875] text-[10px] font-mono-code uppercase font-bold transition-all cursor-pointer group"
                >
                  <Award className="w-3.5 h-3.5 text-[#c9a875] group-hover:text-black" />
                  <span>Certificate</span>
                </button>
              )}
              {onOpenColorStudio && (
                <button
                  onClick={() => onOpenColorStudio(artwork)}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-black/40 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-white/10 hover:border-[#c9a875] text-[10px] font-mono-code uppercase font-bold transition-all cursor-pointer group"
                >
                  <Palette className="w-3.5 h-3.5 text-[#c9a875] group-hover:text-black" />
                  <span>Color Studio</span>
                </button>
              )}
            </div>

            {/* Artwork Specifications & Physical Medium */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
                Specifications
              </h3>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-xs font-light">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1">Medium</span>
                  <span className="text-neutral-300">{artwork.medium}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1">Dimensions</span>
                  <span className="text-neutral-300">{artwork.dimensions || 'Dynamic Frame'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1">Year</span>
                  <span className="text-neutral-300">{artwork.year}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-600 block mb-1">Exhibition</span>
                  <span className="text-neutral-300">{artwork.exhibitionName || 'Permanent Archive'}</span>
                </div>
              </div>
            </div>

            {/* Artist Statement */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
                Curatorial Statement
              </h3>
              <p className="text-sm text-neutral-300 font-light leading-relaxed">
                {artwork.description}
              </p>
              {artwork.curatorNote && (
                <div className="mt-4 p-6 border-l border-white/20 bg-neutral-900/50">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">
                    Curator Observation
                  </span>
                  <p className="font-serif italic text-neutral-400">"{artwork.curatorNote}"</p>
                </div>
              )}
            </div>

            {/* Extracted Harmonic Color Palette */}
            {artwork.colorPalette && artwork.colorPalette.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
                    Palette
                  </h3>
                  {copiedColor && (
                    <span className="text-[9px] uppercase tracking-widest text-white flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied {copiedColor}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {artwork.colorPalette.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyHex(hex)}
                      className="group/color flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <div
                        className="w-full h-10 border border-white/10 rounded-sm"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[9px] uppercase tracking-widest text-neutral-600 group-hover/color:text-white transition-colors">
                        {hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {artwork.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3 py-1 bg-neutral-900 border border-white/5 text-[9px] uppercase tracking-widest text-neutral-400 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Critique & Community Discussion */}
            <div className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
                Activity ({comments.length})
              </h3>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="flex flex-col gap-3">
                <textarea
                  id="comment-textarea"
                  placeholder="Share a contemplation or critique..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-sm text-sm text-white placeholder-neutral-600 focus:border-white/30 focus:outline-none resize-none h-20"
                />
                <button
                  id="submit-comment-btn"
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="self-end px-5 py-2 text-[10px] uppercase tracking-[0.2em] border border-white/20 hover:bg-white hover:text-black transition-colors cursor-pointer text-white bg-transparent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white rounded-sm"
                >
                  Post Critique
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comm) => (
                  <div key={comm.id} className="py-4 border-b border-white/5 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0 overflow-hidden">
                        <img src={comm.user.avatar} alt={comm.user.name} className="w-full h-full object-cover grayscale opacity-80" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
                          <span className="text-neutral-300 font-medium">{comm.user.name}</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-600">
                            {new Date(comm.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm font-light text-neutral-400 leading-relaxed">{comm.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Museum Keyboard Shortcuts & Navigation Hint Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#07080c] border-t border-white/5 text-[10px] font-mono-code text-neutral-400 shrink-0">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-neutral-500 font-bold uppercase tracking-wider">
              <Command className="w-3 h-3 text-[#c9a875]" /> Shortcuts:
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">← / →</kbd> Browse
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">L</kbd> Like
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">S</kbd> Save
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">V</kbd> Vault
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">Z</kbd> Zoom
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-[#e8c690]">Esc</kbd> Close
            </span>
          </div>
          {allArtworks.length > 1 && currentIndex >= 0 && (
            <span className="text-neutral-500 hidden md:inline text-[9px] uppercase tracking-widest font-bold">
              Sequential Exhibition Mode
            </span>
          )}
        </div>
      </div>

      {/* Visual Poetry & Instagram Story Exporter Modal */}
      {isStoryExporterOpen && (
        <PoetryCardExporterModal
          isOpen={isStoryExporterOpen}
          artwork={artwork}
          initialStanzaIndex={marginStanzaIdx}
          onClose={() => setIsStoryExporterOpen(false)}
        />
      )}

      {/* Manuscript Marginalia & Handwriting Reflections Drawer */}
      {isMarginDrawerOpen && (
        <MarginReflectionsDrawer
          isOpen={isMarginDrawerOpen}
          artwork={artwork}
          selectedStanzaIdx={marginStanzaIdx}
          verseSnippet={marginVerseSnippet}
          onClose={() => setIsMarginDrawerOpen(false)}
        />
      )}
    </div>
  );
};
