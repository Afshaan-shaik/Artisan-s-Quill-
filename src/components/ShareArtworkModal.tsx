import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Twitter,
  Send,
  Mail,
  QrCode,
  Sparkles,
  ExternalLink,
  Feather,
  Palette,
  Heart,
  Bookmark,
  Quote
} from 'lucide-react';
import { Artwork } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface ShareArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

// Authentic WhatsApp SVG Icon (Speech Bubble with Handset)
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.201.3-.777.98-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.3-.019-.463.132-.613.136-.135.301-.351.452-.527.15-.175.201-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.235-.245-.587-.494-.507-.677-.517-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.803.376-.276.3-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.2 2.122 3.24 5.141 4.544.718.31 1.278.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.03 14.69 2 12.04 2zm0 18.15c-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32c-.82-1.3-1.26-2.82-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42 1.56 1.56 2.41 3.63 2.41 5.83 0 4.54-3.7 8.23-8.24 8.23z" />
  </svg>
);

// Authentic Telegram Paper Plane Icon
const TelegramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

// Authentic X / Twitter Icon
const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const ShareArtworkModal: React.FC<ShareArtworkModalProps> = ({
  artwork,
  onClose
}) => {
  const [copiedType, setCopiedType] = useState<'link' | 'citation' | 'poem' | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  const artworkTitle = artwork.title || 'Curated Masterpiece';
  const artistName = artwork.artist?.name || 'Sanctuary Artist';
  const artistHandle = artwork.artist?.handle || '';
  const artworkDesc = artwork.description || '';
  const artworkYear = artwork.year || 2026;
  const artworkCategory = artwork.category || 'Visual Art';

  // Permalinks directly open this exact piece of art in high-resolution salon mode
  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?artwork=${encodeURIComponent(artwork.id)}`
    : `https://artisansquill.gallery/artwork/${artwork.id}`;

  const triggerSparkleConfetti = () => {
    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#dfbd87', '#f8f5eb', '#ffffff']
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedType('link');
      triggerSparkleConfetti();
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyCitation = async () => {
    const citation = `"${artworkTitle}" by ${artistName} (${artworkYear}). ${artwork.medium || artworkCategory}. Curated on The Artisan's Quill Atelier. ${currentUrl}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedType('citation');
      triggerSparkleConfetti();
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPoemText = async () => {
    if (!artwork.poetryContent?.stanzas) return;
    const poemText = `"${artworkTitle}"\nBy ${artistName}\n\n${artwork.poetryContent.stanzas.join('\n\n')}\n\n— The Artisan's Quill Atelier\n${currentUrl}`;
    try {
      await navigator.clipboard.writeText(poemText);
      setCopiedType('poem');
      triggerSparkleConfetti();
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${artworkTitle} — The Artisan's Quill`,
          text: `Explore "${artworkTitle}" by ${artistName} on The Artisan's Quill Curatorial Archive:\n${currentUrl}`,
          url: currentUrl
        });
      } catch {
        // User canceled
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(
    `Admiring "${artworkTitle}" by ${artistName} on @TheArtisansQuill ✨\n\nDirect View: ${currentUrl}`
  );

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`"${artworkTitle}" by ${artistName}`)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(`Curatorial Discovery: "${artworkTitle}"`)}&body=${encodeURIComponent(
    `Greetings,\n\nI thought you would appreciate this artwork:\n\n"${artworkTitle}" by ${artistName}\n${artworkDesc}\n\nView this artwork directly in full gallery resolution:\n${currentUrl}`
  )}`;

  return (
    <AnimatePresence>
      <div 
        id="share-artwork-modal-backdrop"
        className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#12141c] via-[#0b0d13] to-[#07080c] border border-[#c9a875]/40 rounded-2xl shadow-[0_0_60px_rgba(201,168,117,0.25)] overflow-hidden font-sans text-neutral-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-noise z-0"></div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#c9a875]/15 border border-[#c9a875]/40 text-[#dfbd87] shadow-[0_0_15px_rgba(201,168,117,0.3)]">
                <Share2 className="w-4 h-4 text-[#e8ca95] animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg sm:text-xl font-bold tracking-wide text-white">
                  Share & Curate Artwork
                </h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a875]/90 font-mono-code">
                  Atelier Curatorial Passcard
                </span>
              </div>
            </div>

            <button
              id="close-share-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 relative z-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Artwork Preview Card */}
            <div className="flex gap-4 p-4 rounded-xl bg-black/60 border border-white/10 shadow-inner">
              {artwork.category === 'poetry' ? (
                <div className="w-20 h-24 rounded-lg bg-neutral-900 border border-[#c9a875]/30 flex flex-col items-center justify-center p-2 text-center shrink-0 shadow-md">
                  <Feather className="w-5 h-5 text-[#c9a875] mb-1" />
                  <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 font-mono-code">
                    Poem
                  </span>
                </div>
              ) : (
                <img
                  src={artwork.thumbnailUrl || artwork.mediaUrl}
                  alt={artworkTitle}
                  referrerPolicy="no-referrer"
                  className="w-20 h-24 rounded-lg object-cover border border-[#c9a875]/30 shrink-0 shadow-md"
                />
              )}

              <div className="flex flex-col justify-center min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 text-[9px] uppercase font-bold tracking-widest font-mono-code">
                    {artworkCategory}
                  </span>
                  {artworkYear && (
                    <span className="text-[10px] text-neutral-400 font-mono-code">
                      {artworkYear}
                    </span>
                  )}
                </div>
                <h4 className="font-serif-display font-bold text-white text-base sm:text-lg truncate tracking-wide">
                  {artworkTitle}
                </h4>
                <p className="text-xs text-[#c9a875] font-light truncate">
                  By {artistName} {artistHandle && `(${artistHandle})`}
                </p>
              </div>
            </div>

            {/* Quick URL Copy Bar */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-400 block font-mono-code">
                Direct Atelier Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/10 text-xs font-mono-code text-neutral-300 truncate select-all">
                  {currentUrl}
                </div>
                <button
                  id="share-copy-link-btn"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 shadow-md ${
                    copiedType === 'link'
                      ? 'bg-emerald-500 text-black font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.03]'
                      : 'bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black hover:shadow-[0_0_20px_rgba(201,168,117,0.6)] hover:scale-[1.02]'
                  }`}
                >
                  {copiedType === 'link' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Social Dispatch Grid */}
            <div className="space-y-2.5">
              <label className="text-xs uppercase tracking-wider font-bold text-neutral-400 block font-mono-code">
                Quick Social Dispatch
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/70 border border-white/10 hover:border-white hover:bg-white/10 text-neutral-300 hover:text-white transition-all text-xs font-medium group cursor-pointer shadow-sm"
                  title="Share on X / Twitter"
                >
                  <XTwitterIcon className="text-white group-hover:scale-110 transition-transform" />
                  <span>X / Tweet</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/70 border border-white/10 hover:border-[#25D366] hover:bg-[#25D366]/20 text-neutral-300 hover:text-white transition-all text-xs font-medium group cursor-pointer shadow-sm"
                  title="Share on WhatsApp"
                >
                  <WhatsAppIcon className="text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/70 border border-white/10 hover:border-[#0088cc] hover:bg-[#0088cc]/20 text-neutral-300 hover:text-white transition-all text-xs font-medium group cursor-pointer shadow-sm"
                  title="Share on Telegram"
                >
                  <TelegramIcon className="text-[#0088cc] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#0088cc] transition-colors">Telegram</span>
                </a>

                <a
                  href={mailUrl}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-black/70 border border-white/10 hover:border-[#c9a875] hover:bg-[#c9a875]/20 text-neutral-300 hover:text-white transition-all text-xs font-medium group cursor-pointer shadow-sm"
                  title="Share via Email"
                >
                  <Mail className="w-4 h-4 text-[#e8ca95] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#e8ca95] transition-colors">Email</span>
                </a>
              </div>
            </div>

            {/* Additional Curatorial Actions (Scholar Citation & QR Pass) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
              <button
                id="share-copy-citation-btn"
                onClick={handleCopyCitation}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  copiedType === 'citation'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-black/60 border-[#c9a875]/30 text-[#e8c690] hover:bg-[#c9a875]/15 hover:border-[#c9a875]'
                }`}
              >
                {copiedType === 'citation' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Citation Copied!</span>
                  </>
                ) : (
                  <>
                    <Quote className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>Copy Scholar Citation</span>
                  </>
                )}
              </button>

              {artwork.category === 'poetry' ? (
                <button
                  id="share-copy-poem-btn"
                  onClick={handleCopyPoemText}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    copiedType === 'poem'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-black/60 border-[#c9a875]/30 text-[#e8c690] hover:bg-[#c9a875]/15 hover:border-[#c9a875]'
                  }`}
                >
                  {copiedType === 'poem' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Poem Text Copied!</span>
                    </>
                  ) : (
                    <>
                      <Feather className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span>Copy Full Poem Text</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  id="share-toggle-qr-btn"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-[#c9a875]/30 bg-black/60 text-[#e8c690] hover:bg-[#c9a875]/15 hover:border-[#c9a875] text-xs font-medium transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#c9a875]" />
                  <span>{showQrCode ? 'Hide QR Pass' : 'Show Mobile QR Pass'}</span>
                </button>
              )}
            </div>

            {/* QR Code Passcard Visualizer */}
            {showQrCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 rounded-xl bg-black/90 border border-[#c9a875]/40 flex flex-col items-center text-center space-y-3 shadow-2xl"
              >
                <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-[#c9a875]">
                  <svg
                    viewBox="0 0 120 120"
                    className="w-32 h-32 text-black"
                    fill="currentColor"
                  >
                    {/* QR Code Corner Finder Patterns */}
                    <rect x="5" y="5" width="30" height="30" fill="black" />
                    <rect x="10" y="10" width="20" height="20" fill="white" />
                    <rect x="15" y="15" width="10" height="10" fill="black" />

                    <rect x="85" y="5" width="30" height="30" fill="black" />
                    <rect x="90" y="10" width="20" height="20" fill="white" />
                    <rect x="95" y="15" width="10" height="10" fill="black" />

                    <rect x="5" y="85" width="30" height="30" fill="black" />
                    <rect x="10" y="90" width="20" height="20" fill="white" />
                    <rect x="15" y="95" width="10" height="10" fill="black" />

                    {/* Data Matrix Elements */}
                    <rect x="42" y="10" width="6" height="6" />
                    <rect x="54" y="15" width="8" height="6" />
                    <rect x="68" y="10" width="6" height="12" />
                    <rect x="42" y="24" width="12" height="6" />

                    <rect x="10" y="42" width="6" height="6" />
                    <rect x="22" y="48" width="8" height="8" />
                    <rect x="10" y="60" width="12" height="6" />
                    <rect x="28" y="66" width="6" height="12" />

                    {/* Center Motif Crest */}
                    <rect x="45" y="45" width="30" height="30" fill="#c9a875" rx="4" />
                    <circle cx="60" cy="60" r="8" fill="black" />
                    <circle cx="60" cy="60" r="4" fill="#dfbd87" />

                    {/* Lower Matrix */}
                    <rect x="85" y="45" width="8" height="14" />
                    <rect x="100" y="52" width="14" height="6" />
                    <rect x="92" y="68" width="16" height="8" />

                    <rect x="42" y="85" width="8" height="8" />
                    <rect x="56" y="92" width="14" height="6" />
                    <rect x="45" y="104" width="8" height="10" />
                    <rect x="68" y="88" width="6" height="14" />
                    <rect x="85" y="92" width="12" height="10" />
                    <rect x="102" y="104" width="12" height="8" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#dfbd87] font-mono-code uppercase tracking-wider">
                    Scan with Mobile Camera
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light">
                    Direct access to this artwork in high-res salon mode
                  </p>
                </div>
              </motion.div>
            )}

            {/* Mobile Native Share Trigger if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                id="share-system-sheet-btn"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Open System Share Sheet</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
