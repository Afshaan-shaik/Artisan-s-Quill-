import React, { useState, useCallback, useId } from 'react';

interface CustomPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PoemFormData) => void;
  initialData?: Partial<PoemFormData>;
  isEditing?: boolean;
}

export interface PoemFormData {
  title: string;
  authorName: string;
  authorHandle: string;
  stanzasText: string;
  dedication?: string;
  poemNumber?: string;
  stainVariant: number;
  paperTone: string;
  alignment: 'left' | 'center';
}

const PAPER_TONES: { label: string; value: string }[] = [
  { label: 'Cream Parchment', value: '#EDE0C8' },
  { label: 'Dark Parchment',  value: '#DFC8A5' },
  { label: 'Aged Ivory',      value: '#E8D9B5' },
  { label: 'Pale Vellum',     value: '#F4ECD6' },
  { label: 'Dark Sepia',      value: '#C9A875' },
];

const STAIN_LABELS: string[] = [
  'No stain',
  'Corner coffee rings',
  'Saucer imprint',
  'Margin spill',
];

const DEFAULT_FORM: PoemFormData = {
  title: '',
  authorName: '',
  authorHandle: '',
  stanzasText: '',
  dedication: '',
  poemNumber: '',
  stainVariant: 0,
  paperTone: '#EDE0C8',
  alignment: 'left',
};

function splitStanzas(raw: string): string[] {
  return raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
}

function ParchmentPreview({ data }: { data: PoemFormData }) {
  const stanzas = splitStanzas(data.stanzasText);
  const hasDrop = stanzas.length > 0;

  const stainStyle = (variant: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      mixBlendMode: 'multiply',
      border: '1px solid rgba(101,67,33,0.35)',
    };
    if (variant === 1)
      return {
        ...base,
        width: 56,
        height: 56,
        top: 12,
        right: 12,
        background: 'radial-gradient(circle, rgba(101,67,33,0.18) 60%, transparent 100%)',
      };
    if (variant === 2)
      return {
        ...base,
        width: 80,
        height: 80,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-60%)',
        background: 'radial-gradient(circle, rgba(101,67,33,0.12) 55%, transparent 100%)',
      };
    if (variant === 3)
      return {
        ...base,
        width: 18,
        top: 0,
        bottom: 0,
        left: 56,
        borderRadius: 0,
        background:
          'linear-gradient(to bottom, rgba(101,67,33,0.14), rgba(101,67,33,0.08) 60%, transparent)',
        border: 'none',
      };
    return { display: 'none' };
  };

  return (
    <div
      style={{
        background: data.paperTone,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 2px 4px 8px rgba(0,0,0,0.2)',
      }}
      className="relative rounded overflow-hidden parchment-deckle-page parchment-ruled parchment-page-appear select-none"
    >
      {data.stainVariant > 0 && <div style={stainStyle(data.stainVariant)} />}
      <div
        className="relative p-6 parchment-margin-rule"
        style={{ minHeight: 240 }}
      >
        {data.poemNumber && (
          <p
            className="font-im-fell italic text-xs mb-1 opacity-50"
            style={{ color: '#5a3e28' }}
          >
            {data.poemNumber}
          </p>
        )}
        <h2
          className="font-im-fell mb-1"
          style={{
            fontSize: '1.25rem',
            color: '#261F18',
            lineHeight: 1.2,
            textAlign: data.alignment,
          }}
        >
          {data.title || 'Untitled Poem'}
        </h2>
        {stanzas.length === 0 && (
          <p
            className="font-im-fell italic opacity-40 mt-4"
            style={{ color: '#5a3e28', fontSize: '0.9rem' }}
          >
            Your poem will appear here&hellip;
          </p>
        )}
        {stanzas.map((stanza, i) => (
          <p
            key={i}
            className={`font-im-fell mt-3 leading-relaxed whitespace-pre-line text-sm ${
              i === 0 && hasDrop ? 'parchment-dropcap' : ''
            }`}
            style={{ color: '#2a1e12', textAlign: data.alignment }}
          >
            {stanza}
          </p>
        ))}
        {data.dedication && (
          <p
            className="font-im-fell italic mt-5 opacity-60 text-xs"
            style={{ color: '#5a3e28', textAlign: 'right' }}
          >
            {data.dedication}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CustomPoemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: CustomPoemModalProps) {
  const [form, setForm] = useState<PoemFormData>({ ...DEFAULT_FORM, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof PoemFormData, string>>>({});
  const [showPreview, setShowPreview] = useState(false);
  const headingId = useId();

  React.useEffect(() => {
    if (isOpen) {
      setForm({ ...DEFAULT_FORM, ...initialData });
      setErrors({});
      setShowPreview(false);
    }
  }, [isOpen]);

  const set = useCallback((field: keyof PoemFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PoemFormData, string>> = {};
    if (!form.title.trim()) errs.title = 'A title is required.';
    if (!form.stanzasText.trim()) errs.stanzasText = 'Write at least one stanza.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(200,160,80,0.25)',
    color: '#DFC8A5',
    caretColor: '#C8A050',
  };

  const labelStyle: React.CSSProperties = {
    color: '#9b8060',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    fontWeight: 500,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      className="poetry-reader-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 920,
          background: 'linear-gradient(135deg, #1a1208 0%, #261B10 50%, #1a1208 100%)',
          border: '1px solid rgba(200,160,80,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 60px rgba(101,67,33,0.15)',
          maxHeight: '92vh',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(200,160,80,0.15)', flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 22 }}>🖋️</span>
            <h2
              id={headingId}
              className="font-im-fell text-xl"
              style={{ color: '#DFC8A5' }}
            >
              {isEditing ? 'Edit Your Poem' : 'Write a New Poem'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: showPreview ? 'rgba(200,160,80,0.2)' : 'rgba(255,255,255,0.06)',
                color: '#C8A050',
                border: '1px solid rgba(200,160,80,0.3)',
              }}
            >
              {showPreview ? '📝 Edit' : '👁 Preview'}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close poem modal"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: '#9b8060' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
          {/* Form */}
          <div
            className="overflow-y-auto"
            style={{
              flex: showPreview ? '0 0 48%' : '1',
              transition: 'flex 0.35s ease',
              padding: 24,
              borderRight: showPreview ? '1px solid rgba(200,160,80,0.12)' : 'none',
            }}
          >
            <form id="custom-poem-form" onSubmit={handleSubmit} noValidate>
              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="poem-title-input" style={labelStyle}>
                  Poem Title *
                </label>
                <input
                  id="poem-title-input"
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="What shall we call this poem?"
                  className="w-full rounded-lg px-3 py-2 font-im-fell text-base outline-none transition-all"
                  style={{
                    ...inputStyle,
                    border: `1px solid ${errors.title ? '#e25555' : 'rgba(200,160,80,0.25)'}`,
                  }}
                  aria-required="true"
                />
                {errors.title && (
                  <p style={{ color: '#e25555', fontSize: '0.75rem', marginTop: 4 }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Author row */}
              <div className="flex gap-3" style={{ marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="poem-author-name-input" style={labelStyle}>
                    Your Name
                  </label>
                  <input
                    id="poem-author-name-input"
                    type="text"
                    value={form.authorName}
                    onChange={(e) => set('authorName', e.target.value)}
                    placeholder="Display name"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="poem-author-handle-input" style={labelStyle}>
                    Handle
                  </label>
                  <input
                    id="poem-author-handle-input"
                    type="text"
                    value={form.authorHandle}
                    onChange={(e) => set('authorHandle', e.target.value)}
                    placeholder="@your_handle"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Stanzas */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="poem-stanzas-textarea" style={labelStyle}>
                  Poem Text *{' '}
                  <span style={{ color: '#6b5038', fontWeight: 400, textTransform: 'none' }}>
                    (blank line between stanzas)
                  </span>
                </label>
                <textarea
                  id="poem-stanzas-textarea"
                  value={form.stanzasText}
                  onChange={(e) => set('stanzasText', e.target.value)}
                  placeholder={'Write your poem here…\n\nLeave a blank line between stanzas.'}
                  rows={9}
                  className="w-full rounded-lg px-3 py-2 font-im-fell text-sm leading-relaxed resize-y outline-none"
                  style={{
                    ...inputStyle,
                    border: `1px solid ${errors.stanzasText ? '#e25555' : 'rgba(200,160,80,0.25)'}`,
                    minHeight: 160,
                  }}
                  aria-required="true"
                />
                {errors.stanzasText && (
                  <p style={{ color: '#e25555', fontSize: '0.75rem', marginTop: 4 }}>
                    {errors.stanzasText}
                  </p>
                )}
              </div>

              {/* Dedication */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="poem-dedication-input" style={labelStyle}>
                  Dedication{' '}
                  <span style={{ color: '#6b5038', fontWeight: 400, textTransform: 'none' }}>
                    (optional)
                  </span>
                </label>
                <input
                  id="poem-dedication-input"
                  type="text"
                  value={form.dedication}
                  onChange={(e) => set('dedication', e.target.value)}
                  placeholder="— for someone, for something"
                  className="w-full rounded-lg px-3 py-2 text-sm font-im-fell italic outline-none"
                  style={inputStyle}
                />
              </div>

              {/* Poem number + alignment */}
              <div className="flex gap-3" style={{ marginBottom: 16 }}>
                <div style={{ flex: '0 0 38%' }}>
                  <label htmlFor="poem-number-input" style={labelStyle}>
                    Poem No.
                  </label>
                  <input
                    id="poem-number-input"
                    type="text"
                    value={form.poemNumber}
                    onChange={(e) => set('poemNumber', e.target.value)}
                    placeholder="e.g. I. or IV."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Alignment</label>
                  <div
                    className="flex rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(200,160,80,0.2)' }}
                  >
                    {(['left', 'center'] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        id={`poem-align-${a}-btn`}
                        onClick={() => set('alignment', a)}
                        className="flex-1 py-2 text-xs transition-all"
                        style={{
                          background:
                            form.alignment === a
                              ? 'rgba(200,160,80,0.2)'
                              : 'rgba(255,255,255,0.03)',
                          color: form.alignment === a ? '#C8A050' : '#6b5038',
                          borderRight: a === 'left' ? '1px solid rgba(200,160,80,0.15)' : 'none',
                        }}
                      >
                        {a === 'left' ? '⬅ Left' : '↔ Center'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Paper tone */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Parchment Tone</label>
                <div className="flex flex-wrap gap-2">
                  {PAPER_TONES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      title={label}
                      id={`paper-tone-${value.replace('#', '')}-btn`}
                      onClick={() => set('paperTone', value)}
                      className="w-9 h-9 rounded-full transition-all"
                      style={{
                        background: value,
                        border:
                          form.paperTone === value
                            ? '3px solid #C8A050'
                            : '2px solid rgba(255,255,255,0.15)',
                        boxShadow:
                          form.paperTone === value ? '0 0 10px rgba(200,160,80,0.5)' : 'none',
                        transform: form.paperTone === value ? 'scale(1.18)' : 'scale(1)',
                      }}
                      aria-pressed={form.paperTone === value}
                      aria-label={label}
                    />
                  ))}
                </div>
              </div>

              {/* Stain variant */}
              <div style={{ marginBottom: 8 }}>
                <label style={labelStyle}>Coffee Stain</label>
                <div className="flex flex-wrap gap-2">
                  {STAIN_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      id={`stain-variant-${i}-btn`}
                      onClick={() => set('stainVariant', i)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background:
                          form.stainVariant === i
                            ? 'rgba(101,67,33,0.4)'
                            : 'rgba(255,255,255,0.04)',
                        color: form.stainVariant === i ? '#DFC8A5' : '#6b5038',
                        border: `1px solid ${
                          form.stainVariant === i
                            ? 'rgba(200,160,80,0.5)'
                            : 'rgba(200,160,80,0.15)'
                        }`,
                      }}
                      aria-pressed={form.stainVariant === i}
                    >
                      {['✦ ', '☕ ', '◎ ', '〜 '][i]}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Preview */}
          {showPreview && (
            <div
              className="overflow-y-auto"
              style={{ flex: '0 0 52%', padding: 24 }}
            >
              <p
                className="uppercase tracking-widest text-xs"
                style={{ color: '#6b5038', marginBottom: 16 }}
              >
                Live Parchment Preview
              </p>
              <ParchmentPreview data={form} />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(200,160,80,0.12)', flexShrink: 0 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm transition-all"
            style={{
              color: '#9b8060',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(200,160,80,0.15)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="custom-poem-form"
            id="submit-poem-btn"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #8B6331 0%, #6B4520 100%)',
              color: '#EDE0C8',
              border: '1px solid rgba(200,160,80,0.3)',
              boxShadow: '0 4px 16px rgba(101,67,33,0.4)',
            }}
          >
            {isEditing ? '✦ Save Changes' : '✦ Publish Poem'}
          </button>
        </div>
      </div>
    </div>
  );
}
