import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Share2,
  Sparkles,
  Smartphone,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  Layers,
  Palette,
  Check,
  Eye,
  Sliders
} from 'lucide-react';
import { Artwork, CanvasTexturePreset, StoryExportFormat } from '../types';
import confetti from 'canvas-confetti';

interface PoetryCardExporterModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  initialStanzaIndex?: number;
  onClose: () => void;
}

export const PoetryCardExporterModal: React.FC<PoetryCardExporterModalProps> = ({
  isOpen,
  artwork,
  initialStanzaIndex,
  onClose
}) => {
  const [texture, setTexture] = useState<CanvasTexturePreset>('parchment');
  const [format, setFormat] = useState<StoryExportFormat>('story'); // 'story' (9:16) or 'square' (1:1)
  const [selectedFont, setSelectedFont] = useState<'cormorant' | 'cinzel' | 'playfair' | 'newsreader'>('cormorant');
  const [alignment, setAlignment] = useState<'center' | 'left'>('center');
  const [selectedStanzaIdx, setSelectedStanzaIdx] = useState<number | 'all'>('all');
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(1);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (initialStanzaIndex !== undefined && initialStanzaIndex >= 0) {
      setSelectedStanzaIdx(initialStanzaIndex);
    } else {
      setSelectedStanzaIdx('all');
    }
  }, [initialStanzaIndex, isOpen]);

  // Texture Palettes definition
  const TEXTURE_THEMES = {
    parchment: {
      name: 'Vintage Parchment',
      bgGradStart: '#fbf8ee',
      bgGradEnd: '#f0e6d2',
      textColor: '#241b12',
      accentColor: '#9e7a44',
      subtextColor: '#66513b',
      borderColor: '#c9a875',
      sealColor: '#8a2b2b'
    },
    velvet: {
      name: 'Midnight Velvet',
      bgGradStart: '#0e111a',
      bgGradEnd: '#06080e',
      textColor: '#f5e4c4',
      accentColor: '#dfbd87',
      subtextColor: '#a39882',
      borderColor: '#c9a875',
      sealColor: '#c9a875'
    },
    washi: {
      name: 'Japanese Washi',
      bgGradStart: '#f5f0e6',
      bgGradEnd: '#e6decb',
      textColor: '#181a1f',
      accentColor: '#474b54',
      subtextColor: '#5c606b',
      borderColor: '#2e323b',
      sealColor: '#b83b3b'
    },
    crimson: {
      name: 'Crimson Silk',
      bgGradStart: '#330d17',
      bgGradEnd: '#140409',
      textColor: '#fbe9cb',
      accentColor: '#e5c38c',
      subtextColor: '#ba9a68',
      borderColor: '#dfbd87',
      sealColor: '#dfbd87'
    }
  };

  const getFontFamily = (f: typeof selectedFont) => {
    switch (f) {
      case 'cinzel':
        return "'Cinzel', serif";
      case 'playfair':
        return "'Playfair Display', serif";
      case 'newsreader':
        return "'Newsreader', serif";
      case 'cormorant':
      default:
        return "'Cormorant Garamond', serif";
    }
  };

  const renderCanvas = useCallback((): string => {
    if (!artwork || !canvasRef.current) return '';
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const isStory = format === 'story';
    const width = isStory ? 1080 : 1200;
    const height = isStory ? 1920 : 1200;

    canvas.width = width;
    canvas.height = height;

    const theme = TEXTURE_THEMES[texture];
    const poetry = artwork.poetryContent;

    // 1. Draw Background Canvas
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.1,
      width / 2,
      height / 2,
      height * 0.75
    );
    bgGrad.addColorStop(0, theme.bgGradStart);
    bgGrad.addColorStop(1, theme.bgGradEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper noise / grain effect
    ctx.fillStyle = texture === 'velvet' || texture === 'crimson' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)';
    for (let i = 0; i < 2400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }

    // 2. Archival Double Border Filigree
    const margin = isStory ? 70 : 60;
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(margin + 12, margin + 12, width - (margin + 12) * 2, height - (margin + 12) * 2);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.fillStyle = theme.accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, 0, 4, 25);
      ctx.fillRect(0, -2, 25, 4);
      ctx.restore();
    };

    drawCorner(margin + 12, margin + 12, 0);
    drawCorner(width - margin - 12, margin + 12, 90);
    drawCorner(width - margin - 12, height - margin - 12, 180);
    drawCorner(margin + 12, height - margin - 12, 270);

    // 3. Top Header Capsule & Title
    const fontName = getFontFamily(selectedFont);
    ctx.fillStyle = theme.accentColor;
    ctx.font = `600 24px 'Cinzel', serif`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '6px';
    ctx.fillText('THE ARTISAN’S QUILL', width / 2, margin + 80);

    ctx.fillStyle = theme.subtextColor;
    ctx.font = `italic 20px ${fontName}`;
    ctx.letterSpacing = '2px';
    ctx.fillText(artwork.title.toUpperCase(), width / 2, margin + 125);

    // Small divider line
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, margin + 155);
    ctx.lineTo(width / 2 + 80, margin + 155);
    ctx.stroke();

    // 4. Stanzas & Verse Rendering
    const stanzasToRender: string[] = [];
    if (poetry && poetry.stanzas && poetry.stanzas.length > 0) {
      if (selectedStanzaIdx === 'all') {
        stanzasToRender.push(...poetry.stanzas);
      } else {
        stanzasToRender.push(poetry.stanzas[selectedStanzaIdx]);
      }
    } else {
      stanzasToRender.push(artwork.description || 'Silence speaks in golden hues.');
    }

    const baseFontSize = (isStory ? 44 : 38) * fontSizeRatio;
    const lineHeight = baseFontSize * 1.6;

    ctx.fillStyle = theme.textColor;
    ctx.font = `italic ${baseFontSize}px ${fontName}`;
    ctx.textAlign = alignment;
    ctx.letterSpacing = '1px';

    // Calculate total height to center text vertically
    const totalLines: string[] = [];
    stanzasToRender.forEach((stanza, sIdx) => {
      const lines = stanza.split('\n');
      lines.forEach((l) => totalLines.push(l.trim()));
      if (sIdx < stanzasToRender.length - 1) {
        totalLines.push(''); // stanza break
      }
    });

    const blockHeight = totalLines.length * lineHeight;
    let startY = (height - blockHeight) / 2 + (isStory ? 20 : -10);
    if (startY < margin + 200) startY = margin + 200;

    const textX = alignment === 'center' ? width / 2 : margin + 70;

    totalLines.forEach((line) => {
      if (line !== '') {
        ctx.fillText(line, textX, startY);
      }
      startY += lineHeight;
    });

    // 5. Author Signature
    const authorName = poetry?.authorSignature || `— ${artwork.artist.name}`;
    ctx.fillStyle = theme.accentColor;
    ctx.font = `bold 28px ${fontName}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText(authorName, width / 2, height - margin - 150);

    // 6. Sanctuary Seal / Watermark
    if (showWatermark) {
      const sealY = height - margin - 80;
      ctx.fillStyle = theme.subtextColor;
      ctx.font = `500 16px 'Cinzel', serif`;
      ctx.letterSpacing = '3px';
      ctx.fillText('ARCHIVAL MASTERPIECE COLLECTION • VERIFIED SANCTUARY', width / 2, sealY);
    }

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  }, [artwork, format, texture, selectedFont, alignment, selectedStanzaIdx, fontSizeRatio, showWatermark]);

  useEffect(() => {
    if (isOpen && artwork) {
      const timer = setTimeout(() => {
        const url = renderCanvas();
        setPreviewDataUrl(url);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, artwork, renderCanvas]);

  if (!isOpen || !artwork) return null;

  const poetry = artwork.poetryContent;

  const handleDownload = () => {
    setIsExporting(true);
    const dataUrl = renderCanvas();

    const link = document.createElement('a');
    const safeTitle = artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `${safeTitle}-${format}-${texture}.png`;
    link.href = dataUrl;
    link.click();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c9a875', '#dfbd87', '#ffffff', '#e8be78']
    });

    setTimeout(() => setIsExporting(false), 800);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?artwork=${artwork.id}`;
    navigator.clipboard.writeText(url);
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#c9a875', '#dfbd87', '#ffffff']
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-300">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#07090e] border border-[#c9a875]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#c9a875]/20 border border-[#c9a875]/60 text-[#dfbd87]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9a875] font-mono-code font-bold">
                  Visual Poetry & Story Studio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#c9a875]/15 border border-[#c9a875]/30 text-[#dfbd87] text-[9px] font-mono-code">
                  Retina 2D Canvas Engine
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif-display font-medium text-white">
                {artwork.title} — <span className="text-neutral-400 font-sans font-light">{artwork.artist.name}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c9a875] hover:bg-[#dfbd87] text-black font-serif-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(201,168,117,0.4)] transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Export PNG'}</span>
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
          
          {/* Left Canvas Preview Chamber */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-center bg-[#030407] border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,117,0.06),transparent_70%)] pointer-events-none" />

            <div className="relative max-h-[68vh] flex items-center justify-center shadow-2xl rounded-xl overflow-hidden border border-[#c9a875]/30">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Poetry Card Preview"
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl transition-all duration-300"
                />
              ) : (
                <div className="w-64 h-96 flex items-center justify-center text-xs font-mono-code text-neutral-400">
                  Synthesizing Archival Canvas...
                </div>
              )}
            </div>

            <p className="text-[11px] font-mono-code text-neutral-400 mt-4 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#c9a875]" />
              <span>
                {format === 'story' ? 'Instagram Story (9:16 • 1080×1920)' : 'Post Format (1:1 • 1200×1200)'}
              </span>
            </p>
          </div>

          {/* Right Customization Suite */}
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-[#07090e] overflow-y-auto">
            
            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> 1. Aspect Ratio Format:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setFormat('story')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    format === 'story'
                      ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#f2dec4] ring-1 ring-[#c9a875]'
                      : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-[#c9a875]" />
                  <div className="text-left">
                    <div className="text-xs font-bold font-serif-display">9:16 Story</div>
                    <div className="text-[9px] font-mono-code opacity-70">Story & Wallpaper</div>
                  </div>
                </button>

                <button
                  onClick={() => setFormat('square')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                    format === 'square'
                      ? 'bg-[#c9a875]/20 border-[#c9a875] text-[#f2dec4] ring-1 ring-[#c9a875]'
                      : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Square className="w-4 h-4 text-[#c9a875]" />
                  <div className="text-left">
                    <div className="text-xs font-bold font-serif-display">1:1 Square</div>
                    <div className="text-[9px] font-mono-code opacity-70">Feed & Print</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Canvas Texture Backdrops */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> 2. Archival Texture Canvas:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(TEXTURE_THEMES) as CanvasTexturePreset[]).map((tKey) => {
                  const t = TEXTURE_THEMES[tKey];
                  const isSelected = tKey === texture;
                  return (
                    <button
                      key={tKey}
                      onClick={() => setTexture(tKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#c9a875]/20 border-[#c9a875] ring-1 ring-[#c9a875]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-serif-display font-medium text-white">{t.name}</div>
                        <div className="text-[9px] font-mono-code text-neutral-400 capitalize">{tKey} palette</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#c9a875]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Pairing */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> 3. Luxury Typography:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cormorant', name: 'Cormorant', style: 'Literary Elegance' },
                  { id: 'cinzel', name: 'Cinzel', style: 'Classical Stone' },
                  { id: 'playfair', name: 'Playfair', style: 'Editorial Serif' },
                  { id: 'newsreader', name: 'Newsreader', style: 'Book Type' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id as typeof selectedFont)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedFont === f.id
                        ? 'bg-[#c9a875]/20 border-[#c9a875]'
                        : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-medium text-white font-serif">{f.name}</div>
                    <div className="text-[9px] font-mono-code text-neutral-400">{f.style}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stanza Scope Selector */}
            {poetry && poetry.stanzas && poetry.stanzas.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono-code text-[#c9a875] font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> 4. Stanza Selection:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedStanzaIdx('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                      selectedStanzaIdx === 'all'
                        ? 'bg-[#c9a875] text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-neutral-300 hover:text-white'
                    }`}
                  >
                    All Stanzas
                  </button>
                  {poetry.stanzas.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedStanzaIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                        selectedStanzaIdx === idx
                          ? 'bg-[#c9a875] text-black font-bold'
                          : 'bg-white/5 border border-white/10 text-neutral-300 hover:text-white'
                      }`}
                    >
                      Stanza {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alignment & Scale Slider */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-neutral-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#c9a875]" /> Verse Size
                </span>
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.05"
                  value={fontSizeRatio}
                  onChange={(e) => setFontSizeRatio(parseFloat(e.target.value))}
                  className="w-32 accent-[#c9a875] bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code text-neutral-400">Alignment</span>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setAlignment('center')}
                    className={`p-1.5 rounded-md transition-colors ${
                      alignment === 'center' ? 'bg-[#c9a875] text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAlignment('left')}
                    className={`p-1.5 rounded-md transition-colors ${
                      alignment === 'left' ? 'bg-[#c9a875] text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-serif-display font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(201,168,117,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Rendering HD Art...' : 'Download Archival Card'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#dfbd87] transition-all cursor-pointer"
                title="Copy Link to Artwork"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
