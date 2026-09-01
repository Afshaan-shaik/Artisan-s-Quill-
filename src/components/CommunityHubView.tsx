import React, { useState, useEffect } from 'react';
import { Compass, Users, Layers, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { Collection, UserProfile, Artwork } from '../types';
import { GalleryService } from '../services/api';
import { MasonryGrid } from './MasonryGrid';
import { Avatar } from './Avatar';

interface CommunityHubViewProps {
  currentUser: UserProfile;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onOpenUpload: (category?: any) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
}

export const CommunityHubView: React.FC<CommunityHubViewProps> = ({
  currentUser,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onOpenUpload,
  onAddToMoodBoard,
}) => {
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  
  // View states
  const [activeTab, setActiveTab] = useState<'vaults' | 'artists'>('vaults');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionArtworks, setCollectionArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    // Fetch all profiles
    const profiles = GalleryService.getAllUserProfiles();
    setAllProfiles(profiles);

    // Fetch all collections and filter out empty ones
    const collections = GalleryService.getAllCollections().filter(c => c.artworkIds.length > 0);
    setAllCollections(collections);
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedCollection) {
      const artworks = selectedCollection.artworkIds
        .map(id => GalleryService.getArtworkById(id))
        .filter((a): a is Artwork => !!a && !a.isDeleted);
      setCollectionArtworks(artworks);
    }
  }, [selectedCollection]);

  // If a collection is selected, render its details
  if (selectedCollection) {
    const creator = allProfiles.find(p => p.id === selectedCollection.userId);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setSelectedCollection(null)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono-code text-neutral-400 hover:text-white transition-colors cursor-pointer mb-2"
        >
          ← Back to Hub
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
            <div className="flex items-center gap-3 mt-5">
              {creator && (
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={(e) => onSelectArtist(creator.id, e)}
                >
                  <Avatar src={creator.avatar} name={creator.name} size="xs" className="border border-[#c9a875]/30 group-hover:border-[#c9a875] transition-colors" />
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{creator.name}</span>
                </div>
              )}
              <span className="text-neutral-600">•</span>
              <p className="text-xs font-mono-code text-neutral-500 uppercase tracking-widest">
                {selectedCollection.artworkIds.length} Masterpiece{selectedCollection.artworkIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <MasonryGrid
          artworks={collectionArtworks}
          onSelectArtwork={onSelectArtwork}
          onToggleLike={onToggleLike}
          onToggleSave={onToggleSave}
          onSelectArtist={onSelectArtist}
          onShareArtwork={onShareArtwork}
          selectedCategory="all"
          onOpenUpload={onOpenUpload}
          onAddToMoodBoard={onAddToMoodBoard}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="pb-6 border-b border-white/5">
        <h2 className="text-3xl sm:text-4xl font-serif-display tracking-[0.05em] text-white flex items-center gap-3">
          <Compass className="w-7 h-7 text-[#c9a875]" />
          Community Hub
        </h2>
        <p className="text-sm text-neutral-400 mt-3 max-w-2xl">
          Discover curated Vaults from other artists and explore the creative directory of The Artisan's Quill ecosystem.
        </p>
        
        {/* Hub Tabs */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => setActiveTab('vaults')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'vaults'
                ? 'bg-[#c9a875] text-black shadow-[0_0_15px_rgba(201,168,117,0.3)]'
                : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Curated Vaults
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'artists'
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Artist Directory
          </button>
        </div>
      </div>

      {activeTab === 'vaults' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-[#c9a875]">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm uppercase tracking-widest font-mono-code font-bold">Featured Curation</h3>
          </div>
          
          {allCollections.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <FolderOpen className="w-12 h-12 text-neutral-800 mb-4" />
              <p className="text-neutral-500 text-sm">No public vaults have been created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCollections.map(collection => {
                const firstArtworkId = collection.artworkIds[0];
                const firstArtwork = firstArtworkId ? GalleryService.getArtworkById(firstArtworkId) : null;
                const coverImage = firstArtwork?.category === 'poetry' ? null : firstArtwork?.thumbnailUrl || firstArtwork?.mediaUrl;
                const creator = allProfiles.find(p => p.id === collection.userId);

                return (
                  <div
                    key={collection.id}
                    onClick={() => setSelectedCollection(collection)}
                    className="group relative flex flex-col bg-neutral-900/40 border border-white/5 rounded-sm overflow-hidden cursor-pointer hover:border-[#c9a875]/40 hover:shadow-[0_0_30px_rgba(201,168,117,0.1)] transition-all duration-300"
                  >
                    <div className="h-56 w-full bg-[#0a0c10] relative overflow-hidden">
                      {coverImage ? (
                        <img 
                          src={coverImage} 
                          alt={collection.title} 
                          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                        />
                      ) : firstArtwork?.category === 'poetry' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black group-hover:scale-105 transition-transform duration-700">
                          <span className="font-serif-display text-7xl text-[#c9a875]/20">P</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-950">
                          <FolderOpen className="w-8 h-8 text-neutral-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-transparent opacity-90" />
                      
                      {/* Creator Badge */}
                      {creator && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                          <Avatar src={creator.avatar} name={creator.name} size="xs" />
                          <span className="text-[10px] uppercase font-mono-code text-white tracking-wider">{creator.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif-display text-xl text-white mb-2 group-hover:text-[#c9a875] transition-colors">{collection.title}</h3>
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
                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono-code text-[#c9a875]">
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProfiles.map(profile => (
              <div 
                key={profile.id}
                onClick={(e) => onSelectArtist(profile.id, e)}
                className="group flex flex-col sm:flex-row gap-5 p-5 rounded-sm border border-white/5 bg-neutral-900/30 hover:bg-[#0c0d12] hover:border-[#c9a875]/30 hover:shadow-[0_0_20px_rgba(201,168,117,0.05)] transition-all cursor-pointer"
              >
                <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#c9a875] transition-colors">
                  <Avatar src={profile.avatar} name={profile.name} size="xl" className="w-full h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-serif-display text-white group-hover:text-[#c9a875] transition-colors">{profile.name}</h3>
                  <p className="text-xs font-mono-code text-[#dfbd87] mb-2">{profile.discipline}</p>
                  <p className="text-sm text-neutral-400 line-clamp-2 font-serif italic mb-3">
                    {profile.bio}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono-code text-neutral-500 mt-auto">
                    <span>{profile.artworksCount} Works</span>
                    <span>•</span>
                    <span>{profile.followersCount} Followers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
