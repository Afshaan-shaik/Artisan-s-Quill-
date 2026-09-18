import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://uskuzbtvbhfqlxvbbrvw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const SYNC_SECRET = process.env.SYNC_ADMIN_SECRET || 'artisan-sync-admin-2026';

interface UserSyncPayload {
  id?: string;
  name: string;
  handle: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  discipline?: string;
  location?: string;
  verified?: boolean;
  badges?: string[];
}

/**
 * POST /api/auth/sync-users
 * Bulk-syncs a batch of artist user profiles into:
 *   1. Supabase Auth (creates auth record with email_confirm: true)
 *   2. Supabase Postgres `profiles` table (upserts full profile)
 *
 * Request body:
 *   { secret: string, users: UserSyncPayload[] }
 *
 * Returns per-user success/failure report.
 *
 * Protected by SYNC_ADMIN_SECRET env var.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { secret, users } = req.body || {};

  // Admin secret check
  if (!secret || secret !== SYNC_SECRET) {
    return res.status(403).json({ error: 'Forbidden: invalid sync secret.' });
  }

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ error: 'users array is required and must not be empty.' });
  }

  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) {
    return res.status(503).json({ error: 'Supabase service role key is not configured on server.' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const results: { handle: string; email: string; authStatus: string; profileStatus: string; userId: string }[] = [];

  for (const user of users as UserSyncPayload[]) {
    const cleanHandle = user.handle?.trim().startsWith('@')
      ? user.handle.trim()
      : `@${user.handle?.trim() || 'artist'}`;
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const userId = user.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Skip guest/visitor accounts
    if (
      cleanHandle === '@visitor' ||
      cleanHandle === '@guest' ||
      cleanEmail === '' ||
      cleanEmail.includes('placeholder')
    ) {
      results.push({
        handle: cleanHandle,
        email: cleanEmail,
        authStatus: 'skipped (guest/placeholder)',
        profileStatus: 'skipped',
        userId
      });
      continue;
    }

    // Skip obviously fake / placeholder emails
    if (cleanEmail.endsWith('@atelier.art') || cleanEmail.includes('@probe_artist')) {
      results.push({
        handle: cleanHandle,
        email: cleanEmail,
        authStatus: 'skipped (auto-generated email)',
        profileStatus: 'skipped',
        userId
      });
      continue;
    }

    let authUserId = userId;
    let authStatus = 'unknown';

    // 1. Sync to Supabase Auth
    const defaultPassword = user.password?.trim() || `atelier-${cleanHandle.replace('@', '')}-2026`;
    try {
      // Try to create the auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: user.name || cleanHandle,
          handle: cleanHandle,
          avatar_url: user.avatar || '/curatorial-masterpiece.svg',
          discipline: user.discipline || 'Visual Arts & Creative Writing',
          bio: user.bio || 'Fine art creator on The Artisan\'s Quill.',
          location: user.location || 'Studio Atelier'
        }
      });

      if (!authError && authData.user) {
        authUserId = authData.user.id;
        authStatus = 'created';
      } else if (authError?.message?.includes('already been registered') || authError?.message?.includes('already exists')) {
        // User exists — look up their existing Supabase Auth ID
        const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existingUser = existing?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (existingUser) {
          authUserId = existingUser.id;
          // Update their metadata to ensure it's current
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            user_metadata: {
              name: user.name || cleanHandle,
              handle: cleanHandle,
              avatar_url: user.avatar || '/curatorial-masterpiece.svg',
              discipline: user.discipline || 'Visual Arts & Creative Writing',
              bio: user.bio || 'Fine art creator on The Artisan\'s Quill.',
              location: user.location || 'Studio Atelier'
            }
          });
          authStatus = 'already_exists_updated';
        } else {
          authStatus = 'already_exists';
        }
      } else {
        authStatus = `auth_error: ${authError?.message || 'unknown'}`;
      }
    } catch (e: any) {
      authStatus = `exception: ${e?.message || 'unknown'}`;
    }

    // 2. Sync to Supabase Postgres profiles table
    // Use the Supabase Auth UUID when available, else fall back to local ID
    const finalId = authUserId !== userId ? authUserId : userId;
    let profileStatus = 'unknown';

    try {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
        {
          id: finalId,
          name: user.name || cleanHandle,
          handle: cleanHandle,
          email: cleanEmail,
          avatar_url: user.avatar || '/curatorial-masterpiece.svg',
          bio: user.bio || 'Fine art creator on The Artisan\'s Quill.',
          discipline: user.discipline || 'Visual Arts & Creative Writing',
          location: user.location || 'Studio Atelier',
          verified: user.verified ?? true,
          badges: user.badges || ['Verified Artist'],
          updated_at: new Date().toISOString()
        },
        { onConflict: 'handle' }
      );

      if (!profileError) {
        profileStatus = 'upserted';
      } else {
        // Try with id conflict resolution
        const { error: profileError2 } = await supabaseAdmin.from('profiles').upsert(
          {
            id: finalId,
            name: user.name || cleanHandle,
            handle: cleanHandle,
            email: cleanEmail,
            avatar_url: user.avatar || '/curatorial-masterpiece.svg',
            bio: user.bio || 'Fine art creator on The Artisan\'s Quill.',
            discipline: user.discipline || 'Visual Arts & Creative Writing',
            location: user.location || 'Studio Atelier',
            verified: user.verified ?? true,
            badges: user.badges || ['Verified Artist'],
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );
        profileStatus = profileError2 ? `profile_error: ${profileError2.message}` : 'upserted_by_id';
      }
    } catch (e: any) {
      profileStatus = `profile_exception: ${e?.message || 'unknown'}`;
    }

    results.push({
      handle: cleanHandle,
      email: cleanEmail,
      authStatus,
      profileStatus,
      userId: finalId
    });
  }

  const created = results.filter(r => r.authStatus === 'created').length;
  const updated = results.filter(r => r.authStatus.includes('exists')).length;
  const skipped = results.filter(r => r.authStatus.includes('skipped')).length;
  const failed = results.filter(r => r.authStatus.includes('error') || r.authStatus.includes('exception')).length;

  return res.status(200).json({
    success: true,
    summary: {
      total: results.length,
      created,
      updated,
      skipped,
      failed
    },
    results
  });
}
