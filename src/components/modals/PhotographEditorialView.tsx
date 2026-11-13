import React, { useState, useRef } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  Award,
  Palette,
  Check,
  Camera,
  MessageSquare
} from 'lucide-react';
import { Artwork, Comment } from '../../types';
import { Avatar } from '../Avatar';

interface PhotographEditorialViewProps {
  artwork: Artwork;
  isLiked: boolean;
  likesCount: number;
  isSaved: boolean;
  isZoomed: boolean;
  onToggleZoom: () => void;
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
  copiedColor?: string | null;
  onCopyColor?: (hex: string) => void;
}

export const PhotographEditorialView: React.FC<PhotographEditorialViewProps> = ({
  artwork,
  isLiked,
  likesCount,
  isSaved,
  isZoomed,
  onToggleZoom,
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
  onCommentSubmit,
  copiedColor,
  onCopyColor
}) => {
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'contemplations'>('details');
  const rightColRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToContemplations = () => {
    setActiveTab('contemplations');
    setTimeout(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const displayImage = imageError
    ? (artwork.thumbnailUrl || '/curatorial-masterpiece.svg')
    : (artwork.mediaUrl || artwork.thumbnailUrl || '/curatorial-masterpiece.svg');

  const resolvedAvatar = typeof artwork.artist === 'object' ? artwork.artist.avatar : '';
  const artistName = typeof artwork.artist === 'object' ? artwork.artist.name : (artwork.artist || 'Sanctuary Artist');
  const artistHandle = typeof artwork.artist === 'object' ? artwork.artist.handle : '@artisan';
  const isVerified = typeof artwork.artist === 'object' ? artwork.artist.verified : false;

  const categoryLabel = artwork.category === 'digital' ? 'DIGITAL' : artwork.category.toUpperCase();

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none">
      {/* ── Left Column: Editorial Photo Viewport (approx 64% desktop) ── */}
      <div className="lg:w-[64%] h-[60vh] sm:h-[70vh] lg:h-full relative flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/40 shrink-0 group">
        
        {/* Rounded photo frame with generous breathing room & soft shadow */}
        <div
          onClick={onToggleZoom}
          className="relative max-w-full max-h-full flex items-center justify-center rounded-[18px] overflow-hidden border border-white/[0.08] shadow-[0_25px_80px_rgba(0,0,0,0.85)] cursor-zoom-in transition-all duration-300 hover:scale-[1.01]"
          title="Click to toggle fullscreen view (Z)"
        >
          <img
            src={displayImage}
            alt={artwork.title}
            onError={() => setImageError(true)}
            className="w-full h-full max-h-[58vh] sm:max-h-[68vh] lg:max-h-[88vh] max-w-full object-contain rounded-[18px] transition-transform duration-300"
            draggable={false}
          />

          {/* Corner Expand Toggle Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleZoom();
            }}
            className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-[#0d0f14]/85 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer"
            title="Expand Full Screen (Z)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Prev / Next Circular Arrows overlaying edges */}
        {hasPrev && onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0d0f14]/80 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-xl flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-250 cursor-pointer hover:scale-105 z-20"
            title="Previous Artwork (Left Arrow)"
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
            title="Next Artwork (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Right Column: Editorial Details (approx 36% desktop) ── */}
      <div
        ref={rightColRef}
        id="editorial-right-column"
        className="lg:w-[36%] h-full overflow-y-auto p-6 sm:p-8 lg:p-10 pb-48 sm:pb-56 lg:pb-64 bg-[#0d0f14] border-t lg:border-t-0 lg:border-l border-white/[0.08] flex flex-col space-y-5 sm:space-y-6 custom-scrollbar scroll-smooth"
      >
        
        {/* 1. Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[11px] uppercase tracking-[0.25em] text-[#d9b878] font-semibold">
            {categoryLabel} {artwork.year ? `· ${artwork.year}` : ''}
          </span>
        </div>

        {/* 2. Large Serif Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-light text-[#f4efe6] leading-[1.08] tracking-[-0.01em] select-text">
          {artwork.title}
        </h1>

        {/* 3. Short Story / Caption (hidden if empty) */}
        {artwork.description && artwork.description.trim() !== '' && (
          <p className="text-sm sm:text-base font-light text-[#ded7c8]/90 leading-relaxed select-text">
            {artwork.description}
          </p>
        )}

        {/* 4. Creator Row */}
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

        {/* 5. Action Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
          {/* Like Button */}
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

          {/* Save Button */}
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

          {/* Share Button */}
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
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono-code font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeTab === 'details'
                ? 'bg-[#d9b878] text-black shadow-md shadow-[#d9b878]/20 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Overview &amp; Story
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

        {/* ── TAB 1: DETAILS & STORY ── */}
        {activeTab === 'details' ? (
          <>
            {/* One Quiet "Experience" Row */}
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

            {/* Compact Real Details / Technical Line */}
            <div className="pt-1 space-y-3">
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono-code text-[#8d897f]">
                {artwork.year && (
                  <span>Year: <strong className="text-neutral-300 font-normal">{artwork.year}</strong></span>
                )}
                {artwork.dimensions && !artwork.dimensions.includes('120') && (
                  <span>Dimensions: <strong className="text-neutral-300 font-normal">{artwork.dimensions}</strong></span>
                )}
                {artwork.medium && !artwork.medium.toLowerCase().includes('volumetric') && !artwork.medium.toLowerCase().includes('generative shader') && (
                  <span>Medium: <strong className="text-neutral-300 font-normal">{artwork.medium}</strong></span>
                )}
              </div>

              {/* Color Palette (if available) */}
              {artwork.colorPalette && artwork.colorPalette.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-code text-[10px] uppercase tracking-[0.2em] text-[#8d897f]">
                      Harmonic Palette
                    </span>
                    {copiedColor && (
                      <span className="text-[10px] font-mono-code text-[#d9b878] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Copied {copiedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {artwork.colorPalette.slice(0, 5).map((hex, i) => (
                      <button
                        key={i}
                        onClick={() => onCopyColor && onCopyColor(hex)}
                        style={{ backgroundColor: hex }}
                        className="flex-1 h-7 rounded-lg border border-white/10 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-inner"
                        title={`Copy ${hex}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* ── EXPANDED CONTEMPLATIONS & ARTISAN INBOX (Active Tab or Bottom of Details) ── */}
        <div className={`space-y-4 pt-4 ${activeTab === 'details' ? 'border-t border-white/[0.08]' : ''}`}>
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
                  placeholder="Leave an artisan contemplation, poetic reflection, or critique..."
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
                Be the first to grace this canvas with your reflection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── True Fullscreen Lightbox Theater Overlay (Full Screen for all devices) ── */}
      {isZoomed && (
        <div
          onClick={onToggleZoom}
          className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-[98vw] max-h-[96vh] flex items-center justify-center">
            <img
              src={displayImage}
              alt={artwork.title}
              className="max-h-[96vh] max-w-[98vw] object-contain rounded-2xl shadow-[0_25px_100px_rgba(0,0,0,0.98)] border border-white/10"
              draggable={false}
            />
            
            {/* Top Bar with title, artist, and close button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto"
            >
              <div className="px-4 py-2 rounded-full bg-[#0d0f14]/85 backdrop-blur-md border border-white/10 text-xs font-mono-code text-[#ded7c8] shadow-2xl">
                <span className="text-[#d9b878] font-bold">{artwork.title}</span>
                <span className="text-neutral-500 mx-2">•</span>
                <span>{artistName}</span>
              </div>

              <button
                onClick={onToggleZoom}
                className="p-3 rounded-full bg-[#0d0f14]/90 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-2xl transition-all cursor-pointer"
                title="Exit Full Screen (Esc / Z)"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Hover Prev / Next in Fullscreen */}
            {hasPrev && onPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0f14]/80 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all cursor-pointer z-20"
                title="Previous Artwork (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {hasNext && onNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0f14]/80 hover:bg-[#d9b878] text-white hover:text-black border border-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all cursor-pointer z-20"
                title="Next Artwork (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

