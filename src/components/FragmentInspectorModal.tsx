import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sun,
  Eye,
  Sparkles,
  Move,
  Grid
} from 'lucide-react';
import { Artwork } from '../types';

interface FragmentInspectorModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  onClose: () => void;
}

export const FragmentInspectorModal: React.FC<FragmentInspectorModalProps> = ({
  isOpen,
  artwork,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1 to 4
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lighting, setLighting] = useState<'obsidian' | 'spotlight' | 'museum'>('obsidian');
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolveImage = (art: Artwork | null): string => {
    if (!art) return '/curatorial-masterpiece.svg';
    if (art.mediaUrl && art.mediaUrl.trim() !== '') return art.mediaUrl;
    if (art.thumbnailUrl && art.thumbnailUrl.trim() !== '') return art.thumbnailUrl;
    if (art.id === 'spotlight-masterpiece-1' || art.category === 'digital') return '/curatorial-masterpiece.svg';
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
  };

  const [activeImageSrc, setActiveImageSrc] = useState<string>(() => resolveImage(artwork));

  useEffect(() => {
    if (isOpen && artwork) {
      setZoomLevel(2);
      setPosition({ x: 0, y: 0 });
      setActiveImageSrc(resolveImage(artwork));
    }
  }, [isOpen, artwork]);

  // Keyboard navigation & zoom controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))));
      } else if (e.key === '-' || e.key === '_') {
        setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))));
      } else if (e.key === '0') {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !artwork) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getBackgroundClass = () => {
    switch (lighting) {
      case 'spotlight':
        return 'bg-[radial-gradient(circle_at_center,_#2a2012_0%,_#0e0c08_50%,_#050608_100%)]';
      case 'museum':
        return 'bg-[#181a20]';
      case 'obsidian':
      default:
        return 'bg-[#050608]';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[80] flex flex-col ${getBackgroundClass()} text-white select-none transition-colors duration-500 overflow-hidden animate-in fade-in duration-200`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Control Bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-black/85 backdrop-blur-2xl z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a875] font-mono-code font-bold">
                High-Resolution Fragment Inspector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#dfbd87] text-[9px] font-mono-code">
                {Math.round(zoomLevel * 100)}% Magnification
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-serif-display font-medium text-white truncate max-w-md">
              {artwork.title} — <span className="text-neutral-400 font-sans font-light">{artwork.artist.name}</span>
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Lighting Mode */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-900 border border-white/15 px-2.5 py-1 rounded-full text-xs">
            <span className="text-[10px] uppercase font-mono-code text-neutral-400 mr-1 flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#c9a875]" /> Light:
            </span>
            <button
              onClick={() => setLighting('obsidian')}
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold transition-all ${
                lighting === 'obsidian' ? 'bg-[#c9a875] text-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setLighting('spotlight')}
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold transition-all ${
                lighting === 'spotlight' ? 'bg-[#c9a875] text-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Spot
            </button>
            <button
              onClick={() => setLighting('museum')}
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold transition-all ${
                lighting === 'museum' ? 'bg-[#c9a875] text-black' : 'text-neutral-300 hover:text-white'
              }`}
            >
              Neutral
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showGrid
                ? 'bg-[#c9a875] text-black border-[#dfbd87]'
                : 'bg-neutral-900 border-white/15 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Composition Grid Overlay"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#c9a875]/20 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-[#c9a875]/60 transition-all cursor-pointer"
            title="Close Fragment Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className={`flex-1 relative flex items-center justify-center overflow-hidden ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Subtle Grid Overlay if active */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-20 grid grid-cols-3 grid-rows-3 border border-[#c9a875]/30">
            <div className="border-r border-b border-[#c9a875]/20" />
            <div className="border-r border-b border-[#c9a875]/20" />
            <div className="border-b border-[#c9a875]/20" />
            <div className="border-r border-b border-[#c9a875]/20" />
            <div className="border-r border-b border-[#c9a875]/20" />
            <div className="border-b border-[#c9a875]/20" />
            <div className="border-r border-[#c9a875]/20" />
            <div className="border-r border-[#c9a875]/20" />
            <div />
          </div>
        )}

        {/* High Resolution Image Subject */}
        <div
          className="transition-transform duration-100 ease-out origin-center flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`
          }}
        >
          <img
            key={`${artwork.id}-${activeImageSrc}`}
            src={activeImageSrc}
            alt={artwork.title}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => {
              if (activeImageSrc !== artwork.thumbnailUrl && artwork.thumbnailUrl) {
                setActiveImageSrc(artwork.thumbnailUrl);
              } else if (activeImageSrc !== '/curatorial-masterpiece.svg') {
                setActiveImageSrc('/curatorial-masterpiece.svg');
              }
            }}
            className="max-h-[80vh] max-w-[85vw] object-contain shadow-2xl rounded-sm pointer-events-none"
          />
        </div>

        {/* Drag Helper Notice */}
        {zoomLevel > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#c9a875]/40 text-[#dfbd87] text-[10px] uppercase font-mono-code flex items-center gap-2 pointer-events-none shadow-lg z-20">
            <Move className="w-3 h-3 text-[#c9a875] animate-pulse" />
            <span>Click & Drag to Pan Canvas</span>
          </div>
        )}
      </div>

      {/* Floating Bottom Zoom Dock */}
      <div className="p-4 bg-black/90 border-t border-white/10 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-4 z-30">
        
        {/* Artwork Info Capsule */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono-code text-neutral-400">
          <span>{artwork.medium}</span>
          <span className="text-[#c9a875]">•</span>
          <span>{artwork.dimensions || 'Museum Scale'}</span>
          <span className="text-[#c9a875]">•</span>
          <span className="text-white font-bold">{artwork.year || 2026}</span>
        </div>

        {/* Zoom Controls Suite */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          
          <button
            onClick={() => setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
            disabled={zoomLevel <= 1}
            className="p-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-white/15 p-1 rounded-xl">
            {[
              { level: 1, label: '1x (Fit)' },
              { level: 2, label: '2x (Brushwork)' },
              { level: 3, label: '3x (Pigment)' },
              { level: 4, label: '4x (Micro)' }
            ].map((preset) => (
              <button
                key={preset.level}
                onClick={() => setZoomLevel(preset.level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase transition-all cursor-pointer ${
                  zoomLevel === preset.level
                    ? 'bg-[#c9a875] text-black shadow-[0_0_12px_rgba(201,168,117,0.5)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setZoomLevel((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))))}
            disabled={zoomLevel >= 4}
            className="p-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset View Button */}
          <button
            onClick={resetView}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 hover:border-[#c9a875] text-xs font-mono-code text-[#dfbd87] hover:text-white transition-all cursor-pointer"
            title="Reset Pan & Zoom (0)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#c9a875]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono-code text-neutral-500">
          <span>Shortcuts:</span>
          <span className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-neutral-300">+ / - Zoom</span>
          <span className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-neutral-300">0 Reset</span>
          <span className="px-1.5 py-0.5 bg-neutral-900 border border-white/10 rounded text-neutral-300">Esc Close</span>
        </div>
      </div>
    </div>
  );
};
