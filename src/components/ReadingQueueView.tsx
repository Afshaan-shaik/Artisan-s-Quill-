import React, { useState, useEffect, useCallback } from 'react';
import {
  BookMarked,
  Trash2,
  Play,
  ChevronUp,
  ChevronDown,
  X,
  Feather,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { Artwork } from '../types';
import { GalleryService } from '../services/api';

interface ReadingQueueViewProps {
  onOpenArtwork: (artwork: Artwork) => void;
}

export const ReadingQueueView: React.FC<ReadingQueueViewProps> = ({ onOpenArtwork }) => {
  const [queue, setQueue] = useState<Artwork[]>([]);

  const refreshQueue = useCallback(() => {
    setQueue(GalleryService.getReadingQueue());
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  const handleRemove = (artworkId: string) => {
    GalleryService.removeFromReadingQueue(artworkId);
    refreshQueue();
  };

  const handleClear = () => {
    GalleryService.clearReadingQueue();
    refreshQueue();
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...queue];
    [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
    GalleryService.reorderReadingQueue(newQueue.map((a) => a.id));
    setQueue(newQueue);
  };

  const handleMoveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const newQueue = [...queue];
    [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
    GalleryService.reorderReadingQueue(newQueue.map((a) => a.id));
    setQueue(newQueue);
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 max-w-sm mx-auto">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <BookMarked className="w-8 h-8 text-[#c9a875]/50 mx-auto" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-white/80 mb-1 tracking-wide">
            Your verse queue is empty
          </h3>
          <p className="text-xs text-neutral-500 font-mono-code leading-relaxed">
            Browse the gallery and tap{' '}
            <span className="text-[#c9a875]">Read Later</span> on any poetry card
            to add it to your reading ritual.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg sm:text-xl font-serif-display tracking-[0.08em] text-white flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-[#c9a875]" />
            Reading Queue
          </h3>
          <p className="text-xs font-mono-code text-neutral-400 mt-1">
            {queue.length} poem{queue.length !== 1 ? 's' : ''} in your reading ritual
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono-code uppercase text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Clear Queue
        </button>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {queue.map((poem, index) => {
          const firstLine = poem.poetryContent?.stanzas?.[0]?.split('\n')?.[0] ?? '';

          return (
            <div
              key={poem.id}
              className="group relative flex items-stretch gap-0 rounded-2xl border border-white/10 hover:border-[#c9a875]/50 bg-[#09090c]/80 hover:bg-[#0d0c11] transition-all overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
            >
              {/* Queue Number Badge */}
              <div className="flex items-center justify-center px-3 text-[10px] font-mono-code font-bold text-neutral-600 border-r border-white/10 shrink-0 w-10">
                {index + 1}
              </div>

              {/* Color Swatch */}
              <div
                className="w-1.5 shrink-0"
                style={{
                  background: poem.colorPalette?.[0]
                    ? `linear-gradient(to bottom, ${poem.colorPalette[0]}, ${poem.colorPalette[1] ?? poem.colorPalette[0]})`
                    : '#c9a875'
                }}
              />

              {/* Content */}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 text-[9px] uppercase tracking-[0.3em] font-mono-code text-[#c9a875]/60">
                      <Feather className="w-2.5 h-2.5" />
                      <span>Poetry</span>
                      {poem.year && <span className="text-neutral-600">· {poem.year}</span>}
                    </div>
                    <h4 className="text-sm font-serif text-white group-hover:text-[#f3e3cb] transition-colors truncate mb-0.5">
                      {poem.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {poem.artist.name}
                      <span className="text-[#c9a875]/60 ml-1">{poem.artist.handle}</span>
                    </p>
                    {firstLine && (
                      <p className="mt-2 text-[11px] italic text-neutral-500 font-serif line-clamp-1 border-l-2 border-[#c9a875]/30 pl-2">
                        {firstLine}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {/* Reorder */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded text-neutral-600 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === queue.length - 1}
                      className="p-1 rounded text-neutral-600 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onOpenArtwork(poem)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono-code uppercase text-white bg-[#c9a875] hover:bg-[#dfbd87] transition-all cursor-pointer shadow hover:shadow-[0_0_15px_rgba(201,168,117,0.4)] font-bold"
                  >
                    <BookOpen className="w-3 h-3" />
                    Read Now
                  </button>
                  <button
                    onClick={() => handleRemove(poem.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono-code text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                    title="Remove from queue"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Read All in Order */}
      {queue.length > 1 && (
        <div className="pt-4 border-t border-white/5 flex justify-center">
          <button
            onClick={() => onOpenArtwork(queue[0])}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c9a875]/15 hover:bg-[#c9a875]/25 border border-[#c9a875]/40 hover:border-[#c9a875] text-[#dfbd87] hover:text-white text-xs font-mono-code uppercase tracking-widest transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            Begin Reading from Top
          </button>
        </div>
      )}
    </div>
  );
};
