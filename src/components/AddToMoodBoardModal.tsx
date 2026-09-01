import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Plus, Check, Search, Layers, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artwork, Collection, UserProfile } from '../types';
import { GalleryService } from '../services/api';

interface AddToMoodBoardModalProps {
  isOpen: boolean;
  artwork: Artwork | null;
  currentUser: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddToMoodBoardModal: React.FC<AddToMoodBoardModalProps> = ({
  isOpen,
  artwork,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCollections(GalleryService.getUserCollections(currentUser.id));
      setIsCreatingNew(false);
      setNewTitle('');
      setNewDescription('');
      setSearchQuery('');
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen || !artwork) return null;

  const filteredCollections = collections.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleArtworkInCollection = (collection: Collection) => {
    const isAlreadyIn = collection.artworkIds.includes(artwork.id);
    let newArtworkIds = [...collection.artworkIds];
    
    if (isAlreadyIn) {
      newArtworkIds = newArtworkIds.filter(id => id !== artwork.id);
    } else {
      newArtworkIds.push(artwork.id);
    }
    
    GalleryService.updateCollection(collection.id, { artworkIds: newArtworkIds });
    setCollections(GalleryService.getUserCollections(currentUser.id));
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsSubmitting(true);
    const newCollection = GalleryService.createCollection(
      currentUser.id,
      newTitle.trim(),
      newDescription.trim()
    );
    
    // Automatically add the artwork to the newly created collection
    GalleryService.updateCollection(newCollection.id, {
      artworkIds: [artwork.id]
    });
    
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[#0a0c10] border border-white/10 shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1017]">
          <h2 className="text-lg font-serif-display text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#c9a875]" />
            Add to Artist Vault
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Artwork Preview */}
        <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-[#08090c]">
          <div className="w-12 h-12 shrink-0 rounded overflow-hidden bg-neutral-900 border border-white/5 relative">
            {artwork.category === 'poetry' ? (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-[#c9a875] font-serif text-lg">
                P
              </div>
            ) : (
              <img 
                src={artwork.thumbnailUrl || artwork.mediaUrl} 
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{artwork.title}</h3>
            <p className="text-xs text-neutral-400 truncate">by {artwork.artist.name}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isCreatingNew ? (
            <>
              {collections.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search vaults..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-white/10 rounded-sm py-2 pl-9 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#c9a875]/50 transition-colors"
                  />
                </div>
              )}

              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-sm text-sm text-[#c9a875] hover:border-[#c9a875]/50 hover:bg-[#c9a875]/5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create New Vault / Mood Board
              </button>

              <div className="space-y-2">
                {filteredCollections.map(collection => {
                  const isAdded = collection.artworkIds.includes(artwork.id);
                  return (
                    <button
                      key={collection.id}
                      onClick={() => handleToggleArtworkInCollection(collection)}
                      className={`w-full flex items-center justify-between p-3 rounded-sm border transition-all cursor-pointer ${
                        isAdded 
                          ? 'bg-[#c9a875]/10 border-[#c9a875]/40 text-white' 
                          : 'bg-neutral-900/40 border-white/5 text-neutral-300 hover:bg-neutral-800/60 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <FolderPlus className={`w-4 h-4 ${isAdded ? 'text-[#c9a875]' : 'text-neutral-500'}`} />
                        <div>
                          <div className="text-sm font-medium">{collection.title}</div>
                          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono-code mt-0.5">
                            {collection.artworkIds.length} item{collection.artworkIds.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      {isAdded && <Check className="w-4 h-4 text-[#c9a875]" />}
                    </button>
                  );
                })}
                {collections.length > 0 && filteredCollections.length === 0 && (
                  <p className="text-center text-sm text-neutral-500 py-4">No vaults found matching "{searchQuery}"</p>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider font-mono-code flex items-center gap-1 mb-2 cursor-pointer"
              >
                ← Back to List
              </button>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1.5 font-mono-code">Vault Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Neo-Renaissance Studies"
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-sm px-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#c9a875]/50 transition-colors font-serif"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-400 mb-1.5 font-mono-code">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional curation notes..."
                  className="w-full h-24 bg-neutral-900/50 border border-white/10 rounded-sm px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#c9a875]/50 transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="flex-1 px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isSubmitting}
                  className="flex-[2] bg-[#c9a875] text-black px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-[#dfbd87] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(201,168,117,0.3)] cursor-pointer"
                >
                  Create & Save
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Footer */}
        {!isCreatingNew && (
          <div className="p-4 border-t border-white/5 bg-[#0d1017] text-center">
            <button
              onClick={onSuccess}
              className="w-full bg-white text-black px-4 py-2.5 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
