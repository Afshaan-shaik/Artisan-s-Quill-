import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Compass, Eye, Filter, Zap, Info, Feather } from 'lucide-react';
import { Artwork } from '../types';

interface ConstellationStarMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
}

interface StarNode {
  artwork: Artwork;
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  theme: string;
  twinklePhase: number;
}

const THEMES = [
  { id: 'all', label: 'All Constellations', color: '#dfbd87' },
  { id: 'poetry', label: 'Poetic Verses', color: '#c9a875' },
  { id: 'starlight', label: 'Starlight & Night', color: '#88a4e6' },
  { id: 'gold', label: 'Gold Leaf & Atelier', color: '#ffd700' },
  { id: 'nature', label: 'Nature & Solitude', color: '#7dd89f' },
  { id: 'abstract', label: 'Transcendence', color: '#f09ad5' }
];

export const ConstellationStarMapModal: React.FC<ConstellationStarMapModalProps> = ({
  isOpen,
  onClose,
  artworks,
  onSelectArtwork
}) => {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [hoveredNode, setHoveredNode] = useState<StarNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const nodesRef = useRef<StarNode[]>([]);
  const rotationRef = useRef({ x: 0.2, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Initialize 3D Star Nodes from artworks
  useEffect(() => {
    if (!artworks || artworks.length === 0) return;

    const assignedThemes = ['poetry', 'starlight', 'gold', 'nature', 'abstract'];

    const nodes: StarNode[] = artworks.map((art, idx) => {
      // Map to 3D sphere coordinate
      const phi = Math.acos(-1 + (2 * idx) / Math.max(1, artworks.length));
      const theta = Math.sqrt(artworks.length * Math.PI) * phi;
      const radius = 260 + (idx % 3) * 40;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const theme =
        art.category === 'poetry'
          ? 'poetry'
          : assignedThemes[(idx + (art.title?.length || 0)) % assignedThemes.length];

      const themeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

      return {
        artwork: art,
        x,
        y,
        z,
        radius: Math.max(4, Math.min(8, (art.likesCount || 1) * 0.8 + 3)),
        color: themeObj.color,
        theme,
        twinklePhase: Math.random() * Math.PI * 2
      };
    });

    nodesRef.current = nodes;
  }, [artworks]);

  // Main 3D Canvas Render Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      const width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800);
      const height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 600);

      ctx.clearRect(0, 0, width, height);

      // Slow idle cosmic rotation if not dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.003;
      }

      const rotX = rotationRef.current.x;
      const rotY = rotationRef.current.y;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 450;

      const projectedNodes: (StarNode & {
        px: number;
        py: number;
        scale: number;
        rotZ: number;
        visible: boolean;
      })[] = [];

      // Project 3D nodes to 2D
      nodesRef.current.forEach((node) => {
        // Rotate around Y axis
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;

        // Rotate around X axis
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const distance = fov + z2;
        if (distance <= 0) return;

        const scale = fov / distance;
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        const isMatchingTheme = selectedTheme === 'all' || node.theme === selectedTheme;

        projectedNodes.push({
          ...node,
          px,
          py,
          scale,
          rotZ: z2,
          visible: isMatchingTheme
        });
      });

      // Sort by depth (back to front)
      projectedNodes.sort((a, b) => a.rotZ - b.rotZ);

      // Draw constellation laser connection rays
      ctx.lineWidth = 1 * window.devicePixelRatio;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const a = projectedNodes[i];
          const b = projectedNodes[j];

          if (!a.visible || !b.visible) continue;

          // Connect nodes that share the same theme if distance is reasonable
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (a.theme === b.theme && dist < 180 * window.devicePixelRatio) {
            const alpha = Math.max(0.08, (1 - dist / (180 * window.devicePixelRatio)) * 0.35);
            ctx.strokeStyle = `rgba(201, 168, 117, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
          }
        }
      }

      // Draw stars
      projectedNodes.forEach((node) => {
        if (!node.visible) return;

        const isHovered = hoveredNode?.artwork.id === node.artwork.id;
        const starRadius = Math.max(
          2,
          node.radius * node.scale * (isHovered ? 1.6 : 1.0) * window.devicePixelRatio
        );

        // Halo glow
        const gradient = ctx.createRadialGradient(
          node.px,
          node.py,
          0,
          node.px,
          node.py,
          starRadius * (isHovered ? 4.5 : 2.5)
        );
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(0.4, `${node.color}55`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.px, node.py, starRadius * (isHovered ? 4.5 : 2.5), 0, Math.PI * 2);
        ctx.fill();

        // Bright star core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(node.px, node.py, starRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Text label on hover or if primary
        if (isHovered) {
          ctx.fillStyle = '#f8ebd5';
          ctx.font = `bold ${12 * window.devicePixelRatio}px Cinzel, serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.artwork.title, node.px, node.py - starRadius * 3);
        }
      });
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isOpen, selectedTheme, hoveredNode]);

  // Mouse & Touch Interactivity (Orbit & Click detection)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      rotationRef.current.y += dx * 0.005;
      rotationRef.current.x += dy * 0.005;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycasting star hover test
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      const mouseY = (e.clientY - rect.top) * window.devicePixelRatio;

      const fov = 450;
      const cx = (canvas.width || 800) / 2;
      const cy = (canvas.height || 600) / 2;

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      let foundNode: StarNode | null = null;
      let closestDist = Infinity;

      nodesRef.current.forEach((node) => {
        const isMatchingTheme = selectedTheme === 'all' || node.theme === selectedTheme;
        if (!isMatchingTheme) return;

        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const distance = fov + z2;
        if (distance <= 0) return;

        const scale = fov / distance;
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        const d = Math.hypot(mouseX - px, mouseY - py);
        if (d < 18 * window.devicePixelRatio && d < closestDist) {
          closestDist = d;
          foundNode = node;
        }
      });

      setHoveredNode(foundNode);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      onSelectArtwork(hoveredNode.artwork);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="constellation-star-map-modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl ultra-glass-elevated border border-[#c9a875]/40 shadow-[0_0_60px_rgba(201,168,117,0.25)] overflow-hidden">
        {/* Top Rim */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#dfbd87] to-transparent opacity-80" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a875]/30 to-[#88a4e6]/20 border border-[#c9a875]/40 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-[#dfbd87]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                  3D Constellation of Motifs
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-mono-code font-bold bg-[#c9a875]/20 text-[#dfbd87] border border-[#c9a875]/40">
                  {nodesRef.current.length} Stars
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono-code">
                Interactive spatial cosmos linking sanctuary artworks and poetry by aesthetic themes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Exit Cosmos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Constellation Theme Filter Strip */}
        <div className="px-5 py-2.5 bg-black/60 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-[#c9a875] shrink-0" />
          {THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#c9a875] to-[#dfbd87] text-black font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }} />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Canvas Cosmic Viewport */}
        <div className="relative flex-1 bg-radial from-[#0e121e] via-[#050608] to-black overflow-hidden cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-full block"
          />

          {/* Navigation / Interaction hint */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-white/10 text-[10px] text-neutral-300 font-mono-code pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-[#c9a875] animate-spin" style={{ animationDuration: '10s' }} />
            <span>Click and drag to rotate cosmos • Click any star to open piece</span>
          </div>

          {/* Holographic 3D Glass Preview Tooltip */}
          {hoveredNode && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 w-64 rounded-xl ultra-glass-elevated border border-[#c9a875]/50 p-3 shadow-[0_0_30px_rgba(201,168,117,0.3)] animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${hoverPos.x}px`,
                top: `${hoverPos.y - 15}px`
              }}
            >
              {/* Holographic Tooltip Media Container */}
              <div className="h-32 w-full rounded-lg overflow-hidden mb-2.5 bg-gradient-to-br from-[#1b1713] via-[#0d0f14] to-black border border-[#c9a875]/30 relative flex items-center justify-center shadow-inner">
                {hoveredNode.artwork.category === 'video' || hoveredNode.artwork.mediaUrl?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                  <video
                    src={hoveredNode.artwork.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : hoveredNode.artwork.category === 'poetry' ? (
                  <div className="w-full h-full p-3 bg-gradient-to-b from-[#251d15] to-[#0d0a08] flex flex-col items-center justify-center text-center">
                    <Feather className="w-6 h-6 text-[#dfbd87] mb-1 opacity-90 drop-shadow-sm" />
                    <span className="text-[10px] font-serif italic text-[#f4ecd8] line-clamp-2 px-2 leading-relaxed">
                      "{hoveredNode.artwork.poetryContent?.stanzas?.[0]?.split('\n')[0] || hoveredNode.artwork.description || 'Illuminated Verse'}"
                    </span>
                  </div>
                ) : (
                  <img
                    src={hoveredNode.artwork.thumbnailUrl || hoveredNode.artwork.mediaUrl}
                    alt={hoveredNode.artwork.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/15 text-[8px] font-mono-code uppercase text-[#dfbd87] flex items-center gap-1 shadow-sm">
                  {hoveredNode.artwork.category === 'video' ? '🎬 Video' : hoveredNode.artwork.category === 'poetry' ? '🪶 Poetry' : '🎨 Art'}
                </div>
              </div>

              <h4 className="text-xs font-serif font-bold text-white line-clamp-1">
                {hoveredNode.artwork.title}
              </h4>
              <p className="text-[10px] text-[#c9a875] font-mono-code mt-0.5">
                by {hoveredNode.artwork.artist?.name || 'Sanctuary Artist'}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[9px] text-neutral-400 font-mono-code">
                <span className="uppercase">{hoveredNode.artwork.category}</span>
                <span className="text-emerald-400 font-bold">Click to Enter</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
