import React from 'react';
import { Artwork } from '../types';
import { ArtworkCard } from './ArtworkCard';

export interface MusicArtworkCardProps {
  artwork: Artwork;
  index?: number;
  isMasterpiece?: boolean;
  onSelectArtwork: (artwork: Artwork) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onSelectArtist?: (artistId: string, e: React.MouseEvent) => void;
  onShareArtwork?: (artwork: Artwork) => void;
  onAddToMoodBoard?: (artwork: Artwork) => void;
}

export const MusicArtworkCard: React.FC<MusicArtworkCardProps> = ({
  artwork,
  index = 0,
  isMasterpiece = false,
  onSelectArtwork,
  onToggleLike,
  onToggleSave,
  onSelectArtist,
  onShareArtwork,
  onAddToMoodBoard
}) => {
  return (
    <ArtworkCard
      artwork={artwork}
      index={index}
      isMasterpiece={isMasterpiece}
      onSelectArtwork={onSelectArtwork}
      onToggleLike={onToggleLike}
      onToggleSave={onToggleSave}
      onSelectArtist={onSelectArtist}
      onShareArtwork={onShareArtwork}
      onAddToMoodBoard={onAddToMoodBoard}
    />
  );
};
