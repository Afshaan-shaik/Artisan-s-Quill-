import { Artwork, Comment, MarginReflection } from '../types';
import { subscribeToCloudArtworks, subscribeToCloudComments, syncArtworkToCloud, syncArtworkLikeToCloud, syncCommentToCloud } from './firebase';
import {
  getSupabaseClient,
  CloudArtworkRow,
  mapRowToArtwork,
  saveArtworkToSupabase,
  updateArtworkInSupabase,
  addCommentToSupabase,
  addMarginReflectionToSupabase
} from './supabaseClient';

export type RealtimeEvent =
  | { type: 'ARTWORK_ADDED'; payload: Artwork }
  | { type: 'ARTWORK_UPDATED'; payload: { id: string; updates: Partial<Artwork> } }
  | { type: 'ARTWORK_DELETED'; payload: { id: string } }
  | { type: 'LIKE_UPDATED'; payload: { artworkId: string; likesCount: number } }
  | { type: 'SAVE_UPDATED'; payload: { artworkId: string; savesCount: number } }
  | { type: 'COMMENT_ADDED'; payload: { artworkId: string; comment: Comment } }
  | { type: 'MARGIN_ADDED'; payload: { artworkId: string; reflection: MarginReflection } };

type RealtimeListener = (event: RealtimeEvent) => void;

class RealtimeBroker {
  private listeners: Set<RealtimeListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeFirestoreArtworks: (() => void) | null = null;
  private unsubscribeFirestoreComments: (() => void) | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Native BroadcastChannel for instantaneous zero-latency cross-tab sync
    if ('BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('artisans_quill_realtime_v1');
        this.broadcastChannel.onmessage = (e: MessageEvent<RealtimeEvent>) => {
          if (e.data && e.data.type) {
            this.emit(e.data, false);
          }
        };
      } catch (err) {
        console.warn('[RealtimeBroker] BroadcastChannel init error:', err);
      }
    }

    // 2. Cloud Firestore Real-time Edge WebSocket Listener
    this.unsubscribeFirestoreArtworks = subscribeToCloudArtworks((cloudArtworks) => {
      cloudArtworks.forEach((art) => {
        this.emit({ type: 'ARTWORK_ADDED', payload: art }, false);
      });
    });

    this.unsubscribeFirestoreComments = subscribeToCloudComments((cloudComments) => {
      cloudComments.forEach((comm) => {
        this.emit({ type: 'COMMENT_ADDED', payload: { artworkId: comm.artworkId, comment: comm } }, false);
      });
    });

    // 3. Supabase Realtime Channel (Postgres Changes for 500+ Concurrent Artists)
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase
          .channel('public:atelier_live_stream')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'artworks' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const rec = payload.new as CloudArtworkRow;
                if (rec && rec.id) {
                  const artwork = mapRowToArtwork(rec);
                  this.emit({ type: 'ARTWORK_ADDED', payload: artwork }, false);
                }
              } else if (payload.eventType === 'UPDATE') {
                const rec = payload.new as CloudArtworkRow;
                if (rec && rec.id) {
                  if (rec.is_deleted) {
                    this.emit({ type: 'ARTWORK_DELETED', payload: { id: rec.id } }, false);
                  } else {
                    const artwork = mapRowToArtwork(rec);
                    this.emit(
                      {
                        type: 'ARTWORK_UPDATED',
                        payload: { id: rec.id, updates: artwork }
                      },
                      false
                    );
                    if (rec.likes_count !== undefined) {
                      this.emit(
                        {
                          type: 'LIKE_UPDATED',
                          payload: { artworkId: rec.id, likesCount: rec.likes_count }
                        },
                        false
                      );
                    }
                    if (rec.saves_count !== undefined) {
                      this.emit(
                        {
                          type: 'SAVE_UPDATED',
                          payload: { artworkId: rec.id, savesCount: rec.saves_count }
                        },
                        false
                      );
                    }
                  }
                }
              } else if (payload.eventType === 'DELETE') {
                const rec = payload.old as { id: string };
                if (rec && rec.id) {
                  this.emit({ type: 'ARTWORK_DELETED', payload: { id: rec.id } }, false);
                }
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'comments' },
            (payload) => {
              const row = payload.new as any;
              if (row && row.id && row.artwork_id) {
                const comment: Comment = {
                  id: row.id,
                  artworkId: row.artwork_id,
                  user: {
                    id: row.user_id || 'guest',
                    name: row.user_name || 'Guest Critic',
                    handle: row.user_handle || '@guest',
                    avatar: row.user_avatar || '/curatorial-masterpiece.svg',
                    verified: row.user_verified ?? false
                  },
                  text: row.text,
                  createdAt: row.created_at || new Date().toISOString(),
                  likesCount: row.likes_count || 0
                };
                this.emit({ type: 'COMMENT_ADDED', payload: { artworkId: row.artwork_id, comment } }, false);
              }
            }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'margin_reflections' },
            (payload) => {
              const row = payload.new as any;
              if (row && row.id && row.artwork_id) {
                const reflection: MarginReflection = {
                  id: row.id,
                  artworkId: row.artwork_id,
                  stanzaIndex: row.stanza_index || 0,
                  lineIndex: row.line_index,
                  verseSnippet: row.verse_snippet,
                  author: {
                    id: row.user_id || 'poet',
                    name: row.author_name || 'Sanctuary Poet',
                    handle: row.author_handle || '@poet',
                    avatar: row.author_avatar || '/curatorial-masterpiece.svg',
                    verified: row.author_verified ?? false
                  },
                  text: row.text,
                  inkColor: row.ink_color || 'gold',
                  createdAt: row.created_at || new Date().toISOString(),
                  upvotes: row.upvotes || 1,
                  isCuratorPick: row.is_curator_pick ?? false
                };
                this.emit({ type: 'MARGIN_ADDED', payload: { artworkId: row.artwork_id, reflection } }, false);
              }
            }
          )
          .subscribe();
      }
    } catch (err) {
      console.warn('[RealtimeBroker] Supabase realtime setup note:', err);
    }

    // 4. Server-Sent Events (SSE) Stream for Cross-Browser / Multi-Context instant sync
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        const sse = new EventSource('/api/realtime/stream');
        sse.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data && data.type && data.type !== 'CONNECTED') {
              this.emit(data, false);
            }
          } catch {}
        };
      } catch {}
    }

    // 5. Resilient serverless event polling fallback for edge environments
    if (typeof window !== 'undefined') {
      let lastSyncTimestamp = Date.now();
      setInterval(async () => {
        try {
          const res = await fetch(`/api/realtime/broadcast?since=${lastSyncTimestamp}`);
          if (res.ok) {
            const data = await res.json();
            if (data.events && Array.isArray(data.events)) {
              data.events.forEach((evt: RealtimeEvent) => {
                this.emit(evt, false);
              });
            }
            if (data.timestamp) {
              lastSyncTimestamp = data.timestamp;
            }
          }
        } catch {}
      }, 1000);
    }
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(event: RealtimeEvent, shouldBroadcast = true) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[RealtimeBroker] Error in listener:', err);
      }
    });

    if (shouldBroadcast) {
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage(event);
        } catch (err) {
          console.warn('[RealtimeBroker] Broadcast postMessage error:', err);
        }
      }

      // Forward to local server SSE broadcaster for multi-context propagation
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/realtime/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        }).catch(() => {});
      }
    }
  }

  public broadcastArtwork(artwork: Artwork) {
    this.emit({ type: 'ARTWORK_ADDED', payload: artwork }, true);
    // Push to Supabase Postgres and Cloud
    saveArtworkToSupabase(artwork).catch(() => {});
    syncArtworkToCloud(artwork).catch(() => {});
  }

  public broadcastLike(artworkId: string, likesCount: number) {
    this.emit({ type: 'LIKE_UPDATED', payload: { artworkId, likesCount } }, true);
    // Push to Supabase Postgres and Cloud
    updateArtworkInSupabase(artworkId, { likesCount }).catch(() => {});
    syncArtworkLikeToCloud(artworkId, likesCount).catch(() => {});
  }

  public broadcastSave(artworkId: string, savesCount: number) {
    this.emit({ type: 'SAVE_UPDATED', payload: { artworkId, savesCount } }, true);
    // Push to Supabase Postgres
    updateArtworkInSupabase(artworkId, { savesCount }).catch(() => {});
  }

  public broadcastComment(artworkId: string, comment: Comment) {
    this.emit({ type: 'COMMENT_ADDED', payload: { artworkId, comment } }, true);
    // Push to Supabase Postgres and Cloud
    addCommentToSupabase(comment).catch(() => {});
    syncCommentToCloud(comment).catch(() => {});
  }

  public broadcastMargin(artworkId: string, reflection: MarginReflection) {
    this.emit({ type: 'MARGIN_ADDED', payload: { artworkId, reflection } }, true);
    addMarginReflectionToSupabase(reflection).catch(() => {});
  }
}

export const realtimeBroker = new RealtimeBroker();
