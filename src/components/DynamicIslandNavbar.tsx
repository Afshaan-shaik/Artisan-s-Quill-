import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Plus,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Disc3,
  ImageIcon,
  Sparkles,
  Film,
  Feather,
  Palette,
  PenTool,
  Layers,
  Bookmark,
  Trash2
} from 'lucide-react';
import { ArtCategory, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { AudioAmbiencePlayer } from './AudioAmbiencePlayer';

interface DynamicIslandNavbarProps {
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
  onSelectCurrentUser: () => void;
  onOpenEditProfile?: () => void;
  onOpenCreateProfile?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  currentUser: UserProfile;
  onOpenCinemaMode?: () => void;
}

interface IslandItemDef {
  id: string;
  name: string;
  symbol: string;
  c1: string;
  c2: string;
  desc: string;
  isActive: boolean;
  onClick: () => void;
}

export const DynamicIslandNavbar: React.FC<DynamicIslandNavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeView,
  onSelectView,
  onOpenUpload,
  onOpenInkStudio,
  onOpenBardModal,
  onOpenConstellationModal,
  onOpenCollectorVault,
  onSelectCurrentUser,
  onOpenEditProfile,
  onOpenLoginModal,
  onLogout,
  currentUser
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isOpen = isHovered || isPinned;

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  const isGuest = currentUser.id === 'guest';

  const closeIsland = () => {
    setIsPinned(false);
    setIsHovered(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setIsPinned(false);
        setIsHovered(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 9 Vault navigation sectors matching Concept 3 (Array S)
  const islandItems: IslandItemDef[] = [
    {
      id: 'all-works',
      name: 'All works',
      symbol: '✦',
      c1: '#e2573d',
      c2: '#a8321f',
      desc: 'Everything in the vault',
      isActive: activeView === 'feed' && selectedCategory === 'all',
      onClick: () => {
        onSelectView('feed');
        onSelectCategory('all');
        closeIsland();
      }
    },
    {
      id: 'exhibitions',
      name: 'Exhibitions',
      symbol: '◧',
      c1: '#e0a53a',
      c2: '#a8741a',
      desc: 'Curated shows',
      isActive: activeView === 'exhibitions',
      onClick: () => {
        onSelectView('exhibitions');
        closeIsland();
      }
    },
    {
      id: 'original-music',
      name: 'Original music',
      symbol: '♪',
      c1: '#7fa650',
      c2: '#4d7a2c',
      desc: 'Your compositions',
      isActive: activeView === 'feed' && selectedCategory === 'music',
      onClick: () => {
        onSelectView('feed');
        onSelectCategory('music');
        closeIsland();
      }
    },
    {
      id: 'constellation',
      name: 'Constellation',
      symbol: '✧',
      c1: '#3f8fd6',
      c2: '#255c9e',
      desc: 'How works connect',
      isActive: false,
      onClick: () => {
        if (onOpenConstellationModal) onOpenConstellationModal();
        closeIsland();
      }
    },
    {
      id: '3d-cosmos',
      name: '3D Cosmos',
      symbol: '◍',
      c1: '#8a63d2',
      c2: '#573a99',
      desc: 'Sculpture in space',
      isActive: activeView === 'cosmos',
      onClick: () => {
        onSelectView('cosmos');
        closeIsland();
      }
    },
    {
      id: 'bard-symphony',
      name: 'Bard Symphony',
      symbol: '❖',
      c1: '#e07aa0',
      c2: '#a84470',
      desc: 'Poetry set to sound',
      isActive: false,
      onClick: () => {
        if (onOpenBardModal) onOpenBardModal();
        closeIsland();
      }
    },
    {
      id: '3d-vault',
      name: '3D Vault',
      symbol: '⬡',
      c1: '#a0693f',
      c2: '#6b4125',
      desc: 'Rendered pieces',
      isActive: false,
      onClick: () => {
        if (onOpenCollectorVault) onOpenCollectorVault();
        closeIsland();
      }
    },
    {
      id: 'saved-vault',
      name: 'Saved vault',
      symbol: '⚑',
      c1: '#3a4a9a',
      c2: '#222d6e',
      desc: 'Bookmarked works',
      isActive: activeView === 'saved',
      onClick: () => {
        onSelectView('saved');
        closeIsland();
      }
    },
    {
      id: 'recycle-bin',
      name: 'Recycle bin',
      symbol: '⌫',
      c1: '#9aa0aa',
      c2: '#5d636d',
      desc: 'Restore deleted works',
      isActive: activeView === 'recycle-bin',
      onClick: () => {
        onSelectView('recycle-bin');
        closeIsland();
      }
    }
  ];

  // Preserved Art Categories explicitly requested by the user:
  // (Poetry Cards, Motion Loops, Digital Media, Paintings, Drawings, Music)
  const artworkCategories: { id: ArtCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'All Works', icon: <Layers className="w-3.5 h-3.5" />, color: '#ffcf6b' },
    { id: 'poetry', label: 'Poetry Cards', icon: <Feather className="w-3.5 h-3.5" />, color: '#e0c49a' },
    { id: 'video', label: 'Motion Loops', icon: <Film className="w-3.5 h-3.5" />, color: '#f0a8d0' },
    { id: 'digital', label: 'Digital Media', icon: <ImageIcon className="w-3.5 h-3.5" />, color: '#8ed8b5' },
    { id: 'painting', label: 'Paintings', icon: <Palette className="w-3.5 h-3.5" />, color: '#e8b482' },
    { id: 'drawing', label: 'Drawings & Ink', icon: <PenTool className="w-3.5 h-3.5" />, color: '#b9c6ea' },
    { id: 'music', label: 'Original Music', icon: <Disc3 className="w-3.5 h-3.5" />, color: '#ffd27a' },
  ];

  return (
    <>
      <style>{`
        /* Dynamic Island Theme & Animations */
        :root {
          --di-bg: #000000;
          --di-surface: rgba(14, 15, 22, 0.96);
          --di-ink: #f0f0f5;
          --di-mute: #9193a8;
          --di-acc: #ffcf6b;
          --di-line: rgba(255, 255, 255, 0.14);
          --di-serif: 'Cormorant Garamond', Georgia, serif;
          --di-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
          --di-e: cubic-bezier(.2, .8, .2, 1);
        }

        /* ── Dynamic Island Header Root (Attached to start of page) ── */
        .di-header-root {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          pointer-events: none;
          z-index: 50;
        }
        .di-header-root > * {
          pointer-events: auto;
        }

        /* ── Dynamic Island Capsule ── */
        .di-isl {
          position: absolute;
          top: calc(var(--sat, 0px) + 16px);
          left: 50%;
          transform: translateX(-50%);
          width: 340px;
          background: #000000;
          border: 1px solid var(--di-line);
          border-radius: 30px;
          z-index: 50;
          overflow: hidden;
          transition: width 0.45s var(--di-e), border-radius 0.45s, box-shadow 0.45s;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          user-select: none;
        }

        .di-isl.is-open,
        .di-isl.open {
          width: min(840px, 94vw);
          border-radius: 34px;
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 207, 107, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 207, 107, 0.35);
        }

        /* Header row */
        .di-ih {
          height: 56px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
          color: var(--di-acc);
          cursor: pointer;
        }
        .di-ih b {
          font-family: var(--di-serif);
          font-size: 21px;
          font-weight: 600;
          color: var(--di-ink);
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .di-ih span {
          margin-left: auto;
          font-size: 13px;
          color: var(--di-mute);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--di-sans);
          transition: transform 0.3s;
        }

        /* Body expansion with grid 0fr -> 1fr */
        .di-ib {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.45s var(--di-e);
        }
        .di-isl.is-open .di-ib,
        .di-isl.open .di-ib {
          grid-template-rows: 1fr;
        }
        .di-ib > div {
          overflow: hidden;
          min-height: 0;
        }

        /* Inside Grid (3 columns) */
        .di-ig {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding: 8px 16px 18px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.35s ease-out, transform 0.35s ease-out;
        }
        .di-isl.is-open .di-ig,
        .di-isl.open .di-ig {
          opacity: 1;
          transform: none;
          transition-delay: 0.12s;
        }

        /* Individual Island Navigation Link */
        .di-link {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 10px 12px;
          border-radius: 16px;
          transition: background 0.25s, transform 0.2s;
          cursor: pointer;
          color: var(--di-ink);
          text-align: left;
        }
        .di-link:hover {
          background: rgba(255, 207, 107, 0.12);
          transform: translateY(-1px);
        }
        .di-link.is-active {
          background: rgba(255, 207, 107, 0.18);
          border: 1px solid rgba(255, 207, 107, 0.3);
        }
        .di-link b {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
        }
        .di-link small {
          display: block;
          font-size: 11px;
          color: var(--di-mute);
          margin-top: 2px;
        }

        .di-gl {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #fff;
          font-style: normal;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.28), inset 0 -3px 5px rgba(0, 0, 0, 0.22), 0 4px 10px rgba(0, 0, 0, 0.4);
        }

        /* Categories Section inside Island */
        .di-categories-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .di-categories-bar::-webkit-scrollbar { display: none; }

        .di-cat-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 12px;
          font-family: var(--di-sans);
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s;
          background: rgba(255, 255, 255, 0.05);
          color: var(--di-mute);
          border: 1px solid transparent;
        }
        .di-cat-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .di-cat-pill.is-active {
          background: rgba(255, 207, 107, 0.2);
          border-color: rgba(255, 207, 107, 0.6);
          color: #ffffff;
          box-shadow: 0 0 14px rgba(255, 207, 107, 0.25);
        }

        /* Top Right Profile & Audio */
        .di-fx-right {
          position: absolute;
          top: calc(var(--sat, 0px) + 16px);
          right: clamp(16px, 4vw, 48px);
          z-index: 45;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .di-me {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 16px 4px 4px;
          border-radius: 99px;
          border: 1px solid var(--di-line);
          background: rgba(14, 15, 22, 0.85);
          backdrop-filter: blur(16px);
          transition: all 0.3s;
          cursor: pointer;
        }
        .di-me:hover {
          border-color: var(--di-acc);
          background: rgba(255, 207, 107, 0.12);
          box-shadow: 0 0 20px rgba(255, 207, 107, 0.2);
        }
        .di-me b {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
        }
        .di-me small {
          display: block;
          font-size: 11px;
          color: var(--di-mute);
        }

        .di-av {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: conic-gradient(from 200deg, var(--di-acc), #3a2a22, var(--di-acc));
          display: grid;
          place-items: center;
          font-family: var(--di-serif);
          font-size: 15px;
          font-weight: 600;
          color: #120d0a;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* Top Left Quick Upload Button */
        .di-fx-left {
          position: absolute;
          top: calc(var(--sat, 0px) + 16px);
          left: clamp(16px, 4vw, 48px);
          z-index: 45;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .di-up-btn {
          height: 44px;
          padding: 0 18px;
          border-radius: 99px;
          border: 1px solid rgba(255, 207, 107, 0.4);
          background: linear-gradient(135deg, rgba(255, 207, 107, 0.2), rgba(255, 207, 107, 0.05));
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 0.25s;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .di-up-btn:hover {
          background: var(--di-acc);
          color: #120d0a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255, 207, 107, 0.4);
        }

        /* Persistent Categories Ribbon on the Main Page */
        .di-page-categories-ribbon {
          position: absolute;
          top: 86px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(10, 11, 17, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          max-width: calc(100vw - 32px);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .di-page-categories-ribbon::-webkit-scrollbar { display: none; }

        @media (max-width: 900px) {
          .di-isl.is-open { width: min(340px, 94vw); }
          .di-ig { grid-template-columns: 1fr; gap: 2px; }
          .di-me span { display: none; }
          .di-up-btn span { display: none; }
          .di-fx-left { left: 12px; }
          .di-fx-right { right: 12px; }
        }
      `}</style>

      {/* Dynamic Island Header Root (Attached to start of page) */}
      <header className="di-header-root" role="banner">
        {/* ─────────────────────────────────────────────────────────────
            1. TOP-LEFT QUICK UPLOAD CTA
           ───────────────────────────────────────────────────────────── */}
        <div className="di-fx-left" ref={uploadMenuRef}>
        <button
          id="di-upload-trigger-btn"
          type="button"
          onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
          className="di-up-btn"
          title="Upload Artwork or Poem (+)"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#ffcf6b]" />
          <span>Upload</span>
        </button>

        {/* Upload Formats Popover */}
        {isUploadMenuOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 p-2 bg-[#0a0d16]/98 border border-[#ffcf6b]/35 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[9px] uppercase font-mono text-[#ffcf6b] tracking-widest border-b border-white/10 mb-1">
              Atelier Upload Formats
            </div>
            <button
              onClick={() => {
                setIsUploadMenuOpen(false);
                onOpenUpload('poetry', 'poetry card');
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
              <span>Poetry Card</span>
            </button>
            <button
              onClick={() => {
                setIsUploadMenuOpen(false);
                onOpenUpload('video', 'motion loops');
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-[#f0a8d0]" />
              <span>Motion Loops</span>
            </button>
            <button
              onClick={() => {
                setIsUploadMenuOpen(false);
                onOpenUpload('digital', 'digital art');
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />
              <span>Digital Media</span>
            </button>
            <button
              onClick={() => {
                setIsUploadMenuOpen(false);
                onOpenUpload('music', 'original song');
              }}
              className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
            >
              <Disc3 className="w-3.5 h-3.5 text-[#ffcf6b]" />
              <span>Original Song</span>
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FLOATING DYNAMIC ISLAND (Concept 3)
          Morphs from 340px pill to 840px command pavilion
         ───────────────────────────────────────────────────────────── */}
      <div
        id="isl"
        ref={islandRef}
        className={`di-isl ${isOpen ? 'is-open open' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="navigation"
        aria-label="Dynamic Island Vault Navigation"
      >
        {/* Dynamic Island Header Row */}
        <div
          className="di-ih"
          onClick={(e) => {
            e.stopPropagation();
            setIsPinned(prev => !prev);
          }}
          title="The Artisan's Quill — Tap to Pin/Expand Island"
        >
          {/* Gold leaf / feather mark */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#ffcf6b] shrink-0"
          >
            <path d="M20 4c-8 0-13 4-14 12l-2 4 4-2c8-1 12-6 12-14z" />
            <path d="M8 16l7-7" />
          </svg>
          <b>The Artisan’s Quill</b>
          <span>
            Menu {isOpen ? '⌃' : '⌄'}
          </span>
        </div>

        {/* Dynamic Island Animated Body */}
        <div className="di-ib">
          <div>
            {/* Quick Search inside Island */}
            <div className="px-4 pt-1 pb-2">
              <label className="flex items-center gap-2.5 h-10 px-3.5 rounded-full border border-white/10 bg-white/5 text-neutral-400 focus-within:border-[#ffcf6b] focus-within:bg-white/10 transition-all">
                <Search className="w-3.5 h-3.5 text-[#ffcf6b] shrink-0" />
                <input
                  id="di-search-input"
                  type="text"
                  placeholder="Search paintings, poetry cards, motion loops, music..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (activeView !== 'feed' && activeView !== 'saved') {
                      onSelectView('feed');
                    }
                  }}
                  className="all-unset flex-1 min-w-0 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="p-0.5 text-neutral-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </label>
            </div>

            {/* 3x3 Main Vault Sectors Grid */}
            <div className="di-ig">
              {islandItems.map((item) => (
                <button
                  key={item.id}
                  id={`island-item-${item.id}`}
                  type="button"
                  onClick={item.onClick}
                  className={`di-link ${item.isActive ? 'is-active' : ''}`}
                >
                  <i
                    className="di-gl"
                    style={{
                      background: `linear-gradient(145deg, ${item.c1}, ${item.c2})`
                    }}
                  >
                    {item.symbol}
                  </i>
                  <div>
                    <b>{item.name}</b>
                    <small>{item.desc}</small>
                  </div>
                </button>
              ))}
            </div>

            {/* Preserved Artwork Categories Sub-Bar inside Island */}
            <div className="di-categories-bar">
              <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 pl-1 shrink-0">
                Mediums:
              </span>
              {artworkCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    if (activeView !== 'feed') onSelectView('feed');
                    closeIsland();
                  }}
                  className={`di-cat-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
                >
                  <span style={{ color: cat.color }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PERSISTENT CATEGORY RIBBON ON MAIN FEED
          Ensures Poetry Cards, Motion Loops, Digital Media are ALWAYS visible!
         ───────────────────────────────────────────────────────────── */}
      {activeView === 'feed' && (
        <nav
          aria-label="Atelier Mediums"
          className="di-page-categories-ribbon"
        >
          {artworkCategories.map((cat) => (
            <button
              key={`page-${cat.id}`}
              id={`cat-filter-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`di-cat-pill ${selectedCategory === cat.id ? 'is-active' : ''}`}
            >
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TOP-RIGHT UTILITY CLUSTER: AUDIO PLAYER + PROFILE
         ───────────────────────────────────────────────────────────── */}
      <div className="di-fx-right">
        {/* Ambient Audio Player */}
        <div className="relative">
          <AudioAmbiencePlayer />
        </div>

        {/* Profile Capsule (.me) */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="di-profile-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="di-me"
            title="Profile & Sanctuary Settings"
          >
            {currentUser.avatar ? (
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#ffcf6b]/50"
                textSize="text-[11px] font-bold"
              />
            ) : (
              <i className="di-av">{currentUser.name ? currentUser.name[0].toUpperCase() : 'A'}</i>
            )}
            <span>
              <b>{currentUser.name || 'Afshaan Shaikh'}</b>
              <small>{currentUser.handle || '@afshaanshaikh'}</small>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#9193a8] transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#0c0f16]/98 border border-[#ffcf6b]/35 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                <p className="text-[11px] text-[#9193a8] font-mono">{currentUser.handle}</p>
              </div>

              {!isGuest && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectCurrentUser();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#ffcf6b]" />
                  <span>View Public Profile</span>
                </button>
              )}

              {onOpenEditProfile && !isGuest && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenEditProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffcf6b]" />
                  <span>Edit Profile Settings</span>
                </button>
              )}

              {onOpenCollectorVault && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenCollectorVault();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd27a]" />
                  <span>Collector 3D Vault</span>
                </button>
              )}

              {onOpenInkStudio && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenInkStudio();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#ffcf6b]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
                  <span>Fluid Ink Poetry Studio</span>
                </button>
              )}

              {isGuest ? (
                onOpenLoginModal && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#ffcf6b] hover:bg-[#ffcf6b]/15 rounded-xl transition-all cursor-pointer text-left mt-1 border-t border-white/5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Credentials</span>
                  </button>
                )
              ) : (
                onLogout && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 rounded-xl transition-all cursor-pointer text-left mt-1 border-t border-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Session</span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
      </header>
    </>
  );
};
