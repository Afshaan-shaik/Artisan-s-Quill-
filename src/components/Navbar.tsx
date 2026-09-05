import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Feather,
  X,
  PenTool,
  Image as ImageIcon,
  Film,
  Palette,
  Layers,
  Sparkles,
  User,
  Plus
} from 'lucide-react';
import { ArtCategory, UserProfile } from '../types';
import { Avatar } from './Avatar';
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
  activeView,
  onSelectView,
  onOpenUpload,
  onOpenInkStudio,
  onOpenBackendModal,
  onSelectCurrentUser,
  onOpenEditProfile,
  onOpenCreateProfile,
  onOpenLoginModal,
  onLogout,
  onOpenCollectorVault,
  onOpenConstellationModal,
  currentUser,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll-aware transition
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearchInput = (value: string) => {
    onSearchChange(value);
    if (value && activeView !== 'feed' && activeView !== 'saved') {
      onSelectView('feed');
    }
  };

  const navLinks: { id: string; label: string; view: typeof activeView }[] = [
    { id: 'nav-works', label: 'Works', view: 'feed' },
    { id: 'nav-cosmos', label: '3D Cosmos', view: 'cosmos' },
    { id: 'nav-exhibitions', label: 'Exhibitions', view: 'exhibitions' },
    { id: 'nav-saved', label: 'Saved', view: 'saved' },
    { id: 'nav-about', label: 'About', view: 'about' },
  ];

  const categories: { id: ArtCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all',      label: 'All Works',      icon: <Layers   className="w-3 h-3" /> },
    { id: 'poetry',   label: 'Poetry',         icon: <Feather  className="w-3 h-3 text-[#e0c49a]" /> },
    { id: 'painting', label: 'Paintings',      icon: <Palette  className="w-3 h-3 text-[#e8b482]" /> },
    { id: 'drawing',  label: 'Drawings & Ink', icon: <PenTool  className="w-3 h-3 text-[#b9c6ea]" /> },
    { id: 'digital',  label: 'Digital Media',  icon: <ImageIcon className="w-3 h-3 text-[#8ed8b5]" /> },
    { id: 'video',    label: 'Motion Loops',   icon: <Film     className="w-3 h-3 text-[#f0a8d0]" /> },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-400 ${
        isScrolled
          ? 'bg-[#06070a]/96 backdrop-blur-2xl border-b border-white/8 shadow-2xl'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* ── Single navigation bar ─────────────────────────────── */}
      <div className="w-full max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center h-16 gap-4 sm:gap-6 lg:gap-8">

          {/* ── Brand Logo with Golden Expand Glow (From Vercel App) ── */}
          <div
            id="brand-logo-btn"
            onClick={() => {
              onSelectView('feed');
              onSelectCategory('all');
              onSearchChange('');
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95 text-left"
            title="The Artisan's Quill — Home Atelier"
          >
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-[#c9a875]/40 group-hover:border-[#c9a875] group-hover:shadow-[0_0_20px_rgba(201,168,117,0.45)] group-hover:bg-[#c9a875]/20 transition-all duration-300">
              <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a875] group-hover:text-white transition-colors" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-serif-display text-lg sm:text-xl md:text-2xl font-medium tracking-[0.14em] text-white group-hover:text-[#f3e3cb] group-hover:drop-shadow-[0_0_12px_rgba(201,168,117,0.6)] whitespace-nowrap transition-all duration-300">
                The Artisan's Quill
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.28em] text-[#c9a875]/80 font-mono-code mt-0.5 hidden sm:block group-hover:text-[#e0c49a] transition-colors">
                Atelier &amp; Gallery Vault
              </span>
            </div>
          </div>

          {/* ── Primary nav links ────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-5 lg:gap-7"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={link.id}
                onClick={() => onSelectView(link.view)}
                className={`nav-link-editorial ${activeView === link.view ? 'active' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* ── Spacer ───────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Right utilities ──────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">

            {/* 3D Cosmos & Galaxy Header Action Badge */}
            <button
              id="header-nav-cosmos-btn"
              onClick={() => onSelectView('cosmos')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-mono-code uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeView === 'cosmos'
                  ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-[0_0_20px_rgba(201,168,117,0.5)] ring-1 ring-[#c9a875]'
                  : 'border border-[#c9a875]/40 text-[#dfbd87] bg-[#c9a875]/10 hover:bg-[#c9a875]/25 hover:border-[#c9a875] hover:shadow-[0_0_18px_rgba(201,168,117,0.35)] hover:scale-105 active:scale-95'
              }`}
              title="Launch 3D Constellation Cosmos & Interactive Galaxy"
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeView === 'cosmos' ? 'text-black' : 'text-[#c9a875] animate-pulse'}`} />
              <span className="font-semibold">3D Cosmos</span>
              <span className="text-[10px] text-[#c9a875] opacity-80 hidden xl:inline">✦ Galaxy</span>
            </button>

            {onOpenConstellationModal && (
              <button
                id="header-nav-starmap-btn"
                onClick={onOpenConstellationModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-code uppercase tracking-wider text-neutral-300 hover:text-[#dfbd87] hover:bg-[#c9a875]/15 border border-white/10 hover:border-[#c9a875]/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Launch 3D Galaxy Starmap Modal"
              >
                <span>🌌</span>
                <span>Galaxy Starmap</span>
              </button>
            )}

            {/* Fluid Ink Studio CTA (from Vercel App) */}
            {onOpenInkStudio && (
              <button
                id="header-nav-ink-studio-btn"
                onClick={onOpenInkStudio}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-code uppercase tracking-wider text-[#f8ebd5] hover:text-white border border-[#dfbd87]/50 bg-gradient-to-r from-[#c9a875]/20 to-transparent hover:border-[#dfbd87] hover:shadow-[0_0_15px_rgba(201,168,117,0.25)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Launch Fluid Ink & Gold-Leaf Poetry Studio"
              >
                <Feather className="w-3.5 h-3.5 text-[#dfbd87]" />
                <span>Ink Studio</span>
              </button>
            )}

            {/* Upload Artwork / Write Poem CTA (from Vercel App) */}
            <button
              id="header-nav-upload-btn"
              onClick={() => onOpenUpload(selectedCategory !== 'all' ? selectedCategory : 'digital')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#c9a875]/60 bg-gradient-to-r from-[#c9a875]/25 via-white/5 to-[#c9a875]/10 hover:from-[#c9a875] hover:to-[#dfbd87] hover:text-black text-white hover:border-[#c9a875] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(201,168,117,0.2)]"
              title="Upload Artwork or Write Poem"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            {/* Real-time Live Sync Indicator (from Vercel App) */}
            <button
              id="navbar-live-sync-btn"
              onClick={onOpenBackendModal}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.2 rounded-full bg-[#c9a875]/10 hover:bg-[#c9a875]/20 border border-[#c9a875]/30 hover:border-[#c9a875]/60 text-[10px] uppercase font-mono-code text-[#dfbd87] shrink-0 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Real-Time Global Synchronization Active across 500+ Sanctuary Artists (Click to inspect Architecture)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-wider text-white">Live Sync</span>
            </button>

            {/* Inline search (expands/collapses) */}
            <div className="flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className={`relative flex items-center rounded-full overflow-hidden transition-all duration-300 ${
                    searchQuery
                      ? 'ring-1 ring-[#c9a875]/60 border border-[#c9a875]/40 bg-[#080a0f]/98 shadow-[0_0_16px_rgba(201,168,117,0.2)]'
                      : 'border border-white/12 bg-[#0a0c12]/90'
                  }`}>
                    <Search className="w-3.5 h-3.5 text-neutral-400 ml-3 shrink-0 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      id="main-search-input"
                      type="text"
                      placeholder="Search artworks, poetry, artists…"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') { setIsSearchOpen(false); handleSearchInput(''); } }}
                      className="w-48 sm:w-64 pl-2 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none bg-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearchInput('')}
                        className="pr-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => { setIsSearchOpen(false); handleSearchInput(''); }}
                    className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  id="search-open-btn"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors rounded-full hover:bg-white/5 cursor-pointer"
                  title="Search"
                  aria-label="Open search"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Artist profile / account menu */}
            <ArtistSwitcherDropdown
              currentUser={currentUser}
              onOpenCreateProfile={() => { if (onOpenCreateProfile) onOpenCreateProfile(); }}
              onOpenLoginModal={onOpenLoginModal}
              onOpenEditProfile={onOpenEditProfile}
              onSelectCurrentUserProfile={onSelectCurrentUser}
              onLogout={onLogout}
              onOpenCollectorVault={onOpenCollectorVault}
            />
          </div>
        </div>
      </div>

      {/* ── Category underline tabs — feed view only ─────────── */}
      {activeView === 'feed' && (
        <div className={`border-t transition-colors duration-400 ${isScrolled ? 'border-white/6' : 'border-white/4'}`}>
          <div className="w-full max-w-[1760px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`category-tab flex items-center gap-1.5 cursor-pointer ${selectedCategory === cat.id ? 'active' : ''}`}
                  title={cat.label}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile search bar ────────────────────────────────── */}
      <div className="block md:hidden px-5 pb-2.5 mt-0">
        <div className={`relative flex items-center rounded-full overflow-hidden border transition-all ${
          searchQuery ? 'border-[#c9a875]/50 bg-[#080a0f]/95' : 'border-white/10 bg-[#0a0c12]/90'
        }`}>
          <Search className="w-3.5 h-3.5 absolute left-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search artworks, poetry…"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchInput('')}
              className="absolute right-3 p-0.5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
