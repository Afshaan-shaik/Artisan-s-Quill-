import React, { useState, useRef, useEffect } from 'react';
import { Feather, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingNote {
  id: string;
  text: string;
  createdAt: number;
}

const STORAGE_KEY = 'atelier_poetic_notes_v1';

export const FloatingGuestbook: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeNotes, setActiveNotes] = useState<FloatingNote[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clean up any pending timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, []);

  const handleDismissNote = (id: string) => {
    setActiveNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;

    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newNote: FloatingNote = {
      id: noteId,
      text: trimmed,
      createdAt: Date.now(),
    };

    // Zero data loss: persist poetic note to local vault history
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const history: FloatingNote[] = stored ? JSON.parse(stored) : [];
      history.unshift(newNote);
      // Keep recent 50 poetic notes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // Safe fallback if localStorage is restricted
    }

    // Reset input and close modal smoothly
    setNoteText('');
    setIsOpen(false);

    // After exactly 2 seconds of submitting, pop up the message in perfect middle from down
    const popupTimeout = setTimeout(() => {
      setActiveNotes((prev) => [...prev, newNote]);

      // Keep the poetic note visible in the middle for 9 seconds before graceful exit
      const removeTimeout = setTimeout(() => {
        setActiveNotes((prev) => prev.filter((n) => n.id !== noteId));
      }, 9000);

      timeoutsRef.current.push(removeTimeout);
    }, 2000);

    timeoutsRef.current.push(popupTimeout);
  };

  return (
    <>
      {/* Floating Notes Renderer - Perfectly Centered in Middle */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center p-4">
        <AnimatePresence>
          {activeNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: '80vh', scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '-35vh', scale: 0.95 }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pointer-events-auto relative p-8 sm:p-12 max-w-sm sm:max-w-md w-full bg-[#050608]/92 backdrop-blur-3xl border border-[#c9a875]/30 rounded-xl shadow-[0_0_50px_rgba(201,168,117,0.18)] flex flex-col items-center text-center group"
            >
              {/* Optional dismiss button */}
              <button
                onClick={() => handleDismissNote(note.id)}
                className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-200 p-1.5 rounded-full transition-colors cursor-pointer"
                title="Dismiss note"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <Feather className="w-5 h-5 text-[#c9a875] opacity-80" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#c9a875]/90 font-mono-code">
                  Poetic Sanctuary Note
                </span>
              </div>

              <p className="font-serif-display italic text-2xl sm:text-3xl leading-[1.6] text-neutral-100 whitespace-pre-line">
                "{note.text}"
              </p>

              <div className="mt-6 flex items-center gap-1.5 text-[10px] text-[#c9a875]/60 font-mono-code tracking-wider">
                <Sparkles className="w-3 h-3 text-[#c9a875]/70" />
                <span>Whispered to the Sanctuary</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 sm:right-12 z-50 w-80 sm:w-96 bg-[#050608]/95 backdrop-blur-2xl border border-[#c9a875]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 rounded-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c9a875]" />
                <span className="text-[10px] uppercase tracking-widest text-[#c9a875]">Guestbook Note</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleSubmit(e);
                  }
                }}
                placeholder="Compose a poetic thought..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-sm p-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-[#c9a875] focus:outline-none resize-none font-serif-display italic leading-relaxed"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-white text-black text-[10px] uppercase tracking-widest hover:bg-[#c9a875] hover:text-black transition-colors rounded-sm font-medium cursor-pointer"
              >
                Release Note
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 sm:bottom-12 sm:right-12 z-40 p-4 bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 hover:border-[#c9a875]/50 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(201,168,117,0.2)] transition-all duration-[600ms] ease-out hover:scale-110 group cursor-pointer"
        title="Leave a Poetic Note"
      >
        <Feather className="w-6 h-6 text-white group-hover:text-[#c9a875] transition-colors" />
      </button>
    </>
  );
};

