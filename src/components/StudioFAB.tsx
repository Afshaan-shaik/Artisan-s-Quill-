import React, { useState } from 'react';
import {
  Feather,
  Plus,
  Trash2,
  Activity,
  User,
  X,
  BookOpen,
  Layers
} from 'lucide-react';
import { ArtCategory } from '../types';

interface StudioFABProps {
  onOpenUpload: (category?: ArtCategory, format?: string) => void;
  onSelectView: (view: 'recycle-bin' | 'community' | 'vaults' | 'feed' | 'cosmos' | 'exhibitions' | 'saved' | 'about') => void;
  onOpenBackendModal: () => void;
  onOpenInkStudio: () => void;
  onOpenEditProfile: () => void;
}

interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

/**
 * StudioFAB
 * Owner-only collapsible floating action button anchored bottom-left.
 * Expands vertically to reveal studio/admin tools that are hidden from
 * the public navigation. All functionality preserved — just relocated.
 */
export const StudioFAB: React.FC<StudioFABProps> = ({
  onOpenUpload,
  onSelectView,
  onOpenBackendModal,
  onOpenInkStudio,
  onOpenEditProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions: FABAction[] = [
    {
      id: 'fab-upload-art',
      icon: <Plus className="w-4 h-4" />,
      label: 'Upload Artwork',
      onClick: () => { onOpenUpload('digital', 'digital art'); setIsOpen(false); },
      color: 'text-[#c9a875]',
    },
    {
      id: 'fab-ink-studio',
      icon: <Feather className="w-4 h-4" />,
      label: 'Ink Studio',
      onClick: () => { onOpenInkStudio(); setIsOpen(false); },
      color: 'text-[#e0c49a]',
    },
    {
      id: 'fab-poetry-upload',
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Upload Poem',
      onClick: () => { onOpenUpload('poetry', 'poetry card'); setIsOpen(false); },
      color: 'text-[#b9c6ea]',
    },
    {
      id: 'fab-recycle-bin',
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Recycle Bin',
      onClick: () => { onSelectView('recycle-bin'); setIsOpen(false); },
      color: 'text-rose-400',
    },
    {
      id: 'fab-live-sync',
      icon: (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
          <Activity className="relative w-3.5 h-3.5 text-emerald-400" />
        </span>
      ),
      label: 'Live Sync / DB',
      onClick: () => { onOpenBackendModal(); setIsOpen(false); },
      color: 'text-emerald-400',
    },
    {
      id: 'fab-edit-profile',
      icon: <User className="w-4 h-4" />,
      label: 'Edit Profile',
      onClick: () => { onOpenEditProfile(); setIsOpen(false); },
      color: 'text-neutral-300',
    },
    {
      id: 'fab-community',
      icon: <Layers className="w-4 h-4" />,
      label: 'Community Hub',
      onClick: () => { onSelectView('community'); setIsOpen(false); },
      color: 'text-neutral-300',
    },
  ];

  return (
    <div
      className="fixed bottom-6 left-6 z-[60] flex flex-col-reverse items-start gap-2"
      aria-label="Studio controls"
    >
      {/* Studio action items — stacked vertically above the toggle */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-250">
          {actions.map((action, i) => (
            <button
              key={action.id}
              id={action.id}
              onClick={action.onClick}
              className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-full bg-[#0d0f18]/95 backdrop-blur-xl border border-white/10 hover:border-[#c9a875]/30 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap group"
              style={{ animationDelay: `${i * 30}ms` }}
              title={action.label}
            >
              <span className={`${action.color} transition-colors`}>{action.icon}</span>
              <span className="text-[11px] font-mono-code uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB toggle */}
      <button
        id="studio-fab-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className={`
          group relative w-12 h-12 rounded-full flex items-center justify-center
          border transition-all duration-300 cursor-pointer
          shadow-[0_8px_24px_-4px_rgba(0,0,0,0.8)]
          ${isOpen
            ? 'bg-[#c9a875] border-[#dfbd87] rotate-45 shadow-[0_0_24px_rgba(201,168,117,0.4)]'
            : 'bg-[#0d0f18]/95 border-white/10 hover:border-[#c9a875]/50 hover:bg-[#c9a875]/10 hover:shadow-[0_0_16px_rgba(201,168,117,0.2)]'
          }
        `}
        title={isOpen ? 'Close Studio' : 'Open Studio Controls'}
        aria-expanded={isOpen}
        aria-label="Studio controls toggle"
      >
        {isOpen
          ? <X className="w-5 h-5 text-black" />
          : <Feather className={`w-5 h-5 transition-colors duration-200 ${isOpen ? 'text-black' : 'text-[#c9a875] group-hover:text-[#dfbd87]'}`} />
        }
      </button>

      {/* Studio label badge */}
      {!isOpen && (
        <span className="text-[9px] font-mono-code uppercase tracking-widest text-[#c9a875]/60 pl-1">
          Studio
        </span>
      )}
    </div>
  );
};
