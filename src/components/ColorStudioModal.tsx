import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Copy,
  Sparkles,
  Sliders,
  Eye,
  Layers,
  Sun
} from 'lucide-react';
import { Artwork } from '../types';
import confetti from 'canvas-confetti';

interface ColorStudioModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  onClose: () => void;
}

export const ColorStudioModal: React.FC<ColorStudioModalProps> = ({
  isOpen,
  artwork,
  onClose
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [selectedHex, setSelectedHex] = useState<string | null>(null);

  if (!isOpen || !artwork) return null;

  const palette =
    artwork.colorPalette && artwork.colorPalette.length > 0
      ? artwork.colorPalette
      : ['#0e111a', '#c9a875', '#333b4d', '#dfbd87', '#f0f3fa'];

  const activeColor = selectedHex || palette[0];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    confetti({
      particleCount: 18,
      spread: 40,
      origin: { y: 0.7 },
      colors: [hex, '#ffffff', '#c9a875']
    });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopyAllCss = () => {
    const cssVars = palette
      .map((hex, idx) => `  --color-atelier-${idx + 1}: ${hex};`)
      .join('\n');
    const fullCss = `/* Palette for "${artwork.title}" by ${artwork.artist.name} */\n:root {\n${cssVars}\n}`;
    navigator.clipboard.writeText(fullCss);
    setCopiedHex('ALL_CSS');
    setTimeout(() => setCopiedHex(null), 2200);
  };

  // Convert hex to rgb helper
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#090b10] border border-[#c9a875]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#07080c]/95 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif-display font-medium text-white tracking-wide uppercase">
                Harmonic Color Studio & Palette
              </h2>
              <p className="text-[10px] text-[#c9a875] font-mono-code">
                {artwork.title} • {palette.length} Chromatic Tonal Values
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllCss}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-xs text-[#dfbd87] hover:text-white font-mono-code transition-all cursor-pointer"
              title="Copy All as CSS Variables"
            >
              {copiedHex === 'ALL_CSS' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHex === 'ALL_CSS' ? 'CSS Copied!' : 'Export CSS'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-900 border border-white/15 text-neutral-400 hover:text-white hover:border-[#c9a875] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          
          {/* Main Color Swatches Grid */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-mono-code text-[#c9a875] font-bold block">
              Extracted Pigments & Tonal Harmony:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              {palette.map((hex, idx) => {
                const isSelected = hex === activeColor;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedHex(hex)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col items-center gap-3 ${
                      isSelected
                        ? 'bg-[#c9a875]/20 border-[#c9a875] ring-2 ring-[#c9a875]/50 scale-105 shadow-xl'
                        : 'bg-neutral-900/80 border-white/10 hover:border-[#c9a875]/40 hover:scale-102'
                    }`}
                  >
                    <div
                      className="w-full h-20 sm:h-24 rounded-lg shadow-inner border border-white/15 relative overflow-hidden"
                      style={{ backgroundColor: hex }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(hex);
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-mono-code text-xs gap-1 font-bold"
                        title="Click to copy hex code"
                      >
                        {copiedHex === hex ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedHex === hex ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="w-full text-center space-y-0.5">
                      <span className="text-xs font-bold font-mono-code text-white block">
                        {hex.toUpperCase()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono-code block">
                        RGB({hexToRgb(hex)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Tone Breakdown & Harmony Inspector */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#0e1017] to-neutral-950 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-mono-code text-[#c9a875] font-bold flex items-center gap-2">
                <Sun className="w-4 h-4" /> Selected Pigment Focus: {activeColor.toUpperCase()}
              </span>
              <button
                onClick={() => handleCopy(activeColor)}
                className="px-3 py-1 rounded-full bg-[#c9a875]/20 hover:bg-[#c9a875] text-[#dfbd87] hover:text-black border border-[#c9a875]/60 text-[10px] uppercase font-mono-code font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3 h-3" />
                <span>Copy HEX</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-code">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">HEX Code</span>
                <span className="text-sm font-bold text-white">{activeColor.toUpperCase()}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">RGB Values</span>
                <span className="text-sm font-bold text-white">rgb({hexToRgb(activeColor)})</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mb-1">Role in Composition</span>
                <span className="text-sm font-bold text-[#dfbd87]">Primary Atelier Tonal Accent</span>
              </div>
            </div>
          </div>

          {/* Background Contrast Test Matrix */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-mono-code text-[#c9a875] font-bold block">
              Contrast Against Gallery Backdrops:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Obsidian Noir', bg: 'bg-[#0a0c10]', text: 'text-white' },
                { name: 'Warm Vellum', bg: 'bg-[#1e1a14]', text: 'text-[#f5ebd7]' },
                { name: 'Midnight Slate', bg: 'bg-[#0c1220]', text: 'text-[#e2ecfa]' },
                { name: 'Museum Concrete', bg: 'bg-[#22242c]', text: 'text-neutral-100' }
              ].map((wall, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${wall.bg} border border-white/10 flex flex-col items-center justify-center text-center gap-2 shadow-lg`}
                >
                  <div
                    className="w-10 h-10 rounded-full shadow-md border-2 border-white/20"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className={`text-[10px] font-mono-code uppercase tracking-wider ${wall.text}`}>
                    {wall.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
