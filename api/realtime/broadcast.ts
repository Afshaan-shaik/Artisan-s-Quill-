import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory global event buffer for edge functions
declare global {
  var __globalRealtimeEvents: Array<{ id: string; event: any; timestamp: number }> | undefined;
}

if (!globalThis.__globalRealtimeEvents) {
  globalThis.__globalRealtimeEvents = [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const event = req.body;
    if (event && event.type) {
      const entry = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        event,
        timestamp: Date.now()
      };
      globalThis.__globalRealtimeEvents!.push(entry);
      // Keep last 100 events
      if (globalThis.__globalRealtimeEvents!.length > 100) {
        globalThis.__globalRealtimeEvents!.splice(0, globalThis.__globalRealtimeEvents!.length - 100);
      }
      return res.status(200).json({ success: true, eventId: entry.id });
    }
    return res.status(400).json({ error: 'Invalid event payload' });
  }

  if (req.method === 'GET') {
    const since = parseInt(req.query.since as string) || 0;
    const events = (globalThis.__globalRealtimeEvents || [])
      .filter((e) => e.timestamp > since)
      .map((e) => e.event);
    return res.status(200).json({ events, timestamp: Date.now() });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
