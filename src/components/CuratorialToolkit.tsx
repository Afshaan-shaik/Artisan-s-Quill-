import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench,
  Palette,
  Eye,
  Maximize2,
  Award,
  Sparkles,
  Share2,
  FolderPlus,
  ChevronDown,
  Download,
  Smartphone,
  Layers
} from 'lucide-react';
import { Artwork } from '../types';

interface CuratorialToolkitProps {
  artwork: Artwork;
  onOpenColorStudio?: (artwork: Artwork) => void;
  onOpenWallView?: (artwork: Artwork) => void;
  onOpenFragmentInspector?: (artwork: Artwork) => void;
  onOpenCertificate?: (artwork: Artwork) => void;
  onOpenStoryExporter?: (artwork: Artwork) => void;
  onOpenMoodboard?: (artwork: Artwork) => void;
  onShare?: (artwork: Artwork) => void;
}

export const CuratorialToolkit: React.FC<CuratorialToolkitProps> = ({
  artwork,
  onOpenColorStudio,
  onOpenWallView,
  onOpenFragmentInspector,
  onOpenCertificate,
  onOpenStoryExporter,
  onOpenMoodboard,
  onShare
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const tools = [
    {
      id: 'color-studio',
      name: 'Color Studio',
      subtitle: 'Pigment analysis & CSS tokens',
      icon: <Palette className="w-4 h-4 text-[#e8c690]" />,
      action: () => onOpenColorStudio && onOpenColorStudio(artwork),
      available: !!onOpenColorStudio
    },
    {
      id: 'wall-view',
      name: 'Museum Wall View',
      subtitle: '3D frame & matboard salon',
      icon: <Eye className="w-4 h-4 text-[#c9a875]" />,
      action: () => onOpenWallView && onOpenWallView(artwork),
      available: !!onOpenWallView
    },
    {
      id: 'fragment-inspector',
      name: 'Fragment Inspector',
      subtitle: 'Deep zoom & texture panning',
      icon: <Maximize2 className="w-4 h-4 text-[#dfbd87]" />,
      action: () => onOpenFragmentInspector && onOpenFragmentInspector(artwork),
      available: !!onOpenFragmentInspector && artwork.category !== 'poetry'
    },
    {
      id: 'story-exporter',
      name: 'Story & Card Exporter',
      subtitle: '9:16 Story & 1:1 Post graphics',
      icon: <Smartphone className="w-4 h-4 text-[#e8be78]" />,
      action: () => onOpenStoryExporter && onOpenStoryExporter(artwork),
      available: !!onOpenStoryExporter
    },
    {
      id: 'certificate',
      name: 'Provenance Certificate',
      subtitle: 'Verified archival authenticity',
      icon: <Award className="w-4 h-4 text-[#f5d8a0]" />,
      action: () => onOpenCertificate && onOpenCertificate(artwork),
      available: !!onOpenCertificate
    },
    {
      id: 'moodboard',
      name: 'Curator Pin',
      subtitle: 'Save to atelier collection',
      icon: <FolderPlus className="w-4 h-4 text-[#dfbd87]" />,
      action: () => onOpenMoodboard && onOpenMoodboard(artwork),
      available: !!onOpenMoodboard
    },
    {
      id: 'share',
      name: 'Share Masterpiece',
      subtitle: 'Copy high-res permalink',
      icon: <Share2 className="w-4 h-4 text-[#c9a875]" />,
      action: () => onShare && onShare(artwork),
      available: !!onShare
    }
  ].filter((t) => t.available);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Floating Ribbon Trigger Button */}
      <button
        id="curatorial-toolkit-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(201,168,117,0.15)] group ${
          isOpen
            ? 'bg-[#c9a875] text-black border-[#dfbd87] shadow-[0_0_25px_rgba(201,168,117,0.4)] scale-105'
            : 'bg-black/80 hover:bg-black/95 border-[#c9a875]/40 hover:border-[#dfbd87] text-[#e8c690]'
        }`}
        title="Open Curatorial Toolkit"
      >
        <Wrench className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90 text-black' : 'text-[#c9a875] group-hover:rotate-45'}`} />
        <span className="font-serif-display font-bold text-xs uppercase tracking-wider hidden sm:inline">
          Curatorial Toolkit
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : 'text-[#c9a875]'}`} />
      </button>

      {/* Expanded Dropdown Chamber */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0b0e14]/98 border border-[#c9a875]/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(201,168,117,0.2)] backdrop-blur-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 divide-y divide-white/10">
          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#c9a875]" />
              <span className="text-[10px] uppercase font-mono-code font-bold tracking-widest text-[#dfbd87]">
                Masterpiece Studio Suite
              </span>
            </div>
            <span className="text-[9px] font-mono-code text-neutral-500">
              {tools.length} Tools
            </span>
          </div>

          {/* Tools Grid */}
          <div className="py-2 space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setIsOpen(false);
                  tool.action();
                }}
                className="w-full p-2.5 rounded-xl hover:bg-[#c9a875]/15 border border-transparent hover:border-[#c9a875]/40 transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#c9a875]/20 border border-white/10 group-hover:border-[#c9a875]/50 transition-colors shrink-0">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-serif-display font-medium text-white group-hover:text-[#dfbd87] transition-colors truncate">
                    {tool.name}
                  </div>
                  <div className="text-[10px] font-mono-code text-neutral-400 truncate">
                    {tool.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer Note */}
          <div className="px-3 pt-2 text-[9px] font-mono-code text-neutral-500 flex items-center justify-between">
            <span>The Artisan's Quill Suite</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
