import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Feather,
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
  Layers,
  Palette,
  PenTool,
  Bookmark,
  Trash2
} from 'lucide-react';
import { ArtCategory, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { AudioAmbiencePlayer } from './AudioAmbiencePlayer';

interface MagnifyingDockNavbarProps {
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

interface DockItemDef {
  id: string;
  name: string;
  symbol: string;
  c1: string;
  c2: string;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

export const MagnifyingDockNavbar: React.FC<MagnifyingDockNavbarProps> = ({
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
  onOpenCreateProfile,
  onOpenLoginModal,
  onLogout,
  currentUser,
  onOpenCinemaMode
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const isGuest = currentUser.id === 'guest';

  // Close profile and upload dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Ultra-smooth 120fps GPU-accelerated Magnifying Dock math
  // Uses fixed-coordinate slots + GPU transform: scale & lift (translateY)
  // Eliminates all layout thrashing, jitter, and rubber-banding!
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    setIsHovering(true);

    const clientX = e.clientX;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      if (!dockRef.current) return;
      const slots = dockRef.current.querySelectorAll<HTMLElement>('.dock-slot');
      slots.forEach((slot) => {
        const icon = slot.querySelector<HTMLElement>('.dock-icon-item');
        if (!icon) return;
        const rect = slot.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dx = clientX - centerX;

        // Gaussian bell curve: peak scale 1.82 (~88px), spread sigma = 58px
        const factor = Math.exp((-dx * dx) / (2 * 58 * 58));
        const scale = 1 + 0.82 * factor;
        const translateY = -(scale - 1) * 24; // Smooth lift up to 20px
        const zIndex = Math.round(scale * 100);

        icon.style.setProperty('--s', scale.toFixed(3));
        icon.style.setProperty('--ty', `${translateY.toFixed(1)}px`);
        icon.style.setProperty('--z', `${zIndex}`);
      });
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    setIsHovering(false);
    if (!dockRef.current) return;

    const icons = dockRef.current.querySelectorAll<HTMLElement>('.dock-icon-item');
    icons.forEach((icon) => {
      icon.style.setProperty('--s', '1');
      icon.style.setProperty('--ty', '0px');
      icon.style.setProperty('--z', '1');
    });
  }, []);

  // Dock items definition matching Concept 3 (Array S)
  const dockItems: DockItemDef[] = [
    {
      id: 'all-works',
      name: 'All works',
      symbol: '✦',
      c1: '#e2573d',
      c2: '#a8321f',
      tooltip: 'Everything in the vault',
      isActive: activeView === 'feed' && selectedCategory === 'all',
      onClick: () => {
        onSelectView('feed');
        onSelectCategory('all');
      }
    },
    {
      id: 'exhibitions',
      name: 'Exhibitions',
      symbol: '◧',
      c1: '#e0a53a',
      c2: '#a8741a',
      tooltip: 'Curated shows',
      isActive: activeView === 'exhibitions',
      onClick: () => {
        onSelectView('exhibitions');
      }
    },
    {
      id: 'original-music',
      name: 'Original music',
      symbol: '♪',
      c1: '#7fa650',
      c2: '#4d7a2c',
      tooltip: 'Your compositions & tracks',
      isActive: activeView === 'feed' && selectedCategory === 'music',
      onClick: () => {
        onSelectView('feed');
        onSelectCategory('music');
      }
    },
    {
      id: 'constellation',
      name: 'Constellation',
      symbol: '✧',
      c1: '#3f8fd6',
      c2: '#255c9e',
      tooltip: 'How works connect',
      isActive: false,
      onClick: () => {
        if (onOpenConstellationModal) onOpenConstellationModal();
      }
    },
    {
      id: '3d-cosmos',
      name: '3D Cosmos',
      symbol: '◍',
      c1: '#8a63d2',
      c2: '#573a99',
      tooltip: 'Sculpture in space',
      isActive: activeView === 'cosmos',
      onClick: () => {
        onSelectView('cosmos');
      }
    },
    {
      id: 'bard-symphony',
      name: 'Bard Symphony',
      symbol: '❖',
      c1: '#e07aa0',
      c2: '#a84470',
      tooltip: 'Poetry set to sound',
      isActive: false,
      onClick: () => {
        if (onOpenBardModal) onOpenBardModal();
      }
    },
    {
      id: '3d-vault',
      name: '3D Vault',
      symbol: '⬡',
      c1: '#a0693f',
      c2: '#6b4125',
      tooltip: 'Rendered pieces & trophy vault',
      isActive: false,
      onClick: () => {
        if (onOpenCollectorVault) onOpenCollectorVault();
      }
    },
    {
      id: 'saved-vault',
      name: 'Saved vault',
      symbol: '⚑',
      c1: '#3a4a9a',
      c2: '#222d6e',
      tooltip: 'Bookmarked works',
      isActive: activeView === 'saved',
      onClick: () => {
        onSelectView('saved');
      }
    },
    {
      id: 'recycle-bin',
      name: 'Recycle bin',
      symbol: '⌫',
      c1: '#9aa0aa',
      c2: '#5d636d',
      tooltip: 'Restore deleted works',
      isActive: activeView === 'recycle-bin',
      onClick: () => {
        onSelectView('recycle-bin');
      }
    }
  ];

  // Secondary sub-categories for fine-grained feed filtering
  const subCategories: { id: ArtCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Media', icon: <Layers className="w-3 h-3" /> },
    { id: 'digital', label: 'Digital Media', icon: <ImageIcon className="w-3 h-3 text-[#8ed8b5]" /> },
    { id: 'video', label: 'Motion Loops', icon: <Film className="w-3 h-3 text-[#f0a8d0]" /> },
    { id: 'music', label: 'Original Music', icon: <Disc3 className="w-3 h-3 text-[#c9a875]" /> },
    { id: 'painting', label: 'Paintings', icon: <Palette className="w-3 h-3 text-[#e8b482]" /> },
    { id: 'drawing', label: 'Drawings & Ink', icon: <PenTool className="w-3 h-3 text-[#b9c6ea]" /> },
    { id: 'poetry', label: 'Poetry Cards', icon: <Feather className="w-3 h-3 text-[#e0c49a]" /> },
  ];

  return (
    <>
      <style>{`
        /* Concept 3 UI Styles */
        :root {
          --c3-bg: #0a0b13;
          --c3-ink: #eceefa;
          --c3-mute: #8b90b0;
          --c3-acc: #8aa4ff;
          --c3-line: rgba(160, 175, 255, 0.16);
          --c3-serif: 'Cormorant Garamond', Georgia, serif;
          --c3-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
          --c3-e: cubic-bezier(.2,.8,.2,1);
        }

        .c3-top {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px clamp(16px, 4vw, 48px) 24px;
          background: linear-gradient(180deg, rgba(10, 11, 19, 0.95) 0%, rgba(10, 11, 19, 0.8) 60%, transparent 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(160, 175, 255, 0.08);
        }

        .c3-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }
        .c3-brand-text b {
          display: block;
          font-family: var(--c3-serif);
          font-size: clamp(22px, 2.2vw, 27px);
          font-weight: 600;
          line-height: 1;
          color: #ffffff;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .c3-brand-text small {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--c3-mute);
          font-family: var(--c3-sans);
          white-space: nowrap;
        }

        .c3-sch {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 46px;
          padding: 0 18px;
          border-radius: 99px;
          border: 1px solid var(--c3-line);
          background: rgba(236, 238, 250, 0.05);
          color: var(--c3-mute);
          width: min(340px, 34vw);
          transition: 0.45s var(--c3-e);
        }
        .c3-sch:focus-within {
          border-color: var(--c3-acc);
          background: rgba(236, 238, 250, 0.08);
          width: min(440px, 48vw);
          box-shadow: 0 0 25px rgba(138, 164, 255, 0.25);
        }
        .c3-sch input {
          all: unset;
          flex: 1;
          min-width: 0;
          color: var(--c3-ink);
          font-size: 13.5px;
          font-family: var(--c3-sans);
        }

        .c3-me {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 16px 4px 4px;
          border-radius: 99px;
          border: 1px solid var(--c3-line);
          background: rgba(236, 238, 250, 0.04);
          transition: all 0.3s var(--c3-e);
          cursor: pointer;
        }
        .c3-me:hover {
          border-color: var(--c3-acc);
          background: rgba(138, 164, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(138, 164, 255, 0.2);
        }
        .c3-me b {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
        }
        .c3-me small {
          display: block;
          font-size: 11px;
          color: var(--c3-mute);
          font-family: var(--c3-sans);
        }
        .c3-av {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: conic-gradient(from 200deg, var(--c3-acc), #3a2a22, var(--c3-acc));
          display: grid;
          place-items: center;
          font-family: var(--c3-serif);
          font-size: 15px;
          font-weight: 600;
          font-style: normal;
          color: #120d0a;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* ─────────────────────────────────────────────────────────────
           BOTTOM FLOATING MAGNIFYING DOCK (Ultra-smooth 120fps physics)
           Fixed-coordinate slots + GPU scale/lift transform
           ───────────────────────────────────────────────────────────── */
        .c3-dock {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: calc(18px + env(safe-area-inset-bottom, 0px));
          z-index: 50;
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 10px 14px 12px;
          height: 80px;
          border-radius: 26px;
          background: rgba(10, 11, 19, 0.85);
          border: 1px solid var(--c3-line);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.14);
          max-width: calc(100vw - 20px);
          user-select: none;
          overflow: visible;
        }

        /* Fixed-width slot guarantees zero layout shifting during hover */
        .dock-slot {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          flex-shrink: 0;
        }

        .dock-icon-item {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 23%;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: inset 0 3px 6px rgba(255, 255, 255, 0.32), inset 0 -6px 10px rgba(0, 0, 0, 0.28), 0 8px 16px rgba(0, 0, 0, 0.4);
          transform-origin: bottom center;
          transform: scale(var(--s, 1)) translateY(var(--ty, 0px));
          z-index: var(--z, 1);
          will-change: transform;
          cursor: pointer;
        }

        /* Active mouse tracking: 0-lag instantaneous 120fps interpolation */
        .dock-icon-item.is-tracking {
          transition: transform 0.04s linear, filter 0.15s ease;
        }

        /* Exit: silky smooth spring return to rest */
        .dock-icon-item.is-idle {
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.15s ease;
        }

        .dock-icon-item:hover {
          filter: brightness(1.15);
        }

        /* Tooltip */
        .dock-icon-item::after {
          content: attr(data-n);
          position: absolute;
          bottom: calc(100% + 14px);
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          font-family: var(--c3-sans);
          font-size: 11.5px;
          font-weight: 600;
          background: var(--c3-ink);
          color: var(--c3-bg);
          padding: 4px 11px;
          border-radius: 99px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease-out;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
          letter-spacing: 0.02em;
        }
        .dock-icon-item:hover::after {
          opacity: 1;
        }

        .dock-active-dot {
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px #ffffff, 0 0 16px var(--c3-acc);
        }

        .c3-dsep {
          width: 1px;
          height: 44px;
          background: var(--c3-line);
          align-self: center;
          margin: 0 4px;
          flex-shrink: 0;
        }

        .c3-upload-btn {
          background: linear-gradient(145deg, #f4ece6, #b9aca4);
          color: #111111;
          font-weight: bold;
        }

        @media (max-width: 900px) {
          .c3-sch { display: none; }
          .c3-me span { display: none; }
          .c3-dock {
            overflow-x: auto;
            gap: 6px;
            padding: 8px 10px;
            height: 72px;
            max-width: calc(100vw - 16px);
            scrollbar-width: none;
          }
          .c3-dock::-webkit-scrollbar { display: none; }
          .dock-slot {
            width: 38px;
            height: 38px;
          }
          .dock-icon-item {
            width: 38px;
            height: 38px;
            font-size: 16px;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER BAR (Concept 3 Layout)
          Brand Logo (Left) | Search The Vault (Center) | Audio + Profile (Right)
         ───────────────────────────────────────────────────────────── */}
      <header className="c3-top">
        {/* Left: Brand Identity preserving exact quill logo & founder branding */}
        <div
          id="c3-brand-btn"
          onClick={() => {
            onSelectView('feed');
            onSelectCategory('all');
            onSearchChange('');
          }}
          className="c3-brand group"
          title="The Artisan's Quill — Atelier & Gallery Vault"
        >
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-[#c9a875]/40 group-hover:border-[#c9a875] group-hover:shadow-[0_0_20px_rgba(201,168,117,0.35)] transition-all shrink-0">
            <Feather className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a875] group-hover:text-white transition-colors" />
          </div>
          <div className="c3-brand-text">
            <b>The Artisan’s Quill</b>
            <small>Atelier &amp; Gallery Vault</small>
          </div>
        </div>

        {/* Center: Search Capsule ("Search the vault") */}
        <div className="flex-1 flex justify-center">
          <label className="c3-sch relative">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-[#8b90b0]"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              id="c3-search-input"
              type="text"
              placeholder="Search the vault"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeView !== 'feed' && activeView !== 'saved') {
                  onSelectView('feed');
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Right Action Suite: Audio Player + Profile Pill (.me) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Ambient Soundscape Player */}
          <div className="relative">
            <AudioAmbiencePlayer />
          </div>

          {/* Guest Sign-In Button (if in guest mode) */}
          {isGuest && onOpenLoginModal && (
            <button
              onClick={onOpenLoginModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#8aa4ff]/40 bg-[#8aa4ff]/10 hover:bg-[#8aa4ff]/25 text-[#eceefa] rounded-full transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Profile Capsule (.me) matching Concept 3 */}
          <div className="relative" ref={profileMenuRef}>
            <button
              id="c3-profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="c3-me"
              title="Atelier Profile & Settings"
            >
              {currentUser.avatar ? (
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#8aa4ff]/40"
                  textSize="text-[11px] font-bold"
                />
              ) : (
                <i className="c3-av">{currentUser.name ? currentUser.name[0].toUpperCase() : 'A'}</i>
              )}
              <span>
                <b>{currentUser.name || 'Afshaan Shaikh'}</b>
                <small>{currentUser.handle || '@afshaanshaikh'}</small>
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8b90b0] transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#0a0d16]/98 border border-[#8aa4ff]/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-[#8b90b0] font-mono">{currentUser.handle}</p>
                </div>

                {!isGuest && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSelectCurrentUser();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <User className="w-3.5 h-3.5 text-[#8aa4ff]" />
                    <span>View Public Profile</span>
                  </button>
                )}

                {onOpenEditProfile && !isGuest && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenEditProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#c9a875]" />
                    <span>Edit Profile Settings</span>
                  </button>
                )}

                {onOpenCollectorVault && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenCollectorVault();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e0a53a]" />
                    <span>Collector 3D Vault</span>
                  </button>
                )}

                {onOpenInkStudio && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenInkStudio();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <Feather className="w-3.5 h-3.5 text-[#dfbd87]" />
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
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8aa4ff] hover:bg-[#8aa4ff]/15 rounded-xl transition-all cursor-pointer text-left mt-1 border-t border-white/5"
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

      {/* ─────────────────────────────────────────────────────────────
          2. CURATORIAL CATEGORY SUB-RIBBON (When in Feed View)
          Allows quick filtering across Paintings, Poems, Digital, Music, etc.
         ───────────────────────────────────────────────────────────── */}
      {activeView === 'feed' && (
        <nav
          aria-label="Atelier Mediums"
          className="fixed top-[74px] sm:top-[78px] left-0 right-0 z-30 flex justify-center px-4 py-2 pointer-events-none"
        >
          <div className="flex items-center gap-1.5 p-1 bg-[#0a0b13]/85 backdrop-blur-xl border border-white/10 rounded-full shadow-lg pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
            {subCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#8aa4ff]/20 border border-[#8aa4ff]/60 text-white font-semibold shadow-[0_0_12px_rgba(138,164,255,0.3)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. BOTTOM FLOATING MAGNIFYING DOCK (Concept 3)
          Ultra-smooth 120fps physics with zero layout thrash!
          9 Sections + Separator + Upload (+ button)
         ───────────────────────────────────────────────────────────── */}
      <div
        id="dock"
        ref={dockRef}
        className="c3-dock"
        onPointerMove={handlePointerMove}
        onMouseMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onMouseLeave={handlePointerLeave}
        role="navigation"
        aria-label="Magnifying Vault Dock"
      >
        {dockItems.map((item) => (
          <div key={item.id} className="dock-slot">
            <button
              id={`dock-item-${item.id}`}
              type="button"
              className={`dock-icon-item ${isHovering ? 'is-tracking' : 'is-idle'}`}
              data-n={item.name}
              title={item.tooltip}
              onClick={item.onClick}
              style={{
                background: `linear-gradient(145deg, ${item.c1}, ${item.c2})`
              }}
            >
              <span>{item.symbol}</span>
              {item.isActive && <span className="dock-active-dot" />}
            </button>
          </div>
        ))}

        {/* Separator Line */}
        <i className="c3-dsep" />

        {/* Upload Button (+) with Format Popover */}
        <div className="dock-slot relative" ref={uploadMenuRef}>
          <button
            id="dock-upload-btn"
            type="button"
            className={`dock-icon-item c3-upload-btn ${isHovering ? 'is-tracking' : 'is-idle'}`}
            data-n="Upload"
            title="Upload Artwork or Poem (+)"
            onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
          >
            <span>+</span>
          </button>

          {/* Atelier Upload Formats Dropdown */}
          {isUploadMenuOpen && (
            <div className="absolute bottom-[calc(100%+16px)] right-0 w-56 p-2 bg-[#0c0e17]/98 border border-[#8aa4ff]/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-1.5 text-[9px] uppercase font-mono text-[#8aa4ff] tracking-widest border-b border-white/10 mb-1">
                Atelier Upload Formats
              </div>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('music', 'original song');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-[#c9a875]" />
                <span>Original Song</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('poetry', 'poetry card');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
                <span>Poetry Card</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('digital', 'digital art');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />
                <span>Digital Art</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('video', 'motion loops');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#8aa4ff]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-[#b9c6ea]" />
                <span>Motion Loops</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
