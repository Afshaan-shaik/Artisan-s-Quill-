import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Feather,
  Sparkles,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Share2,
  Type,
  Palette,
  Stamp,
  Sliders,
  Check,
  ChevronDown,
  Layers,
  Flame,
  ShieldCheck,
  Eye,
  PenTool
} from 'lucide-react';
import { Artwork, ArtCategory, UserProfile } from '../types';
import { GalleryService } from '../services/api';
import confetti from 'canvas-confetti';

interface FluidInkPoetryStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPublishSuccess: (newArtwork: Artwork) => void;
  onOpenBardModal?: (poem: { title: string; author: string; authorHandle?: string; content: string }) => void;
}

type NibType = 'quill' | 'chisel' | 'goldleaf' | 'sumie';
type ParchmentTheme = 'obsidian' | 'vellum' | 'midnight' | 'emerald' | 'crimson';

interface Point {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

const PARCHMENT_STYLES: Record<ParchmentTheme, { name: string; bg: string; border: string; textAccent: string; defaultInk: string }> = {
  obsidian: {
    name: 'Obsidian Stardust',
    bg: 'radial-gradient(circle at 50% 30%, #161822 0%, #090a0f 100%)',
    border: 'rgba(255, 255, 255, 0.12)',
    textAccent: '#e2d3be',
    defaultInk: '#c9a875'
  },
  vellum: {
    name: 'Antique Vellum',
    bg: 'radial-gradient(circle at 50% 30%, #241d16 0%, #110d0a 100%)',
    border: 'rgba(201, 168, 117, 0.3)',
    textAccent: '#dfbd87',
    defaultInk: '#f5ecd7'
  },
  midnight: {
    name: 'Royal Midnight',
    bg: 'radial-gradient(circle at 50% 30%, #121d33 0%, #070b14 100%)',
    border: 'rgba(99, 130, 201, 0.3)',
    textAccent: '#a5b4fc',
    defaultInk: '#dfbd87'
  },
  emerald: {
    name: 'Emerald Lacquer',
    bg: 'radial-gradient(circle at 50% 30%, #0e241b 0%, #06110c 100%)',
    border: 'rgba(72, 179, 137, 0.3)',
    textAccent: '#6ee7b7',
    defaultInk: '#c9a875'
  },
  crimson: {
    name: 'Crimson Velvet',
    bg: 'radial-gradient(circle at 50% 30%, #2a0f16 0%, #120508 100%)',
    border: 'rgba(229, 62, 62, 0.3)',
    textAccent: '#fca5a5',
    defaultInk: '#dfbd87'
  }
};

const INK_PALETTES = [
  { name: '24k Liquid Gold', color: '#c9a875', isMetallic: true },
  { name: 'Pure Starlight', color: '#ffffff', isMetallic: false },
  { name: 'Burnished Amber', color: '#dfbd87', isMetallic: true },
  { name: 'Vermilion Red', color: '#e53e3e', isMetallic: false },
  { name: 'Royal Indigo', color: '#818cf8', isMetallic: false },
  { name: 'Jade Emerald', color: '#10b981', isMetallic: false },
  { name: 'Rose Quartz', color: '#f472b6', isMetallic: false },
  { name: 'Obsidian Ink', color: '#090a0f', isMetallic: false }
];

export const FluidInkPoetryStudioModal: React.FC<FluidInkPoetryStudioModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPublishSuccess,
  onOpenBardModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNib, setSelectedNib] = useState<NibType>('quill');
  const [selectedParchment, setSelectedParchment] = useState<ParchmentTheme>('obsidian');
  const [selectedInk, setSelectedInk] = useState<string>('#c9a875');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'seal'>('draw');

  // Text Overlay State
  const [poemTitle, setPoemTitle] = useState('');
  const [poemVerse, setPoemVerse] = useState('');
  const [poemFont, setPoemFont] = useState<'Playfair Display' | 'Cormorant Garamond' | 'Cinzel' | 'Alex Brush'>('Playfair Display');
  const [verseAlign, setVerseAlign] = useState<'center' | 'left' | 'right'>('center');

  // Wax Seal State
  const [hasSeal, setHasSeal] = useState(true);
  const [sealColor, setSealColor] = useState<'crimson' | 'gold' | 'obsidian' | 'emerald'>('gold');

  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Drawing tracking
  const pointsRef = useRef<Point[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set higher resolution canvas size for crisp Hi-DPI display
    canvas.width = 1200;
    canvas.height = 1500;

    // Paint Background
    paintBackground(ctx, selectedParchment);

    // Save initial blank state into history
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryStep(0);
  }, [selectedParchment]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        initCanvas();
      }, 50);
    }
  }, [isOpen, initCanvas]);

  const paintBackground = (ctx: CanvasRenderingContext2D, theme: ParchmentTheme) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const grad = ctx.createRadialGradient(width / 2, height * 0.35, 50, width / 2, height / 2, width * 0.85);

    switch (theme) {
      case 'vellum':
        grad.addColorStop(0, '#261f18');
        grad.addColorStop(1, '#110d0a');
        break;
      case 'midnight':
        grad.addColorStop(0, '#131e36');
        grad.addColorStop(1, '#070b14');
        break;
      case 'emerald':
        grad.addColorStop(0, '#0f261c');
        grad.addColorStop(1, '#05110b');
        break;
      case 'crimson':
        grad.addColorStop(0, '#2c0f17');
        grad.addColorStop(1, '#110508');
        break;
      case 'obsidian':
      default:
        grad.addColorStop(0, '#181a24');
        grad.addColorStop(1, '#08090d');
        break;
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle luxury gilded double border
    ctx.strokeStyle = theme === 'vellum' || theme === 'obsidian' ? 'rgba(201, 168, 117, 0.35)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = 'rgba(201, 168, 117, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Decorative corner flourishes
    const cornerSize = 25;
    ctx.strokeStyle = 'rgba(201, 168, 117, 0.6)';
    ctx.lineWidth = 2;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(30, 30 + cornerSize);
    ctx.lineTo(30 + cornerSize, 30);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, 30);
    ctx.lineTo(width - 30, 30 + cornerSize);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(30, height - 30 - cornerSize);
    ctx.lineTo(30 + cornerSize, height - 30);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - 30 - cornerSize, height - 30);
    ctx.lineTo(width - 30, height - 30 - cornerSize);
    ctx.stroke();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(data);

    // Cap history at 25 steps
    if (newHistory.length > 25) newHistory.shift();

    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetStep = historyStep - 1;
    ctx.putImageData(history[targetStep], 0, 0);
    setHistoryStep(targetStep);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetStep = historyStep + 1;
    ctx.putImageData(history[targetStep], 0, 0);
    setHistoryStep(targetStep);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    paintBackground(ctx, selectedParchment);
    saveCanvasState();
  };

  // Convert mouse/touch coords to internal high-res canvas scale
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: Date.now() };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      time: Date.now()
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pt = getCanvasCoordinates(e);
    pointsRef.current = [pt];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pt = getCanvasCoordinates(e);
    pointsRef.current.push(pt);

    const points = pointsRef.current;
    if (points.length < 2) return;

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    ctx.save();

    // Specific Calligraphy & Brush Physics
    if (selectedNib === 'chisel') {
      // Italic / Gothic 45-degree angle chisel nib
      ctx.strokeStyle = selectedInk;
      ctx.lineWidth = strokeWidth * 1.6;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';

      const angle = Math.PI / 4; // 45 degrees
      const dx = Math.cos(angle) * (strokeWidth * 1.5);
      const dy = Math.sin(angle) * (strokeWidth * 1.5);

      ctx.beginPath();
      ctx.moveTo(p1.x - dx, p1.y - dy);
      ctx.lineTo(p1.x + dx, p1.y + dy);
      ctx.lineTo(p2.x + dx, p2.y + dy);
      ctx.lineTo(p2.x - dx, p2.y - dy);
      ctx.closePath();
      ctx.fillStyle = selectedInk;
      ctx.fill();
    } else if (selectedNib === 'quill') {
      // Velocity pressure sensitive feather quill
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const time = Math.max(1, p2.time - p1.time);
      const speed = dist / time;

      // Faster = thinner stroke, Slower = rich ink pool
      const dynamicWidth = Math.max(1.5, strokeWidth * (1.8 / (1 + speed * 0.45)));

      ctx.strokeStyle = selectedInk;
      ctx.lineWidth = dynamicWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
      ctx.stroke();
    } else if (selectedNib === 'goldleaf') {
      // 24k Gold Leaf with shimmering particle flecks
      ctx.strokeStyle = '#dfbd87';
      ctx.lineWidth = strokeWidth * 1.4;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(201, 168, 117, 0.8)';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Scatter gold leaf metallic sparkles around the stroke
      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * strokeWidth * 3.5;
        const offsetY = (Math.random() - 0.5) * strokeWidth * 3.5;
        const radius = Math.random() * 2.2 + 0.5;

        ctx.fillStyle = Math.random() > 0.4 ? '#fff5db' : '#c9a875';
        ctx.beginPath();
        ctx.arc(p2.x + offsetX, p2.y + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (selectedNib === 'sumie') {
      // Soft translucent Japanese sumi-e wash
      ctx.strokeStyle = selectedInk;
      ctx.lineWidth = strokeWidth * 3;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.18;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pointsRef.current = [];
    saveCanvasState();
  };

  // Render Formatted Verse Text & Seals onto Canvas
  const applyVerseTextToCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || (!poemVerse.trim() && !poemTitle.trim())) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.textAlign = verseAlign;
    const centerX = verseAlign === 'center' ? canvas.width / 2 : verseAlign === 'left' ? 120 : canvas.width - 120;
    let currentY = 180;

    // Render Title
    if (poemTitle.trim()) {
      ctx.font = `600 48px "${poemFont}", serif`;
      ctx.fillStyle = '#dfbd87';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(poemTitle.toUpperCase(), centerX, currentY);

      // Title underline divider
      ctx.strokeStyle = 'rgba(201, 168, 117, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 120, currentY + 25);
      ctx.lineTo(canvas.width / 2 + 120, currentY + 25);
      ctx.stroke();

      currentY += 90;
    }

    // Render Stanzas
    if (poemVerse.trim()) {
      ctx.font = `400 32px "${poemFont}", serif`;
      ctx.fillStyle = PARCHMENT_STYLES[selectedParchment].textAccent;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;

      const lines = poemVerse.split('\n');
      lines.forEach((line) => {
        if (line.trim() === '') {
          currentY += 24; // Stanza break
        } else {
          ctx.fillText(line, centerX, currentY);
          currentY += 46;
        }
      });
    }

    // Render Embossed Wax Seal
    if (hasSeal) {
      const sealX = canvas.width / 2;
      const sealY = canvas.height - 180;
      const sealRadius = 55;

      ctx.save();
      // Seal Outer Droop Glow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 20;

      // Outer Wax Body
      const sealGrad = ctx.createRadialGradient(sealX - 10, sealY - 10, 5, sealX, sealY, sealRadius);
      if (sealColor === 'crimson') {
        sealGrad.addColorStop(0, '#e53e3e');
        sealGrad.addColorStop(0.7, '#881337');
        sealGrad.addColorStop(1, '#4c0519');
      } else if (sealColor === 'gold') {
        sealGrad.addColorStop(0, '#fff0d1');
        sealGrad.addColorStop(0.5, '#c9a875');
        sealGrad.addColorStop(1, '#664c1e');
      } else if (sealColor === 'emerald') {
        sealGrad.addColorStop(0, '#34d399');
        sealGrad.addColorStop(0.7, '#065f46');
        sealGrad.addColorStop(1, '#022c22');
      } else {
        sealGrad.addColorStop(0, '#2d3748');
        sealGrad.addColorStop(0.7, '#1a202c');
        sealGrad.addColorStop(1, '#090a0f');
      }

      ctx.fillStyle = sealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner Stamp Rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius - 10, 0, Math.PI * 2);
      ctx.stroke();

      // Quill Logo Crest in Wax
      ctx.fillStyle = sealColor === 'gold' ? '#291c06' : '#ffffff';
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ AQ ✦', sealX, sealY);

      // Attribution below seal
      ctx.font = '18px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(201, 168, 117, 0.8)';
      ctx.fillText(`ATELIER ARCHIVE • ${currentUser.name.toUpperCase()}`, sealX, sealY + 80);

      ctx.restore();
    }

    ctx.restore();
    saveCanvasState();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${poemTitle ? poemTitle.toLowerCase().replace(/\s+/g, '-') : 'artisans-quill-verse'}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handlePublishToSanctuary = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsPublishing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.92);

      const title = poemTitle.trim() || 'Illuminated Calligraphy Verse';
      const description = poemVerse.trim() || 'Hand-scribed in the Fluid Ink & Gold-Leaf Poetry Sanctuary Studio.';

      const isGuest = currentUser.id === 'guest';
      const artistName = isGuest ? 'Guest Artist' : currentUser.name;
      const artistHandle = isGuest ? `@guest_${Date.now().toString(36).substring(2, 6)}` : currentUser.handle;
      const artistAvatar = isGuest ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' : currentUser.avatar;

      const newArtwork: Artwork = {
        id: `art-verse-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        description,
        artist: {
          id: isGuest ? `guest-${Date.now()}` : currentUser.id,
          name: artistName,
          handle: artistHandle,
          avatar: artistAvatar,
          verified: isGuest ? false : (currentUser.verified ?? true),
          location: currentUser.location || 'Sanctuary Atelier',
          bio: currentUser.bio
        },
        category: 'poetry',
        medium: 'Hand-Scribed Fluid Ink on Vellum',
        mediaUrl: dataUrl,
        thumbnailUrl: dataUrl,
        aspectRatio: 'tall',
        year: new Date().getFullYear(),
        dimensions: 'Illuminated Vellum Manuscript',
        tags: ['Fluid Ink Studio', 'Original Verse', 'Gold Leaf', selectedParchment],
        likesCount: 1,
        viewsCount: 1,
        savesCount: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
        isSaved: false,
        featured: false,
        poetryContent: {
          stanzas: poemVerse ? poemVerse.split('\n\n').filter(Boolean) : [description],
          theme: selectedParchment,
          fontStyle: poemFont === 'Cormorant Garamond' ? 'cormorant' : poemFont === 'Cinzel' ? 'newsreader' : 'playfair',
          alignment: verseAlign === 'left' ? 'left' : 'center',
          readingTimeMinutes: 1,
          authorSignature: `— ${artistName}`
        }
      };

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c9a875', '#ffffff', '#dfbd87', '#10b981']
      });

      onPublishSuccess(newArtwork);
      onClose();
    } catch (err) {
      console.error('Failed to inaugurate verse:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-7xl ultra-glass-elevated rounded-2xl sm:rounded-3xl border border-[#c9a875]/40 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07090e]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#c9a875]/30 to-[#c9a875]/5 border border-[#c9a875]/50 shadow-[0_0_20px_rgba(201,168,117,0.25)]">
              <Feather className="w-5 h-5 text-[#dfbd87]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif-display font-bold text-white tracking-wider flex items-center gap-2">
                <span>Fluid Ink &amp; Gold-Leaf Poetry Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-code bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40 uppercase">
                  Atelier Scribe
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono-code">
                Hand-scribe verses with authentic nib physics, gold leaf, and wax seals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Workspace + Studio Controls */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Main Drawing Stage */}
          <div className="flex-1 bg-[#050608] p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-auto select-none">
            
            {/* Canvas Frame */}
            <div className="relative shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(201,168,117,0.15)] rounded-lg overflow-hidden border border-[#c9a875]/30 max-h-[68vh] aspect-[4/5]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full object-contain cursor-crosshair touch-none"
              />
            </div>

            {/* Quick Canvas Action Bar */}
            <div className="mt-4 flex items-center gap-2 bg-[#090c13]/90 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl text-xs font-mono-code">
              <button
                onClick={handleUndo}
                disabled={historyStep <= 0}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleRedo}
                disabled={historyStep >= history.length - 1}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/15 mx-1" />

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Reset Parchment"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="h-4 w-px bg-white/15 mx-1" />

              <span className="text-[10px] text-neutral-400">
                Parchment: <strong className="text-[#dfbd87]">{PARCHMENT_STYLES[selectedParchment].name}</strong>
              </span>
            </div>
          </div>

          {/* Right Sidebar Control Suite */}
          <div className="w-full lg:w-96 bg-[#080a10]/95 border-t lg:border-t-0 lg:border-l border-white/10 p-5 flex flex-col justify-between overflow-y-auto space-y-6">
            
            <div className="space-y-5">
              
              {/* Studio Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-neutral-900/90 border border-white/10">
                <button
                  onClick={() => setActiveTab('draw')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'draw'
                      ? 'bg-[#c9a875] text-black shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Calligraphy</span>
                </button>

                <button
                  onClick={() => setActiveTab('type')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'type'
                      ? 'bg-[#c9a875] text-black shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Verse Text</span>
                </button>

                <button
                  onClick={() => setActiveTab('seal')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'seal'
                      ? 'bg-[#c9a875] text-black shadow-[0_0_12px_rgba(201,168,117,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Wax Seal</span>
                </button>
              </div>

              {/* TAB 1: CALLIGRAPHY & NIBS */}
              {activeTab === 'draw' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  
                  {/* Nib Selection */}
                  <div>
                    <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-2 block">
                      Artisan Nib &amp; Brush Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedNib('quill')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedNib === 'quill'
                            ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-[0_0_15px_rgba(201,168,117,0.2)]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                        }`}
                      >
                        <Feather className="w-4 h-4 text-[#dfbd87] shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Feather Quill</div>
                          <div className="text-[9px] text-neutral-400">Velocity Pressure</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedNib('chisel')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedNib === 'chisel'
                            ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-[0_0_15px_rgba(201,168,117,0.2)]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                        }`}
                      >
                        <PenTool className="w-4 h-4 text-[#dfbd87] shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Chisel Nib</div>
                          <div className="text-[9px] text-neutral-400">45° Italic Edge</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedNib('goldleaf')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedNib === 'goldleaf'
                            ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-[0_0_15px_rgba(201,168,117,0.2)]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">24k Gold Leaf</div>
                          <div className="text-[9px] text-amber-300/80">Metallic Flecks</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedNib('sumie')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          selectedNib === 'sumie'
                            ? 'bg-[#c9a875]/20 border-[#c9a875] text-white shadow-[0_0_15px_rgba(201,168,117,0.2)]'
                            : 'bg-white/5 border-white/10 text-neutral-300 hover:border-white/20'
                        }`}
                      >
                        <Palette className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">Sumi-e Wash</div>
                          <div className="text-[9px] text-neutral-400">Watercolor Bleed</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Ink Palette */}
                  <div>
                    <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-2 block">
                      Liquid Ink Pigment
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {INK_PALETTES.map((ink) => (
                        <button
                          key={ink.name}
                          onClick={() => setSelectedInk(ink.color)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 flex items-center justify-center cursor-pointer hover:scale-110 ${
                            selectedInk === ink.color
                              ? 'border-white scale-110 shadow-[0_0_15px_rgba(201,168,117,0.5)]'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: ink.color }}
                          title={ink.name}
                        >
                          {selectedInk === ink.color && (
                            <Check className={`w-4 h-4 ${ink.color === '#ffffff' || ink.color === '#dfbd87' ? 'text-black' : 'text-white'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stroke Width Slider */}
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-mono-code uppercase text-neutral-300 mb-1.5">
                      <span>Stroke Weight</span>
                      <span className="text-[#dfbd87] font-bold">{strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="18"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-full accent-[#c9a875] bg-neutral-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Parchment Backdrop Switcher */}
                  <div>
                    <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-2 block">
                      Parchment Texture
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(PARCHMENT_STYLES) as ParchmentTheme[]).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => {
                            setSelectedParchment(theme);
                            const canvas = canvasRef.current;
                            if (canvas) {
                              const ctx = canvas.getContext('2d');
                              if (ctx) paintBackground(ctx, theme);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-serif text-left border transition-all cursor-pointer ${
                            selectedParchment === theme
                              ? 'border-[#c9a875] bg-[#c9a875]/20 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {PARCHMENT_STYLES[theme].name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VERSE TEXT COMPOSER */}
              {activeTab === 'type' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-1.5 block">
                      Poem Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Ode to the Starlit Quill"
                      value={poemTitle}
                      onChange={(e) => setPoemTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#c9a875] font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-1.5 block">
                      Verse &amp; Stanzas
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Write your stanzas here..."
                      value={poemVerse}
                      onChange={(e) => setPoemVerse(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-sm focus:outline-none focus:border-[#c9a875] font-serif resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono-code uppercase text-neutral-400 block mb-1">
                        Typography
                      </label>
                      <select
                        value={poemFont}
                        onChange={(e) => setPoemFont(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-xs text-white focus:outline-none focus:border-[#c9a875]"
                      >
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                        <option value="Cinzel">Cinzel Imperial</option>
                        <option value="Alex Brush">Alex Brush Script</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono-code uppercase text-neutral-400 block mb-1">
                        Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-xl border border-white/15">
                        <button
                          onClick={() => setVerseAlign('left')}
                          className={`py-1 rounded-lg text-xs font-mono-code ${verseAlign === 'left' ? 'bg-[#c9a875] text-black font-bold' : 'text-neutral-400'}`}
                        >
                          Left
                        </button>
                        <button
                          onClick={() => setVerseAlign('center')}
                          className={`py-1 rounded-lg text-xs font-mono-code ${verseAlign === 'center' ? 'bg-[#c9a875] text-black font-bold' : 'text-neutral-400'}`}
                        >
                          Mid
                        </button>
                        <button
                          onClick={() => setVerseAlign('right')}
                          className={`py-1 rounded-lg text-xs font-mono-code ${verseAlign === 'right' ? 'bg-[#c9a875] text-black font-bold' : 'text-neutral-400'}`}
                        >
                          Right
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={applyVerseTextToCanvas}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Type className="w-4 h-4 text-black" />
                    <span>Stamp Verse to Parchment</span>
                  </button>
                </div>
              )}

              {/* TAB 3: WAX SEAL APPLICATOR */}
              {activeTab === 'seal' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs font-mono-code uppercase text-white font-bold">
                      Embossed Wax Hallmark
                    </span>
                    <input
                      type="checkbox"
                      checked={hasSeal}
                      onChange={(e) => setHasSeal(e.target.checked)}
                      className="w-4 h-4 accent-[#c9a875] rounded cursor-pointer"
                    />
                  </div>

                  {hasSeal && (
                    <div>
                      <label className="text-[11px] font-mono-code uppercase text-[#dfbd87] tracking-wider mb-2 block">
                        Wax Mineral Pigment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSealColor('gold')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            sealColor === 'gold'
                              ? 'bg-[#c9a875]/20 border-[#c9a875] text-white'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-[#c9a875] inline-block shadow-sm" />
                          <span className="text-xs font-bold">24k Imperial Gold</span>
                        </button>

                        <button
                          onClick={() => setSealColor('crimson')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            sealColor === 'crimson'
                              ? 'bg-rose-950/40 border-rose-500 text-white'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-rose-600 inline-block shadow-sm" />
                          <span className="text-xs font-bold">Crimson Lacquer</span>
                        </button>

                        <button
                          onClick={() => setSealColor('emerald')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            sealColor === 'emerald'
                              ? 'bg-emerald-950/40 border-emerald-500 text-white'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-500 inline-block shadow-sm" />
                          <span className="text-xs font-bold">Jade Emerald</span>
                        </button>

                        <button
                          onClick={() => setSealColor('obsidian')}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            sealColor === 'obsidian'
                              ? 'bg-neutral-800 border-neutral-400 text-white'
                              : 'bg-white/5 border-white/10 text-neutral-400'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 inline-block shadow-sm" />
                          <span className="text-xs font-bold">Pitch Obsidian</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-neutral-400 font-mono-code leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                    Wax seals are stamped directly on top of your calligraphy canvas during export or publishing with your artist handle (<strong className="text-[#dfbd87]">{currentUser.handle}</strong>).
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Export & Publish Action Bar */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              {onOpenBardModal && poemVerse && (
                <button
                  onClick={() => {
                    onOpenBardModal({
                      title: poemTitle || 'Ink Studio Calligraphy',
                      author: currentUser.name,
                      authorHandle: currentUser.handle,
                      content: poemVerse
                    });
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c9a875]/20 via-[#dfbd87]/15 to-transparent border border-[#dfbd87]/50 text-[#dfbd87] hover:text-white hover:bg-[#c9a875]/30 text-xs font-mono-code font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  title="Recite with AI Bard Symphony"
                >
                  <Feather className="w-3.5 h-3.5 text-[#dfbd87]" />
                  <span>Test-Recite in Bard Symphony</span>
                </button>
              )}

              <button
                onClick={handlePublishToSanctuary}
                disabled={isPublishing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c9a875] via-[#dfbd87] to-[#c9a875] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(201,168,117,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>{isPublishing ? 'Inaugurating...' : 'Inaugurate to Sanctuary Feed'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-200 text-xs font-mono-code uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#dfbd87]" />
                <span>Download Masterpiece PNG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
