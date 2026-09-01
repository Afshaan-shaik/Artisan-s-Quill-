import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('xyzcompany')) {
    return res.status(200).json({
      success: true,
      data: [],
      notice: 'Supabase environment variables not configured yet.'
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (req.method === 'GET') {
    try {
      const category = req.query.category as string;
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, data: data || [] });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const artwork = req.body;
      if (!artwork || !artwork.id || !artwork.title) {
        return res.status(400).json({ error: 'Missing artwork required fields' });
      }

      const { data, error } = await supabase
        .from('artworks')
        .upsert(artwork, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
