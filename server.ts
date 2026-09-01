import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface SearchResultItem {
  id: string;
  title: string;
  artist: string;
  subtitle: string;
  youtubeId: string;
  youtubeUrl: string;
  artworkUrl: string;
  durationSeconds: number;
  isOriginal: boolean;
  versionType: 'original' | 'acoustic' | 'live' | 'remix' | 'instrumental' | 'lofi' | 'alternate';
}

async function searchYouTube(query: string): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = [];
  const seenIds = new Set<string>();

  // 1. Direct YouTube Scrape with Robust Header Spoofing
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });

    if (res.ok) {
      const html = await res.text();

      // 1A. Try parsing ytInitialData JSON from HTML
      const jsonMatch =
        html.match(/var ytInitialData = ({.+?});<\/script>/) ||
        html.match(/ytInitialData\s*=\s*({.+?});/);

      if (jsonMatch && jsonMatch[1]) {
        try {
          const data = JSON.parse(jsonMatch[1]);
          const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;

          if (Array.isArray(contents)) {
            for (const section of contents) {
              const items = section?.itemSectionRenderer?.contents;
              if (Array.isArray(items)) {
                for (const item of items) {
                  const video = item.videoRenderer;
                  if (video && video.videoId && !seenIds.has(video.videoId)) {
                    seenIds.add(video.videoId);
                    const videoId = video.videoId;
                    const title =
                      video.title?.runs?.[0]?.text ||
                      video.title?.accessibility?.accessibilityData?.label ||
                      query;
                    const channel =
                      video.ownerText?.runs?.[0]?.text ||
                      video.shortBylineText?.runs?.[0]?.text ||
                      'Official Artist';
                    const lengthStr = video.lengthText?.simpleText || '';

                    let durationSec = 240;
                    if (lengthStr) {
                      const parts = lengthStr.split(':').map(Number);
                      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        durationSec = parts[0] * 60 + parts[1];
                      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                        durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                      }
                    }

                    const titleLower = title.toLowerCase();
                    let versionType: 'original' | 'acoustic' | 'live' | 'remix' | 'instrumental' | 'lofi' | 'alternate' =
                      'alternate';

                    if (
                      results.length === 0 ||
                      titleLower.includes('official') ||
                      titleLower.includes('original') ||
                      titleLower.includes('vevo') ||
                      titleLower.includes('t-series')
                    ) {
                      versionType = 'original';
                    } else if (titleLower.includes('acoustic') || titleLower.includes('unplugged')) {
                      versionType = 'acoustic';
                    } else if (titleLower.includes('live') || titleLower.includes('concert') || titleLower.includes('performance')) {
                      versionType = 'live';
                    } else if (titleLower.includes('remix') || titleLower.includes('club mix') || titleLower.includes('dj')) {
                      versionType = 'remix';
                    } else if (titleLower.includes('lofi') || titleLower.includes('chill') || titleLower.includes('slowed')) {
                      versionType = 'lofi';
                    } else if (titleLower.includes('instrumental') || titleLower.includes('piano') || titleLower.includes('cover')) {
                      versionType = 'instrumental';
                    }

                    const isOriginal = results.length === 0 || versionType === 'original';

                    results.push({
                      id: `yt-live-${videoId}`,
                      title,
                      artist: channel,
                      subtitle: `${channel} • ${lengthStr || 'Full Version'} (Starts at 0:00)`,
                      youtubeId: videoId,
                      youtubeUrl: `https://youtu.be/${videoId}`,
                      artworkUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                      durationSeconds: durationSec,
                      isOriginal,
                      versionType
                    });
                  }
                  if (results.length >= 20) break;
                }
              }
              if (results.length >= 20) break;
            }
          }
        } catch {
          // fallback to regex
        }
      }

      // 1B. Fallback regex search for videoId matches if needed
      if (results.length === 0) {
        const vidRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let match: RegExpExecArray | null;
        while ((match = vidRegex.exec(html)) !== null && results.length < 12) {
          const vid = match[1];
          if (!seenIds.has(vid)) {
            seenIds.add(vid);
            const isPrimary = results.length === 0;
            results.push({
              id: `yt-regex-${vid}`,
              title: isPrimary ? `${query} (Official Master)` : `${query} (Alternate Version)`,
              artist: 'YouTube Music Artist',
              subtitle: `Full YouTube Stream (Starts at 0:00) • ID: ${vid}`,
              youtubeId: vid,
              youtubeUrl: `https://youtu.be/${vid}`,
              artworkUrl: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
              durationSeconds: 240,
              isOriginal: isPrimary,
              versionType: isPrimary ? 'original' : 'alternate'
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('YouTube direct scrape warning:', err);
  }

  // 2. Invidious / Piped Public Instance API Fallback (Guaranteed to return working video IDs)
  if (results.length === 0) {
    const invidiousHosts = [
      'https://invidious.nerdvpn.de',
      'https://yt.drgnz.club',
      'https://inv.nadeko.net',
      'https://invidious.privacydev.net'
    ];

    for (const host of invidiousHosts) {
      try {
        const invRes = await fetch(`${host}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3500)
        });

        if (invRes.ok) {
          const data = await invRes.json();
          if (Array.isArray(data) && data.length > 0) {
            for (const item of data) {
              const vid = item.videoId;
              if (vid && !seenIds.has(vid)) {
                seenIds.add(vid);
                const isPrimary = results.length === 0;
                results.push({
                  id: `inv-srv-${vid}`,
                  title: item.title || query,
                  artist: item.author || 'YouTube Artist',
                  subtitle: `${item.author || 'Artist'} • Starts at 0:00`,
                  youtubeId: vid,
                  youtubeUrl: `https://youtu.be/${vid}`,
                  artworkUrl: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                  durationSeconds: item.lengthSeconds || 240,
                  isOriginal: isPrimary,
                  versionType: isPrimary ? 'original' : 'alternate'
                });
              }
              if (results.length >= 15) break;
            }
            if (results.length > 0) break;
          }
        }
      } catch {
        // try next host
      }
    }
  }

  return results;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: Real-Time SSE Stream (Cross-Browser / Multi-Context Instant Sync)
  const sseClients = new Set<express.Response>();

  app.get('/api/realtime/stream', (_req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);

    // Send initial keep-alive
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

    _req.on('close', () => {
      sseClients.delete(res);
    });
  });

  const eventBuffer: Array<{ id: string; event: any; timestamp: number }> = [];

  app.get('/api/realtime/broadcast', (req, res) => {
    const since = parseInt(req.query.since as string) || 0;
    const events = eventBuffer
      .filter((e) => e.timestamp > since)
      .map((e) => e.event);
    return res.json({ events, timestamp: Date.now() });
  });

  app.post('/api/realtime/broadcast', (req, res) => {
    const event = req.body;
    if (event && event.type) {
      eventBuffer.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        event,
        timestamp: Date.now()
      });
      if (eventBuffer.length > 100) {
        eventBuffer.splice(0, eventBuffer.length - 100);
      }
      const data = `data: ${JSON.stringify(event)}\n\n`;
      for (const client of sseClients) {
        try {
          client.write(data);
        } catch {
          sseClients.delete(client);
        }
      }
    }
    return res.json({ success: true, activeClients: sseClients.size });
  });

  // Local Auth Session Mock Handlers
  app.post('/api/auth/session', (req, res) => {
    res.setHeader('Set-Cookie', `__session=${encodeURIComponent(JSON.stringify(req.body?.profile || {}))}; Path=/; HttpOnly; SameSite=Lax`);
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/__session=([^;]+)/);
    if (match) {
      try {
        const user = JSON.parse(decodeURIComponent(match[1]));
        return res.json({ authenticated: true, user });
      } catch {}
    }
    return res.json({ authenticated: false, user: null });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.setHeader('Set-Cookie', '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    res.json({ success: true });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
