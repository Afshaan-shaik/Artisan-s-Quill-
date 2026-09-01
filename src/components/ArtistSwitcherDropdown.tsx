import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Camera,
  Layers,
  User,
  UserPlus,
  LogIn,
  LogOut,
  Ghost,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';

interface ArtistSwitcherDropdownProps {
  currentUser: UserProfile;
  onOpenCreateProfile: () => void;
  onOpenLoginModal?: () => void;
  onOpenEditProfile?: () => void;
  onSelectCurrentUserProfile: () => void;
  onLogout?: () => void;
  onOpenCollectorVault?: () => void;
}

export const ArtistSwitcherDropdown: React.FC<ArtistSwitcherDropdownProps> = ({
  currentUser,
  onOpenCreateProfile,
  onOpenLoginModal,
  onOpenEditProfile,
  onSelectCurrentUserProfile,
  onLogout,
  onOpenCollectorVault
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGuest = currentUser.id === 'guest';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Persona Pill in Navbar */}
      <div className="flex items-center gap-1">
        <button
          id="artist-profile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border transition-all cursor-pointer group shadow-lg ${
            isOpen
              ? 'bg-neutral-900 border-[#c9a875] ring-2 ring-[#c9a875]/40 shadow-[0_0_22px_rgba(201,168,117,0.4)]'
              : 'bg-gradient-to-r from-neutral-950 via-[#0e1017] to-neutral-950 border-[#c9a875]/60 hover:border-[#c9a875] hover:shadow-[0_0_20px_rgba(201,168,117,0.35)]'
          }`}
          title={isGuest ? 'Guest Visitor — Sign in to access your atelier' : 'Your Private Artist Account & Settings'}
        >
          <div className="relative">
            {isGuest ? (
              // Guest avatar: ghost icon
              <div className="w-8 h-8 rounded-full border border-neutral-600 bg-neutral-800 flex items-center justify-center">
                <Ghost className="w-4 h-4 text-neutral-400" />
              </div>
            ) : (
              <>
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  className="w-8 h-8 rounded-full border border-[#c9a875] overflow-hidden shrink-0 shadow-sm"
                  textSize="text-xs font-bold"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-black rounded-full flex items-center justify-center text-[7px] font-extrabold border border-black shadow-xs">
                  ✓
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-widest text-white font-bold whitespace-nowrap group-hover:text-[#f3e3cb] transition-colors">
                {isGuest ? 'Guest' : currentUser.name}
              </span>
              {!isGuest && <ShieldCheck className="w-3 h-3 text-[#c9a875] shrink-0" />}
            </div>
            <span className="text-[9px] uppercase tracking-wider text-[#c9a875] font-mono-code -mt-0.5 whitespace-nowrap">
              {isGuest ? 'Visitor' : currentUser.handle}
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-[#c9a875] ml-0.5 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Quick trigger to view profile — hidden for guests */}
        {!isGuest && (
          <button
            onClick={onSelectCurrentUserProfile}
            className="hidden md:flex p-2 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-[#c9a875]/40 hover:border-[#c9a875] text-[#dfbd87] hover:text-white transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Open Studio Profile Details"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 rounded-2xl bg-[#090b10]/98 border border-[#c9a875]/50 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(201,168,117,0.2)] backdrop-blur-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-200 text-neutral-200">

          {/* Active User / Guest Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#17140e] via-[#100f0d] to-[#17140e] border border-[#c9a875]/40 shadow-inner mb-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c9a875] font-mono-code font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isGuest ? 'Visitor Session' : 'Active Account'}
              </span>
              <span
                className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-full border ${
                  isGuest
                    ? 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isGuest ? 'Guest' : 'Authenticated'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isGuest ? (
                <div className="w-11 h-11 rounded-full border-2 border-neutral-600 bg-neutral-800 flex items-center justify-center">
                  <Ghost className="w-5 h-5 text-neutral-400" />
                </div>
              ) : (
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.name}
                  className="w-11 h-11 rounded-full border-2 border-[#c9a875]"
                  textSize="text-sm font-bold"
                />
              )}
              <div className="min-w-0 flex-1">
                {isGuest ? (
                  <>
                    <div className="text-sm text-neutral-300 font-medium">Guest Visitor</div>
                    <div className="text-[10px] text-neutral-500 font-mono-code mt-0.5">
                      Sign in or create a profile to upload & interact
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-serif-display font-medium text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-[#c9a875] font-mono-code truncate">
                      {currentUser.handle}
                    </div>
                    <div className="text-[9px] text-neutral-400 font-sans truncate">
                      {currentUser.discipline || 'Visual Artist & Poet'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Options for authenticated users */}
          {!isGuest && (
            <div className="space-y-1 pt-1 pb-2 border-b border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSelectCurrentUserProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-[#c9a875]" />
                <span>View My Studio Profile</span>
              </button>

              {onOpenCollectorVault && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenCollectorVault();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#dfbd87] hover:text-white hover:bg-[#c9a875]/20 transition-colors text-left cursor-pointer font-medium"
                >
                  <Award className="w-4 h-4 text-[#c9a875]" />
                  <span>🏆 3D Trophy Vault & Certificates</span>
                </button>
              )}

              {onOpenEditProfile && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenEditProfile();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#c9a875]" />
                  <span>Edit Photo & Profile Details</span>
                </button>
              )}
            </div>
          )}

          {/* Sign In / Create Profile Actions */}
          <div className="pt-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateProfile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#dfbd87] hover:text-white hover:bg-[#c9a875]/20 border border-transparent hover:border-[#c9a875]/40 transition-colors text-left cursor-pointer font-mono-code"
            >
              <UserPlus className="w-4 h-4 text-[#c9a875]" />
              <span>{isGuest ? 'Create Your Artist Profile' : 'Create New ID (from Scratch)'}</span>
            </button>

            {onOpenLoginModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer font-mono-code"
              >
                <LogIn className="w-4 h-4 text-neutral-400" />
                <span>{isGuest ? 'Sign In to Your Atelier' : 'Sign In / Switch Account'}</span>
              </button>
            )}

            {/* Logout — only shown when authenticated */}
            {!isGuest && onLogout && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-white hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-colors text-left cursor-pointer font-mono-code mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Leave Atelier</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
