import React, { useState, useEffect } from 'react';
import {
  X,
  Feather,
  Heart,
  Send,
  Sparkles,
  Award,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Quote
} from 'lucide-react';
import { Artwork, MarginReflection } from '../types';
import { GalleryService } from '../services/api';
import confetti from 'canvas-confetti';

interface MarginReflectionsDrawerProps {
  isOpen: boolean;
  artwork: Artwork | null;
  selectedStanzaIdx: number;
  selectedLineIdx?: number;
  verseSnippet?: string;
  onClose: () => void;
}

export const MarginReflectionsDrawer: React.FC<MarginReflectionsDrawerProps> = ({
  isOpen,
  artwork,
  selectedStanzaIdx,
  selectedLineIdx,
  verseSnippet,
  onClose
}) => {
  const [reflections, setReflections] = useState<MarginReflection[]>([]);
  const [newText, setNewText] = useState('');
  const [selectedInk, setSelectedInk] = useState<'gold' | 'charcoal' | 'sepia' | 'crimson'>('gold');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (artwork && isOpen) {
      const all = GalleryService.getMarginReflections(artwork.id);
      const filtered = all.filter((r) => r.stanzaIndex === selectedStanzaIdx);
      setReflections(filtered);
    }
  }, [artwork, selectedStanzaIdx, isOpen]);

  if (!isOpen || !artwork) return null;

  const INK_PALETTES = {
    gold: {
      name: 'Atelier Gold',
      textClass: 'text-[#f5deb3]',
      borderClass: 'border-[#dfbd87]/50',
      bgClass: 'bg-[#dfbd87]/10',
      hex: '#dfbd87'
    },
    charcoal: {
      name: 'Vine Charcoal',
      textClass: 'text-neutral-200',
      borderClass: 'border-neutral-500/50',
      bgClass: 'bg-neutral-500/10',
      hex: '#d0d2d6'
    },
    sepia: {
      name: 'Aged Sepia',
      textClass: 'text-[#d6be9f]',
      borderClass: 'border-[#b59873]/50',
      bgClass: 'bg-[#b59873]/10',
      hex: '#c2a688'
    },
    crimson: {
      name: 'Venetian Crimson',
      textClass: 'text-[#fca5a5]',
      borderClass: 'border-[#e06d6d]/50',
      bgClass: 'bg-[#e06d6d]/10',
      hex: '#e68585'
    }
  };

  const handleUpvote = (id: string) => {
    const updated = GalleryService.toggleUpvoteMarginReflection(id);
    if (updated) {
      setReflections((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (updated.isUpvoted) {
        confetti({
          particleCount: 15,
          spread: 30,
          origin: { y: 0.8 },
          colors: ['#c9a875', '#ffffff']
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmitting(true);

    const created = GalleryService.addMarginReflection({
      artworkId: artwork.id,
      stanzaIndex: selectedStanzaIdx,
      lineIndex: selectedLineIdx,
      verseSnippet: verseSnippet || undefined,
      author: {
        id: `user-${Date.now()}`,
        name: authorName.trim() || 'Anonymous Reader',
        handle: `@${(authorName.trim() || 'reader').toLowerCase().replace(/\s+/g, '')}`,
        avatar: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=200&q=80',
        verified: false
      },
      text: newText.trim(),
      inkColor: selectedInk
    });

    setReflections((prev) => [created, ...prev]);
    setNewText('');
    setIsSubmitting(false);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#c9a875', '#dfbd87', '#ffffff']
    });
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg h-full bg-[#0a0c12] border-l border-[#c9a875]/40 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#07080d]/90 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a875] font-mono-code font-bold">
                Archival Marginalia & Notes
              </span>
              <h3 className="font-serif-display font-medium text-base text-white">
                Stanza {selectedStanzaIdx + 1} Reflections
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-[#c9a875] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Highlight Banner */}
        {verseSnippet && (
          <div className="px-6 py-4 bg-[#121520] border-b border-white/10 flex items-start gap-3">
            <Quote className="w-4 h-4 text-[#c9a875] shrink-0 mt-0.5" />
            <p className="text-xs font-serif italic text-[#dfbd87] leading-relaxed line-clamp-3">
              "{verseSnippet}"
            </p>
          </div>
        )}

        {/* Reflections Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {reflections.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/15 rounded-2xl">
              <Feather className="w-8 h-8 text-[#c9a875]/40 mb-3" />
              <p className="font-serif-display text-sm text-neutral-300">
                No ink has touched this margin yet.
              </p>
              <p className="text-xs text-neutral-500 font-mono-code mt-1">
                Be the first to whisper a reflection on this verse below.
              </p>
            </div>
          ) : (
            reflections.map((ref) => {
              const ink = INK_PALETTES[ref.inkColor] || INK_PALETTES.gold;
              return (
                <div
                  key={ref.id}
                  className={`p-4 rounded-2xl border ${ink.borderClass} ${ink.bgClass} backdrop-blur-sm space-y-3 relative group transition-all`}
                >
                  {ref.isCuratorPick && (
                    <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono-code text-[#dfbd87] font-bold">
                      <Award className="w-3.5 h-3.5 text-[#c9a875]" />
                      <span>Curator Selected Marginalia</span>
                    </div>
                  )}

                  {/* Handwritten ink note */}
                  <p
                    className={`font-serif italic text-base sm:text-lg leading-relaxed ${ink.textClass}`}
                    style={{ fontStyle: 'italic' }}
                  >
                    "{ref.text}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-neutral-300 text-xs">
                        {ref.author.name}
                      </span>
                      <span className="text-[10px] font-mono-code text-neutral-500">
                        {new Date(ref.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleUpvote(ref.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-code transition-all cursor-pointer ${
                        ref.isUpvoted
                          ? 'bg-[#c9a875] text-black font-bold'
                          : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${ref.isUpvoted ? 'fill-current' : ''}`} />
                      <span>{ref.upvotes}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Drawer Form */}
        <form onSubmit={handleSubmit} className="p-5 border-t border-white/10 bg-[#07090e] space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1">
              <Feather className="w-3 h-3" /> Inscribe Marginal Note:
            </span>

            {/* Ink Color Selector */}
            <div className="flex items-center gap-1.5">
              {(Object.keys(INK_PALETTES) as (keyof typeof INK_PALETTES)[]).map((inkKey) => {
                const isSelected = selectedInk === inkKey;
                return (
                  <button
                    key={inkKey}
                    type="button"
                    onClick={() => setSelectedInk(inkKey)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: INK_PALETTES[inkKey].hex }}
                    title={INK_PALETTES[inkKey].name}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875]"
            />
          </div>

          <div className="relative">
            <textarea
              rows={3}
              placeholder="Whisper your reflection or literary marginal note..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white font-serif italic placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!newText.trim() || isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-serif-display font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Inscribing...' : 'Inscribe in Margins'}</span>
          </button>
        </form>

      </div>
    </div>
  );
};
