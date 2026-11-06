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
  Feather
} from 'lucide-react';
import { ArtCategory, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { AudioAmbiencePlayer } from './AudioAmbiencePlayer';

interface GallerySpineNavbarProps {
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

interface SpineItemDef {
  id: string;
  name: string;
  symbol: string;
  c1: string;
  c2: string;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

export const GallerySpineNavbar: React.FC<GallerySpineNavbarProps> = ({
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const railRef = useRef<HTMLElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  const isGuest = currentUser.id === 'guest';

  // Close menus on outside click
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

  const spineItems: SpineItemDef[] = [
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

  return (
    <>
      <style>{`
        /* Concept 2: Gallery Spine Theme & Layout Tokens */
        :root {
          --c2-bg: #0c0f10;
          --c2-ink: #e9f1ee;
          --c2-mute: #8a9d98;
          --c2-acc: #6fb7a4;
          --c2-line: rgba(150, 230, 210, 0.15);
          --c2-serif: 'Cormorant Garamond', Georgia, serif;
          --c2-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
          --c2-e: cubic-bezier(.2, .8, .2, 1);
        }

        /* ── Left Fixed Rail / Spine ── */
        .c2-rail {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 76px;
          z-index: 45;
          background: rgba(12, 15, 16, 0.94);
          border-right: 1px solid var(--c2-line);
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: hidden;
          transition: width 0.4s var(--c2-e), box-shadow 0.4s var(--c2-e);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          user-select: none;
        }
        .c2-rail:hover, .c2-rail.is-open {
          width: 280px;
          box-shadow: 20px 0 60px rgba(0, 0, 0, 0.7);
        }

        .c2-rhead {
          display: flex;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          cursor: pointer;
        }

        /* Feather circular mark */
        .c2-mk {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid var(--c2-acc);
          color: var(--c2-acc);
          display: grid;
          place-items: center;
          flex-shrink: 0;
          background: rgba(111, 183, 164, 0.06);
          transition: transform 0.25s var(--c2-e), background 0.25s;
        }
        .c2-mk:hover {
          transform: scale(1.06);
          background: rgba(111, 183, 164, 0.16);
        }

        .c2-t {
          opacity: 0;
          transition: opacity 0.22s ease-out;
          pointer-events: none;
        }
        .c2-rail:hover .c2-t, .c2-rail.is-open .c2-t {
          opacity: 1;
          pointer-events: auto;
          transition-delay: 0.1s;
        }

        .c2-brand-text b {
          display: block;
          font-family: var(--c2-serif);
          font-size: 21px;
          font-weight: 600;
          line-height: 1.1;
          color: #ffffff;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .c2-brand-text small {
          display: block;
          margin-top: 3px;
          font-size: 9.5px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--c2-mute);
          font-family: var(--c2-sans);
          white-space: nowrap;
        }

        /* Spine navigation items */
        .c2-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .c2-nav::-webkit-scrollbar { display: none; }

        .c2-nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          height: 46px;
          padding: 0 5px;
          border-radius: 14px;
          color: var(--c2-mute);
          white-space: nowrap;
          transition: background 0.25s, color 0.25s;
          cursor: pointer;
        }
        .c2-nav-link:hover {
          background: rgba(111, 183, 164, 0.1);
          color: var(--c2-ink);
        }
        .c2-nav-link.is-active {
          background: rgba(111, 183, 164, 0.18);
          color: #ffffff;
          font-weight: 600;
          border: 1px solid rgba(111, 183, 164, 0.28);
          box-shadow: 0 0 16px rgba(111, 183, 164, 0.15);
        }

        /* 36px squircle icon badge */
        .c2-gl {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #ffffff;
          font-style: normal;
          font-size: 16px;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.28), inset 0 -3px 5px rgba(0, 0, 0, 0.22), 0 4px 10px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s;
        }
        .c2-nav-link:hover .c2-gl {
          transform: scale(1.08);
        }

        /* Rail Bottom: Profile */
        .c2-rbot {
          display: flex;
          align-items: center;
          gap: 14px;
          white-space: nowrap;
          padding-top: 10px;
          border-top: 1px solid var(--c2-line);
          cursor: pointer;
        }
        .c2-av {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: conic-gradient(from 200deg, var(--c2-acc), #1e2e28, var(--c2-acc));
          display: grid;
          place-items: center;
          font-family: var(--c2-serif);
          font-size: 15px;
          font-weight: 600;
          color: #0c0f10;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        /* ── Top-Right Floating Bar (.fb) ── */
        .c2-fb {
          position: fixed;
          top: 18px;
          right: clamp(16px, 3vw, 40px);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 40;
        }

        .c2-sch {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 16px;
          border-radius: 99px;
          border: 1px solid var(--c2-line);
          background: rgba(233, 241, 238, 0.05);
          color: var(--c2-mute);
          width: min(290px, 32vw);
          transition: 0.35s var(--c2-e);
        }
        .c2-sch:focus-within {
          border-color: var(--c2-acc);
          background: rgba(233, 241, 238, 0.08);
          width: min(400px, 46vw);
          box-shadow: 0 0 22px rgba(111, 183, 164, 0.28);
        }
        .c2-sch input {
          all: unset;
          flex: 1;
          min-width: 0;
          color: var(--c2-ink);
          font-size: 13.5px;
          font-family: var(--c2-sans);
        }

        .c2-btn-up {
          height: 44px;
          padding: 0 22px;
          border-radius: 99px;
          border: 0;
          font-size: 13.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          background: var(--c2-acc);
          color: #0c0f10;
          cursor: pointer;
          transition: transform 0.2s var(--c2-e), box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(111, 183, 164, 0.35);
        }
        .c2-btn-up:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(111, 183, 164, 0.5);
        }

        @media (max-width: 768px) {
          .c2-sch { display: none; }
          .c2-rail:hover, .c2-rail.is-open { width: 76px; }
          .c2-t { display: none !important; }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          1. LEFT GALLERY SPINE / RAIL (Concept 2)
          Collapsed width: 76px | Expanded hover/open: 280px
         ───────────────────────────────────────────────────────────── */}
      <aside
        id="gallery-spine-rail"
        ref={railRef}
        className={`c2-rail ${isRailOpen ? 'is-open' : ''}`}
        aria-label="Gallery Spine Navigation"
      >
        {/* Rail Top Brand */}
        <div
          className="c2-rhead"
          onClick={() => {
            onSelectView('feed');
            onSelectCategory('all');
            onSearchChange('');
            setIsRailOpen(!isRailOpen);
          }}
          title="The Artisan's Quill — Atelier"
        >
          <div className="c2-mk" title="Toggle Sidebar">
            {/* Feather / Quill SVG mark */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 4c-8 0-13 4-14 12l-2 4 4-2c8-1 12-6 12-14z" />
              <path d="M8 16l7-7" />
            </svg>
          </div>
          <div className="c2-t c2-brand-text">
            <b>The Artisan’s Quill</b>
            <small>Atelier</small>
          </div>
        </div>

        {/* Vertical Navigation Items */}
        <nav className="c2-nav">
          {spineItems.map((item) => (
            <button
              key={item.id}
              id={`spine-item-${item.id}`}
              type="button"
              onClick={item.onClick}
              className={`c2-nav-link ${item.isActive ? 'is-active' : ''}`}
              title={item.tooltip}
            >
              <i
                className="c2-gl"
                style={{
                  background: `linear-gradient(145deg, ${item.c1}, ${item.c2})`
                }}
              >
                {item.symbol}
              </i>
              <span className="c2-t font-sans text-xs sm:text-[13px] tracking-wide">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Rail Bottom: Profile Capsule */}
        <div className="relative" ref={profileMenuRef}>
          <div
            className="c2-rbot"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title="User Profile & Studio Options"
          >
            {currentUser.avatar ? (
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#6fb7a4]/50"
                textSize="text-[11px] font-bold"
              />
            ) : (
              <i className="c2-av">{currentUser.name ? currentUser.name[0].toUpperCase() : 'A'}</i>
            )}
            <div className="c2-t flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {currentUser.name || 'Afshaan Shaikh'}
              </span>
              <span className="text-[11px] text-[#8a9d98] font-mono">
                {currentUser.handle || '@afshaanshaikh'}
              </span>
            </div>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute left-0 bottom-full mb-3 w-64 p-2 bg-[#0c0f12]/98 border border-[#6fb7a4]/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                <p className="text-[11px] text-[#8a9d98] font-mono">{currentUser.handle}</p>
              </div>

              {!isGuest && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSelectCurrentUser();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#6fb7a4]" />
                  <span>View Public Profile</span>
                </button>
              )}

              {onOpenEditProfile && !isGuest && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenEditProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6fb7a4]" />
                  <span>Edit Profile Settings</span>
                </button>
              )}

              {onOpenCollectorVault && (
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenCollectorVault();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 rounded-xl transition-all cursor-pointer text-left"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Feather className="w-3.5 h-3.5 text-[#6fb7a4]" />
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#6fb7a4] hover:bg-[#6fb7a4]/15 rounded-xl transition-all cursor-pointer text-left mt-1 border-t border-white/5"
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
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP-RIGHT FLOATING ACTION BAR (.fb)
          Search Capsule + Audio Ambience Player + Mint + Upload CTA
         ───────────────────────────────────────────────────────────── */}
      <div className="c2-fb">
        {/* Search Capsule */}
        <label className="c2-sch relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-[#8a9d98]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            id="c2-search-input"
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

        {/* Ambient Soundscape Player */}
        <div className="relative">
          <AudioAmbiencePlayer />
        </div>

        {/* + Upload CTA with Popover */}
        <div className="relative" ref={uploadMenuRef}>
          <button
            id="c2-upload-btn"
            type="button"
            className="c2-btn-up"
            onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
            title="Upload Artwork or Poem (+)"
          >
            <Plus className="w-4 h-4 text-[#0c0f10] stroke-[2.5]" />
            <span>Upload</span>
          </button>

          {/* Atelier Upload Formats Dropdown */}
          {isUploadMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#0c0f12]/98 border border-[#6fb7a4]/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 text-[9px] uppercase font-mono text-[#6fb7a4] tracking-widest border-b border-white/10 mb-1">
                Atelier Upload Formats
              </div>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('music', 'original song');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <Disc3 className="w-3.5 h-3.5 text-[#6fb7a4]" />
                <span>Original Song</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('poetry', 'poetry card');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5 text-[#e0c49a]" />
                <span>Poetry Card</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('digital', 'digital art');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#8ed8b5]" />
                <span>Digital Art</span>
              </button>
              <button
                onClick={() => {
                  setIsUploadMenuOpen(false);
                  onOpenUpload('video', 'motion loops');
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white hover:bg-[#6fb7a4]/15 flex items-center gap-2.5 rounded-xl font-mono transition-colors cursor-pointer"
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

