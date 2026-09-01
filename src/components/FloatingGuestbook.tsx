import React, { useState } from 'react';
import { Feather, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingNote {
  id: string;
  text: string;
  x: number;
}

export const FloatingGuestbook: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeNotes, setActiveNotes] = useState<FloatingNote[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote: FloatingNote = {
      id: Date.now().toString(),
      text: noteText.trim(),
      x: Math.floor(Math.random() * 50) + 25, // 25% to 75% of screen width
    };

    setActiveNotes((prev) => [...prev, newNote]);
    setNoteText('');
    setIsOpen(false);

    // Remove note after 15 seconds
    setTimeout(() => {
      setActiveNotes((prev) => prev.filter((n) => n.id !== newNote.id));
    }, 15000);
  };

  return (
    <>
      {/* Floating Notes Renderer */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        <AnimatePresence>
          {activeNotes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: '100vh', x: `${note.x}vw`, scale: 0.8 }}
              animate={{ opacity: 1, y: '-20vh', scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 15, ease: 'linear' }}
              className="absolute bottom-0 p-8 sm:p-12 max-w-sm sm:max-w-md bg-[#050608]/80 backdrop-blur-3xl border border-[#c9a875]/20 rounded-sm shadow-[0_0_40px_rgba(201,168,117,0.1)] flex flex-col items-center text-center"
            >
              <Feather className="w-5 h-5 text-[#c9a875] mb-6 opacity-60" />
              <p className="font-serif-display italic text-2xl sm:text-3xl leading-[1.6] text-neutral-200">
                "{note.text}"
              </p>
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
            className="fixed bottom-24 right-6 sm:right-12 z-20 w-80 bg-[#050608]/95 backdrop-blur-2xl border border-[#c9a875]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] p-6 rounded-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c9a875]" />
                <span className="text-[10px] uppercase tracking-widest text-[#c9a875]">Guestbook Note</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Compose a poetic thought..."
                className="w-full h-32 bg-white/5 border border-white/10 rounded-sm p-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-[#c9a875] focus:outline-none resize-none font-serif-display italic leading-relaxed"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full py-3 bg-white text-black text-[10px] uppercase tracking-widest hover:bg-[#c9a875] transition-colors rounded-sm font-medium"
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
        className="fixed bottom-6 right-6 sm:bottom-12 sm:right-12 z-20 p-4 bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 hover:border-[#c9a875]/50 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(201,168,117,0.2)] transition-all duration-[600ms] ease-out hover:scale-110 group"
        title="Leave a Poetic Note"
      >
        <Feather className="w-6 h-6 text-white group-hover:text-[#c9a875] transition-colors" />
      </button>
    </>
  );
};
