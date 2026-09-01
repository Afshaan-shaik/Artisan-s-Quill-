import { Artwork } from '../types';

/**
 * Robust detection for any video media (MP4, WebM, MOV, OGG video, etc.)
 * Checks category, mediaUrl extension, storage MIME, and videoData flags.
 */
export function isVideoMedia(artwork: Artwork | null | undefined): boolean {
  if (!artwork) return false;
  if (artwork.category === 'video') return true;
  if (artwork.videoData && Object.keys(artwork.videoData).length > 0) return true;

  const url = (artwork.mediaUrl || '').toLowerCase().trim();
  const thumb = (artwork.thumbnailUrl || '').toLowerCase().trim();

  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.mkv'];
  const hasVideoExt = videoExtensions.some(ext => url.includes(ext) || thumb.includes(ext));
  if (hasVideoExt) return true;

  // Supabase or CDN video pattern detection
  if (url.includes('video/') || url.includes('/videos/') || url.includes('type=video')) {
    return true;
  }

  return false;
}

/**
 * Robust detection for audio media (MP3, WAV, AAC, FLAC, OGG audio, etc.)
 */
export function isAudioMedia(artwork: Artwork | null | undefined): boolean {
  if (!artwork) return false;
  if ((artwork.category as string) === 'audio') return true;

  const url = (artwork.mediaUrl || '').toLowerCase().trim();
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  return audioExtensions.some(ext => url.includes(ext));
}

/**
 * Returns a high quality fallback image or poster if the artwork has a dedicated static cover.
 * For videos, returns undefined by default to prevent jarring mismatched image flashes before playback starts.
 */
export function getMediaPoster(artwork: Artwork | null | undefined): string | undefined {
  if (!artwork) return undefined;
  
  if (isVideoMedia(artwork)) {
    // Only return a poster if it's a dedicated non-default image that is NOT the blue placeholder
    if (
      artwork.thumbnailUrl &&
      artwork.thumbnailUrl.trim() !== '' &&
      !artwork.thumbnailUrl.includes('photo-1618005182384-a83a8bd57fbe') &&
      !isVideoMedia({ ...artwork, mediaUrl: artwork.thumbnailUrl })
    ) {
      return artwork.thumbnailUrl;
    }
    return undefined;
  }

  if (artwork.thumbnailUrl && artwork.thumbnailUrl.trim() !== '') {
    return artwork.thumbnailUrl;
  }

  if (artwork.category === 'poetry') {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80';
  }

  return artwork.mediaUrl || '/curatorial-masterpiece.svg';
}
