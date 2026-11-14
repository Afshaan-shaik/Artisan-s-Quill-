/**
 * Centralized Audio URL Resolver for The Artisan's Quill
 * Ensures 100% robust playback for all sanctuary and community audio tracks.
 * Resolves YouTube URLs, local audio assets, and Supabase cloud storage fallbacks.
 */

import { Artwork } from '../types';

export const KNOWN_AUDIO_PRESETS: Record<string, string> = {
  'tvcaYU7uofY': '/audio/tvcaYU7uofY.mp4', // HUM - Murtaza Qizilbash
  '0enmMyV1Q48': '/audio/0enmMyV1Q48.mp4', // Tum - Murtaza Qizilbash
  '1F3Xb_f07Y4': '/audio/humsafar-ost-2012.mp3', // HUMSAFAR OST 2012 - Qurat-ul-Ain Balouch (QB)
  'vee-ARvduA4': '/audio/humsafar-ost-2012.mp3', // HUMSAFAR OST 2012 alternate
  'humsafar-ost-2012': '/audio/humsafar-ost-2012.mp3', // HUMSAFAR OST 2012
  'sanc-humsafar': '/audio/humsafar-ost-2012.mp3',
  'music-sanc-humsafar': '/audio/humsafar-ost-2012.mp3',
  'TxuYuvWt19E': '/audio/TxuYuvWt19E.mp4', // Hum Slowed Reverb
  '4NRXx6U8ABQ': '/audio/4NRXx6U8ABQ.mp4', // Blinding Lights
  'Rif-RTvmmss': '/audio/Rif-RTvmmss.mp4', // Starboy
  'wsKhe5rTKw8': '/audio/wsKhe5rTKw8.mp4', // M. - Anıl Emre Daldal / Cosmic Strings
  'UDVtMYqUAyw': '/audio/UDVtMYqUAyw.mp4', // S.T.A.Y. - Interstellar
  '1V_xRb0x9aw': '/audio/1V_xRb0x9aw.mp4', // Kesariya - Arijit Singh
  'yp2HBYREKiw': '/audio/yp2HBYREKiw.mp4', // Belki - Dedublüman
  'BddP6PYo2gs': '/audio/BddP6PYo2gs.mp4', // Experience - Ludovico Einaudi
  'hN_q-_nGv4U': '/audio/hN_q-_nGv4U.mp4', // Pasoori - Ali Sethi & Shae Gill
  '5Eqb_-j3FDA': '/audio/5Eqb_-j3FDA.mp4', // CO2 - Prateek Kuhad
  'fEOJQawykEQ': '/audio/fEOJQawykEQ.mp4', // Kahani Suno 2.0 - Kaifi Khalil
  'M-Remix': '/audio/M-Remix.mp4'         // M-Remix
};

/**
 * Filter out any Derry or obsolete reference across all systems
 */
export function isDerryArtwork(art?: any): boolean {
  if (!art) return false;
  const id = String(art.id || '');
  const title = String(art.title || '');
  const mediaUrl = String(art.mediaUrl || '');
  const audioUrl = String(art.musicData?.audioUrl || art.audioUrl || '');
  if (/derry/i.test(id) || /qwTop2qs1tE/i.test(id)) return true;
  if (/Welcome to Derry/i.test(title)) return true;
  if (/qwTop2qs1tE/i.test(mediaUrl) || /qwTop2qs1tE/i.test(audioUrl)) return true;
  return false;
}

const SUPABASE_AUDIO_BASE = 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/';

/**
 * Extracts YouTube video ID from any YouTube URL (watch, embed, short, thumbnail).
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|img\.youtube\.com\/vi\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

/**
 * Checks if a URL is a YouTube page/watch link (cannot be played directly by HTML5 <audio>).
 */
export function isYouTubeWatchUrl(url?: string | null): boolean {
  if (!url) return false;
  return /(?:youtube\.com\/watch|youtu\.be\/)/i.test(url);
}

/**
 * Returns a direct playable audio stream URL for any artwork or raw audio/media URL.
 */
export function resolveAudioUrl(input: Artwork | string | undefined | null, explicitYtId?: string): string {
  if (!input) return '';

  // Guaranteed Humsafar resolution: always plays the 2012 OST attached audio
  const inputTitle = typeof input === 'object' ? String(input.title || input.id || '') : String(input || '');
  if (/humsafar/i.test(inputTitle)) {
    return '/audio/humsafar-ost-2012.mp3';
  }

  let rawUrl = '';
  let ytId = explicitYtId || '';

  if (typeof input === 'object') {
    rawUrl = input.musicData?.audioUrl || input.mediaUrl || '';
    ytId = ytId || (input as any).videoData?.youtubeId || input.musicData?.composer || '';
    if (!ytId) {
      ytId = extractYouTubeId(rawUrl) || extractYouTubeId(input.thumbnailUrl) || '';
    }
  } else {
    rawUrl = input;
    if (!ytId) {
      ytId = extractYouTubeId(rawUrl) || '';
    }
  }

  // Check if ytId matches Humsafar presets
  if (ytId === '1F3Xb_f07Y4' || ytId === 'vee-ARvduA4' || ytId === 'humsafar-ost-2012') {
    return '/audio/humsafar-ost-2012.mp3';
  }

  // If a known YouTube ID is identified, use the high-fidelity pre-cached local stream
  if (ytId && KNOWN_AUDIO_PRESETS[ytId]) {
    return KNOWN_AUDIO_PRESETS[ytId];
  }

  // If the raw URL is a YouTube watch URL and we have an extracted ID
  const extracted = extractYouTubeId(rawUrl);
  if (extracted) {
    if (KNOWN_AUDIO_PRESETS[extracted]) {
      return KNOWN_AUDIO_PRESETS[extracted];
    }
    // Try the standard local audio file path
    return `/audio/${extracted}.mp4`;
  }

  // If it's an image URL mistakenly put as audio (e.g. img.youtube.com thumbnail)
  if (rawUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)) {
    if (extracted) {
      return `/audio/${extracted}.mp4`;
    }
    return '/audio/wsKhe5rTKw8.mp4';
  }

  return rawUrl;
}

/**
 * Returns an alternative fallback audio URL (such as Cloud Storage) if local file fails.
 */
export function getAudioFallbackUrl(currentSrc?: string | null): string | null {
  if (!currentSrc) return null;

  if (/humsafar/i.test(currentSrc)) {
    return `${SUPABASE_AUDIO_BASE}humsafar-ost-2012.mp3`;
  }

  // If currently using a local /audio/ path, fall back to Supabase Cloud Storage
  const match = currentSrc.match(/\/audio\/([a-zA-Z0-9_-]+)\.(mp4|m4a|mp3)/i);
  if (match) {
    const filename = match[1];
    const ext = match[2];
    return `${SUPABASE_AUDIO_BASE}${filename}.${ext}`;
  }

  // If currently on Supabase and it has a corresponding local path
  if (currentSrc.includes('supabase.co/storage')) {
    const matchSb = currentSrc.match(/\/uploads\/([a-zA-Z0-9_-]+)\.(mp4|m4a|mp3)/i);
    if (matchSb) {
      return `/audio/${matchSb[1]}.mp4`;
    }
  }

  return null;
}

