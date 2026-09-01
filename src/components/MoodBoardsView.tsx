import React, { useState, useEffect } from 'react';
import { Layers, FolderOpen, Plus, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { Collection, UserProfile, Artwork } from '../types';
import { GalleryService } from '../services/api';
import { MasonryGrid } from './MasonryGrid';
import { isVideoMedia } from '../utils/mediaUtils';

interface MoodBoardsViewProps {
  currentUser: UserProfile;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onOpenUpload: (category?: any) => void;
}

export const MoodBoardsView: React.FC<MoodBoardsViewProps> = ({
  currentUser,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onOpenUpload,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionArtworks, setCollectionArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    refreshCollections();
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedCollection) {
      const artworks = selectedCollection.artworkIds
        .map(id => GalleryService.getArtworkById(id))
        .filter((a): a is Artwork => !!a && !a.isDeleted);
      setCollectionArtworks(artworks);
    }
  }, [selectedCollection]);

  const refreshCollections = () => {
    setCollections(GalleryService.getUserCollections(currentUser.id));
  };

  const handleDeleteCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this Vault? The artworks inside will NOT be deleted.')) {
      GalleryService.deleteCollection(id);
      refreshCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
      }
    }
  };

  if (selectedCollection) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setSelectedCollection(null)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono-code text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Vaults
        </button>

        <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-serif-display tracking-[0.05em] text-white flex items-center gap-3">
              <Layers className="w-6 h-6 text-[#c9a875]" />
              {selectedCollection.title}
            </h2>
            {selectedCollection.description && (
              <p className="mt-3 text-neutral-300 font-serif italic text-lg border-l-2 border-[#c9a875]/40 pl-4">
                {selectedCollection.description}
              </p>
            )}
            <p className="text-xs font-mono-code text-neutral-500 mt-4">
              Curated by {currentUser.name} • {selectedCollection.artworkIds.length} Masterpiece{selectedCollection.artworkIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={(e) => handleDeleteCollection(selectedCollection.id, e)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-400 border border-rose-500/30 rounded-sm hover:bg-rose-500/10 transition-colors self-start md:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Vault
          </button>
        </div>

        {collectionArtworks.length > 0 ? (
          <MasonryGrid
            artworks={collectionArtworks}
            onSelectArtwork={onSelectArtwork}
            onToggleLike={onToggleLike}
            onToggleSave={onToggleSave}
            onSelectArtist={onSelectArtist}
            onShareArtwork={onShareArtwork}
            selectedCategory="all"
            onOpenUpload={onOpenUpload}
          />
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <FolderOpen className="w-16 h-16 text-neutral-800 mb-4" />
            <h3 className="text-xl font-serif-display text-neutral-400 mb-2">This Vault is empty</h3>
            <p className="text-sm text-neutral-500 max-w-md">
              Explore the sanctuary and use the "Add to Vault" button on artworks to curate this collection.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-2xl sm:text-3xl font-serif-display tracking-[0.06em] text-white flex items-center gap-3">
          <Layers className="w-6 h-6 text-[#c9a875]" />
          My Private Vaults & Mood Boards
        </h2>
        <p className="text-xs text-neutral-400 font-mono-code mt-2">
          Your personal curation spaces. Create thematic collections of masterpieces to inspire your next creation.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-sm bg-neutral-950/30">
          <Layers className="w-16 h-16 text-neutral-800 mb-4" />
          <h3 className="text-xl font-serif-display text-neutral-300 mb-2">No Vaults Created</h3>
          <p className="text-sm text-neutral-500 max-w-md mb-6">
            Vaults allow you to curate and save artworks into thematic collections. Start building your personal gallery.
          </p>
          <div className="text-xs font-mono-code text-[#c9a875] border border-[#c9a875]/30 px-4 py-2 rounded-sm bg-[#c9a875]/5">
            Tip: You can create new vaults directly when clicking "Add to Vault" on any artwork.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => {
            const firstArtworkId = collection.artworkIds[0];
            const firstArtwork = firstArtworkId ? GalleryService.getArtworkById(firstArtworkId) : null;
            const coverImage = firstArtwork?.category === 'poetry' ? null : firstArtwork?.thumbnailUrl || firstArtwork?.mediaUrl;

            return (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className="group relative flex flex-col bg-neutral-900/40 border border-white/5 rounded-sm overflow-hidden cursor-pointer hover:border-[#c9a875]/40 hover:shadow-[0_0_30px_rgba(201,168,117,0.1)] transition-all duration-300"
              >
                <div className="h-48 w-full bg-[#0a0c10] relative overflow-hidden">
                  {isVideoMedia(firstArtwork) ? (
                    <video
                      src={firstArtwork?.mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out pointer-events-none"
                    />
                  ) : coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={collection.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  ) : firstArtwork?.category === 'poetry' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black group-hover:scale-105 transition-transform duration-700">
                      <span className="font-serif-display text-6xl text-[#c9a875]/20">P</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-950">
                      <FolderOpen className="w-8 h-8 text-neutral-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050608] to-transparent opacity-90" />
                  
                  {/* Action overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteCollection(collection.id, e)}
                      className="p-1.5 bg-black/60 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded backdrop-blur-sm transition-colors"
                      title="Delete Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif-display text-xl text-white mb-1 group-hover:text-[#c9a875] transition-colors">{collection.title}</h3>
                    {collection.description && (
                      <p className="text-sm text-neutral-400 line-clamp-2 italic font-serif mb-4">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="text-[10px] uppercase tracking-widest font-mono-code text-neutral-500">
                      {collection.artworkIds.length} item{collection.artworkIds.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-mono-code text-[#c9a875]">
                      Open Vault →
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
