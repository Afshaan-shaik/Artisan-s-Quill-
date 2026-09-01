import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Maximize2,
  Sun,
  Palette,
  Sliders,
  Layers,
  Check,
  Eye,
  Download,
  Share2,
  User,
  Square,
  Sparkle
} from 'lucide-react';
import { Artwork, WallFrameStyle, WallColorPreset } from '../types';
import confetti from 'canvas-confetti';

interface GalleryWallModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  onClose: () => void;
}

type MatboardStyle = 'none' | 'single-white' | 'double-gold' | 'deckle-float';

export const GalleryWallModal: React.FC<GalleryWallModalProps> = ({
  isOpen,
  artwork,
  onClose
}) => {
  const [frameStyle, setFrameStyle] = useState<WallFrameStyle>('gilded');
  const [wallColor, setWallColor] = useState<WallColorPreset>('obsidian');
  const [shadowDepth, setShadowDepth] = useState<number>(65); // 0 to 100
  const [lightingAngle, setLightingAngle] = useState<number>(45); // 0 to 90 degrees
  const [matboard, setMatboard] = useState<MatboardStyle>('double-gold');
  const [showHumanScale, setShowHumanScale] = useState<boolean>(true);
  const [scaleRatio, setScaleRatio] = useState<number>(100); // 70% to 130%

  if (!isOpen || !artwork) return null;

  const WALL_COLORS: Record<WallColorPreset, { name: string; hex: string; bgClass: string; textClass: string; isLight: boolean }> = {
    obsidian: {
      name: 'Museum Obsidian',
      hex: '#08090d',
      bgClass: 'bg-[#08090d]',
      textClass: 'text-neutral-200',
      isLight: false
    },
    alabaster: {
      name: 'Gallery Alabaster',
      hex: '#e8e4dc',
      bgClass: 'bg-[#e8e4dc]',
      textClass: 'text-neutral-900',
      isLight: true
    },
    taupe: {
      name: 'Warm Taupe',
      hex: '#231e1a',
      bgClass: 'bg-[#231e1a]',
      textClass: 'text-stone-200',
      isLight: false
    },
    sage: {
      name: 'Muted Sage',
      hex: '#18241d',
      bgClass: 'bg-[#18241d]',
      textClass: 'text-emerald-100',
      isLight: false
    },
    slate: {
      name: 'Midnight Slate',
      hex: '#121824',
      bgClass: 'bg-[#121824]',
      textClass: 'text-blue-100',
      isLight: false
    }
  };

  const FRAME_MATERIALS: Record<WallFrameStyle, { name: string; subtitle: string; frameClass: string }> = {
    gilded: {
      name: '19th Century Antique Gilded Gold',
      subtitle: 'Filigree border accents & metallic specular highlight',
      frameClass: 'p-6 sm:p-8 bg-gradient-to-r from-[#d4af37] via-[#f9e8b7] via-[#b8860b] to-[#d4af37] ring-8 ring-[#4a340e] border-2 border-[#fff3d4] shadow-[0_0_40px_rgba(212,175,55,0.4)]'
    },
    walnut: {
      name: 'Raw Italian Walnut Wood',
      subtitle: 'Warm natural matte grain & dark bevel',
      frameClass: 'p-5 sm:p-7 bg-gradient-to-br from-[#3b2a1a] via-[#24170d] to-[#3b2a1a] ring-6 ring-[#150d06] border border-[#5a422d]'
    },
    obsidian: {
      name: 'Minimalist Matte Obsidian Steel',
      subtitle: 'Ultra-thin dark architectural bezel',
      frameClass: 'p-3 sm:p-4 bg-[#0d0f14] ring-2 ring-[#1f212b] border border-white/15'
    },
    'floating-glass': {
      name: 'Floating Deckle-Edge Glass',
      subtitle: 'Frameless acrylic/glass spacer with soft refraction',
      frameClass: 'p-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xs'
    }
  };

  const getMatboardClass = () => {
    switch (matboard) {
      case 'single-white':
        return 'p-6 sm:p-8 bg-[#fdfcf7] shadow-inner border border-neutral-300';
      case 'double-gold':
        return 'p-6 sm:p-8 bg-[#f8f5ee] shadow-inner border-2 border-[#c9a875] ring-2 ring-[#a38048]/40';
      case 'deckle-float':
        return 'p-8 sm:p-10 bg-[#f4ede2] shadow-[0_15px_30px_rgba(0,0,0,0.3)] border border-[#e0d6c5]';
      case 'none':
      default:
        return 'p-0';
    }
  };

  const activeWall = WALL_COLORS[wallColor];
  const activeFrame = FRAME_MATERIALS[frameStyle];

  const shadowX = Math.cos((lightingAngle * Math.PI) / 180) * (shadowDepth * 0.45);
  const shadowY = Math.sin((lightingAngle * Math.PI) / 180) * (shadowDepth * 0.7);
  const shadowBlur = shadowDepth * 0.9;
  const shadowSpread = shadowDepth * 0.15;
  const computedDropShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px ${shadowSpread.toFixed(1)}px rgba(0,0,0,${(shadowDepth / 100 * 0.85).toFixed(2)})`;

  const isPoetry = artwork.category === 'poetry';

  const displayImage = artwork.mediaUrl || artwork.thumbnailUrl || (artwork.id === 'spotlight-masterpiece-1' || artwork.category === 'digital' ? '/curatorial-masterpiece.svg' : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-7xl h-full max-h-[94vh] bg-[#050608] border border-[#c9a875]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header Controls */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#07080c]/95 flex items-center justify-between gap-4 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a875] font-mono-code font-bold">
                  Interactive Museum Wall & Frame Simulator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#dfbd87] text-[9px] font-mono-code">
                  3D Directional Lighting
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif-display font-medium text-white tracking-wide uppercase">
                {artwork.title} • By {artwork.artist.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                confetti({
                  particleCount: 30,
                  spread: 60,
                  origin: { y: 0.5 },
                  colors: ['#c9a875', '#ffffff', '#dfbd87']
                });
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#c9a875]/20 hover:bg-[#c9a875]/30 border border-[#c9a875]/50 text-[#dfbd87] text-xs font-mono-code transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acquisition View</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white hover:border-[#c9a875] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Main 3D Salon Wall Viewport */}
          <div
            className={`lg:col-span-8 xl:col-span-9 p-6 sm:p-12 md:p-16 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-700 ${activeWall.bgClass}`}
          >
            {/* Gallery Track Lighting Bloom */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 pointer-events-none transition-all duration-700 opacity-60"
              style={{
                background: `radial-gradient(ellipse at top, rgba(255,240,200,${(shadowDepth / 100 * 0.35).toFixed(2)}) 0%, transparent 70%)`
              }}
            />

            {/* Simulated Wood Flooring at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent border-t border-white/5 pointer-events-none" />

            {/* Framed Artwork Presentation */}
            <div
              className="relative z-10 flex flex-col items-center transition-all duration-300"
              style={{
                transform: `scale(${scaleRatio / 100})`
              }}
            >
              {/* The Frame Outer Shell */}
              <div
                className={`relative transition-all duration-500 rounded-sm ${activeFrame.frameClass}`}
                style={{
                  boxShadow: computedDropShadow
                }}
              >
                {/* Matboard Inner Layer */}
                <div className={`transition-all duration-500 rounded-xs ${getMatboardClass()}`}>
                  {isPoetry && artwork.poetryContent ? (
                    /* Framed Poetry Card */
                    <div className="p-8 sm:p-12 bg-[#0c0e14] border border-[#c9a875]/30 rounded-xs shadow-inner max-w-md text-center space-y-4">
                      <span className="text-[10px] uppercase font-mono-code tracking-widest text-[#c9a875]">
                        Poetry Salon Masterpiece
                      </span>
                      <h3 className="text-xl font-serif-display font-bold text-white uppercase">
                        {artwork.title}
                      </h3>
                      <div className="space-y-3 font-serif italic text-sm sm:text-base text-neutral-300 leading-relaxed max-h-48 overflow-y-auto">
                        {artwork.poetryContent.stanzas.slice(0, 2).map((st, sI) => (
                          <p key={sI}>{st}</p>
                        ))}
                      </div>
                      <div className="text-xs text-[#dfbd87] font-mono-code font-bold pt-2">
                        {artwork.poetryContent.authorSignature || `— ${artwork.artist.name}`}
                      </div>
                    </div>
                  ) : artwork.category === 'video' ? (
                    <video
                      src={artwork.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-[48vh] object-contain shadow-md rounded-xs"
                    />
                  ) : (
                    <img
                      src={displayImage}
                      alt={artwork.title}
                      className="max-h-[50vh] w-auto object-contain shadow-2xl rounded-xs"
                    />
                  )}
                </div>
              </div>

              {/* Museum Brass Plaque */}
              <div className="mt-6 px-5 py-2.5 bg-gradient-to-r from-[#292215] via-[#1d1911] to-[#292215] border border-[#c9a875]/70 rounded-md shadow-2xl flex flex-col items-center text-center">
                <span className="font-serif-display text-xs sm:text-sm font-bold text-[#f7e4c6] uppercase tracking-wider">
                  {artwork.title}
                </span>
                <span className="text-[10px] uppercase font-mono-code text-[#c9a875] tracking-widest mt-0.5">
                  {artwork.artist.name} ({artwork.year || 2026}) • {artwork.medium || 'Master Collection'}
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-mono-code mt-0.5">
                  The Artisan's Quill Permanent Salon Collection
                </span>
              </div>
            </div>

            {/* Human Scale Silhouette Reference */}
            {showHumanScale && (
              <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex flex-col items-center opacity-45 pointer-events-none group-hover:opacity-75 transition-opacity">
                {/* 1.75m Human Silhouette */}
                <div className="w-12 h-36 border-2 border-dashed border-[#c9a875]/60 rounded-t-full flex flex-col items-center justify-between p-1 bg-[#c9a875]/5">
                  <div className="w-4 h-4 rounded-full bg-[#c9a875]/60" />
                  <div className="text-[8px] font-mono-code text-[#dfbd87] text-center">
                    1.75m<br />Scale
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Configuration Panel */}
          <div className="lg:col-span-4 xl:col-span-3 border-l border-white/10 bg-[#0c0f16] flex flex-col overflow-y-auto p-6 space-y-6">
            
            {/* 1. Frame Material Switcher */}
            <div className="space-y-2.5">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 1. Frame Craftsmanship:
              </label>
              <div className="space-y-2">
                {(Object.keys(FRAME_MATERIALS) as WallFrameStyle[]).map((fKey) => {
                  const frame = FRAME_MATERIALS[fKey];
                  const isSelected = frameStyle === fKey;
                  return (
                    <button
                      key={fKey}
                      onClick={() => setFrameStyle(fKey)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-[#c9a875]/20 border-[#c9a875] ring-1 ring-[#c9a875]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-xs font-serif-display font-medium text-white">{frame.name}</div>
                        <div className="text-[10px] font-mono-code text-neutral-400 mt-0.5">{frame.subtitle}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#c9a875] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Wall Paint Swatches */}
            <div className="space-y-2.5">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> 2. Wall Paint Tone:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(WALL_COLORS) as WallColorPreset[]).map((cKey) => {
                  const wall = WALL_COLORS[cKey];
                  const isSelected = wallColor === cKey;
                  return (
                    <button
                      key={cKey}
                      onClick={() => setWallColor(cKey)}
                      className={`h-10 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected ? 'ring-2 ring-[#c9a875] scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: wall.hex }}
                      title={wall.name}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#dfbd87] absolute inset-0 m-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Matboard Customizer */}
            <div className="space-y-2.5">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5" /> 3. Archival Matboard:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'double-gold', label: 'Double Gold Trim' },
                  { id: 'single-white', label: 'Single Museum White' },
                  { id: 'deckle-float', label: 'Floating Deckle Edge' },
                  { id: 'none', label: 'No Matboard (Full Frame)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMatboard(m.id as MatboardStyle)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono-code transition-all cursor-pointer ${
                      matboard === m.id
                        ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#dfbd87]'
                        : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Directional Light & Shadow Depth Sliders */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-[#c9a875]" /> Shadow Depth & Blur
                  </span>
                  <span className="text-[#dfbd87] font-bold">{shadowDepth}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={shadowDepth}
                  onChange={(e) => setShadowDepth(parseInt(e.target.value))}
                  className="w-full accent-[#c9a875] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#c9a875]" /> Scale Visualizer
                  </span>
                  <span className="text-[#dfbd87] font-bold">{scaleRatio}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  value={scaleRatio}
                  onChange={(e) => setScaleRatio(parseInt(e.target.value))}
                  className="w-full accent-[#c9a875] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono-code text-neutral-400">Human Scale Silhouette</span>
                <button
                  onClick={() => setShowHumanScale(!showHumanScale)}
                  className={`px-3 py-1 rounded-full text-xs font-mono-code transition-all ${
                    showHumanScale ? 'bg-[#c9a875] text-black font-bold' : 'bg-white/10 text-neutral-400'
                  }`}
                >
                  {showHumanScale ? 'Visible' : 'Hidden'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
