import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Check,
  User,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Palette,
  CheckCircle2,
  Trash2,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_USER } from '../data/initialData';
import { GalleryService } from '../services/api';
import { uploadMediaToSupabase, upsertProfileToSupabase } from '../services/supabaseClient';
import { Avatar } from './Avatar';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetUser?: UserProfile | null;
  onSuccess: (updatedUser: UserProfile) => void;
}

const ARTISTIC_AVATAR_PRESETS = [
  {
    name: 'Sanctuary Curatorial Seal',
    url: '/curatorial-masterpiece.svg',
    tag: 'Official Seal'
  },
  {
    name: 'Volcanic Eruption (Molten Caldera)',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
    tag: 'Volcanic Magma'
  },
  {
    name: 'Midnight Sea & Bioluminescent Waves',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    tag: 'Ocean Nocturne'
  },
  {
    name: 'Golden Sun Hour & Solstice Glow',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    tag: 'Golden Radiance'
  },
  {
    name: 'Cosmic Nebula & Midnight Aurora',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    tag: 'Cosmic Realm'
  },
  {
    name: 'Obsidian Alchemy & Liquid Gold',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    tag: 'Fine Art Texture'
  }
];

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  onSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  
  const effectiveUser = targetUser || currentUser;

  // State
  const [name, setName] = useState(effectiveUser.name || 'Artist');
  const [handle, setHandle] = useState((effectiveUser.handle || '@artist').replace(/^@/, ''));
  const [avatar, setAvatar] = useState(effectiveUser.avatar || DEFAULT_USER.avatar);
  const [urlInput, setUrlInput] = useState('');
  const [discipline, setDiscipline] = useState(effectiveUser.discipline || 'Visual Artist & Poet');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const active = targetUser || currentUser;
      setName(active.name || 'Artist');
      setHandle((active.handle || '@artist').replace(/^@/, ''));
      setAvatar(active.avatar || DEFAULT_USER.avatar);
      setDiscipline(active.discipline || 'Visual Artist & Poet');
      setUrlInput('');
      setSavedSuccess(false);
      setIsUploading(false);
      setIsSaving(false);
    }
  }, [isOpen, currentUser, targetUser]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB. Please select a smaller photo.');
      return;
    }

    try {
      setIsUploading(true);
      const publicCdnUrl = await uploadMediaToSupabase(file, 'avatars', 'profiles');
      setAvatar(publicCdnUrl);
    } catch (err) {
      console.warn('[ProfilePictureModal] Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setAvatar(urlInput.trim());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      alert('Please wait for image upload to complete.');
      return;
    }

    setIsSaving(true);

    try {
      const cleanName = name.trim() || effectiveUser.name || 'Artist';
      const isFounder =
        effectiveUser.id === DEFAULT_USER.id ||
        effectiveUser.handle === DEFAULT_USER.handle ||
        effectiveUser.handle === '@afshaanshaikh' ||
        effectiveUser.name?.toLowerCase().includes('afshaan') ||
        name.toLowerCase().includes('afshaan') ||
        handle.toLowerCase() === 'afshaanshaikh' ||
        targetUser?.id === DEFAULT_USER.id;

      const cleanHandle = isFounder ? 'afshaanshaikh' : (handle.trim().replace(/^@/, '') || effectiveUser.handle.replace(/^@/, '') || 'artist');
      const finalAvatar = avatar.trim() || DEFAULT_USER.avatar;

      const updatedUser: UserProfile = {
        ...effectiveUser,
        id: isFounder ? DEFAULT_USER.id : effectiveUser.id,
        name: cleanName,
        handle: `@${cleanHandle}`,
        avatar: finalAvatar,
        discipline: discipline.trim() || effectiveUser.discipline || 'Visual Artist & Poet'
      };

      if (isFounder) {
        // Direct database update to Supabase for the founder
        await GalleryService.updateFounderProfile(updatedUser);
      } else {
        GalleryService.saveCurrentUser(updatedUser);
        await upsertProfileToSupabase(updatedUser);
      }

      onSuccess(updatedUser);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 600);
    } catch (err) {
      console.warn('[ProfilePictureModal] Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/90 backdrop-blur-md">
      <div
        id="profile-picture-modal"
        className="relative w-full max-w-2xl bg-[#0a0c10] border border-[#c9a875]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col rounded-xl font-sans"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0f17]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/40 flex items-center justify-center text-[#c9a875]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif-display font-semibold text-white tracking-wide">
                Edit Profile Picture & Name
              </h3>
              <p className="text-[11px] font-mono-code text-[#c9a875] tracking-wider">
                Permanent Cloud Storage & Identity Management
              </p>
            </div>
          </div>
          <button
            id="close-profile-picture-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Main Visual Preview Bar */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#121520] via-[#0e1017] to-[#0a0c10] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Previews */}
            <div className="relative group shrink-0">
              <Avatar
                src={avatar}
                name={name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#c9a875] shadow-[0_0_25px_rgba(201,168,117,0.3)] object-cover"
                textSize="text-2xl font-bold"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer border border-[#c9a875]"
                title="Click to change photo"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-[#c9a875] animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-[#c9a875]" />
                    <span className="text-[8px] uppercase tracking-widest text-[#dfbd87] font-bold mt-1">Upload</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Details Live Preview */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <div className="text-[10px] font-mono-code uppercase tracking-[0.2em] text-[#c9a875]">
                Live Atelier Preview
              </div>
              <h4 className="text-xl sm:text-2xl font-serif-display font-bold text-white truncate">
                {name || 'Afshaan Shaikh'}
              </h4>
              <p className="text-xs font-mono-code text-neutral-400">
                @{handle || 'afshaanshaikh'}
              </p>
              <p className="text-[11px] font-mono-code text-[#dfbd87] uppercase tracking-wider truncate">
                {discipline}
              </p>
            </div>
          </div>

          {/* Section 1: Name & Identity Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#c9a875]" />
                <span>Artist Display Name</span>
              </label>
            </div>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  id="profile-edit-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artist Name"
                  className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/15 focus:border-[#c9a875] text-white rounded-lg text-sm focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-500 font-mono-code text-sm">@</span>
                  <input
                    type="text"
                    id="profile-edit-handle-input"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="afshaanshaikh"
                    className="w-full pl-8 pr-4 py-2.5 bg-neutral-900/90 border border-white/15 focus:border-[#c9a875] text-white rounded-lg text-sm font-mono-code focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
                Disciplines / Subtitle
              </label>
              <input
                type="text"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="ARTIST | POET | CODER | SOFTWARE DEVELOPER"
                className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/15 focus:border-[#c9a875] text-white rounded-lg text-xs font-mono-code focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Photo Source Tabs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.15em] text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#c9a875]" />
                <span>Profile Picture Source</span>
              </label>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#c9a875] text-black font-bold'
                    : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to Cloud</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'presets'
                    ? 'bg-[#c9a875] text-black font-bold'
                    : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Artistic Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-[#c9a875] text-black font-bold'
                    : 'text-neutral-400 hover:text-white bg-white/5'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Image URL</span>
              </button>
            </div>

            {/* Tab 1: Upload from device */}
            {activeTab === 'upload' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#c9a875] bg-[#c9a875]/10 scale-[1.01]'
                    : 'border-white/20 hover:border-[#c9a875]/60 bg-neutral-900/40 hover:bg-neutral-900/80'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[#c9a875]/10 border border-[#c9a875]/30 flex items-center justify-center text-[#c9a875] mx-auto mb-3">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  {isUploading ? 'Uploading to Supabase CDN...' : 'Click to select or drag & drop photo'}
                </div>
                <div className="text-xs text-neutral-400 font-mono-code">
                  Saved permanently in Supabase Cloud Storage (JPG, PNG, WebP, SVG up to 10MB)
                </div>
              </div>
            )}

            {/* Tab 2: Curated Presets */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ARTISTIC_AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      className={`flex flex-col items-center gap-2 p-2.5 rounded-lg border text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-[#c9a875] bg-[#c9a875]/15 ring-2 ring-[#c9a875]'
                          : 'border-white/10 hover:border-white/30 bg-neutral-900/50'
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/20">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          onError={(e) => {
                            e.currentTarget.src = '/curatorial-masterpiece.svg';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[#c9a875]">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <div className="text-[11px] font-semibold text-white truncate">{preset.name}</div>
                        <div className="text-[9px] font-mono-code text-[#c9a875]">{preset.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Paste URL */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 px-4 py-2.5 bg-neutral-900 border border-white/15 focus:border-[#c9a875] text-white rounded-lg text-xs font-mono-code focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 bg-[#c9a875] hover:bg-[#dfbd87] text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Paste a direct link to any public image on Unsplash, GitHub, or your personal website.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setAvatar(currentUser.avatar || '/curatorial-masterpiece.svg');
                setName(currentUser.name || '');
                setHandle((currentUser.handle || '').replace(/^@/, ''));
                setDiscipline(currentUser.discipline || 'Visual Artist & Poet');
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="save-profile-picture-btn"
                disabled={isUploading || isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c9a875] to-[#dfbd87] hover:from-[#dfbd87] hover:to-[#e8cf9f] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Saved to Database!</span>
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 text-black animate-spin" />
                    <span>Updating Cloud...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
