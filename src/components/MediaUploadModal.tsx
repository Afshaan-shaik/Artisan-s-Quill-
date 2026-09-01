import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Feather, Palette, PenTool, Image as ImageIcon, Film, Sparkles, Check, RefreshCw, Music } from 'lucide-react';
import { ArtCategory, Artwork, PoetryTheme, PoetryFont, AspectRatioType } from '../types';
import { PoetryCard } from './PoetryCard';
import { GalleryService } from '../services/api';
import { uploadArtworkMediaToStorage } from '../services/supabaseClient';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newArtwork: Artwork) => void;
  initialCategory?: ArtCategory;
  initialFormat?: string;
}

const PRESET_ART_IMAGES = [
  {
    title: 'Nocturnal Metamorphosis in Oil',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'painting' as const,
    medium: 'Oil on Belgian Canvas',
    palette: ['#0f0f14', '#c9a875', '#382f25', '#e9dfd0', '#635340']
  },
  {
    title: 'Graphite Resonance No. IX',
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    category: 'drawing' as const,
    medium: 'Compressed Charcoal & Graphite',
    palette: ['#121317', '#8b8e99', '#3b3d45', '#d4d6dc', '#222329']
  },
  {
    title: 'Cybernetic Monolith in Shader Code',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    category: 'digital' as const,
    medium: 'Generative Neural Shader',
    palette: ['#0c0d1c', '#a855f7', '#ec4899', '#312e81', '#fbcfe8']
  },
  {
    title: 'Fluid Obsidian Suspension',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'video' as const,
    medium: '4K Volumetric Fluid Simulation',
    palette: ['#090a0f', '#eab308', '#262626', '#ca8a04', '#fafafa']
  }
];

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCategory = 'poetry',
  initialFormat
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'poetry'>(
    initialFormat?.includes('poetry') || initialCategory === 'poetry' ? 'poetry' : 'visual'
  );
  const [activeFormat, setActiveFormat] = useState<string>(
    initialFormat || (initialCategory === 'poetry' ? 'poetry card' : initialCategory === 'digital' ? 'digital art' : 'digital art')
  );

  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tagsInput, setTagsInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('tall');

  // Visual art fields
  const [visualCategory, setVisualCategory] = useState<'painting' | 'drawing' | 'digital' | 'video'>(
    initialCategory === 'poetry' || initialCategory === 'all' ? 'digital' : initialCategory
  );
  const [medium, setMedium] = useState(
    initialFormat === 'integer art' ? 'Algorithmic Integer Canvas & Shader Code' : 'Generative Shader & 3D Render'
  );
  const [dimensions, setDimensions] = useState('120 x 160 cm');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [paletteHexes, setPaletteHexes] = useState<string[]>([
    '#111218',
    '#c9a875',
    '#4b3c2d',
    '#ded7ca',
    '#705f4c'
  ]);
  const [videoDuration, setVideoDuration] = useState('0:30 (Loop)');

  // Poetry specific fields
  const [poetryRawText, setPoetryRawText] = useState(
    'The night is a crucible of heavy water,\nslowly cooling into morning obsidian.\n\nWe count the heartbeats left upon the shore,\nbefore the tide reclaims the quiet stone.'
  );
  const [poetrySubtitle, setPoetrySubtitle] = useState('From the Nocturne Fragments');
  const [poetryTheme, setPoetryTheme] = useState<PoetryTheme>('obsidian');
  const [poetryFont, setPoetryFont] = useState<PoetryFont>('cormorant');
  const [poetryAlignment, setPoetryAlignment] = useState<'left' | 'center'>('center');
  const [authorSignature, setAuthorSignature] = useState('— Atelier Member');
  const [guestName, setGuestName] = useState('Guest Artist');
  const [guestHandle, setGuestHandle] = useState('@guest_artist');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFormat) {
      setActiveFormat(initialFormat);
      if (initialFormat === 'poetry session' || initialFormat === 'poetry card') {
        setActiveTab('poetry');
      } else {
        setActiveTab('visual');
        setVisualCategory('digital');
        if (initialFormat === 'integer art') {
          setMedium('Algorithmic Integer Canvas & Shader Code');
        } else {
          setMedium('Generative Shader & 3D Render');
        }
      }
    } else if (initialCategory === 'poetry') {
      setActiveTab('poetry');
      setActiveFormat('poetry card');
    } else if (initialCategory !== 'all') {
      setActiveTab('visual');
      setVisualCategory(initialCategory);
      setActiveFormat(initialCategory === 'digital' ? 'digital art' : `${initialCategory} art`);
    }
  }, [initialCategory, initialFormat]);

  if (!isOpen) return null;

  // Auto-split poetry stanzas by blank line
  const parsedStanzas = poetryRawText
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingMedia(true);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      // Auto-detect video files (MP4, WebM, MOV, etc.)
      if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v|ogv)$/i)) {
        setVisualCategory('video');
        if (!medium) setMedium('4K Volumetric Fluid Dynamics & Motion Loop');
        setAspectRatio('wide');
      }
      const publicUrl = await uploadArtworkMediaToStorage(file);
      setMediaUrl(publicUrl);
    } catch (err) {
      console.warn('[MediaUploadModal] Upload error, using data URI fallback:', err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_ART_IMAGES[0]) => {
    setMediaUrl(preset.url);
    setTitle(preset.title);
    setVisualCategory(preset.category);
    setMedium(preset.medium);
    setPaletteHexes(preset.palette);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const isGuest = activeUser.id === 'guest';
    const artistObj = isGuest
      ? {
          id: `guest-${Date.now()}`,
          name: guestName.trim() || 'Guest Artist',
          handle: guestHandle.startsWith('@') ? guestHandle.trim() : `@${guestHandle.trim() || 'guest'}`,
          avatar: '/curatorial-masterpiece.svg',
          verified: false
        }
      : {
          id: activeUser.id,
          name: activeUser.name,
          handle: activeUser.handle,
          avatar: activeUser.avatar || '/curatorial-masterpiece.svg',
          verified: activeUser.verified ?? true
        };

    const newArtId = `art-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (activeTab === 'poetry') {
      const poetryArtwork: Artwork = {
        id: newArtId,
        title: title.trim(),
        category: 'poetry',
        artist: artistObj,
        mediaUrl: mediaUrl.trim() || '/curatorial-masterpiece.svg',
        thumbnailUrl: mediaUrl.trim() || '/curatorial-masterpiece.svg',
        medium: 'Poetic Lyric & Typography Card',
        dimensions: 'Aesthetic Card',
        year: year,
        description: description.trim() || 'Curated poetry card crafted in The Artisan\'s Quill.',
        tags: tags.length > 0 ? tags : ['Poetry', 'Lyric Verse', 'Atelier'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: 'portrait',
        isLiked: false,
        isSaved: false,
        featured: false,
        colorPalette:
          poetryTheme === 'vellum'
            ? ['#1c1813', '#cbb084', '#3d3121', '#f3ebd9']
            : poetryTheme === 'midnight'
            ? ['#0f121a', '#9bb4d0', '#25354e', '#e3ecf5']
            : poetryTheme === 'emerald'
            ? ['#0d1712', '#52b788', '#1b3b2c', '#d8f3dc']
            : poetryTheme === 'crimson'
            ? ['#1c0c10', '#df526b', '#481720', '#fad5dc']
            : ['#12141c', '#c9a875', '#333b4d', '#f0f3fa'],
        poetryContent: {
          stanzas: parsedStanzas.length > 0 ? parsedStanzas : ['Silence speaks in verse.'],
          theme: poetryTheme,
          fontStyle: poetryFont,
          alignment: poetryAlignment,
          readingTimeMinutes: Math.max(1, Math.ceil(poetryRawText.split(/\s+/).length / 70)),
          authorSignature: authorSignature.trim() || (isGuest ? `— ${guestName.trim() || 'Guest Poet'}` : '— Atelier Poet'),
          subtitle: poetrySubtitle.trim()
        }
      };
      onSuccess(poetryArtwork);
    } else {
      const resolvedMediaUrl = mediaUrl.trim() || '/curatorial-masterpiece.svg';

      const isVideoFinal = visualCategory === 'video' || resolvedMediaUrl.match(/\.(mp4|webm|mov|m4v|ogv)/i) != null;

      const visualArtwork: Artwork = {
        id: newArtId,
        title: title.trim(),
        category: isVideoFinal ? 'video' : visualCategory,
        artist: artistObj,
        mediaUrl: resolvedMediaUrl,
        thumbnailUrl: resolvedMediaUrl,
        dimensions: dimensions.trim() || (isVideoFinal ? '4K Cinema (3840 x 2160)' : 'Original Canvas'),
        medium: medium.trim() || (isVideoFinal ? '4K Volumetric Fluid Dynamics & Motion Loop' : activeFormat === 'integer art' ? 'Algorithmic Integer Canvas & Shader Code' : 'Generative Shader & 3D Render'),
        year: year,
        description: description.trim() || (isVideoFinal ? 'A curated motion cinema loop in The Artisan\'s Quill sanctuary.' : 'Artist piece published in the sanctuary.'),
        tags: tags.length > 0 ? tags : [isVideoFinal ? 'VIDEO' : visualCategory.toUpperCase(), 'Atelier Collection'],
        likesCount: 0,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        aspectRatio: aspectRatio || (isVideoFinal ? 'wide' : 'tall'),
        colorPalette: paletteHexes,
        isLiked: false,
        isSaved: false,
        featured: false,
        videoData:
          isVideoFinal
            ? {
                duration: videoDuration || '0:30 (Loop)',
                isLoop: true,
                resolution: '4K Cinema',
                hasAudio: true
              }
            : undefined
      };
      onSuccess(visualArtwork);
    }
  };

  // Mock artwork object for live poetry preview
  const activeUser = GalleryService.getCurrentUser();
  const livePreviewArtwork: Artwork = {
    id: 'preview-artwork',
    title: title || 'Title of Your Verse',
    artist: {
      id: activeUser.id !== 'guest' ? activeUser.id : 'preview-artist',
      name: activeUser.id !== 'guest' ? activeUser.name : 'Atelier Poet',
      handle: activeUser.id !== 'guest' ? activeUser.handle : '@poet',
      avatar: activeUser.avatar || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    category: 'poetry',
    mediaUrl: '',
    year,
    description: description || 'Live preview',
    tags: ['Preview'],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: new Date().toISOString(),
    aspectRatio: 'portrait',
    poetryContent: {
      stanzas: parsedStanzas.length > 0 ? parsedStanzas : ['Enter your poem lines in the composer to the left...'],
      theme: poetryTheme,
      fontStyle: poetryFont,
      alignment: poetryAlignment,
      readingTimeMinutes: Math.max(1, Math.ceil(poetryRawText.split(/\s+/).length / 70)),
      authorSignature: authorSignature || '— Elena Vance',
      subtitle: poetrySubtitle || 'Drafting Verse'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div
        id="media-upload-modal"
        className="relative w-full max-w-5xl bg-[#11131a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#151822]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#c9a875]">
              {activeTab === 'poetry' ? <Feather className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-serif-display font-semibold text-white">
                {activeTab === 'poetry' ? 'Poetry Studio & Card Formatter' : 'Exhibition Media Upload'}
              </h2>
              <p className="text-xs text-white/50 font-mono-code">
                {activeTab === 'poetry'
                  ? 'Automatically format stanzas into high-end aesthetic presentation cards'
                  : 'Submit paintings, fine charcoal drawings, digital renders, and video loops'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 4 Format Switcher Buttons */}
            <div className="flex flex-wrap p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono-code gap-1">
              <button
                type="button"
                id="modal-tab-poetry-session"
                onClick={() => {
                  setActiveTab('poetry');
                  setActiveFormat('poetry session');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'poetry' && activeFormat === 'poetry session'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Poetry Session
              </button>
              <button
                type="button"
                id="modal-tab-poetry-card"
                onClick={() => {
                  setActiveTab('poetry');
                  setActiveFormat('poetry card');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'poetry' && activeFormat === 'poetry card'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                Poetry Card
              </button>
              <button
                type="button"
                id="modal-tab-digital-art"
                onClick={() => {
                  setActiveTab('visual');
                  setVisualCategory('digital');
                  setActiveFormat('digital art');
                  setMedium('Generative Shader & 3D Render');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'visual' && activeFormat === 'digital art'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Digital Art
              </button>
              <button
                type="button"
                id="modal-tab-integer-art"
                onClick={() => {
                  setActiveTab('visual');
                  setVisualCategory('digital');
                  setActiveFormat('integer art');
                  setMedium('Algorithmic Integer Canvas & Shader Code');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'visual' && activeFormat === 'integer art'
                    ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Integer Art
              </button>
            </div>

            <button
              id="close-upload-modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'visual' ? (
            /* Visual Art Form */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Media & File Upload */}
              <div className="lg:col-span-6 space-y-5">
                {activeUser.id === 'guest' && (
                  <div className="p-3.5 rounded-xl bg-[#c9a875]/10 border border-[#c9a875]/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a875] uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Broadcasting to Global Live Feed (Guest Creator)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Artist Display Name</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Elena Vance"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Artist Handle</label>
                        <input
                          type="text"
                          value={guestHandle}
                          onChange={(e) => setGuestHandle(e.target.value)}
                          placeholder="e.g. @elena.art"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Discipline Category
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['painting', 'drawing', 'digital', 'video'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setVisualCategory(cat);
                          if (cat === 'painting') setMedium('Oil on Belgian Linen');
                          if (cat === 'drawing') setMedium('Charcoal & Graphite on Cotton Paper');
                          if (cat === 'digital') setMedium('Generative Shader & 3D Render');
                          if (cat === 'video') setMedium('4K Volumetric Fluid Loop');
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-mono-code capitalize transition-all cursor-pointer ${
                          visualCategory === cat
                            ? 'bg-[#c9a875]/15 border-[#c9a875] text-[#c9a875] font-semibold'
                            : 'bg-black/20 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {cat === 'painting' && <Palette className="w-4 h-4" />}
                        {cat === 'drawing' && <PenTool className="w-4 h-4" />}
                        {cat === 'digital' && <ImageIcon className="w-4 h-4" />}
                        {cat === 'video' && <Film className="w-4 h-4" />}
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Box or Image URL */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Artwork Media
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all overflow-hidden flex flex-col items-center justify-center min-h-[220px] ${
                      mediaUrl
                        ? 'border-[#c9a875]/50 bg-black/40'
                        : 'border-white/15 hover:border-[#c9a875]/40 bg-black/20'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {mediaUrl ? (
                      <div className="space-y-3 w-full">
                        <img
                          src={mediaUrl}
                          alt="Uploaded Preview"
                          className="max-h-48 rounded-xl mx-auto object-cover border border-white/20"
                        />
                        <p className="text-xs text-[#c9a875] font-mono-code">
                          Click to select a different file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-[#c9a875] mx-auto animate-bounce" />
                        <p className="text-sm font-medium text-white">
                          Drag & drop high-res artwork or click to browse
                        </p>
                        <p className="text-xs text-white/40 font-mono-code">
                          Supports PNG, JPG, WebP, GIF, MP4 (Up to 50MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-mono-code text-white/50 mb-1">
                      Or paste an external Image / Video URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#c9a875] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Curated Studio Presets */}
                <div>
                  <label className="block text-xs font-mono-code text-white/50 mb-2">
                    Or select a curated masterpiece demo asset:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_ART_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset)}
                        className="group relative rounded-xl overflow-hidden aspect-square border border-white/15 cursor-pointer hover:border-[#c9a875]"
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-mono-code text-center p-1">
                          Select
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Artwork Title *
                  </label>
                  <input
                    id="artwork-title-input"
                    type="text"
                    required
                    placeholder="e.g. Echoes of Gold and Rust"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-serif-display text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Medium
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Oil on Belgian Linen"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Dimensions / Resolution
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 140 x 180 cm"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Year Created
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Aspect Ratio
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    >
                      <option value="tall" className="bg-[#11131a]">Tall (3:4)</option>
                      <option value="square" className="bg-[#11131a]">Square (1:1)</option>
                      <option value="wide" className="bg-[#11131a]">Wide (16:10)</option>
                      <option value="ultrawide" className="bg-[#11131a]">Ultra Wide (21:9)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Artist Statement & Philosophical Concept
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the aesthetic intention, textures, emotional narrative, or technical process..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Color Palette Picker */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Harmonic Color Palette (Extracted HEX)
                  </label>
                  <div className="flex items-center gap-2">
                    {paletteHexes.map((hex, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="color"
                          value={hex}
                          onChange={(e) => {
                            const copy = [...paletteHexes];
                            copy[idx] = e.target.value;
                            setPaletteHexes(copy);
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPaletteHexes([
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
                          '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
                        ])
                      }
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 text-xs font-mono-code flex items-center gap-1 cursor-pointer"
                      title="Randomize Palette"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Chiaroscuro, Oil Painting, Nocturne, Texture"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Poetry Studio Form & Live Card Formatter */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Poetry Composer */}
              <div className="lg:col-span-6 space-y-4">
                {activeUser.id === 'guest' && (
                  <div className="p-3.5 rounded-xl bg-[#c9a875]/10 border border-[#c9a875]/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a875] uppercase tracking-wider font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Broadcasting to Global Live Feed (Guest Poet)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Poet Name / Moniker</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Aria Chen"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono-code text-white/70 mb-1">Your Handle</label>
                        <input
                          type="text"
                          value={guestHandle}
                          onChange={(e) => setGuestHandle(e.target.value)}
                          placeholder="e.g. @ariachen.verse"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Poem Title *
                  </label>
                  <input
                    id="poem-title-input"
                    type="text"
                    required
                    placeholder="e.g. Anatomy of the Night Wind"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-serif-display text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Collection / Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. From 'Monasteries of the Rain'"
                      value={poetrySubtitle}
                      onChange={(e) => setPoetrySubtitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Author Signature
                    </label>
                    <input
                      type="text"
                      placeholder="— Elena Vance, 2026"
                      value={authorSignature}
                      onChange={(e) => setAuthorSignature(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    />
                  </div>
                </div>

                {/* Stanzas Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono-code uppercase tracking-wider text-white/70">
                      Poetic Stanzas (Separate stanzas with double Enter)
                    </label>
                    <span className="text-[11px] text-[#c9a875] font-mono-code">
                      {parsedStanzas.length} Stanza{parsedStanzas.length !== 1 ? 's' : ''} detected
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    required
                    placeholder="Enter your lines here...&#10;&#10;Separate each stanza with a blank line to format cleanly."
                    value={poetryRawText}
                    onChange={(e) => setPoetryRawText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:border-[#c9a875] focus:outline-none font-cormorant text-base leading-relaxed"
                  />
                </div>

                {/* Card Theme Picker */}
                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-2">
                    Aesthetic Card Theme & Texture
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['obsidian', 'vellum', 'midnight', 'emerald', 'crimson'] as PoetryTheme[]).map(
                      (theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setPoetryTheme(theme)}
                          className={`p-2.5 rounded-xl border text-[11px] font-mono-code capitalize transition-all cursor-pointer text-center ${
                            poetryTheme === theme
                              ? 'border-[#c9a875] ring-2 ring-[#c9a875]/40 font-semibold'
                              : 'border-white/10 hover:border-white/30'
                          } ${
                            theme === 'obsidian'
                              ? 'bg-[#12141d] text-white'
                              : theme === 'vellum'
                              ? 'bg-[#201a14] text-[#f3ebd9]'
                              : theme === 'midnight'
                              ? 'bg-[#111a2e] text-[#9bb4d0]'
                              : theme === 'emerald'
                              ? 'bg-[#10241b] text-[#52b788]'
                              : 'bg-[#291216] text-[#df526b]'
                          }`}
                        >
                          {theme}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Typography & Alignment Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Serif Typography
                    </label>
                    <select
                      value={poetryFont}
                      onChange={(e) => setPoetryFont(e.target.value as PoetryFont)}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                    >
                      <option value="cormorant" className="bg-[#11131a]">Cormorant Garamond (Classic)</option>
                      <option value="newsreader" className="bg-[#11131a]">Newsreader (Refined Book)</option>
                      <option value="playfair" className="bg-[#11131a]">Playfair Display (Dramatic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-black/30 border border-white/15 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPoetryAlignment('center')}
                        className={`py-1 rounded-lg text-xs font-mono-code transition-colors cursor-pointer ${
                          poetryAlignment === 'center'
                            ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoetryAlignment('left')}
                        className={`py-1 rounded-lg text-xs font-mono-code transition-colors cursor-pointer ${
                          poetryAlignment === 'left'
                            ? 'bg-[#c9a875] text-[#0d0e12] font-semibold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Left
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-code uppercase tracking-wider text-white/70 mb-1.5">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Lyric Poetry, Free Verse, Philosophy, Night"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white focus:border-[#c9a875] focus:outline-none font-mono-code"
                  />
                </div>
              </div>

              {/* Right Column: Live Formatted Card Preview */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono-code uppercase tracking-wider text-[#c9a875] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Live Aesthetic Card Preview
                  </span>
                  <span className="text-[11px] text-white/40 font-mono-code">
                    Rendered in real-time
                  </span>
                </div>

                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-center overflow-hidden">
                  <div className="w-full max-w-md">
                    <PoetryCard
                      artwork={livePreviewArtwork}
                      onSelect={() => {}}
                      onToggleLike={() => {}}
                      onToggleSave={() => {}}
                      onSelectArtist={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/5 text-xs font-mono-code transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-artwork-btn"
              type="submit"
              className="flex items-center gap-2 px-7 py-3 rounded-full bg-[#c9a875] hover:bg-[#dfba88] text-[#0c0d10] font-semibold text-sm transition-all cursor-pointer shadow-xl shadow-[#c9a875]/20 hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              {activeTab === 'poetry' ? 'Publish Formatted Poetry Card' : 'Inaugurate to Sanctuary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
