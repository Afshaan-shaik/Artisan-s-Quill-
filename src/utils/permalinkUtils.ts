import { Artwork } from '../types';

const CANONICAL_PRODUCTION_DOMAIN = 'https://the-artisans-quill-digital-art-poet.vercel.app';
const DEFAULT_SITE_TITLE = "The Artisan's Quill — Digital Fine Art & Poetry Gallery";

/**
 * Sanitizes an extracted artwork ID:
 * Removes URL encoding, trims whitespace, and strips trailing punctuation
 * commonly appended by messaging apps (e.g., Telegram, WhatsApp, email clients).
 */
function cleanArtworkId(raw: string): string | null {
  if (!raw) return null;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // Strip trailing punctuation (. , ! ? ; " ' ) and slashes
  decoded = decoded.replace(/[.,!?;:"')\]\/>]+$/, '').trim();

  return decoded.length > 0 ? decoded : null;
}

/**
 * Robust, universal extractor for artwork ID from any URL, Location object, or current browser window.
 * Supports:
 *  - Query parameters: ?artwork=..., ?art=..., ?piece=..., ?id=...
 *  - Path-based routes: /artwork/:id, /art/:id, /piece/:id
 *  - Hash-based routes: #artwork-:id, #/artwork/:id, #art-:id, #/art/:id
 *  - Messaging app extra parameters: e.g. ?artwork=art-123&utm_source=whatsapp
 */
export function extractArtworkIdFromLocation(
  target?: Location | string | { search?: string; pathname?: string; hash?: string }
): string | null {
  let search = '';
  let pathname = '';
  let hash = '';

  if (typeof target === 'string') {
    try {
      const parsed = new URL(target, 'http://localhost');
      search = parsed.search;
      pathname = parsed.pathname;
      hash = parsed.hash;
    } catch {
      // If not a full URL, attempt direct query/hash search
      const qIndex = target.indexOf('?');
      const hIndex = target.indexOf('#');
      if (qIndex !== -1) {
        search = target.slice(qIndex, hIndex !== -1 ? hIndex : undefined);
      }
      if (hIndex !== -1) {
        hash = target.slice(hIndex);
      }
      pathname = target.replace(/[?#].*$/, '');
    }
  } else if (target && typeof target === 'object') {
    search = target.search || '';
    pathname = target.pathname || '';
    hash = target.hash || '';
  } else if (typeof window !== 'undefined') {
    search = window.location.search || '';
    pathname = window.location.pathname || '';
    hash = window.location.hash || '';
  } else {
    return null;
  }

  // 1. Check Search Parameters: ?artwork=... / ?art=... / ?piece=... / ?id=...
  if (search) {
    try {
      const params = new URLSearchParams(search);
      const queryId =
        params.get('artwork') ||
        params.get('art') ||
        params.get('piece') ||
        params.get('id');

      if (queryId) {
        const cleaned = cleanArtworkId(queryId);
        if (cleaned) return cleaned;
      }
    } catch {
      // Fallback regex for search query params
      const match = search.match(/[?&](?:artwork|art|piece|id)=([^&#]+)/i);
      if (match && match[1]) {
        const cleaned = cleanArtworkId(match[1]);
        if (cleaned) return cleaned;
      }
    }
  }

  // 2. Check Pathname: /artwork/:id or /art/:id or /piece/:id
  if (pathname) {
    const pathMatch = pathname.match(/\/(?:artwork|art|piece)\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) {
      const cleaned = cleanArtworkId(pathMatch[1]);
      if (cleaned) return cleaned;
    }
  }

  // 3. Check Hash: #artwork-:id, #/artwork/:id, #art-:id, #/art/:id
  if (hash) {
    const hashMatch = hash.match(/#(?:(?:\/)?(?:artwork|art|piece)(?:[\/-]))([^/?#]+)/i);
    if (hashMatch && hashMatch[1]) {
      const cleaned = cleanArtworkId(hashMatch[1]);
      if (cleaned) return cleaned;
    }

    if (hash.startsWith('#artwork-')) {
      const cleaned = cleanArtworkId(hash.replace('#artwork-', ''));
      if (cleaned) return cleaned;
    }

    if (hash.startsWith('#art-')) {
      const cleaned = cleanArtworkId(hash.replace('#art-', ''));
      if (cleaned) return cleaned;
    }
  }

  return null;
}

/**
 * Returns the standardized canonical permalink for any artwork.
 * Always resolves to a clean root URL with `?artwork=<id>` for universal cross-platform compatibility.
 */
export function getCanonicalArtworkUrl(artworkId: string): string {
  const cleanId = cleanArtworkId(artworkId) || artworkId;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : CANONICAL_PRODUCTION_DOMAIN;

  return `${origin}/?artwork=${encodeURIComponent(cleanId)}`;
}

/**
 * Synchronizes the browser address bar and document title with the active artwork without reloading.
 */
export function syncArtworkUrl(artwork: Artwork | null, mode: 'push' | 'replace' = 'push'): void {
  if (typeof window === 'undefined') return;

  try {
    const currentUrl = new URL(window.location.href);

    if (artwork && artwork.id) {
      currentUrl.searchParams.set('artwork', artwork.id);
      currentUrl.searchParams.delete('art');
      currentUrl.searchParams.delete('piece');
      currentUrl.searchParams.delete('id');

      // If pathname had /artwork/:id, normalize to root
      if (/\/(?:artwork|art|piece)\//i.test(currentUrl.pathname)) {
        currentUrl.pathname = '/';
      }

      const targetTitle = `${artwork.title || 'Masterpiece'} — The Artisan's Quill`;
      document.title = targetTitle;

      if (mode === 'replace') {
        window.history.replaceState({ artworkId: artwork.id }, targetTitle, currentUrl.toString());
      } else {
        // Only push if the ID isn't already the same in search
        const existingId = new URLSearchParams(window.location.search).get('artwork');
        if (existingId !== artwork.id) {
          window.history.pushState({ artworkId: artwork.id }, targetTitle, currentUrl.toString());
        } else {
          window.history.replaceState({ artworkId: artwork.id }, targetTitle, currentUrl.toString());
        }
      }
    } else {
      currentUrl.searchParams.delete('artwork');
      currentUrl.searchParams.delete('art');
      currentUrl.searchParams.delete('piece');
      currentUrl.searchParams.delete('id');

      if (/\/(?:artwork|art|piece)\//i.test(currentUrl.pathname)) {
        currentUrl.pathname = '/';
      }

      document.title = DEFAULT_SITE_TITLE;

      const cleanSearch = currentUrl.searchParams.toString();
      const cleanUrl =
        currentUrl.pathname +
        (cleanSearch ? `?${cleanSearch}` : '') +
        (currentUrl.hash && !currentUrl.hash.startsWith('#artwork-') ? currentUrl.hash : '');

      if (mode === 'replace') {
        window.history.replaceState({}, DEFAULT_SITE_TITLE, cleanUrl);
      } else {
        window.history.pushState({}, DEFAULT_SITE_TITLE, cleanUrl);
      }
    }
  } catch (err) {
    console.warn('[permalinkUtils] URL sync warning:', err);
  }
}

/**
 * Pre-formats rich social sharing payloads with canonical permalinks.
 */
export function getArtworkSharePayload(artwork: Artwork) {
  const permalink = getCanonicalArtworkUrl(artwork.id);
  const title = artwork.title || 'Curated Masterpiece';
  const artistName =
    typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist || 'Sanctuary Artist';
  const description = artwork.description || 'Curated on The Artisan’s Quill digital sanctuary.';

  const shareText = `Admiring "${title}" by ${artistName} on @TheArtisansQuill ✨\n\nDirect View: ${permalink}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(permalink)}&text=${encodeURIComponent(
    `"${title}" by ${artistName} — The Artisan's Quill`
  )}`;

  const emailSubject = `Curatorial Discovery: "${title}" by ${artistName}`;
  const emailBody = `Greetings,\n\nI thought you would appreciate this creation from The Artisan's Quill sanctuary:\n\n"${title}" by ${artistName}\n${description}\n\nView this artwork directly in full gallery resolution:\n${permalink}\n\n— The Artisan's Quill Atelier`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  return {
    permalink,
    title,
    artistName,
    shareText,
    twitterUrl,
    whatsappUrl,
    telegramUrl,
    mailUrl,
    emailSubject,
    emailBody
  };
}
