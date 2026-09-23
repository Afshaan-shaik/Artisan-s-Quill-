import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Palette,
  PenTool,
  Image as ImageIcon,
  Film,
  Feather,
  Database,
  Compass,
  Bookmark,
  X,
  Layers,
  Filter,
  Calendar,
  Trash2,
  User,
  Camera,
  HardDrive,
  Menu,
  LogIn,
  Disc3,
  Music
} from 'lucide-react';
import { ArtCategory, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { AudioAmbiencePlayer } from './AudioAmbiencePlayer';
import { ArtistSwitcherDropdown } from './ArtistSwitcherDropdown';

interface NavbarProps {
  selectedCategory: ArtCategory;
  onSelectCategory: (category: ArtCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: { start?: string; end?: string; };
  onDateRangeChange: (range: { start?: string; end?: string; }) => void;
  activeView: 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults';
  onSelectView: (view: 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about' | 'recycle-bin' | 'community' | 'vaults') => void;
  onOpenUpload: (category?: ArtCategory, format?: string) => void;
  onOpenInkStudio?: () => void;
  onOpenBardModal?: () => void;
  onOpenConstellationModal?: () => void;
  onOpenCollectorVault?: () => void;
  onOpenVaultModal?: () => void;
  onSelectCurrentUser: () => void;
  onOpenEditProfile?: () => void;
  onOpenCreateProfile?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  currentUser: UserProfile;
  onOpenCinemaMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  activeView,
  onSelectView,
  onOpenUpload,
  onOpenInkStudio,
  onOpenBardModal,
  onOpenConstellationModal,
  onOpenCollectorVault,
  onSelectCurrentUser,
  onOpenEditProfile,
  onOpenCreateProfile,
  onOpenLoginModal,
  onLogout,
  currentUser,
  onOpenCinemaMode
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileActionSheetOpen, setIsMobileActionSheetOpen] = useState(false);

  const categories: { id: ArtCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'all', label: 'All Works', icon: <Layers className="w-3.5 h-3.5" />, desc: 'Curated complete atelier' },
    { id: 'poetry', label: 'Poetry Cards', icon: <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />, desc: 'Verse, stanzas & lyrical cards' },
    { id: 'painting', label: 'Paintings', icon: <Palette className="w-3.5 h-3.5 text-[#e8b482]" />, desc: 'Oil, acrylic & canvas' },
    { id: 'drawing', label: 'Drawings & Ink', icon: <PenTool className="w-3.5 h-3.5 text-[#b9c6ea]" />, desc: 'Charcoal, pencil & ink wash' },
    { id: 'digital', label: 'Digital Media', icon: <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />, desc: 'Generative, 3D & render art' },
    { id: 'video', label: 'Motion Loops', icon: <Film className="w-3.5 h-3.5 text-[#f0a8d0]" />, desc: 'Cinematic loops & audiovisual' },
    { id: 'music', label: 'Original Music', icon: <Disc3 className="w-3.5 h-3.5 text-[#c9a875]" />, desc: 'Original songs, audio tracks & soundscapes' }
  ];

  const hasActiveDateFilter = Boolean(dateRange.start || dateRange.end);

  const handleSearchInput = (value: string) => {
    onSearchChange(value);
    if (activeView !== 'feed' && activeView !== 'saved') {
      onSelectView('feed');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#06070a]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all">
      
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP ATELIER NAVIGATION SUITE (md:block hidden)
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* TIER 1: Primary Brand Header & Utility Suite
            (The Artisan's Quill, Spacious Search Bar, Audio, DBMS, Upload, NEW ARTIST) */}
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Brand Logo & Tagline */}
          <div
            id="brand-logo-btn"
            onClick={() => {
              onSelectView('feed');
              onSelectCategory('all');
              onSearchChange('');
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 transition-transform duration-200 hover:scale-105"
            title="The Artisan's Quill — Home Atelier"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-[#c9a875]/40 group-hover:border-[#c9a875] group-hover:shadow-[0_0_20px_rgba(201,168,117,0.35)] transition-all">
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a875] group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-display text-lg sm:text-xl md:text-2xl font-medium tracking-[0.14em] text-white group-hover:text-[#f3e3cb] whitespace-nowrap transition-colors">
                The Artisan's Quill
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[#c9a875]/80 font-mono-code -mt-0.5 hidden sm:block">
                Atelier & Gallery Vault
              </span>
            </div>
          </div>

          {/* Center: Spacious Expanding Rectangular Search Bar */}
          <div
            className="flex-1 transition-all duration-300 ease-out hidden md:block max-w-xl lg:max-w-2xl xl:max-w-3xl mx-2 lg:mx-4"
          >
            <div
              className={`relative flex items-center transition-all duration-300 rounded-xl overflow-hidden ${
                isSearchFocused || searchQuery
                  ? 'ring-1 ring-[#c9a875] border border-[#c9a875] shadow-[0_0_25px_rgba(201,168,117,0.3)] bg-[#080a0f]/98'
                  : 'bg-[#0a0c12]/90 hover:bg-[#0e111a] border border-white/15 hover:border-[#c9a875]/50 shadow-inner'
              }`}
            >
              {/* Left Magnifying Glass Icon */}
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none ${
                  isSearchFocused || searchQuery ? 'text-[#c9a875]' : 'text-neutral-400'
                }`}
              />

              {/* Direct On-Page Search Input */}
              <input
                id="main-search-input"
                type="text"
                placeholder="Search paintings, poetry, digital art, mediums, techniques, artists..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] text-white placeholder-neutral-400 focus:outline-none transition-all font-sans bg-transparent"
              />

              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={() => handleSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Suite (Music, Upload, and Artist Profile) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Ambient Soundscape */}
            <div className="relative">
              <AudioAmbiencePlayer />
            </div>

            {/* Fluid Ink & Gold-Leaf Poetry Studio Button */}
            {onOpenInkStudio && (
              <button
                id="navbar-ink-studio-btn"
                onClick={onOpenInkStudio}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] border border-[#dfbd87]/50 bg-gradient-to-r from-[#c9a875]/25 via-white/5 to-[#c9a875]/10 hover:border-[#dfbd87] text-[#f8ebd5] hover:text-white rounded-sm transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(201,168,117,0.25)] backdrop-blur-md"
                title="Launch Fluid Ink & Gold-Leaf Poetry Studio"
              >
                <Feather className="w-3.5 h-3.5 text-[#dfbd87]" />
                <span>Ink Studio</span>
              </button>
            )}

            {/* Upload Artwork / Write Poem CTA */}
            <div className="relative group">
              <button
                id="navbar-upload-btn"
                onClick={() => onOpenUpload(selectedCategory !== 'all' ? selectedCategory : 'digital')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] border border-[#c9a875]/60 bg-gradient-to-r from-[#c9a875]/20 to-transparent hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black text-white hover:border-[#c9a875] rounded-sm transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(201,168,117,0.2)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              {/* Restored Quick-Select Format Dropdown - All 5 Atelier Pieces */}
              <div className="absolute right-0 top-full mt-1.5 w-52 py-1.5 bg-[#0a0d14]/98 border border-[#c9a875]/40 rounded-xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-1 text-[9px] uppercase font-mono-code text-[#c9a875]/80 tracking-widest border-b border-white/10 mb-1">
                  Atelier Formats (5 Pieces)
                </div>
                <button
                  id="upload-opt-music"
                  onClick={() => onOpenUpload('music', 'original song')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Disc3 className="w-3.5 h-3.5 text-[#c9a875]" />
                  <span>Original Song</span>
                </button>
                <button
                  id="upload-opt-poetry-card"
                  onClick={() => onOpenUpload('poetry', 'poetry card')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
                  <span>Poetry Card</span>
                </button>
                <button
                  id="upload-opt-digital-art"
                  onClick={() => onOpenUpload('digital', 'digital art')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />
                  <span>Digital Art</span>
                </button>
                <button
                  id="upload-opt-integer-art"
                  onClick={() => onOpenUpload('digital', 'integer art')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f0a8d0]" />
                  <span>Integer Art</span>
                </button>
                <button
                  id="upload-opt-motion-loops"
                  onClick={() => onOpenUpload('video', 'motion loops')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5 text-[#b9c6ea]" />
                  <span>Motion Loops</span>
                </button>
              </div>
            </div>

            {/* Explicit Sign In button when visitor is in Guest Mode */}
            {currentUser.id === 'guest' && onOpenLoginModal && (
              <button
                id="navbar-guest-signin-btn"
                onClick={onOpenLoginModal}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] border border-[#c9a875]/70 bg-gradient-to-r from-[#c9a875]/20 to-[#c9a875]/40 hover:from-[#c9a875] hover:to-[#dfbd87] text-[#f8ebd5] hover:text-black rounded-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(201,168,117,0.3)] hover:scale-105 active:scale-95"
                title="Sign in with Google or Artist Credentials"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Private User Account Capsule & Options */}
            <ArtistSwitcherDropdown
              currentUser={currentUser}
              onOpenCreateProfile={() => {
                if (onOpenCreateProfile) onOpenCreateProfile();
              }}
              onOpenLoginModal={onOpenLoginModal}
              onOpenEditProfile={onOpenEditProfile}
              onSelectCurrentUserProfile={onSelectCurrentUser}
              onLogout={onLogout}
              onOpenCollectorVault={onOpenCollectorVault}
            />
          </div>
        </div>

        {/* Mobile Search Bar (Rectangular Form Factor) */}
        <div className="mt-3 block sm:hidden">
          <div className="relative flex items-center bg-[#090b10]/95 border border-white/15 focus-within:border-[#c9a875] focus-within:ring-1 focus-within:ring-[#c9a875]/60 rounded-xl overflow-hidden shadow-inner">
            <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search paintings, poetry, art..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: Navigation & Curatorial Salon Ribbon
          (All Works, 3D Cosmos, Curated Exhibitions, Constellation, Bard, 3D Vault)
          + Right: Saved Vault, Recycle Bin, About
         ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-[#05060a]/95 px-4 sm:px-6 lg:px-8 xl:px-10 py-2 shadow-sm">
        <div className="max-w-[1760px] mx-auto flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar touch-scroll py-0.5">
          
          {/* Left: Main Navigation Views Pills */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 py-0.5">
            <button
              id="nav-all-works-btn"
              onClick={() => {
                onSelectView('feed');
                onSelectCategory('all');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'feed'
                  ? 'text-[#c9a875] font-bold bg-[#c9a875]/15 border border-[#c9a875]/40 shadow-[0_0_16px_rgba(201,168,117,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>{activeView === 'feed' ? '✦' : '✧'}</span>
              <span>All Works</span>
            </button>

            {/* 3D Constellation Cosmos Interactive Starmap Tab */}
            <button
              id="nav-3d-cosmos-btn"
              onClick={() => onSelectView('cosmos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'cosmos'
                  ? 'text-[#c9a875] font-bold bg-[#c9a875]/15 border border-[#c9a875]/40 shadow-[0_0_16px_rgba(201,168,117,0.25)]'
                  : 'text-neutral-400 hover:text-[#dfbd87] hover:bg-white/[0.05]'
              }`}
              title="Click to view 3D constellation of art data"
            >
              <Sparkles className={`w-3 h-3 ${activeView === 'cosmos' ? 'text-[#c9a875]' : 'text-neutral-400'}`} />
              <span>3D Cosmos</span>
            </button>

            <button
              id="nav-exhibitions-btn"
              onClick={() => onSelectView('exhibitions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'exhibitions'
                  ? 'text-[#c9a875] font-bold bg-[#c9a875]/15 border border-[#c9a875]/40 shadow-[0_0_16px_rgba(201,168,117,0.25)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span>{activeView === 'exhibitions' ? '✦' : '✧'}</span>
              <span>Exhibitions</span>
            </button>

            {/* 3D Constellation Star Map Modal Trigger */}
            {onOpenConstellationModal && (
              <button
                id="nav-constellation-btn"
                onClick={onOpenConstellationModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] text-neutral-400 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-transparent hover:border-[#c9a875]/30 transition-all cursor-pointer whitespace-nowrap"
                title="Launch 3D Constellation of Motifs"
              >
                <span>🌌</span>
                <span>Constellation</span>
              </button>
            )}

            {/* AI Poetic Bard Symphony Trigger */}
            {onOpenBardModal && (
              <button
                id="nav-bard-symphony-btn"
                onClick={onOpenBardModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] text-neutral-400 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-transparent hover:border-[#c9a875]/30 transition-all cursor-pointer whitespace-nowrap"
                title="Launch AI Poetic Reciter & Bard Symphony"
              >
                <span>🎙️</span>
                <span>Bard Symphony</span>
              </button>
            )}

            {/* 3D Collector's Vault Modal Trigger */}
            {onOpenCollectorVault && (
              <button
                id="nav-collector-vault-btn"
                onClick={onOpenCollectorVault}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] uppercase font-mono-code tracking-[0.18em] text-neutral-400 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-transparent hover:border-[#c9a875]/30 transition-all cursor-pointer whitespace-nowrap"
                title="Open Collector's 3D Trophy Vault & Certificates"
              >
                <span>🏆</span>
                <span>3D Vault</span>
              </button>
            )}
          </div>

          {/* Right: Saved Vault, Recycle Bin, About */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              id="nav-saved-vault-btn"
              onClick={() => onSelectView('saved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'saved'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Vault</span>
            </button>

            <button
              id="nav-recycle-bin-btn"
              onClick={() => onSelectView('recycle-bin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'recycle-bin'
                  ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                  : 'text-neutral-300 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Recycle Bin</span>
            </button>

            <button
              id="nav-about-btn"
              onClick={() => onSelectView('about')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'about'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 3: Medium & Category Sub-Tabs Ribbon
          (All, Poetry Cards, Paintings, Drawings, Digital, Video)
          + Dead-Right: Date Filter & Live Sync Feature
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#040508]/95 border-t border-white/[0.07] px-4 sm:px-6 lg:px-8 xl:px-10 py-2 shadow-md">
        <div className="max-w-[1760px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Category Pills (When on feed or saved), or View Context */}
          {activeView === 'feed' || activeView === 'saved' ? (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-scroll py-0.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap group ${
                      isSelected
                        ? 'bg-white/15 text-white border border-[#c9a875]/60 shadow-[0_0_15px_rgba(201,168,117,0.15)] font-bold'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent'
                    }`}
                    title={cat.desc}
                  >
                    <span className="transition-transform group-hover:scale-110">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-neutral-400 py-1">
              <span className="text-[#c9a875]">✦ Atelier Sanctuary</span>
              <span className="text-neutral-600">/</span>
              <span className="text-white capitalize font-semibold tracking-wider">
                {activeView === 'cosmos' && '3D Constellation Cosmos'}
                {activeView === 'exhibitions' && 'Curated Exhibitions'}
                {activeView === 'about' && 'Sanctuary Vision & About'}
                {activeView === 'recycle-bin' && 'Recycle Bin Archive'}
                {activeView === 'community' && 'Community Salon'}
                {activeView === 'vaults' && 'Collector Vaults'}
              </span>
            </div>
          )}

          {/* Dead Right: Date Filter */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Filter Button */}
            <button
              id="navbar-date-filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono-code font-bold uppercase rounded-md border transition-all cursor-pointer ${
                showFilters || hasActiveDateFilter
                  ? 'bg-[#c9a875]/25 border-[#c9a875] text-[#dfbd87] shadow-[0_0_10px_rgba(201,168,117,0.3)]'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Timeline & Date Filter"
            >
              <Filter className="w-3 h-3" />
              <span>Filter</span>
              {hasActiveDateFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875]" />}
            </button>
          </div>
        </div>

        {/* Collapsible Date Timeline Filter Strip */}
        {showFilters && (
          <div className="max-w-[1760px] mx-auto mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#c9a875] uppercase font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date Range:</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                  className="bg-neutral-900 border border-white/20 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#c9a875]"
                />
                <span className="text-neutral-500 font-mono-code">to</span>
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  className="bg-neutral-900 border border-white/20 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#c9a875]"
                />
              </div>
            </div>

            {hasActiveDateFilter && (
              <button
                onClick={() => onDateRangeChange({ start: undefined, end: undefined })}
                className="text-[10px] font-mono-code uppercase text-[#c9a875] hover:text-white hover:underline cursor-pointer"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE APPARATUS & ATELIER EXPERIENCE (block md:hidden)
         ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden">

        {/* Mobile Top App Bar */}
        <div className="flex items-center justify-between h-14 landscape:h-11 px-2.5 sm:px-3 bg-[#06070a]/98 backdrop-blur-2xl border-b border-white/10 gap-2">
          
          {/* Left Brand Logo Badge & Title */}
          <div
            id="mobile-brand-logo-btn"
            onClick={() => {
              onSelectView('feed');
              onSelectCategory('all');
              onSearchChange('');
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0 pr-1 shrink"
            title="The Artisan's Quill — Home Atelier"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-neutral-900/90 border border-white/15 flex items-center justify-center shadow-inner group-hover:border-[#c9a875]/60 transition-colors shrink-0">
              <Feather className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e0c49a]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif-display text-[15px] sm:text-lg font-medium tracking-wide text-white leading-tight truncate">
                The Artisan's Quill
              </span>
              <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.2em] text-[#c9a875] font-mono-code font-medium mt-0.5 truncate hidden min-[360px]:block">
                ATELIER &amp; GALLERY VAULT
              </span>
            </div>
          </div>

          {/* Right Action Suite: 4 Circular Buttons (Search, Audio, Avatar, Menu) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 1. Search Circular Button */}
            <button
              id="mobile-search-toggle-btn"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer touch-target-44 ${
                isMobileSearchOpen || searchQuery
                  ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#dfbd87]'
                  : 'bg-neutral-900/90 border-white/15 text-cyan-400 hover:text-white hover:border-white/30'
              }`}
              title="Toggle Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* 2. Audio Ambience Player (Circular Variant) */}
            <div className="relative">
              <AudioAmbiencePlayer variant="circular" />
            </div>

            {/* 3. Artist Profile Switcher (Circular Avatar Variant) */}
            <ArtistSwitcherDropdown
              currentUser={currentUser}
              onOpenCreateProfile={() => {
                if (onOpenCreateProfile) onOpenCreateProfile();
              }}
              onOpenLoginModal={onOpenLoginModal}
              onOpenEditProfile={onOpenEditProfile}
              onSelectCurrentUserProfile={onSelectCurrentUser}
              onLogout={onLogout}
              onOpenCollectorVault={onOpenCollectorVault}
              variant="circular"
            />

            {/* 4. Sanctuary Menu Drawer Hamburger Trigger */}
            <button
              id="mobile-menu-drawer-btn"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="w-9 h-9 rounded-full bg-neutral-900/90 border border-white/15 flex items-center justify-center text-neutral-200 hover:text-white hover:border-[#c9a875]/50 transition-all cursor-pointer touch-target-44"
              title="Open Sanctuary Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Search Input Strip */}
        {isMobileSearchOpen && (
          <div className="px-3.5 py-2.5 bg-[#080a10] border-b border-[#c9a875]/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1 flex items-center bg-black/60 border border-[#c9a875]/60 rounded-xl overflow-hidden shadow-inner">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#c9a875] pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search paintings, poetry, artists..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none bg-transparent font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 font-mono-code cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Mobile Category Rail (Exact Image 4 reference with icons & gold active border) */}
        <div className="bg-[#050609]/95 border-b border-white/[0.06] px-3 py-2 landscape:py-1 flex items-center justify-between gap-2">
          {activeView === 'feed' || activeView === 'saved' ? (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar touch-scroll py-0.5 w-full">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                // Category emoji badges matching Image 4
                const emojiIcon =
                  cat.id === 'all'
                    ? '✦'
                    : cat.id === 'poetry'
                    ? '🪶'
                    : cat.id === 'painting'
                    ? '🎨'
                    : cat.id === 'drawing'
                    ? '✒️'
                    : cat.id === 'digital'
                    ? '🖼️'
                    : cat.id === 'music'
                    ? '🎵'
                    : '🎬';

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      if (activeView !== 'feed' && activeView !== 'saved') {
                        onSelectView('feed');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-neutral-950 text-[#fcedd2] border border-[#c9a875] font-semibold shadow-[0_0_12px_rgba(201,168,117,0.3)]'
                        : 'text-neutral-300 hover:text-white bg-neutral-900/80 border border-white/10'
                    }`}
                  >
                    <span>{emojiIcon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}

              {/* Filter Button */}
              <button
                id="mobile-date-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code font-bold uppercase rounded-full border transition-all cursor-pointer shrink-0 ${
                  showFilters || hasActiveDateFilter
                    ? 'bg-[#c9a875]/25 border-[#c9a875] text-[#dfbd87]'
                    : 'bg-neutral-900/80 border-white/10 text-neutral-300'
                }`}
                title="Toggle Filter"
              >
                <Filter className="w-3 h-3 text-[#c9a875]" />
                <span>Filter</span>
                {hasActiveDateFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875]" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full text-xs font-mono-code py-0.5">
              <div className="flex items-center gap-1.5 text-neutral-300 truncate">
                <span className="text-[#c9a875]">✦</span>
                <span className="font-semibold text-white capitalize">
                  {activeView === 'cosmos' && '3D Cosmos'}
                  {activeView === 'exhibitions' && 'Exhibitions'}
                  {activeView === 'about' && 'About & Vision'}
                  {activeView === 'recycle-bin' && 'Recycle Bin'}
                  {activeView === 'community' && 'Community Salon'}
                  {activeView === 'vaults' && 'Collector Vaults'}
                </span>
              </div>
              <button
                onClick={() => onSelectView('feed')}
                className="text-[10px] uppercase font-mono-code text-[#c9a875] hover:text-white px-2 py-1 rounded bg-[#c9a875]/10 border border-[#c9a875]/30 cursor-pointer shrink-0"
              >
                ← Atelier
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Mobile Date Filter */}
        {showFilters && (
          <div className="px-4 py-3 bg-[#080a11] border-b border-white/10 text-xs text-neutral-300 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#c9a875] uppercase font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date Range</span>
              </span>
              {hasActiveDateFilter && (
                <button
                  onClick={() => onDateRangeChange({ start: undefined, end: undefined })}
                  className="text-[10px] font-mono-code uppercase text-[#c9a875] hover:text-white underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="flex-1 bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a875]"
              />
              <span className="text-neutral-500 font-mono-code text-xs">to</span>
              <input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="flex-1 bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a875]"
              />
            </div>
          </div>
        )}
      </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE FIXED BOTTOM APP DOCK (block md:hidden)
         ───────────────────────────────────────────────────────────── */}
      <nav
        id="mobile-bottom-app-dock"
        aria-label="Mobile Navigation Dock"
        className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06070a]/96 backdrop-blur-2xl border-t border-[#c9a875]/30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[env(safe-area-inset-bottom,6px)]"
      >
        <div className="flex items-center justify-around h-15 landscape:h-12 px-2">
          {/* 1. Feed / Atelier */}
          <button
            id="mobile-dock-feed-btn"
            onClick={() => {
              onSelectView('feed');
              onSelectCategory('all');
            }}
            className={`flex flex-col items-center justify-center gap-1 landscape:gap-0.5 flex-1 py-1 landscape:py-0.5 transition-all cursor-pointer ${
              activeView === 'feed'
                ? 'text-[#c9a875] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-5 h-5 landscape:w-4 landscape:h-4" />
            <span className="text-[9px] font-mono-code uppercase tracking-wider">Atelier</span>
          </button>

          {/* 2. 3D Cosmos */}
          <button
            id="mobile-dock-cosmos-btn"
            onClick={() => onSelectView('cosmos')}
            className={`flex flex-col items-center justify-center gap-1 landscape:gap-0.5 flex-1 py-1 landscape:py-0.5 transition-all cursor-pointer ${
              activeView === 'cosmos'
                ? 'text-[#c9a875] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 landscape:w-4 landscape:h-4" />
            <span className="text-[9px] font-mono-code uppercase tracking-wider">Cosmos</span>
          </button>

          {/* 3. Center Elevated Gold '+' Button */}
          <div className="relative -top-3.5 landscape:-top-2 flex flex-col items-center shrink-0 px-1">
            <button
              id="mobile-dock-create-btn"
              onClick={() => setIsMobileActionSheetOpen(true)}
              className="w-13 h-13 landscape:w-10 landscape:h-10 rounded-full bg-gradient-to-tr from-[#c9a875] via-[#dfbd87] to-[#e4cb9c] text-black flex items-center justify-center shadow-[0_0_24px_rgba(201,168,117,0.7)] border-3 border-[#06070a] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Create in Atelier"
            >
              <Plus className="w-6 h-6 landscape:w-4 landscape:h-4 stroke-[2.5]" />
            </button>
            <span className="text-[8px] font-mono-code uppercase tracking-widest text-[#dfbd87] font-bold mt-0.5 landscape:hidden">
              Create
            </span>
          </div>

          {/* 4. Exhibitions */}
          <button
            id="mobile-dock-exhibitions-btn"
            onClick={() => onSelectView('exhibitions')}
            className={`flex flex-col items-center justify-center gap-1 landscape:gap-0.5 flex-1 py-1 landscape:py-0.5 transition-all cursor-pointer ${
              activeView === 'exhibitions'
                ? 'text-[#c9a875] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-5 h-5 landscape:w-4 landscape:h-4" />
            <span className="text-[9px] font-mono-code uppercase tracking-wider">Salons</span>
          </button>

          {/* 5. Saved Vault */}
          <button
            id="mobile-dock-saved-btn"
            onClick={() => onSelectView('saved')}
            className={`flex flex-col items-center justify-center gap-1 landscape:gap-0.5 flex-1 py-1 landscape:py-0.5 transition-all cursor-pointer ${
              activeView === 'saved'
                ? 'text-[#c9a875] font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-5 h-5 landscape:w-4 landscape:h-4" />
            <span className="text-[9px] font-mono-code uppercase tracking-wider">Saved</span>
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDING SANCTUARY DRAWER (Right-side sheet)
         ───────────────────────────────────────────────────────────── */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
          className="block md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 bottom-0 right-0 w-[84%] max-w-xs bg-[#080a11] border-l border-[#c9a875]/40 shadow-2xl p-5 pt-[calc(env(safe-area-inset-top,16px)+16px)] pb-[calc(env(safe-area-inset-bottom,16px)+16px)] overflow-y-auto touch-scroll flex flex-col justify-between animate-in slide-in-from-right duration-300"
          >
            <div className="space-y-5">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-[#c9a875]" />
                  <span className="font-serif-display text-base font-semibold text-white">
                    Sanctuary Studio
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Persona / Account Card */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-[#c9a875]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={currentUser.avatar}
                    name={currentUser.name}
                    className="w-9 h-9 rounded-full border border-[#c9a875] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] font-mono-code text-[#c9a875] truncate">{currentUser.handle}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSelectCurrentUser();
                  }}
                  className="text-[10px] font-mono-code uppercase px-2 py-1 rounded bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 shrink-0 cursor-pointer"
                >
                  Profile
                </button>
              </div>

              {/* Curatorial Studios Section */}
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-[0.2em] font-mono-code text-[#c9a875] px-2 py-1 font-bold">
                  Curatorial Studios
                </div>

                {onOpenBardModal && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenBardModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-base">🎙️</span>
                    <span className="font-medium">Bard Symphony Studio</span>
                  </button>
                )}

                {onOpenConstellationModal && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenConstellationModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-base">🌌</span>
                    <span className="font-medium">3D Constellation Starmap</span>
                  </button>
                )}

                {onOpenCollectorVault && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenCollectorVault();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-base">🏆</span>
                    <span className="font-medium">3D Trophy Vault &amp; Certs</span>
                  </button>
                )}

                {onOpenInkStudio && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenInkStudio();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-base">✒️</span>
                    <span className="font-medium">Fluid Ink &amp; Gold-Leaf Studio</span>
                  </button>
                )}

                {onOpenCinemaMode && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenCinemaMode();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <span className="text-base">🎞️</span>
                    <span className="font-medium">Cinema Slideshow Mode</span>
                  </button>
                )}
              </div>

              {/* Sanctuary Ateliers Section */}
              <div className="space-y-1">
                <div className="text-[9px] uppercase tracking-[0.2em] font-mono-code text-[#c9a875] px-2 py-1 font-bold">
                  Sanctuary Ateliers
                </div>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSelectView('exhibitions');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#c9a875]" />
                  <span className="font-medium">Curated Exhibitions</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSelectView('community');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#8ed8b5]" />
                  <span className="font-medium">Community Salon</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSelectView('about');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#e0c49a]" />
                  <span className="font-medium">About Us &amp; Vision</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onSelectView('recycle-bin');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="font-medium">Recycle Bin Archive</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom Infrastructure Footer */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {onLogout && currentUser.id !== 'guest' && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 text-center text-xs font-mono-code text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Sign Out Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE QUICK CREATE / UPLOAD ACTION SHEET
         ───────────────────────────────────────────────────────────── */}
      {isMobileActionSheetOpen && (
        <div
          id="mobile-action-sheet-overlay"
          onClick={() => setIsMobileActionSheetOpen(false)}
          className="block md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-[#0a0d16] border-t border-[#c9a875]/50 rounded-t-3xl p-5 space-y-3 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-in slide-in-from-bottom duration-300 shadow-2xl"
          >
            <div className="w-10 h-1 bg-neutral-600 rounded-full mx-auto mb-2" />
            <h3 className="font-serif-display text-center text-lg text-white font-medium mb-3">
              Create in Sanctuary
            </h3>

            <button
              onClick={() => {
                setIsMobileActionSheetOpen(false);
                onOpenUpload(selectedCategory !== 'all' ? selectedCategory : 'digital');
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#c9a875]/60 text-left transition-all cursor-pointer"
            >
              <span className="text-xl">🖼️</span>
              <div>
                <div className="text-xs font-semibold text-white">Upload Artwork / Media</div>
                <div className="text-[10px] font-mono-code text-neutral-400">Paintings, drawings, digital art &amp; motion loops</div>
              </div>
            </button>

            {onOpenInkStudio && (
              <button
                onClick={() => {
                  setIsMobileActionSheetOpen(false);
                  onOpenInkStudio();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#c9a875]/60 text-left transition-all cursor-pointer"
              >
                <span className="text-xl">✒️</span>
                <div>
                  <div className="text-xs font-semibold text-white">Fluid Ink &amp; Gold-Leaf Studio</div>
                  <div className="text-[10px] font-mono-code text-neutral-400">Interactive parchment calligraphy &amp; foil stamping</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                setIsMobileActionSheetOpen(false);
                onOpenUpload('poetry', 'poetry card');
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#c9a875]/60 text-left transition-all cursor-pointer"
            >
              <span className="text-xl">🪶</span>
              <div>
                <div className="text-xs font-semibold text-white">Inscribe Poetry Card</div>
                <div className="text-[10px] font-mono-code text-neutral-400">Coffee-stained lyrical verse archive</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsMobileActionSheetOpen(false);
                onOpenUpload('music', 'music track');
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#c9a875]/60 text-left transition-all cursor-pointer"
            >
              <span className="text-xl">🎵</span>
              <div>
                <div className="text-xs font-semibold text-white">Music &amp; Audio Studio</div>
                <div className="text-[10px] font-mono-code text-neutral-400">Publish original songs, audio tracks &amp; soundscapes</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsMobileActionSheetOpen(false);
                onOpenUpload('video', 'motion loops');
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#c9a875]/60 text-left transition-all cursor-pointer"
            >
              <span className="text-xl">🎬</span>
              <div>
                <div className="text-xs font-semibold text-white">Motion Cinema &amp; Loops</div>
                <div className="text-[10px] font-mono-code text-neutral-400">4K volumetric fluid dynamics &amp; audiovisual loops</div>
              </div>
            </button>

            <button
              onClick={() => setIsMobileActionSheetOpen(false)}
              className="w-full py-3 rounded-xl bg-white/10 text-xs font-medium text-white text-center cursor-pointer mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
