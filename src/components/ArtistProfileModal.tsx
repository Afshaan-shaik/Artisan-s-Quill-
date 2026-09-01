import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Globe,
  Instagram,
  Heart,
  Bookmark,
  UserPlus,
  Check,
  Layers,
  Twitter,
  Plus,
  Folder,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Quote,
  Camera,
  ShieldCheck,
  Award,
  Users,
  Palette,
  Upload,
  Download,
  Database,
  CheckCircle2,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { UserProfile, Artwork, Collection } from '../types';
import { PoetryCard } from './PoetryCard';
import { GalleryService } from '../services/api';
import { AddProfileModal } from './AddProfileModal';
import { ProfilePictureModal } from './ProfilePictureModal';
import { Avatar } from './Avatar';

interface ArtistProfileModalProps {
  artistId: string | null;
  artworks: Artwork[];
  currentUser: UserProfile;
  onClose: () => void;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onUpdateProfile?: (user: UserProfile) => void;
  onOpenUpload?: (category?: any) => void;
}

export const ArtistProfileModal: React.FC<ArtistProfileModalProps> = ({
  artistId,
  artworks,
  currentUser,
  onClose,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onUpdateProfile,
  onOpenUpload
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'works' | 'collections'>('works');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [vaultStatusMsg, setVaultStatusMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Editor Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<'details' | 'avatar' | 'quote' | 'social'>('details');
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isCreateNewPersonaMode, setIsCreateNewPersonaMode] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (artistId) {
      setCollections(GalleryService.getUserCollections(artistId));
      setAllProfiles(GalleryService.getAllUserProfiles());
    }
  }, [artistId]);

  const handleExportVault = () => {
    GalleryService.exportStudioVault();
    setVaultStatusMsg('Studio archive downloaded! All your artworks, poems, and profiles are safely saved.');
    setTimeout(() => setVaultStatusMsg(null), 4500);
  };

  const handleImportVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await GalleryService.importStudioVault(content);
        setVaultStatusMsg(res.message);
        if (res.success && onUpdateProfile) {
          onUpdateProfile(GalleryService.getCurrentUser());
          setAllProfiles(GalleryService.getAllUserProfiles());
        }
        setTimeout(() => setVaultStatusMsg(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artistId) return null;

  const isCurrentUser = currentUser.id === artistId || currentUser.handle === artistId;
  const foundProfile = allProfiles.find((p) => p.id === artistId || p.handle === artistId);

  const artist: UserProfile =
    isCurrentUser
      ? currentUser
      : foundProfile
      ? foundProfile
      : ({
          id: artistId,
          name: 'Artist',
          handle: artistId.startsWith('@') ? artistId : `@${artistId}`,
          avatar: '',
          bio: 'Fine art creator exploring classic and digital canvases.',
          discipline: 'Fine Arts & Contemporary Media',
          location: 'Global Atelier',
          verified: true,
          artworksCount: 0,
          followersCount: 1420,
          followingCount: 310,
          badges: ['Exhibition Artist', 'Atelier Resident']
        } as UserProfile);

  const artistArtworks = artworks.filter(
    (a) =>
      !a.isDeleted &&
      (a.artist.id === artistId ||
        a.artist.handle === artistId ||
        (artist.handle && a.artist.handle?.toLowerCase() === artist.handle.toLowerCase()) ||
        (artist.name && a.artist.name?.toLowerCase() === artist.name.toLowerCase()) ||
        (artistId === 'artist-2' && (a.id === 'poetry-1' || a.id === 'poetry-4')))
  );

  const handleSelectWork = (art: Artwork) => {
    onClose();
    onSelectArtwork(art);
  };

  const handleProfileSuccess = (updatedUser: UserProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(updatedUser);
    }
    setAllProfiles(GalleryService.getAllUserProfiles());
  };

  const handleSwitchProfile = (profileId: string) => {
    const switched = GalleryService.switchUserProfile(profileId);
    if (onUpdateProfile) {
      onUpdateProfile(switched);
    }
  };

  const handleCreateOrUpdateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    if (editingCollectionId) {
      GalleryService.updateCollection(editingCollectionId, {
        title: newCollectionTitle,
        description: newCollectionDesc,
        artworkIds: selectedArtworkIds
      });
    } else {
      const created = GalleryService.createCollection(artistId, newCollectionTitle, newCollectionDesc);
      if (selectedArtworkIds.length > 0) {
        created.artworkIds = selectedArtworkIds;
        GalleryService.updateCollection(created.id, { artworkIds: created.artworkIds });
      }
    }

    setCollections(GalleryService.getUserCollections(artistId));
    setIsCreatingCollection(false);
    setEditingCollectionId(null);
    setNewCollectionTitle('');
    setNewCollectionDesc('');
    setSelectedArtworkIds([]);
  };

  const toggleArtworkSelection = (id: string) => {
    if (selectedArtworkIds.includes(id)) {
      setSelectedArtworkIds(selectedArtworkIds.filter((item) => item !== id));
    } else {
      setSelectedArtworkIds([...selectedArtworkIds, id]);
    }
  };

  const moveArtwork = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= selectedArtworkIds.length) return;
    const arr = [...selectedArtworkIds];
    const temp = arr[index];
    arr[index] = arr[index + direction];
    arr[index + direction] = temp;
    setSelectedArtworkIds(arr);
  };

  const openEditCollection = (collection: Collection) => {
    setEditingCollectionId(collection.id);
    setNewCollectionTitle(collection.title);
    setNewCollectionDesc(collection.description);
    setSelectedArtworkIds(collection.artworkIds || []);
    setIsCreatingCollection(true);
  };

  const quoteData =
    typeof artist.favoriteQuote === 'object'
      ? artist.favoriteQuote
      : typeof artist.favoriteQuote === 'string'
      ? { text: artist.favoriteQuote, author: undefined }
      : undefined;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Floating Fixed Close Button (Always visible on all screen sizes & scroll offsets) */}
      <button
        id="floating-close-artist-modal"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-black/80 hover:bg-[#c9a875] text-white hover:text-black border border-white/25 hover:border-[#c9a875] shadow-2xl transition-all duration-200 cursor-pointer z-[95] flex items-center justify-center hover:scale-110 active:scale-95 group"
        title="Close Profile (Esc)"
        aria-label="Close Profile"
      >
        <X className="w-5 h-5 text-neutral-300 group-hover:text-black transition-colors" />
      </button>

      <div
        id="artist-profile-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-neutral-950 border border-[#c9a875]/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden max-h-[92vh] flex flex-col font-sans rounded-sm z-10"
      >
        {/* Cover Header Banner */}
        <div className="relative h-48 sm:h-60 bg-neutral-900 border-b border-white/10 overflow-hidden shrink-0">
          <img
            src={
              artist.coverImage ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80'
            }
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/40 to-black/30 backdrop-blur-2xs pointer-events-none" />

          {/* In-Banner Close Button */}
          <button
            id="close-artist-modal"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 bg-black/80 hover:bg-[#c9a875] text-neutral-300 hover:text-black transition-all cursor-pointer z-30 rounded-full border border-white/20 hover:border-[#c9a875] shadow-xl hover:scale-110 active:scale-95"
            title="Close Artist Profile (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Quick Edit Cover for Current User */}
          {isCurrentUser && (
            <button
              onClick={() => {
                setIsCreateNewPersonaMode(false);
                setProfileModalInitialTab('avatar');
                setIsProfileModalOpen(true);
              }}
              className="absolute top-4 left-4 sm:top-5 sm:left-5 px-3 py-1.5 bg-black/70 hover:bg-black text-white/90 hover:text-white text-[9px] uppercase tracking-widest border border-white/20 rounded-sm backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer z-20"
            >
              <Camera className="w-3 h-3 text-[#c9a875]" />
              <span>Update Cover & Studio Info</span>
            </button>
          )}
        </div>

        {/* Profile Content Container */}
        <div className="px-6 sm:px-10 pb-8 -mt-16 sm:-mt-20 relative z-10 flex-1 overflow-y-auto space-y-8">
          {/* Identity Bar & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex items-end gap-5 sm:gap-6">
              {/* Avatar with Camera Trigger */}
              <div className="relative group shrink-0">
                <Avatar
                  src={artist.avatar}
                  name={artist.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-[#c9a875]/60 shadow-2xl rounded-sm group-hover:border-[#c9a875] transition-colors"
                  textSize="text-3xl sm:text-4xl"
                />
                {isCurrentUser && (
                  <button
                    onClick={() => {
                      setIsPictureModalOpen(true);
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer rounded-sm"
                    title="Change Profile Picture & Edit Name"
                  >
                    <Camera className="w-5 h-5 text-[#c9a875]" />
                    <span className="text-[8px] uppercase tracking-widest text-[#c9a875] mt-1 font-medium">
                      Update Photo
                    </span>
                  </button>
                )}
              </div>

              {/* Name & Handle */}
              <div className="mb-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-light tracking-[0.08em] text-white uppercase">
                    {artist.name}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#c9a875] text-[9px] uppercase tracking-widest rounded-sm flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3" /> Verified Studio
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs font-mono-code text-[#c9a875]/90 tracking-wide">{artist.handle}</p>
                  {artist.discipline && (
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 border-l border-white/10 pl-3">
                      {artist.discipline}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              {isCurrentUser ? (
                <>
                  <button
                    id="edit-profile-btn"
                    onClick={() => {
                      setIsCreateNewPersonaMode(false);
                      setProfileModalInitialTab('details');
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] border border-[#c9a875] bg-[#c9a875]/10 hover:bg-[#c9a875] text-[#c9a875] hover:text-black font-medium transition-colors cursor-pointer rounded-sm"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Profile Details</span>
                  </button>

                  <button
                    id="add-new-profile-btn"
                    onClick={() => {
                      setIsCreateNewPersonaMode(true);
                      setProfileModalInitialTab('details');
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-colors cursor-pointer rounded-sm"
                    title="Add a completely new distinct profile persona"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Profile</span>
                  </button>

                  <button
                    id="reset-profile-default-btn"
                    onClick={() => {
                      if (window.confirm('Reset studio profile to clean defaults?')) {
                        const defaultUser = GalleryService.restoreDefaultProfile();
                        if (onUpdateProfile) onUpdateProfile(defaultUser);
                        setAllProfiles([defaultUser]);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-sm"
                    title="Restore profile to default blank canvas template"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-2 px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] border transition-colors cursor-pointer rounded-sm ${
                    isFollowing
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-white/20 bg-transparent text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {isFollowing ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                  <span>{isFollowing ? 'Following' : 'Follow Artist'}</span>
                </button>
              )}
            </div>
          </div>

          {/* SIGNATURE FAVOURITE QUOTE SECTION (Unique & Premium) */}
          {quoteData && quoteData.text && (
            <div className="relative p-6 sm:p-7 bg-gradient-to-r from-neutral-900/95 via-neutral-900/70 to-neutral-900/95 border border-[#c9a875]/35 rounded-sm shadow-2xl overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c9a875]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2.5 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/40 text-[#c9a875] shrink-0 mt-0.5">
                  <Quote className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#c9a875] font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" /> Signature Motto & Favourite Quote
                    </span>
                    {isCurrentUser && (
                      <button
                        onClick={() => {
                          setIsCreateNewPersonaMode(false);
                          setProfileModalInitialTab('quote');
                          setIsProfileModalOpen(true);
                        }}
                        className="text-[9px] uppercase tracking-widest text-neutral-400 hover:text-[#c9a875] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5" /> Edit Quote
                      </button>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-serif italic text-neutral-100 leading-relaxed">
                    "{quoteData.text}"
                  </p>
                  {quoteData.author && (
                    <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                      — {quoteData.author}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STUDIO DATA VAULT & NEVER-DELETE ASSURANCE (Exclusive Artist Protection) */}
          {isCurrentUser && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-[#c9a875]/30 rounded-sm shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/40 text-[#c9a875]">
                    <ShieldCheck className="w-4 h-4 text-[#c9a875]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs uppercase tracking-widest text-white font-medium">
                        Atelier Studio Vault Active
                      </h4>
                      <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px] uppercase tracking-widest rounded-full font-mono-code flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Protected
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                      Your artworks, poems, profile edits, and custom collections are dual-persisted to the indestructible vault. Website updates will never delete your work.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={handleExportVault}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a875]/15 hover:bg-[#c9a875] text-[#c9a875] hover:text-black border border-[#c9a875]/40 text-[9px] uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                    title="Export complete studio archive file (.json)"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Vault (.json)</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 text-[9px] uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                    title="Restore previously saved archive"
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>Restore Archive</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportVault}
                  />
                </div>
              </div>

              {vaultStatusMsg && (
                <div className="p-2.5 bg-[#c9a875]/10 border border-[#c9a875]/30 rounded-sm text-xs text-[#c9a875] font-light animate-in fade-in flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{vaultStatusMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* Bio & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-5">
              {/* Bio Statement */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                  Artist Manifesto
                </span>
                <p className="text-sm text-neutral-300 font-light leading-relaxed whitespace-pre-line">
                  {artist.bio ||
                    'Visual artist exploring classical pigments, chiaroscuro lighting, and poetic resonance across physical and digital mediums.'}
                </p>
              </div>

              {/* Badges and Tags */}
              {artist.badges && artist.badges.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
                    Recognitions & Mediums
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {artist.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-[#c9a875] rounded-sm flex items-center gap-1.5"
                      >
                        <Award className="w-2.5 h-2.5" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social and Contact Links */}
              <div className="flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-widest text-neutral-400 pt-2 border-t border-white/5">
                {artist.location && (
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <MapPin className="w-3.5 h-3.5 text-[#c9a875]" />
                    {artist.location}
                  </span>
                )}
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#c9a875] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#c9a875] transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    @{artist.instagram.replace(/^@/, '')}
                  </a>
                )}
                {artist.twitter && (
                  <a
                    href={`https://twitter.com/${artist.twitter.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#c9a875] transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    @{artist.twitter.replace(/^@/, '')}
                  </a>
                )}
                {artist.email && (
                  <a
                    href={`mailto:${artist.email}`}
                    className="flex items-center gap-1.5 hover:text-[#c9a875] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Inquire
                  </a>
                )}
                {artist.phone && (
                  <a
                    href={`tel:${artist.phone}`}
                    className="flex items-center gap-1.5 hover:text-[#c9a875] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                )}
              </div>
            </div>

            {/* Stats Counter Box */}
            <div className="p-6 bg-neutral-900/90 border border-white/10 flex flex-col justify-around text-center gap-5 rounded-sm shadow-lg">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Creations</span>
                <span className="block text-base font-medium tracking-widest text-[#c9a875]">
                  {artistArtworks.length}
                </span>
              </div>
              <div className="w-full h-[1px] bg-white/10" />
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Followers</span>
                <span className="block text-base font-medium tracking-widest text-white">
                  {isFollowing ? (artist.followersCount || 120) + 1 : artist.followersCount || 120}
                </span>
              </div>
              <div className="w-full h-[1px] bg-white/10" />
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Collections</span>
                <span className="block text-base font-medium tracking-widest text-white">
                  {collections.length}
                </span>
              </div>
            </div>
          </div>

          {/* Artist's Showcase Tabs & Grid */}
          <div className="pt-6 border-t border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('works')}
                  className={`pb-4 text-[10px] uppercase tracking-[0.25em] font-medium transition-colors cursor-pointer ${
                    activeTab === 'works'
                      ? 'text-[#c9a875] border-b-2 border-[#c9a875]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  Works ({artistArtworks.length})
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`pb-4 text-[10px] uppercase tracking-[0.25em] font-medium transition-colors cursor-pointer ${
                    activeTab === 'collections'
                      ? 'text-[#c9a875] border-b-2 border-[#c9a875]'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  Curated Collections ({collections.length})
                </button>
              </div>

              {isCurrentUser && (
                <div className="flex items-center gap-3 pb-3">
                  {activeTab === 'works' && onOpenUpload && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUpload('painting');
                      }}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-[9px] uppercase tracking-widest bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 rounded-sm transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload New Artwork</span>
                    </button>
                  )}
                  {activeTab === 'collections' && (
                    <button
                      onClick={() => setIsCreatingCollection(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-[9px] uppercase tracking-widest bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 rounded-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Collection</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* TAB: WORKS */}
            {activeTab === 'works' && (
              <>
                {artistArtworks.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-white/10 bg-neutral-900/40 rounded-sm space-y-4">
                    <Palette className="w-10 h-10 text-neutral-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-light uppercase tracking-widest text-white">
                        No Artworks Uploaded Yet
                      </h4>
                      <p className="text-xs text-neutral-400 font-light">
                        {isCurrentUser
                          ? 'Publish your paintings, sketches, digital shaders, or stanzas to build your atelier gallery.'
                          : 'This artist has not uploaded public artworks yet.'}
                      </p>
                    </div>
                    {isCurrentUser && onOpenUpload && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenUpload('painting');
                        }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c9a875] hover:bg-[#e0be88] text-black font-semibold text-[10px] uppercase tracking-[0.2em] rounded-sm transition-colors cursor-pointer shadow-lg"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Your First Artwork</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artistArtworks.map((art) => {
                      if (art.category === 'poetry' && art.poetryContent) {
                        return (
                          <PoetryCard
                            key={art.id}
                            artwork={art}
                            onSelect={handleSelectWork}
                            onToggleLike={onToggleLike}
                            onToggleSave={onToggleSave}
                            onSelectArtist={() => {}}
                            isCompact={false}
                          />
                        );
                      }

                      return (
                        <div
                          key={art.id}
                          onClick={() => handleSelectWork(art)}
                          className="group relative overflow-hidden aspect-[4/3] bg-neutral-900 border border-white/10 hover:border-[#c9a875]/60 rounded-sm cursor-pointer transition-all duration-300 shadow-md hover:shadow-[0_0_25px_rgba(201,168,117,0.2)]"
                        >
                          <img
                            src={art.mediaUrl || art.thumbnailUrl}
                            alt={art.title}
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                            <h4 className="text-sm font-light text-white truncate mb-1">{art.title}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-[#c9a875] flex items-center justify-between">
                              <span>{art.medium}</span>
                              <span className="text-white underline underline-offset-2">View Masterpiece →</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB: COLLECTIONS */}
            {activeTab === 'collections' && (
              <div className="space-y-6">
                {isCreatingCollection && (
                  <form
                    onSubmit={handleCreateOrUpdateCollection}
                    className="p-6 bg-neutral-900 border border-[#c9a875]/30 space-y-6 rounded-sm shadow-xl"
                  >
                    <h4 className="text-xs font-light tracking-widest uppercase text-[#c9a875] font-medium">
                      {editingCollectionId ? 'Edit Collection' : 'Create Curated Collection'}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCollectionTitle}
                          onChange={(e) => setNewCollectionTitle(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:border-[#c9a875] focus:outline-none transition-colors"
                          placeholder="e.g. Nocturnes & Gold Leaf"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                          Curatorial Statement
                        </label>
                        <textarea
                          value={newCollectionDesc}
                          onChange={(e) => setNewCollectionDesc(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded-sm px-4 py-2 text-sm text-white focus:border-[#c9a875] focus:outline-none transition-colors h-20 resize-none"
                          placeholder="Describe the thematic cohesion of these pieces..."
                        />
                      </div>

                      {/* Selection of artworks */}
                      {artistArtworks.length > 0 && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
                            Select Included Artworks ({selectedArtworkIds.length} chosen)
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                            {artistArtworks.map((art) => {
                              const isSelected = selectedArtworkIds.includes(art.id);
                              return (
                                <div
                                  key={art.id}
                                  onClick={() => toggleArtworkSelection(art.id)}
                                  className={`relative aspect-square border rounded-xs cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-[#c9a875] ring-1 ring-[#c9a875]'
                                      : 'border-white/10 opacity-50 hover:opacity-90'
                                  }`}
                                >
                                  <img
                                    src={art.thumbnailUrl || art.mediaUrl}
                                    className="w-full h-full object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 bg-[#c9a875] text-black p-0.5 rounded-full">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                      {editingCollectionId && (
                        <button
                          type="button"
                          onClick={() => {
                            GalleryService.deleteCollection(editingCollectionId);
                            setCollections(GalleryService.getUserCollections(artistId));
                            setIsCreatingCollection(false);
                            setEditingCollectionId(null);
                            setNewCollectionTitle('');
                            setNewCollectionDesc('');
                            setSelectedArtworkIds([]);
                          }}
                          className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors mr-auto"
                        >
                          Delete Collection
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingCollection(false);
                          setEditingCollectionId(null);
                          setNewCollectionTitle('');
                          setNewCollectionDesc('');
                          setSelectedArtworkIds([]);
                        }}
                        className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-[10px] uppercase tracking-[0.2em] bg-[#c9a875] text-black font-semibold hover:bg-[#e0be88] transition-colors rounded-sm cursor-pointer"
                      >
                        {editingCollectionId ? 'Save Changes' : 'Save Collection'}
                      </button>
                    </div>
                  </form>
                )}

                {!isCreatingCollection && collections.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 bg-neutral-900/40 rounded-sm">
                    <Folder className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-light text-neutral-400">No collections curated yet.</p>
                  </div>
                ) : (
                  !isCreatingCollection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {collections.map((collection) => (
                        <div
                          key={collection.id}
                          className="border border-white/10 bg-neutral-900/80 rounded-sm overflow-hidden group shadow-lg"
                        >
                          <div className="p-5 border-b border-white/10 relative">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-base font-light tracking-wide text-white uppercase pr-12">
                                {collection.title}
                              </h4>
                              {isCurrentUser && (
                                <button
                                  onClick={() => openEditCollection(collection)}
                                  className="absolute top-5 right-5 p-1.5 bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-colors rounded-xs"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {collection.description && (
                              <p className="text-xs font-light text-neutral-400 line-clamp-2">
                                {collection.description}
                              </p>
                            )}
                            <span className="block mt-3 text-[9px] uppercase tracking-widest text-[#c9a875]">
                              {collection.artworkIds.length} items curated
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-0.5 bg-black/60">
                            {collection.artworkIds.slice(0, 4).map((artId) => {
                              const art = artworks.find((a) => a.id === artId);
                              if (!art) return <div key={artId} className="aspect-square bg-neutral-800" />;
                              return (
                                <div
                                  key={art.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectWork(art);
                                  }}
                                  className="aspect-square overflow-hidden bg-neutral-800 cursor-pointer group/thumb hover:ring-1 hover:ring-[#c9a875]"
                                  title={`View ${art.title}`}
                                >
                                  <img
                                    src={art.thumbnailUrl || art.mediaUrl}
                                    alt={art.title}
                                    className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all"
                                  />
                                </div>
                              );
                            })}
                            {Array.from({ length: Math.max(0, 4 - collection.artworkIds.length) }).map((_, i) => (
                              <div key={`empty-${i}`} className="aspect-square bg-neutral-900/60" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Profile Dedicated Modal */}
      <AddProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSuccess={handleProfileSuccess}
        isCreateMode={isCreateNewPersonaMode}
        initialTab={profileModalInitialTab}
      />

      {/* Quick Profile Picture & Name Editor Modal */}
      <ProfilePictureModal
        isOpen={isPictureModalOpen}
        onClose={() => setIsPictureModalOpen(false)}
        currentUser={currentUser}
        onSuccess={(updated) => {
          handleProfileSuccess(updated);
        }}
      />
    </div>
  );
};
