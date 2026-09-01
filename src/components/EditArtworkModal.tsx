import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldAlert, CheckCircle2, Lock, Feather } from 'lucide-react';
import { Artwork, UserProfile } from '../types';
import { GalleryService } from '../services/api';

interface EditArtworkModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: (updatedArtwork: Artwork) => void;
}

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({
  isOpen,
  artwork,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState<number | string>(2026);
  const [curatorNote, setCuratorNote] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [stanzasStr, setStanzasStr] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (artwork && isOpen) {
      setTitle(artwork.title);
      setDescription(artwork.description);
      setMedium(artwork.medium || '');
      setDimensions(artwork.dimensions || '');
      setYear(artwork.year || 2026);
      setCuratorNote(artwork.curatorNote || '');
      setTagsStr((artwork.tags || []).join(', '));
      if (artwork.poetryContent?.stanzas) {
        setStanzasStr(artwork.poetryContent.stanzas.join('\n\n'));
      } else {
        setStanzasStr('');
      }
      setErrorMsg(null);
    }
  }, [artwork, isOpen]);

  if (!isOpen || !artwork) return null;

  const isAuthor = GalleryService.canUserManageArtwork(artwork, currentUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthor) {
      setErrorMsg(`Access Denied: You cannot modify "${artwork.title}" because it was created by ${artwork.artist.name}. Only the verified author has edit privileges.`);
      return;
    }

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: Artwork = {
      ...artwork,
      title: title.trim(),
      description: description.trim(),
      medium: medium.trim(),
      dimensions: dimensions.trim() || artwork.dimensions,
      year: typeof year === 'string' && !isNaN(Number(year)) ? Number(year) : year,
      curatorNote: curatorNote.trim() || undefined,
      tags: tags.length > 0 ? tags : artwork.tags
    };

    if (artwork.category === 'poetry' && artwork.poetryContent) {
      const stanzas = stanzasStr
        .split('\n\n')
        .map((s) => s.trim())
        .filter(Boolean);
      updated.poetryContent = {
        ...artwork.poetryContent,
        stanzas: stanzas.length > 0 ? stanzas : artwork.poetryContent.stanzas
      };
    }

    onSuccess(updated);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090b10] border border-[#c9a875]/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full border border-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-medium text-white uppercase tracking-wider">
              Edit Artwork & Provenance Details
            </h2>
            <p className="text-[10px] text-[#c9a875] font-mono-code">
              Author: {artwork.artist.name} • Active Session: {currentUser.name}
            </p>
          </div>
        </div>

        {/* Security Alert if not Author */}
        {!isAuthor ? (
          <div className="p-6 rounded-xl bg-rose-950/80 border border-rose-500/50 space-y-3 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto text-rose-300">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif-display text-white font-bold">
              Access Restricted to Author
            </h3>
            <p className="text-xs text-rose-200 font-light leading-relaxed max-w-md mx-auto">
              You are currently logged in as <span className="font-bold text-white">{currentUser.name}</span>, but this masterpiece belongs to <span className="font-bold text-white">{artwork.artist.name}</span>.
              In accordance with Atelier sanctuary provenance rules, only the original creator may modify or delete their works.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono-code uppercase tracking-widest text-white rounded-full transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Artwork Title *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Medium / Physical Technique
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. Oil on Belgian Linen"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Dimensions / Aspect
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. 140 x 180 cm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Creation Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                  placeholder="e.g. Oil Painting, Nocturne, Gold Leaf"
                />
              </div>
            </div>

            {/* If Poetry: Stanzas Editor */}
            {artwork.category === 'poetry' && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5" /> Poetic Stanzas (Separate stanzas with double enter)
                  </label>
                  <span className="text-[9px] text-neutral-400 font-mono-code">Lyrical Verse Editor</span>
                </div>
                <textarea
                  rows={6}
                  value={stanzasStr}
                  onChange={(e) => setStanzasStr(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors resize-none font-serif italic"
                  placeholder="Stanza 1...&#10;&#10;Stanza 2..."
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                Curatorial Statement / Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-3 text-white text-sm focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[#c9a875] font-mono-code font-bold">
                Curator Observation / Special Note
              </label>
              <textarea
                rows={2}
                value={curatorNote}
                onChange={(e) => setCuratorNote(e.target.value)}
                className="w-full bg-black/60 border border-white/15 focus:border-[#c9a875] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none italic"
                placeholder="Observation or exhibition citation..."
              />
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-white/15 text-xs text-neutral-300 hover:text-white font-mono-code transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cb9a] text-black font-mono-code font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                Save Atelier Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
