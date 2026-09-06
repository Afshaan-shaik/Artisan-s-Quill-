/**
 * PoetrySanctuaryView — The coffee-stained parchment poetry gallery.
 *
 * Modes:
 *   shelf  → "Continuous Coffee-Stained Shelf" (Design 1)
 *   desk   → "Poet's Desk with Reader Overlay"  (Design 2)
 *   grid   → Classic Grid (existing style)
 *
 * Capabilities:
 *   • View all poems (guests + authenticated users)
 *   • Write new poem → dispatches to parent via onWritePoem
 *   • Edit / Delete own poem → via canManage prop (respects canUserManageArtwork)
 *   • Full-screen reader overlay for any poem
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Artwork } from '../types';

/* ── Types ──────────────────────────────────────────────────────────── */

type ViewMode = 'shelf' | 'desk' | 'grid';

interface PoetrySanctuaryViewProps {
  poems: Artwork[];
  onWritePoem: () => void;
  onEditPoem: (poem: Artwork) => void;
  onDeletePoem: (poem: Artwork) => void;
  canManage: (poem: Artwork) => boolean;
}

/* ── Coffee stain renderer ──────────────────────────────────────────── */

function CoffeeStain({ variant }: { variant: number }) {
  if (!variant) return null;

  if (variant === 1) {
    // Corner coffee rings
    return (
      <>
        <div
          className="coffee-ring"
          style={{
            width: 54,
            height: 54,
            top: 14,
            right: 14,
            background: 'radial-gradient(circle at 45% 45%, rgba(101,67,33,0.15) 55%, transparent 72%)',
            border: '1.5px solid rgba(101,67,33,0.28)',
          }}
        />
        <div
          className="coffee-ring"
          style={{
            width: 34,
            height: 34,
            top: 34,
            right: 52,
            background: 'radial-gradient(circle at 55% 55%, rgba(101,67,33,0.1) 55%, transparent 70%)',
            border: '1px solid rgba(101,67,33,0.2)',
          }}
        />
      </>
    );
  }

  if (variant === 2) {
    // Saucer imprint (center)
    return (
      <div
        className="coffee-ring"
        style={{
          width: 90,
          height: 90,
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle at 50% 50%, rgba(101,67,33,0.08) 62%, rgba(101,67,33,0.18) 68%, rgba(101,67,33,0.04) 78%, transparent 90%)',
          border: '2px solid rgba(101,67,33,0.22)',
        }}
      />
    );
  }

  if (variant === 3) {
    // Margin spill
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 50,
          width: 16,
          background:
            'linear-gradient(to bottom, rgba(101,67,33,0.18) 0%, rgba(101,67,33,0.09) 55%, transparent 100%)',
          pointerEvents: 'none',
          mixBlendMode: 'multiply',
        }}
      />
    );
  }

  return null;
}

/* ── Stain style helper for CSSProperties ───────────────────────────── */

function getStainStyle(variant: number): React.CSSProperties {
  if (variant === 1)
    return {
      position: 'absolute',
      width: 54,
      height: 54,
      top: 14,
      right: 14,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 45% 45%, rgba(101,67,33,0.15) 55%, transparent 72%)',
      border: '1.5px solid rgba(101,67,33,0.28)',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
    };
  if (variant === 2)
    return {
      position: 'absolute',
      width: 90,
      height: 90,
      top: '38%',
      left: '50%',
      transform: 'translate(-50%,-50%)',
      borderRadius: '50%',
      background:
        'radial-gradient(circle at 50% 50%, rgba(101,67,33,0.08) 62%, rgba(101,67,33,0.18) 68%, rgba(101,67,33,0.04) 78%, transparent 90%)',
      border: '2px solid rgba(101,67,33,0.22)',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
    };
  if (variant === 3)
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 50,
      width: 16,
      background:
        'linear-gradient(to bottom, rgba(101,67,33,0.18) 0%, rgba(101,67,33,0.09) 55%, transparent 100%)',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
    };
  return { display: 'none' };
}

/* ── Poem excerpt helper ─────────────────────────────────────────────── */

function getExcerpt(poem: Artwork): string {
  const pc = poem.poetryContent;
  if (!pc) return '';
  if (pc.excerpt) return pc.excerpt;
  const first = pc.stanzas[0] || '';
  return first.length > 120 ? first.slice(0, 117) + '…' : first;
}

/* ── Full-screen Reader Overlay ─────────────────────────────────────── */

function ReaderOverlay({
  poem,
  onClose,
  onEdit,
  onDelete,
  canManage,
}: {
  poem: Artwork | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pc = poem?.poetryContent;
  const paperTone = pc?.paperTone || '#EDE0C8';
  const stainVariant = pc?.stainVariant || 0;
  const isOpen = !!poem;

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!poem || !pc) return null;

  return (
    <div
      ref={overlayRef}
      className={`poetry-reader-overlay ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`Reading: ${poem.title}`}
    >
      <div
        className="relative mx-4 rounded-2xl overflow-auto parchment-page-appear"
        style={{
          maxWidth: 660,
          width: '100%',
          maxHeight: '90vh',
          background: paperTone,
          boxShadow: '0 40px 100px rgba(0,0,0,0.95), 0 0 80px rgba(101,67,33,0.2)',
        }}
      >
        {/* Stain */}
        {stainVariant > 0 && <div style={getStainStyle(stainVariant)} />}

        {/* Deckle edge layers */}
        <div className="parchment-deckle-page parchment-ruled absolute inset-0 pointer-events-none" />

        {/* Bookmark close tab */}
        <div
          className="poetry-bookmark-tab"
          onClick={onClose}
          title="Close (Esc)"
          role="button"
          aria-label="Close reader"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
        />

        {/* Content */}
        <div className="relative parchment-margin-rule px-10 pt-16 pb-12">
          {/* Poem number */}
          {pc.poemNumber && (
            <p
              className="font-im-fell italic text-xs mb-2 opacity-50"
              style={{ color: '#5a3e28' }}
            >
              {pc.poemNumber}
            </p>
          )}

          {/* Title */}
          <h1
            className="font-im-fell"
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              color: '#1a1208',
              lineHeight: 1.15,
              textAlign: pc.alignment,
            }}
          >
            {poem.title}
          </h1>

          {/* Subtitle */}
          {pc.subtitle && (
            <p
              className="font-im-fell italic mt-1 text-sm opacity-60"
              style={{ color: '#5a3e28', textAlign: pc.alignment }}
            >
              {pc.subtitle}
            </p>
          )}

          {/* Divider */}
          <div
            className="my-5 mx-auto"
            style={{
              height: 1,
              background: 'linear-gradient(to right, transparent, rgba(101,67,33,0.4), transparent)',
              maxWidth: 200,
            }}
          />

          {/* Stanzas */}
          {pc.stanzas.map((stanza, i) => (
            <p
              key={i}
              className={`font-im-fell leading-loose whitespace-pre-line ${i === 0 ? 'parchment-dropcap' : 'mt-6'}`}
              style={{
                color: '#2a1e12',
                fontSize: '1.08rem',
                textAlign: pc.alignment,
              }}
            >
              {stanza}
            </p>
          ))}

          {/* Dedication */}
          {pc.dedication && (
            <p
              className="font-im-fell italic mt-8 text-sm opacity-55"
              style={{ color: '#5a3e28', textAlign: 'right' }}
            >
              {pc.dedication}
            </p>
          )}

          {/* Signature */}
          {pc.authorSignature && (
            <p
              className="font-im-fell italic mt-4 text-xs opacity-60"
              style={{ color: '#5a3e28', textAlign: 'right' }}
            >
              {pc.authorSignature}
            </p>
          )}

          {/* Artist */}
          <div className="mt-10 pt-5 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(101,67,33,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: 'rgba(101,67,33,0.2)', color: '#5a3e28' }}
              >
                {poem.artist.name.charAt(0)}
              </div>
              <div>
                <p className="font-im-fell text-sm" style={{ color: '#2a1e12' }}>
                  {poem.artist.name}
                </p>
                <p className="text-xs opacity-50" style={{ color: '#5a3e28' }}>
                  {poem.artist.handle}
                </p>
              </div>
            </div>

            {/* Manage buttons */}
            {canManage && (
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(101,67,33,0.15)',
                    color: '#5a3e28',
                    border: '1px solid rgba(101,67,33,0.3)',
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: 'rgba(200,40,40,0.1)',
                    color: '#9b3030',
                    border: '1px solid rgba(200,40,40,0.2)',
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shelf Card (Design 1) ──────────────────────────────────────────── */

function ShelfCard({
  poem,
  onRead,
  onEdit,
  onDelete,
  canManage,
}: {
  poem: Artwork;
  onRead: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const pc = poem.poetryContent;
  const [hovered, setHovered] = useState(false);
  const paperTone = pc?.paperTone || '#EDE0C8';
  const stainVariant = pc?.stainVariant || 0;
  const excerpt = getExcerpt(poem);

  return (
    <article
      className="relative flex-shrink-0 parchment-page-appear"
      style={{
        width: 'clamp(200px, 22vw, 280px)',
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-12px) rotate(-0.5deg)' : 'translateY(0) rotate(0deg)',
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onRead}
    >
      {/* Parchment page */}
      <div
        className="parchment-deckle-page parchment-ruled relative overflow-hidden"
        style={{
          background: paperTone,
          minHeight: 340,
          boxShadow: hovered
            ? '0 24px 60px rgba(0,0,0,0.7), -4px 0 12px rgba(0,0,0,0.25)'
            : '0 8px 24px rgba(0,0,0,0.45), -2px 0 6px rgba(0,0,0,0.15)',
          transition: 'box-shadow 0.35s ease',
        }}
      >
        {/* Stain */}
        {stainVariant > 0 && <div style={getStainStyle(stainVariant)} />}

        {/* Margin rule */}
        <div className="parchment-margin-rule absolute inset-0 pointer-events-none" />

        {/* Content */}
        <div className="relative p-6 pt-7">
          {pc?.poemNumber && (
            <p className="font-im-fell italic text-xs mb-1 opacity-40" style={{ color: '#5a3e28' }}>
              {pc.poemNumber}
            </p>
          )}

          <h3
            className="font-im-fell leading-tight mb-3"
            style={{ fontSize: '1.15rem', color: '#1a1208' }}
          >
            {poem.title}
          </h3>

          <div
            style={{ height: 1, background: 'rgba(101,67,33,0.25)', margin: '8px 0 10px' }}
          />

          <p
            className="font-im-fell italic text-sm leading-relaxed whitespace-pre-line line-clamp-5"
            style={{ color: '#2a1e12', WebkitLineClamp: 5, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}
          >
            {excerpt}
          </p>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-im-fell italic opacity-50" style={{ color: '#5a3e28' }}>
              {poem.artist.name}
            </span>
            {pc?.readingTimeMinutes && (
              <span className="text-xs opacity-40" style={{ color: '#5a3e28' }}>
                {pc.readingTimeMinutes} min
              </span>
            )}
          </div>
        </div>

        {/* Hover reveal: manage buttons */}
        {canManage && hovered && (
          <div
            className="absolute bottom-0 left-0 right-0 flex gap-2 p-3"
            style={{
              background: `linear-gradient(to top, ${paperTone}f0, transparent)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="flex-1 text-xs py-1.5 rounded transition-all"
              style={{ background: 'rgba(101,67,33,0.2)', color: '#3a2412', border: '1px solid rgba(101,67,33,0.3)' }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 text-xs py-1.5 rounded transition-all"
              style={{ background: 'rgba(200,40,40,0.12)', color: '#7a1a1a', border: '1px solid rgba(200,40,40,0.2)' }}
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>

      {/* Book spine shadow */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          bottom: 6,
          left: -6,
          width: 8,
          background: `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.12), transparent)`,
          borderRadius: '0 0 0 3px',
        }}
      />
    </article>
  );
}

/* ── Desk Card (Design 2) ───────────────────────────────────────────── */

function DeskCard({
  poem,
  onRead,
  onEdit,
  onDelete,
  canManage,
}: {
  poem: Artwork;
  onRead: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const pc = poem.poetryContent;
  const [hovered, setHovered] = useState(false);
  const paperTone = pc?.paperTone || '#DFC8A5';
  const stainVariant = pc?.stainVariant || 0;
  const excerpt = getExcerpt(poem);

  return (
    <article
      className="relative parchment-torn-card parchment-ruled parchment-page-appear"
      style={{
        background: paperTone,
        padding: '28px 24px',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.3)'
          : '0 6px 20px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)',
        transform: hovered ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        zIndex: hovered ? 10 : 1,
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onRead}
    >
      {/* Stain */}
      <CoffeeStain variant={stainVariant} />

      {/* Margin rule */}
      <div className="parchment-margin-rule absolute inset-0 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {pc?.poemNumber && (
          <p className="font-im-fell italic text-xs mb-1 opacity-40" style={{ color: '#4a3020' }}>
            {pc.poemNumber}
          </p>
        )}
        <h3
          className="font-im-fell leading-snug mb-2"
          style={{ fontSize: '1.1rem', color: '#1a1208' }}
        >
          {poem.title}
        </h3>
        <p
          className="font-im-fell italic text-sm leading-relaxed"
          style={{
            color: '#2a1e12',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 4,
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-im-fell italic opacity-55" style={{ color: '#4a3020' }}>
            — {poem.artist.name}
          </span>
          {canManage && (
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onEdit}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{ background: 'rgba(101,67,33,0.2)', color: '#3a2412', border: '1px solid rgba(101,67,33,0.3)' }}
              >
                ✏️
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{ background: 'rgba(200,40,40,0.12)', color: '#7a1a1a', border: '1px solid rgba(200,40,40,0.2)' }}
              >
                🗑
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Classic Grid Card ──────────────────────────────────────────────── */

function GridCard({
  poem,
  onRead,
  onEdit,
  onDelete,
  canManage,
}: {
  poem: Artwork;
  onRead: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}) {
  const pc = poem.poetryContent;
  const [hovered, setHovered] = useState(false);
  const excerpt = getExcerpt(poem);

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all parchment-page-appear"
      style={{
        background: 'linear-gradient(145deg, rgba(26,18,8,0.95) 0%, rgba(38,27,16,0.98) 100%)',
        border: `1px solid ${hovered ? 'rgba(200,160,80,0.35)' : 'rgba(200,160,80,0.12)'}`,
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onRead}
    >
      {/* Color accent strip */}
      <div
        style={{
          height: 3,
          background: poem.colorPalette?.length
            ? `linear-gradient(to right, ${poem.colorPalette[0]}, ${poem.colorPalette[1] || poem.colorPalette[0]})`
            : 'linear-gradient(to right, #8B6331, #C8A050)',
        }}
      />
      <div className="p-5">
        {pc?.poemNumber && (
          <p className="font-im-fell italic text-xs mb-1 opacity-40" style={{ color: '#9b8060' }}>
            {pc.poemNumber}
          </p>
        )}
        <h3
          className="font-im-fell text-lg leading-snug mb-2"
          style={{ color: '#DFC8A5' }}
        >
          {poem.title}
        </h3>
        <p
          className="font-im-fell italic text-sm leading-relaxed"
          style={{
            color: '#a08060',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs opacity-50" style={{ color: '#9b8060' }}>
            — {poem.artist.name}
          </span>
          {canManage && (
            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onEdit}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{ background: 'rgba(200,160,80,0.1)', color: '#C8A050', border: '1px solid rgba(200,160,80,0.25)' }}
              >
                ✏️
              </button>
              <button
                onClick={onDelete}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{ background: 'rgba(200,40,40,0.1)', color: '#e25555', border: '1px solid rgba(200,40,40,0.2)' }}
              >
                🗑
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Main PoetrySanctuaryView ───────────────────────────────────────── */

export default function PoetrySanctuaryView({
  poems,
  onWritePoem,
  onEditPoem,
  onDeletePoem,
  canManage,
}: PoetrySanctuaryViewProps) {
  const [mode, setMode] = useState<ViewMode>('shelf');
  const [activePoem, setActivePoem] = useState<Artwork | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Artwork | null>(null);

  const poetryPoems = poems.filter((a) => a.category === 'poetry' && a.poetryContent);

  const openReader = useCallback((poem: Artwork) => setActivePoem(poem), []);
  const closeReader = useCallback(() => setActivePoem(null), []);

  const requestDelete = useCallback(
    (poem: Artwork) => {
      closeReader();
      setDeleteConfirm(poem);
    },
    [closeReader],
  );

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      onDeletePoem(deleteConfirm);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, onDeletePoem]);

  const handleEdit = useCallback(
    (poem: Artwork) => {
      closeReader();
      onEditPoem(poem);
    },
    [closeReader, onEditPoem],
  );

  /* ── Mode switcher bar ── */
  const ModeBar = () => (
    <div className="flex items-center gap-2">
      {([
        { id: 'shelf', label: '📚 Shelf',      emoji: '📚' },
        { id: 'desk',  label: '🖊 Desk',        emoji: '🖊' },
        { id: 'grid',  label: '⊞ Grid',         emoji: '⊞' },
      ] as { id: ViewMode; label: string; emoji: string }[]).map(({ id, label }) => (
        <button
          key={id}
          id={`poetry-mode-${id}-btn`}
          onClick={() => setMode(id)}
          className="text-xs px-3 py-1.5 rounded-full transition-all"
          style={{
            background: mode === id ? 'rgba(200,160,80,0.2)' : 'rgba(255,255,255,0.05)',
            color: mode === id ? '#C8A050' : '#6b5038',
            border: `1px solid ${mode === id ? 'rgba(200,160,80,0.4)' : 'rgba(200,160,80,0.12)'}`,
          }}
          aria-pressed={mode === id}
        >
          {label}
        </button>
      ))}
    </div>
  );

  /* ── Empty state ── */
  if (poetryPoems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-im-fell text-5xl mb-4 opacity-30">🖋️</p>
        <h2 className="font-im-fell text-2xl mb-3" style={{ color: '#DFC8A5' }}>
          The pages are blank
        </h2>
        <p className="text-sm mb-6 opacity-50" style={{ color: '#9b8060' }}>
          No poems yet. Be the first to write one.
        </p>
        <button
          id="write-first-poem-btn"
          onClick={onWritePoem}
          className="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, #8B6331, #6B4520)',
            color: '#EDE0C8',
            border: '1px solid rgba(200,160,80,0.3)',
          }}
        >
          ✦ Write the First Poem
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Sanctuary Header ── */}
      <div
        className="relative mb-8 rounded-2xl overflow-hidden px-8 py-10"
        style={{
          background:
            'linear-gradient(135deg, rgba(20,14,8,0.97) 0%, rgba(30,20,10,0.98) 50%, rgba(20,14,8,0.97) 100%)',
          border: '1px solid rgba(200,160,80,0.15)',
        }}
      >
        {/* Decorative coffee ring */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '2px solid rgba(101,67,33,0.12)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '1.5px solid rgba(101,67,33,0.1)',
            pointerEvents: 'none',
          }}
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#6b5038' }}>
              The Artisan's Quill
            </p>
            <h1 className="font-im-fell text-4xl leading-tight mb-2" style={{ color: '#DFC8A5' }}>
              Poetry Sanctuary
            </h1>
            <p className="font-im-fell italic text-sm opacity-60" style={{ color: '#9b8060' }}>
              {poetryPoems.length} {poetryPoems.length === 1 ? 'poem' : 'poems'} —{' '}
              read, write, and linger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ModeBar />
            <button
              id="write-new-poem-btn"
              onClick={onWritePoem}
              className="text-sm px-5 py-2.5 rounded-xl font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #8B6331 0%, #6B4520 100%)',
                color: '#EDE0C8',
                border: '1px solid rgba(200,160,80,0.3)',
                boxShadow: '0 4px 16px rgba(101,67,33,0.4)',
              }}
            >
              🖋️ Write a Poem
            </button>
          </div>
        </div>
      </div>

      {/* ── Shelf Mode ── */}
      {mode === 'shelf' && (
        <div>
          {/* Wooden shelf top */}
          <div
            className="rounded-t-lg mb-0"
            style={{
              height: 18,
              background: 'linear-gradient(to bottom, #3B2212, #2A1A0E)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          />
          {/* Scrollable shelf */}
          <div
            style={{
              background: 'linear-gradient(to bottom, rgba(20,12,6,0.98), rgba(15,10,4,0.98))',
              padding: '24px 32px 32px',
              borderRadius: '0 0 16px 16px',
              border: '1px solid rgba(101,67,33,0.15)',
              borderTop: 'none',
            }}
          >
            <div
              className="flex gap-6 overflow-x-auto pb-4"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
            >
              {poetryPoems.map((poem) => (
                <div key={poem.id} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
                  <ShelfCard
                    poem={poem}
                    onRead={() => openReader(poem)}
                    onEdit={() => handleEdit(poem)}
                    onDelete={() => requestDelete(poem)}
                    canManage={canManage(poem)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Wooden shelf base */}
          <div
            style={{
              height: 14,
              background: 'linear-gradient(to bottom, #2A1A0E, #1E1208)',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}

      {/* ── Desk Mode ── */}
      {mode === 'desk' && (
        <div
          className="rounded-2xl p-8"
          style={{
            background:
              'radial-gradient(ellipse at 30% 20%, rgba(38,25,15,0.98) 0%, rgba(22,14,8,0.99) 100%)',
            border: '1px solid rgba(101,67,33,0.18)',
            boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {poetryPoems.map((poem) => (
              <DeskCard
                key={poem.id}
                poem={poem}
                onRead={() => openReader(poem)}
                onEdit={() => handleEdit(poem)}
                onDelete={() => requestDelete(poem)}
                canManage={canManage(poem)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Grid Mode ── */}
      {mode === 'grid' && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {poetryPoems.map((poem) => (
            <GridCard
              key={poem.id}
              poem={poem}
              onRead={() => openReader(poem)}
              onEdit={() => handleEdit(poem)}
              onDelete={() => requestDelete(poem)}
              canManage={canManage(poem)}
            />
          ))}
        </div>
      )}

      {/* ── Reader Overlay ── */}
      <ReaderOverlay
        poem={activePoem}
        onClose={closeReader}
        onEdit={() => activePoem && handleEdit(activePoem)}
        onDelete={() => activePoem && requestDelete(activePoem)}
        canManage={activePoem ? canManage(activePoem) : false}
      />

      {/* ── Delete Confirm Dialog ── */}
      {deleteConfirm && (
        <div
          className="poetry-reader-overlay is-open"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm deletion"
        >
          <div
            className="rounded-2xl p-8 mx-4"
            style={{
              maxWidth: 420,
              width: '100%',
              background: 'linear-gradient(135deg, #1a1208, #261B10)',
              border: '1px solid rgba(200,40,40,0.3)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.95)',
            }}
          >
            <p className="text-3xl mb-4 text-center">🗑️</p>
            <h2 className="font-im-fell text-xl mb-2 text-center" style={{ color: '#DFC8A5' }}>
              Delete "{deleteConfirm.title}"?
            </h2>
            <p className="text-sm text-center mb-6 opacity-60" style={{ color: '#9b8060' }}>
              This poem will be permanently removed from the sanctuary.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#9b8060',
                  border: '1px solid rgba(200,160,80,0.15)',
                }}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-poem-btn"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #9b2335, #7a1a27)',
                  color: '#fff',
                  border: '1px solid rgba(200,40,40,0.3)',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
