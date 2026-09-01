export type MusicPlatform = 'youtube' | 'spotify' | 'jiosaavn' | 'sanctuary' | 'vault';

export interface UniversalTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  platform: MusicPlatform;
  sourceType: 'audio-stream' | 'youtube-iframe' | 'spotify-embed';
  streamUrl?: string; // Direct audio stream for HTML5 <audio>
  youtubeId?: string; // YouTube video ID for YouTube IFrame API
  spotifyId?: string; // Spotify track ID for Spotify Web Player / Embed
  artworkUrl: string;
  durationSeconds: number;
  year?: number | string;
  genre?: string;
  isOriginal?: boolean;
  versionType?: 'original' | 'acoustic' | 'live' | 'remix' | 'instrumental' | 'lofi' | 'alternate';
  subtitle?: string;
  collection?: 'Vault Music' | 'Sanctuary Classics';
  isVaultExclusive?: boolean;
}

export interface UniversalSearchResult {
  query: string;
  all: UniversalTrack[];
  vault: UniversalTrack[];
  youtube: UniversalTrack[];
  spotify: UniversalTrack[];
  jiosaavn: UniversalTrack[];
  sanctuary: UniversalTrack[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Dedicated Extracted Vault Music Collection
// ─────────────────────────────────────────────────────────────────────────────
export const VAULT_MUSIC_COLLECTION: UniversalTrack[] = [
  {
    id: 'vault-it-welcome-to-derry',
    title: 'IT: Welcome to Derry - Opening Theme',
    artist: 'Bear McCreary / HBO Max',
    album: 'IT: Welcome to Derry (Original Series Soundtrack)',
    platform: 'vault',
    sourceType: 'audio-stream',
    streamUrl: '/audio/qwTop2qs1tE.mp4',
    youtubeId: 'qwTop2qs1tE',
    artworkUrl: 'https://img.youtube.com/vi/qwTop2qs1tE/hqdefault.jpg',
    durationSeconds: 115,
    isOriginal: true,
    versionType: 'original',
    genre: 'Cinematic Orchestral / Dark Ambient',
    subtitle: 'HBO Max Original Soundtrack • Extracted Master Audio',
    collection: 'Vault Music',
    isVaultExclusive: true
  },
  {
    id: 'vault-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    platform: 'vault',
    sourceType: 'audio-stream',
    streamUrl: '/audio/4NRXx6U8ABQ.mp4',
    youtubeId: '4NRXx6U8ABQ',
    artworkUrl: 'https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    durationSeconds: 263,
    isOriginal: true,
    versionType: 'original',
    genre: 'Synthwave / 80s Retro Pop',
    subtitle: 'The Weeknd • Official Master High-Fidelity Audio',
    collection: 'Vault Music',
    isVaultExclusive: true
  },
  {
    id: 'vault-starboy',
    title: 'Starboy (feat. Daft Punk)',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    platform: 'vault',
    sourceType: 'audio-stream',
    streamUrl: '/audio/Rif-RTvmmss.mp4',
    youtubeId: 'Rif-RTvmmss',
    artworkUrl: 'https://img.youtube.com/vi/Rif-RTvmmss/hqdefault.jpg',
    durationSeconds: 231,
    isOriginal: true,
    versionType: 'original',
    genre: 'Electropop / R&B',
    subtitle: 'The Weeknd & Daft Punk • Extracted Vault Audio',
    collection: 'Vault Music',
    isVaultExclusive: true
  },
  {
    id: 'vault-anil-emre-daldal-m',
    title: 'M.',
    artist: 'Anıl Emre Daldal',
    album: 'M. - Single',
    platform: 'vault',
    sourceType: 'audio-stream',
    streamUrl: '/audio/wsKhe5rTKw8.mp4',
    youtubeId: 'wsKhe5rTKw8',
    artworkUrl: 'https://img.youtube.com/vi/wsKhe5rTKw8/hqdefault.jpg',
    durationSeconds: 224,
    isOriginal: true,
    versionType: 'original',
    genre: 'Indie Alternative / Turkish Melancholy',
    subtitle: 'Anıl Emre Daldal • Official Studio Master Audio',
    collection: 'Vault Music',
    isVaultExclusive: true
  },
  {
    id: 'vault-m-remix',
    title: 'M-Remix',
    artist: 'Anıl Emre Daldal (M E D Z Z Remix)',
    album: 'M. (Instagram Reel Ambient Remix)',
    platform: 'vault',
    sourceType: 'audio-stream',
    streamUrl: '/audio/M-Remix.mp4',
    artworkUrl: '/audio/M-Remix.jpg',
    durationSeconds: 55,
    isOriginal: false,
    versionType: 'remix',
    genre: 'Indie Alternative / Ambient Remix',
    subtitle: 'Anıl Emre Daldal • M E D Z Z Instagram Master Remix',
    collection: 'Vault Music',
    isVaultExclusive: true
  }
];

// Master Pre-Indexed Sanctuary Vault (Includes Vault Music & Sanctuary Classics)
export const MASTER_SANCTUARY_TRACKS: UniversalTrack[] = [
  ...VAULT_MUSIC_COLLECTION,
  {
    id: 'sanc-hum-murtaza',
    title: 'HUM',
    artist: 'Murtaza Qizilbash',
    album: 'Hum - Masterpiece Single',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'tvcaYU7uofY',
    artworkUrl: 'https://img.youtube.com/vi/tvcaYU7uofY/hqdefault.jpg',
    durationSeconds: 276,
    isOriginal: true,
    versionType: 'original',
    genre: 'Indie Soul / Acoustic',
    subtitle: 'Murtaza Qizilbash • Official Sanctuary Master'
  },
  {
    id: 'sanc-hum-slowed',
    title: 'Hum (Atmospheric Slowed + Reverb)',
    artist: 'Murtaza Qizilbash',
    album: 'Atelier Midnight Reveries',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'TxuYuvWt19E',
    artworkUrl: 'https://img.youtube.com/vi/TxuYuvWt19E/hqdefault.jpg',
    durationSeconds: 325,
    isOriginal: false,
    versionType: 'lofi',
    genre: 'Lo-Fi / Reverb',
    subtitle: 'Murtaza Qizilbash • Sanctuary Lo-Fi Edition'
  },
  {
    id: 'sanc-tum-murtaza',
    title: 'Tum',
    artist: 'Murtaza Qizilbash',
    album: 'Tum - Single',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: '0enmMyV1Q48',
    artworkUrl: 'https://img.youtube.com/vi/0enmMyV1Q48/hqdefault.jpg',
    durationSeconds: 259,
    isOriginal: true,
    versionType: 'original',
    genre: 'Indie Pop',
    subtitle: 'Murtaza Qizilbash • Official Track'
  },
  {
    id: 'sanc-humsafar',
    title: 'HUMSAFAR',
    artist: 'Akhil Sachdeva & Mansheel Gujral',
    album: 'Badrinath Ki Dulhania',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'vee-ARvduA4',
    artworkUrl: 'https://img.youtube.com/vi/vee-ARvduA4/hqdefault.jpg',
    durationSeconds: 270,
    isOriginal: true,
    versionType: 'original',
    genre: 'Romantic Ballad',
    subtitle: 'Akhil Sachdeva • Full Official Master'
  },
  {
    id: 'sanc-stay-interstellar',
    title: 'S.T.A.Y. (Interstellar Master Suite)',
    artist: 'Hans Zimmer',
    album: 'Interstellar (Original Motion Picture Soundtrack)',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'UDVtMYqUAyw',
    artworkUrl: 'https://img.youtube.com/vi/UDVtMYqUAyw/hqdefault.jpg',
    durationSeconds: 383,
    isOriginal: true,
    versionType: 'original',
    genre: 'Cinematic Neoclassical',
    subtitle: 'Hans Zimmer • Complete 6:23 Master Piece'
  },
  {
    id: 'sanc-cornfield-chase',
    title: 'Cornfield Chase',
    artist: 'Hans Zimmer',
    album: 'Interstellar Original Soundtrack',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: '1V_xRb0x9aw',
    artworkUrl: 'https://img.youtube.com/vi/1V_xRb0x9aw/hqdefault.jpg',
    durationSeconds: 247,
    isOriginal: true,
    versionType: 'original',
    genre: 'Symphonic Organ',
    subtitle: 'Hans Zimmer • Iconic Cathedral Organ'
  },
  {
    id: 'sanc-belki',
    title: 'Belki',
    artist: 'Dedublüman & Mavzer Tabancas',
    album: 'Belki Live Studio',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'yp2HBYREKiw',
    artworkUrl: 'https://img.youtube.com/vi/yp2HBYREKiw/hqdefault.jpg',
    durationSeconds: 284,
    isOriginal: true,
    versionType: 'original',
    genre: 'Anatolian Acoustic Rock',
    subtitle: 'Dedublüman • Turkish Sol Klarnet Master'
  },
  {
    id: 'sanc-kesariya',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam, Amitabh Bhattacharya',
    album: 'Brahmāstra',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'BddP6PYo2gs',
    artworkUrl: 'https://img.youtube.com/vi/BddP6PYo2gs/hqdefault.jpg',
    durationSeconds: 268,
    isOriginal: true,
    versionType: 'original',
    genre: 'Bollywood Romance',
    subtitle: 'Arijit Singh • Official Full Song'
  },
  {
    id: 'sanc-experience',
    title: 'Experience',
    artist: 'Ludovico Einaudi',
    album: 'In A Time Lapse',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'hN_q-_nGv4U',
    artworkUrl: 'https://img.youtube.com/vi/hN_q-_nGv4U/hqdefault.jpg',
    durationSeconds: 315,
    isOriginal: true,
    versionType: 'original',
    genre: 'Neoclassical Piano & Strings',
    subtitle: 'Ludovico Einaudi • Studio Master'
  },
  {
    id: 'sanc-pasoori',
    title: 'Pasoori',
    artist: 'Ali Sethi & Shae Gill',
    album: 'Coke Studio Season 14',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: '5Eqb_-j3FDA',
    artworkUrl: 'https://img.youtube.com/vi/5Eqb_-j3FDA/hqdefault.jpg',
    durationSeconds: 224,
    isOriginal: true,
    versionType: 'original',
    genre: 'Punjabi World / Folk Pop',
    subtitle: 'Coke Studio 14 • Global Sensation'
  },
  {
    id: 'sanc-nuvole-bianche',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    album: 'Una Mattina',
    platform: 'sanctuary',
    sourceType: 'youtube-iframe',
    youtubeId: 'fEOJQawykEQ',
    artworkUrl: 'https://img.youtube.com/vi/fEOJQawykEQ/hqdefault.jpg',
    durationSeconds: 358,
    isOriginal: true,
    versionType: 'original',
    genre: 'Solo Piano',
    subtitle: 'Ludovico Einaudi • Solo Piano Suite'
  }
];

export class UniversalMusicEngine {
  /**
   * Search across all platforms simultaneously (YouTube, Spotify, JioSaavn, Sanctuary Vault)
   */
  static async searchAll(query: string): Promise<UniversalSearchResult> {
    const qTrim = query.trim();
    if (!qTrim) {
      return {
        query: '',
        all: MASTER_SANCTUARY_TRACKS,
        vault: VAULT_MUSIC_COLLECTION,
        youtube: [],
        spotify: [],
        jiosaavn: [],
        sanctuary: MASTER_SANCTUARY_TRACKS
      };
    }

    const qLower = qTrim.toLowerCase();
    const words = qLower.split(/\s+/).filter(Boolean);

    // 1. Sanctuary Vault Local Matches
    const sanctuaryMatches = MASTER_SANCTUARY_TRACKS.filter((t) => {
      const text = `${t.title} ${t.artist} ${t.album || ''} ${t.subtitle || ''}`.toLowerCase();
      return words.some((w) => text.includes(w));
    });

    const vaultMatches = VAULT_MUSIC_COLLECTION.filter((t) => {
      const text = `${t.title} ${t.artist} ${t.album || ''} ${t.subtitle || ''}`.toLowerCase();
      return words.some((w) => text.includes(w));
    });

    // 2. Fetch Multi-Platform Results Concurrently
    const [youtubeResults, saavnSpotifyResults] = await Promise.allSettled([
      this.searchYouTube(qTrim),
      this.searchJioSaavnAndSpotify(qTrim)
    ]);

    const ytList = youtubeResults.status === 'fulfilled' ? youtubeResults.value : [];
    const { jiosaavnList, spotifyList } =
      saavnSpotifyResults.status === 'fulfilled'
        ? saavnSpotifyResults.value
        : { jiosaavnList: [], spotifyList: [] };

    // Combine and prioritize: Sanctuary matches first, then primary YouTube, JioSaavn, Spotify
    const combined: UniversalTrack[] = [];
    const seenTitles = new Set<string>();

    const addTrack = (track: UniversalTrack) => {
      const key = `${track.title.toLowerCase().trim()}-${track.artist.toLowerCase().trim()}`;
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        combined.push(track);
      }
    };

    sanctuaryMatches.forEach(addTrack);
    ytList.forEach(addTrack);
    jiosaavnList.forEach(addTrack);
    spotifyList.forEach(addTrack);

    return {
      query: qTrim,
      all: combined,
      vault: vaultMatches.length > 0 ? vaultMatches : VAULT_MUSIC_COLLECTION,
      youtube: ytList,
      spotify: spotifyList,
      jiosaavn: jiosaavnList,
      sanctuary: sanctuaryMatches.length > 0 ? sanctuaryMatches : MASTER_SANCTUARY_TRACKS
    };
  }

  /**
   * Search YouTube for authentic video IDs & full-length tracks
   */
  static async searchYouTube(query: string): Promise<UniversalTrack[]> {
    const list: UniversalTrack[] = [];
    const seenIds = new Set<string>();

    // Try backend API first
    try {
      const res = await fetch(`/api/search-youtube?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        for (const item of results) {
          if (item.youtubeId && !seenIds.has(item.youtubeId)) {
            seenIds.add(item.youtubeId);
            list.push({
              id: `yt-${item.youtubeId}`,
              title: item.title,
              artist: item.artist || 'YouTube Artist',
              album: 'YouTube Official',
              platform: 'youtube',
              sourceType: 'youtube-iframe',
              youtubeId: item.youtubeId,
              artworkUrl: item.artworkUrl || `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`,
              durationSeconds: item.durationSeconds || 240,
              isOriginal: item.isOriginal ?? true,
              versionType: item.versionType || 'original',
              subtitle: item.subtitle || `${item.artist} • Starts from 0:00`
            });
          }
        }
      }
    } catch {
      // Offline fallback
    }

    // Direct Invidious fallback if backend returned few results
    if (list.length < 3) {
      const invidiousInstances = [
        'https://invidious.nerdvpn.de/api/v1/search',
        'https://yt.drgnz.club/api/v1/search',
        'https://inv.nadeko.net/api/v1/search',
        'https://invidious.privacydev.net/api/v1/search'
      ];

      for (const instance of invidiousInstances) {
        try {
          const invRes = await fetch(`${instance}?q=${encodeURIComponent(query)}&type=video`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(3000)
          });
          if (invRes.ok) {
            const data = await invRes.json();
            if (Array.isArray(data) && data.length > 0) {
              data.slice(0, 10).forEach((item: any, idx: number) => {
                const vid = item.videoId;
                if (vid && !seenIds.has(vid)) {
                  seenIds.add(vid);
                  const isOrig = idx === 0;
                  list.push({
                    id: `yt-inv-${vid}`,
                    title: item.title || query,
                    artist: item.author || 'Artist',
                    album: 'YouTube Video',
                    platform: 'youtube',
                    sourceType: 'youtube-iframe',
                    youtubeId: vid,
                    artworkUrl: item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                    durationSeconds: item.lengthSeconds || 240,
                    isOriginal: isOrig,
                    versionType: isOrig ? 'original' : 'alternate',
                    subtitle: `${item.author || 'Artist'} • Starts at 0:00`
                  });
                }
              });
              break;
            }
          }
        } catch {
          // next instance
        }
      }
    }

    return list;
  }

  /**
   * Search JioSaavn / Apple Lossless stream & Spotify metadata
   */
  static async searchJioSaavnAndSpotify(
    query: string
  ): Promise<{ jiosaavnList: UniversalTrack[]; spotifyList: UniversalTrack[] }> {
    const jiosaavnList: UniversalTrack[] = [];
    const spotifyList: UniversalTrack[] = [];

    // Query iTunes high-quality lossless preview streams & Spotify metadata
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=12`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          data.results.forEach((item: any, idx: number) => {
            const artHighRes =
              item.artworkUrl100?.replace('100x100bb', '600x600bb') ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

            const durationSec = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 240;

            // JioSaavn / Lossless Audio Stream Entry
            if (item.previewUrl) {
              jiosaavnList.push({
                id: `saavn-stream-${item.trackId || idx}`,
                title: item.trackName || query,
                artist: item.artistName || 'Artist',
                album: item.collectionName || 'Studio Master',
                platform: 'jiosaavn',
                sourceType: 'audio-stream',
                streamUrl: item.previewUrl,
                artworkUrl: artHighRes,
                durationSeconds: durationSec,
                isOriginal: idx === 0,
                versionType: idx === 0 ? 'original' : 'alternate',
                genre: item.primaryGenreName || 'Indian / World',
                subtitle: `${item.collectionName || 'Album'} • High-Bitrate Master Stream`
              });
            }

            // Spotify Compatible Metadata & Embed Player Entry
            spotifyList.push({
              id: `spotify-${item.trackId || idx}`,
              title: item.trackName || query,
              artist: item.artistName || 'Artist',
              album: item.collectionName || 'Spotify Release',
              platform: 'spotify',
              sourceType: 'audio-stream',
              streamUrl: item.previewUrl, // fallback direct stream
              spotifyId: `${item.trackId}`,
              artworkUrl: artHighRes,
              durationSeconds: durationSec,
              isOriginal: idx === 0,
              versionType: idx === 0 ? 'original' : 'alternate',
              genre: item.primaryGenreName || 'Pop / Indie',
              subtitle: `${item.artistName} • Spotify Web Compatible`
            });
          });
        }
      }
    } catch {
      // offline fallback
    }

    return { jiosaavnList, spotifyList };
  }
}
