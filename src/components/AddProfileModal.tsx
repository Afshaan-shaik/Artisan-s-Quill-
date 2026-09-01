import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Quote,
  Check,
  User,
  Globe,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Palette,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { UserProfile } from '../types';
import { GalleryService } from '../services/api';
import { syncUserProfileToCloud } from '../services/firebase';
import { uploadMediaToSupabase } from '../services/supabaseClient';
import { Avatar } from './Avatar';

interface AddProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
  isCreateMode?: boolean;
  initialTab?: 'details' | 'avatar' | 'quote' | 'social';
}

const AVATAR_PRESETS = [
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

const COVER_PRESETS = [
  {
    name: 'Dark Obsidian Canvas',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80'
  },
  {
    name: 'Gold Foil Texture',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=80'
  },
  {
    name: 'Atmospheric Studio Light',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1400&q=80'
  },
  {
    name: 'Nocturne Deep Sea',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'
  }
];

const INSPIRATIONAL_QUOTES = [
  {
    text: 'Art washes away from the soul the dust of everyday life.',
    author: 'Pablo Picasso'
  },
  {
    text: 'Every child is an artist. The problem is how to remain an artist once we grow up.',
    author: 'Pablo Picasso'
  },
  {
    text: 'I dream my painting and I paint my dream.',
    author: 'Vincent van Gogh'
  },
  {
    text: 'Life imitates art far more than art imitates Life.',
    author: 'Oscar Wilde'
  },
  {
    text: 'Tell me, what is it you plan to do with your one wild and precious life?',
    author: 'Mary Oliver'
  },
  {
    text: 'Let everything happen to you: beauty and terror. Just keep going. No feeling is final.',
    author: 'Rainer Maria Rilke'
  },
  {
    text: 'Simplicity is the ultimate sophistication.',
    author: 'Leonardo da Vinci'
  },
  {
    text: 'Without music and art, life would be a mistake.',
    author: 'Friedrich Nietzsche'
  }
];

const AVAILABLE_BADGES = [
  'Resident Creator',
  'Master Lyricist',
  'Oil Painter',
  'Digital Pioneer',
  'Curator Fellow',
  'Sculptural Arts',
  'Verified Studio',
  'Nocturne Collector'
];

export const AddProfileModal: React.FC<AddProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  isCreateMode = false,
  initialTab = 'details'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState(isCreateMode ? '' : currentUser.name);
  const [handle, setHandle] = useState(isCreateMode ? '' : currentUser.handle.replace(/^@/, ''));
  const [avatar, setAvatar] = useState(
    isCreateMode
      ? '/curatorial-masterpiece.svg'
      : currentUser.avatar || '/curatorial-masterpiece.svg'
  );
  const [coverImage, setCoverImage] = useState(
    currentUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80'
  );
  const [discipline, setDiscipline] = useState(isCreateMode ? 'Visual Arts & Creative Writing' : currentUser.discipline || 'Visual Arts & Creative Writing');
  const [location, setLocation] = useState(isCreateMode ? 'Studio Atelier' : currentUser.location || 'Studio Atelier');
  const [bio, setBio] = useState(isCreateMode ? '' : currentUser.bio || '');

  // Favourite Quote
  const initialQuoteText =
    typeof currentUser.favoriteQuote === 'object'
      ? currentUser.favoriteQuote?.text
      : typeof currentUser.favoriteQuote === 'string'
      ? currentUser.favoriteQuote
      : 'Art washes away from the soul the dust of everyday life.';
  const initialQuoteAuthor =
    typeof currentUser.favoriteQuote === 'object' ? currentUser.favoriteQuote?.author || 'Pablo Picasso' : 'Pablo Picasso';

  const [quoteText, setQuoteText] = useState(isCreateMode ? '' : initialQuoteText);
  const [quoteAuthor, setQuoteAuthor] = useState(isCreateMode ? '' : initialQuoteAuthor);

  // Socials
  const [website, setWebsite] = useState(isCreateMode ? '' : currentUser.website || '');
  const [instagram, setInstagram] = useState(isCreateMode ? '' : currentUser.instagram || '');
  const [twitter, setTwitter] = useState(isCreateMode ? '' : currentUser.twitter || '');
  const [email, setEmail] = useState(isCreateMode ? '' : currentUser.email || '');
  const [phone, setPhone] = useState(isCreateMode ? '' : currentUser.phone || '');

  // Badges
  const [badges, setBadges] = useState<string[]>(
    isCreateMode ? ['Resident Creator', 'Verified Studio'] : currentUser.badges || ['Resident Creator']
  );

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'avatar' | 'quote' | 'social'>(initialTab);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'new_persona'>(isCreateMode ? 'new_persona' : 'update');

  const handleClearForm = () => {
    setName('');
    setHandle('');
    setAvatar('/curatorial-masterpiece.svg');
    setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80');
    setDiscipline('Visual Arts & Creative Writing');
    setLocation('Studio Atelier');
    setBio('');
    setQuoteText('Art washes away from the soul the dust of everyday life.');
    setQuoteAuthor('Pablo Picasso');
    setWebsite('');
    setInstagram('');
    setTwitter('');
    setEmail('');
    setPhone('');
    setBadges(['Resident Creator', 'Verified Studio']);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveSubTab(initialTab || 'details');
      if (isCreateMode) {
        setName('');
        setHandle('');
        setAvatar('/curatorial-masterpiece.svg');
        setCoverImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80');
        setDiscipline('Visual Arts & Creative Writing');
        setLocation('Studio Atelier');
        setBio('');
        setQuoteText('Art washes away from the soul the dust of everyday life.');
        setQuoteAuthor('Pablo Picasso');
        setWebsite('');
        setInstagram('');
        setTwitter('');
        setEmail('');
        setPhone('');
        setBadges(['Resident Creator', 'Verified Studio']);
        setSaveMode('new_persona');
      } else {
        setName(currentUser.name || '');
        setHandle((currentUser.handle || '').replace(/^@/, ''));
        setAvatar(currentUser.avatar || '/curatorial-masterpiece.svg');
        setCoverImage(
          currentUser.coverImage ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80'
        );
        setDiscipline(currentUser.discipline || 'Visual Arts & Creative Writing');
        setLocation(currentUser.location || 'Studio Atelier');
        setBio(currentUser.bio || '');
        const qText =
          typeof currentUser.favoriteQuote === 'object'
            ? currentUser.favoriteQuote?.text
            : typeof currentUser.favoriteQuote === 'string'
            ? currentUser.favoriteQuote
            : 'Art washes away from the soul the dust of everyday life.';
        const qAuthor =
          typeof currentUser.favoriteQuote === 'object'
            ? currentUser.favoriteQuote?.author || 'Pablo Picasso'
            : 'Pablo Picasso';
        setQuoteText(qText);
        setQuoteAuthor(qAuthor);
        setWebsite(currentUser.website || '');
        setInstagram(currentUser.instagram || '');
        setTwitter(currentUser.twitter || '');
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
        setBadges(currentUser.badges || ['Resident Creator']);
        setSaveMode('update');
      }
    }
  }, [isOpen, isCreateMode, currentUser, initialTab]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, SVG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please select an image under 10MB.');
        return;
      }
      try {
        const publicUrl = await uploadMediaToSupabase(file, 'avatars', 'profiles');
        setAvatar(publicUrl);
      } catch (err) {
        console.warn('[AddProfileModal] Avatar upload error:', err);
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('Cover image is too large. Please select an image under 15MB.');
        return;
      }
      try {
        const publicUrl = await uploadMediaToSupabase(file, 'artworks', 'covers');
        setCoverImage(publicUrl);
      } catch (err) {
        console.warn('[AddProfileModal] Cover upload error:', err);
      }
    }
  };

  const toggleBadge = (badge: string) => {
    if (badges.includes(badge)) {
      setBadges(badges.filter((b) => b !== badge));
    } else {
      setBadges([...badges, badge]);
    }
  };

  const handleApplyQuotePreset = (preset: { text: string; author: string }) => {
    setQuoteText(preset.text);
    setQuoteAuthor(preset.author);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setActiveSubTab('details');
      alert('Please enter an artist display name.');
      return;
    }

    const cleanHandle = handle.trim().replace(/^@/, '') || 'creator';

    const profilePayload: Partial<UserProfile> = {
      name: name.trim(),
      handle: `@${cleanHandle}`,
      avatar: avatar.trim() || '/curatorial-masterpiece.svg',
      coverImage: coverImage.trim(),
      discipline: discipline.trim() || 'Visual Artist',
      location: location.trim() || 'Studio Atelier',
      bio: bio.trim() || 'Artist exploring fine arts and curated digital expressions.',
      favoriteQuote: quoteText.trim()
        ? {
            text: quoteText.trim(),
            author: quoteAuthor.trim() || undefined
          }
        : undefined,
      website: website.trim(),
      instagram: instagram.trim().replace(/^@/, ''),
      twitter: twitter.trim().replace(/^@/, ''),
      email: email.trim(),
      phone: phone.trim(),
      badges: badges.length > 0 ? badges : ['Resident Creator'],
      verified: true
    };

    let resultUser: UserProfile;

    if (saveMode === 'new_persona' || isCreateMode) {
      resultUser = GalleryService.createUserProfile(profilePayload);
    } else {
      resultUser = {
        ...currentUser,
        ...profilePayload
      } as UserProfile;
      GalleryService.saveCurrentUser(resultUser);
    }

    // Cloud Firestore persistent cross-deployment database push
    syncUserProfileToCloud(resultUser).catch(() => {});

    onSuccess(resultUser);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/95 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        id="add-profile-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-neutral-950 border border-[#c9a875]/30 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans rounded-sm z-10"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#c9a875]/10 border border-[#c9a875]/30 flex items-center justify-center text-[#c9a875]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-light uppercase tracking-[0.2em] text-white">
                {isCreateMode ? 'Create New Unique Profile' : 'Studio Profile & Identity Studio'}
              </h3>
              <p className="text-[10px] text-neutral-400 tracking-wider">
                Craft your bespoke artist persona, quote, avatar & public exhibition details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="clear-profile-form-btn"
              onClick={handleClearForm}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Reset all fields to clean blank canvas"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear Form</span>
            </button>
            <button
              type="button"
              id="close-add-profile-modal"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - 4 Interactive Pillars */}
        <div className="flex border-b border-white/10 bg-neutral-950 px-4 sm:px-6 overflow-x-auto text-[10px] uppercase tracking-[0.2em] relative z-20 shrink-0 select-none">
          <button
            type="button"
            id="tab-btn-details"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSubTab('details');
            }}
            className={`py-3.5 px-4 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'details'
                ? 'border-[#c9a875] text-[#c9a875] bg-[#c9a875]/5'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            1. Identity & Bio
          </button>
          <button
            type="button"
            id="tab-btn-avatar"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSubTab('avatar');
            }}
            className={`py-3.5 px-4 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'avatar'
                ? 'border-[#c9a875] text-[#c9a875] bg-[#c9a875]/5'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            2. Profile Picture & Cover
          </button>
          <button
            type="button"
            id="tab-btn-quote"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSubTab('quote');
            }}
            className={`py-3.5 px-4 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'quote'
                ? 'border-[#c9a875] text-[#c9a875] bg-[#c9a875]/5'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            3. Favourite Quote
          </button>
          <button
            type="button"
            id="tab-btn-social"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSubTab('social');
            }}
            className={`py-3.5 px-4 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'social'
                ? 'border-[#c9a875] text-[#c9a875] bg-[#c9a875]/5'
                : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            4. Contacts & Badges
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Live Mini Preview Bar */}
          <div className="relative p-4 sm:p-5 bg-neutral-900/80 border border-white/10 rounded-sm flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative group">
              <Avatar
                src={avatar}
                name={name || 'New Artist'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#c9a875]/40 shadow-lg"
                textSize="text-2xl sm:text-3xl"
              />
              <button
                type="button"
                onClick={() => setActiveSubTab('avatar')}
                className="absolute bottom-0 right-0 p-1.5 bg-[#c9a875] text-black rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-light tracking-wide text-white uppercase">
                  {name || 'Your Artist Name'}
                </span>
                <span className="px-2 py-0.5 bg-[#c9a875]/20 text-[#c9a875] border border-[#c9a875]/30 text-[9px] uppercase tracking-wider rounded-sm flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              </div>
              <p className="text-[11px] font-mono-code text-neutral-400">@{handle || 'yourhandle'}</p>
              <p className="text-xs text-neutral-300 line-clamp-1">{discipline || 'Visual Artist & Poet'}</p>
              {quoteText && (
                <p className="text-xs font-serif italic text-[#c9a875]/90 pt-1">
                  "{quoteText}" {quoteAuthor && <span className="not-italic text-neutral-400 text-[10px]">— {quoteAuthor}</span>}
                </p>
              )}
            </div>
          </div>

          {/* TAB 1: DETAILS & BIO */}
          {activeSubTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a875] mb-2 font-medium">
                    Display Name / Artist Moniker *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Julian Thorne, Maya Lin, Studio Noir"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a875] mb-2 font-medium">
                    Handle / Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">@</span>
                    <input
                      type="text"
                      placeholder="julian_art"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm pl-8 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
                    Artistic Discipline / Specialty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oil on Canvas & Classical Charcoal"
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
                    Location / Base City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="e.g. Kyoto / Paris / New York"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm pl-9 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a875] mb-2 font-medium">
                  Artist Statement / Bio
                </label>
                <textarea
                  rows={4}
                  placeholder="Express your artistic philosophy, creative medium, inspirations, and history..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('avatar');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all cursor-pointer rounded-sm"
                >
                  Next: Picture & Cover →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE PICTURE & COVER */}
          {activeSubTab === 'avatar' && (
            <div className="space-y-8">
              {/* Profile Picture (Avatar) Section */}
              <div className="p-6 bg-neutral-900/60 border border-white/10 rounded-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.2em] text-[#c9a875] font-medium flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Profile Picture (Avatar)
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Upload from your device, choose an artistic preset, or provide an image URL.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Current Avatar Large */}
                  <div className="flex flex-col items-center justify-center p-4 bg-black/40 border border-white/5 rounded-sm">
                    <Avatar
                      src={avatar}
                      name={name || 'New Artist'}
                      className="w-24 h-24 rounded-full border-2 border-[#c9a875] shadow-xl"
                      textSize="text-3xl"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[9px] uppercase tracking-widest text-[#c9a875]">Active Picture</span>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('/curatorial-masterpiece.svg')}
                          className="text-[9px] uppercase tracking-widest text-neutral-400 hover:text-white underline cursor-pointer"
                          title="Reset image to curatorial seal"
                        >
                          (Reset)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Upload from Local Device */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-dashed border-[#c9a875]/50 bg-[#c9a875]/5 hover:bg-[#c9a875]/15 text-[#c9a875] transition-colors cursor-pointer rounded-sm text-xs uppercase tracking-[0.15em]"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo from Device</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or paste direct image URL (https://...)"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 rounded-sm pl-4 pr-20 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customAvatarUrl.trim()) {
                            setAvatar(customAvatarUrl.trim());
                            setCustomAvatarUrl('');
                          }
                        }}
                        disabled={!customAvatarUrl.trim()}
                        className="absolute right-1 top-1 bottom-1 px-3 bg-white/10 hover:bg-white text-white hover:text-black text-[9px] uppercase tracking-wider rounded-xs transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Gallery */}
                <div>
                  <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3">
                    Curated Artistic Presets
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {AVATAR_PRESETS.map((preset) => (
                      <div
                        key={preset.name}
                        onClick={() => setAvatar(preset.url)}
                        className={`group relative cursor-pointer border rounded-sm overflow-hidden p-1 transition-all ${
                          avatar === preset.url
                            ? 'border-[#c9a875] bg-[#c9a875]/10 scale-105 shadow-md'
                            : 'border-white/10 hover:border-white/30 bg-black/30'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          onError={(e) => {
                            e.currentTarget.src = '/curatorial-masterpiece.svg';
                          }}
                          className="w-full aspect-square object-cover rounded-xs"
                        />
                        {avatar === preset.url && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#c9a875] text-black flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <span className="block text-[8px] uppercase tracking-wider text-neutral-400 text-center mt-1 truncate">
                          {preset.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Banner Section */}
              <div className="p-6 bg-neutral-900/60 border border-white/10 rounded-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.2em] text-[#c9a875] font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Header Cover Banner
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      Choose an atmospheric studio backdrop for your profile header.
                    </p>
                  </div>
                </div>

                <div className="relative h-24 rounded-sm overflow-hidden border border-white/10">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-4 py-1.5 bg-black/70 hover:bg-black text-white text-[10px] uppercase tracking-widest border border-white/20 rounded-sm backdrop-blur-sm flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" /> Upload Custom Cover
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COVER_PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      onClick={() => setCoverImage(preset.url)}
                      className={`relative cursor-pointer h-14 rounded-sm overflow-hidden border transition-all ${
                        coverImage === preset.url
                          ? 'border-[#c9a875] ring-1 ring-[#c9a875]'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-white truncate font-medium">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('details');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('quote');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all cursor-pointer rounded-sm"
                >
                  Next: Favourite Quote →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FAVOURITE QUOTE */}
          {activeSubTab === 'quote' && (
            <div className="space-y-8">
              {/* Quote Inspiration Card Preview */}
              <div className="relative p-6 sm:p-8 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-neutral-900 border border-[#c9a875]/40 rounded-sm shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a875]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#c9a875] shrink-0">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#c9a875] font-semibold">
                      Your Profile's Signature Quote
                    </span>
                    <p className="text-base sm:text-xl font-serif italic text-neutral-100 leading-relaxed">
                      "{quoteText || 'Art is the lie that enables us to realize the truth.'}"
                    </p>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-medium pt-1">
                      — {quoteAuthor || 'Author / Source'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote Editor Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a875] mb-2 font-medium">
                    Favourite Quote / Artistic Motto
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter a quote or verse that inspires your art and worldview..."
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors resize-none leading-relaxed font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
                    Quote Author / Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pablo Picasso, Rainer Maria Rilke, Maya Angelou, Personal Motto"
                    value={quoteAuthor}
                    onChange={(e) => setQuoteAuthor(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#c9a875] transition-colors"
                  />
                </div>
              </div>

              {/* Quick Preset Quotes */}
              <div className="space-y-3">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  Or select an inspirational quote preset:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {INSPIRATIONAL_QUOTES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleApplyQuotePreset(preset)}
                      className={`p-3 rounded-sm border cursor-pointer transition-all ${
                        quoteText === preset.text
                          ? 'border-[#c9a875] bg-[#c9a875]/10 text-white'
                          : 'border-white/5 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-300'
                      }`}
                    >
                      <p className="text-xs font-serif italic line-clamp-2">"{preset.text}"</p>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500 mt-1.5 font-sans">
                        — {preset.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('avatar');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Picture
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('social');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all cursor-pointer rounded-sm"
                >
                  Next: Contacts & Badges →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIALS & BADGES */}
          {activeSubTab === 'social' && (
            <div className="space-y-8">
              {/* Social Links Grid */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#c9a875] font-medium">
                  Portfolio & Social Links
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.studio"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Instagram className="w-3 h-3" /> Instagram Handle
                    </label>
                    <input
                      type="text"
                      placeholder="your_instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Twitter className="w-3 h-3" /> Twitter / X
                    </label>
                    <input
                      type="text"
                      placeholder="your_handle"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Public Inquiries Email
                    </label>
                    <input
                      type="email"
                      placeholder="artist@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Studio Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-sm px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                    />
                  </div>
                </div>
              </div>

              {/* Badges & Recognitions */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-[0.2em] text-[#c9a875] font-medium">
                  Studio Badges & Specializations
                </h4>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_BADGES.map((badge) => {
                    const isSelected = badges.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={`px-3 py-1.5 rounded-sm text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#c9a875] text-black font-medium shadow-sm'
                            : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Save Mode */}
              <div className="p-4 bg-neutral-900/80 border border-white/10 rounded-sm space-y-3">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#c9a875] font-medium">
                  Profile Mode
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="saveMode"
                      value="update"
                      checked={saveMode === 'update'}
                      onChange={() => setSaveMode('update')}
                      className="accent-[#c9a875]"
                    />
                    <span>Update Current Active Profile</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="saveMode"
                      value="new_persona"
                      checked={saveMode === 'new_persona'}
                      onChange={() => setSaveMode('new_persona')}
                      className="accent-[#c9a875]"
                    />
                    <span>Add As New Unique Persona / Profile</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSubTab('quote');
                  }}
                  className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Quote
                </button>
              </div>
            </div>
          )}

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-profile-btn"
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-[#c9a875] hover:bg-[#e0be88] text-black font-semibold text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer rounded-sm shadow-xl hover:shadow-[#c9a875]/20"
            >
              <Check className="w-4 h-4" />
              <span>{saveMode === 'new_persona' ? 'Save & Switch To New Profile' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
