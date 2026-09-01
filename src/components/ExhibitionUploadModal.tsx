import React, { useState, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, MapPin, Calendar, Layout, Upload, Loader2 } from 'lucide-react';
import { Exhibition } from '../types';
import { uploadMediaToSupabase } from '../services/supabaseClient';

interface ExhibitionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (exhibition: Omit<Exhibition, 'id'>) => void;
}

export const ExhibitionUploadModal: React.FC<ExhibitionUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [curator, setCurator] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState('');
  const [theme, setTheme] = useState('');
  const [location, setLocation] = useState('');

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const url = await uploadMediaToSupabase(file, 'artworks', 'exhibitions');
      setCoverImage(url);
    } catch (err) {
      console.warn('[ExhibitionUploadModal] Cover upload error:', err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      title,
      subtitle,
      curator: curator || 'Independent Curator',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
      description,
      dates,
      theme,
      artworkIds: [],
      location: location || 'Main Atrium'
    });
    // Reset
    setTitle('');
    setSubtitle('');
    setCurator('');
    setCoverImage('');
    setDescription('');
    setDates('');
    setTheme('');
    setLocation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/95 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/5 rounded-sm p-8 sm:p-12 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-[#c9a875]" />
          <h2 className="font-serif-display text-2xl font-light text-white uppercase tracking-widest">
            Curate Exhibition
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500">Exhibition Title *</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
                placeholder="E.g., Shadows & Light"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
                placeholder="A Study of Form..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500">Curator Name</label>
            <input
              type="text"
              value={curator}
              onChange={(e) => setCurator(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
              placeholder="E.g., Elena Vance"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500">Cover Image</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover}
                className="text-[10px] uppercase tracking-widest text-[#c9a875] hover:text-white transition-colors flex items-center gap-1.5"
              >
                {isUploadingCover ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Uploading to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
                placeholder="https://images.unsplash.com/... or click Upload File"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500">Dates</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
                  placeholder="August 1 - Sept 30"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-sm text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors"
                  placeholder="Virtual Hall I"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:border-[#c9a875] focus:outline-none transition-colors resize-none"
              placeholder="Curatorial statement..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-black text-[10px] uppercase tracking-widest hover:bg-[#c9a875] transition-colors rounded-sm font-medium mt-4"
          >
            Launch Exhibition
          </button>
        </form>
      </div>
    </div>
  );
};
