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
  HardDrive
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
  onOpenBackendModal: () => void;
  onOpenVaultModal?: () => void;
  onSelectCurrentUser: () => void;
  onOpenEditProfile?: () => void;
  onOpenCreateProfile?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  currentUser: UserProfile;
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
  onOpenBackendModal,
  onSelectCurrentUser,
  onOpenEditProfile,
  onOpenCreateProfile,
  onOpenLoginModal,
  onLogout,
  currentUser
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories: { id: ArtCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'all', label: 'All Works', icon: <Layers className="w-3.5 h-3.5" />, desc: 'Curated complete atelier' },
    { id: 'poetry', label: 'Poetry Cards', icon: <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />, desc: 'Verse, stanzas & lyrical cards' },
    { id: 'painting', label: 'Paintings', icon: <Palette className="w-3.5 h-3.5 text-[#e8b482]" />, desc: 'Oil, acrylic & canvas' },
    { id: 'drawing', label: 'Drawings & Ink', icon: <PenTool className="w-3.5 h-3.5 text-[#b9c6ea]" />, desc: 'Charcoal, pencil & ink wash' },
    { id: 'digital', label: 'Digital Media', icon: <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />, desc: 'Generative, 3D & render art' },
    { id: 'video', label: 'Motion Loops', icon: <Film className="w-3.5 h-3.5 text-[#f0a8d0]" />, desc: 'Cinematic loops & audiovisual' }
  ];

  const hasActiveDateFilter = Boolean(dateRange.start || dateRange.end);

  const handleSearchInput = (value: string) => {
    onSearchChange(value);
    if (activeView !== 'feed' && activeView !== 'saved') {
      onSelectView('feed');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#06070a]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl transition-all">
      
      {/* ─────────────────────────────────────────────────────────────
          TIER 1: Primary Brand Header & Utility Suite
          (The Artisan's Quill, Spacious Search Bar, Audio, DBMS, Upload, NEW ARTIST)
         ───────────────────────────────────────────────────────────── */}
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] border border-[#dfbd87]/50 bg-gradient-to-r from-[#c9a875]/25 via-white/5 to-[#c9a875]/10 hover:border-[#dfbd87] text-[#f8ebd5] hover:text-white rounded-sm transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(201,168,117,0.25)] backdrop-blur-md"
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

              {/* Restored Quick-Select Format Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-52 py-1.5 bg-[#0a0d14]/98 border border-[#c9a875]/40 rounded-xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-1 text-[9px] uppercase font-mono-code text-[#c9a875]/80 tracking-widest border-b border-white/10 mb-1">
                  Atelier Formats
                </div>
                <button
                  id="upload-opt-poetry-session"
                  onClick={() => onOpenUpload('poetry', 'poetry session')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
                  <span>Poetry Session</span>
                </button>
                <button
                  id="upload-opt-poetry-card"
                  onClick={() => onOpenUpload('poetry', 'poetry card')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#c9a875]/15 flex items-center gap-2 font-mono-code transition-colors cursor-pointer"
                >
                  <Feather className="w-3.5 h-3.5 text-[#c9a875]" />
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
              </div>
            </div>

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
          TIER 2: Navigation & Curatorial Views Ribbon
          (Gallery, Curators, Saved, Recycle Bin, and Advanced Filter Selector)
         ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-[#07080c]/90 px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 shadow-sm">
        <div className="max-w-[1760px] mx-auto flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
          
          {/* Main Navigation Views Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="nav-all-works-btn"
              onClick={() => {
                onSelectView('feed');
                onSelectCategory('all');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'feed'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>All Works</span>
            </button>

            {/* 3D Constellation Cosmos Interactive Starmap Tab */}
            <button
              id="nav-3d-cosmos-btn"
              onClick={() => onSelectView('cosmos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'cosmos'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md shadow-[#c9a875]/20 ring-1 ring-[#c9a875]/50'
                  : 'text-neutral-300 hover:text-[#dfbd87] hover:bg-white/10'
              }`}
              title="Click to view 3D constellation of art data"
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeView === 'cosmos' ? 'text-black' : 'text-[#c9a875]'}`} />
              <span>3D Cosmos</span>
            </button>

            <button
              id="nav-exhibitions-btn"
              onClick={() => onSelectView('exhibitions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'exhibitions'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-md shadow-[#c9a875]/20'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Exhibitions</span>
            </button>

            {/* 3D Constellation Star Map Modal Trigger */}
            {onOpenConstellationModal && (
              <button
                id="nav-constellation-btn"
                onClick={onOpenConstellationModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-neutral-300 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-white/5 hover:border-[#c9a875]/40 transition-all cursor-pointer whitespace-nowrap"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-neutral-300 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-white/5 hover:border-[#c9a875]/40 transition-all cursor-pointer whitespace-nowrap"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-neutral-300 hover:text-[#dfbd87] hover:bg-[#c9a875]/10 border border-white/5 hover:border-[#c9a875]/40 transition-all cursor-pointer whitespace-nowrap"
                title="Open Collector's 3D Trophy Vault & Certificates"
              >
                <span>🏆</span>
                <span>3D Vault</span>
              </button>
            )}

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

          {/* Right: Date Filter & Advanced Palette Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-2.5 py-1.2 text-[11px] font-mono-code font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                showFilters || hasActiveDateFilter
                  ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#dfbd87]'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Timeline & Date Filter"
            >
              <Filter className="w-3 h-3" />
              <span>Filter</span>
              {hasActiveDateFilter && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a875]" />}
            </button>

            {/* Live Sync Symbol (Replacing DBMS button) */}
            <button
              id="navbar-live-sync-btn"
              onClick={onOpenBackendModal}
              className="flex items-center gap-2 px-3 py-1.2 rounded-lg bg-[#c9a875]/10 hover:bg-[#c9a875]/20 border border-[#c9a875]/30 hover:border-[#c9a875]/60 text-[10px] uppercase font-mono-code text-[#dfbd87] shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Real-Time Global Synchronization Active across 500+ Sanctuary Artists (Click to inspect Architecture)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-wider text-white">Live Sync</span>
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

      {/* ─────────────────────────────────────────────────────────────
          TIER 3: Medium & Category Sub-Tabs Ribbon
          (All, Poetry Cards, Paintings, Drawings, Digital, Video)
         ───────────────────────────────────────────────────────────── */}
      {activeView === 'feed' && (
        <div className="bg-[#040508]/90 border-t border-white/5 px-4 sm:px-6 lg:px-8 xl:px-10 py-2">
          <div className="max-w-[1760px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
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
        </div>
      )}
    </header>
  );
};
