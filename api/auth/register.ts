import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://uskuzbtvbhfqlxvbbrvw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, handle, email, password, discipline, bio, location, avatar } = req.body || {};

    if (!name || !handle || !email || !password) {
      return res.status(400).json({ error: 'Full name, handle, email, and password are required.' });
    }

    const cleanHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Prevent claiming Sanctuary Founder handle/email
    if (
      cleanHandle.toLowerCase() === '@afshaanshaikh' ||
      cleanEmail === 'afshaan100@gmail.com'
    ) {
      return res.status(403).json({ error: 'Founder credentials are reserved exclusively for Sanctuary Founder Afshaan Shaikh.' });
    }

    let userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // If Supabase Service Key is available, provision user in Supabase Auth with auto-confirmed email
    if (SUPABASE_SERVICE_KEY && SUPABASE_URL) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: cleanName,
          handle: cleanHandle,
          avatar_url: avatar || '/curatorial-masterpiece.svg',
          discipline: discipline || 'Visual Arts & Creative Writing'
        }
      });

      if (!authError && authData.user) {
        userId = authData.user.id;
      } else if (authError && !authError.message.includes('already been registered')) {
        console.warn('[Register Endpoint] Supabase admin createUser notice:', authError.message);
      }

      // Upsert into Supabase Postgres profiles table
      try {
        await supabaseAdmin.from('profiles').upsert({
          id: userId,
          name: cleanName,
          handle: cleanHandle,
          email: cleanEmail,
          avatar_url: avatar || '/curatorial-masterpiece.svg',
          bio: bio || 'Fine art creator on The Artisan’s Quill.',
          discipline: discipline || 'Visual Arts & Creative Writing',
          location: location || 'Studio Atelier',
          verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'handle' });
      } catch (dbErr) {
        console.warn('[Register Endpoint] Profile table upsert notice:', dbErr);
      }
    }

    const userProfile = {
      id: userId,
      name: cleanName,
      handle: cleanHandle,
      email: cleanEmail,
      avatar: avatar || '/curatorial-masterpiece.svg',
      bio: bio || 'Fine art creator on The Artisan’s Quill.',
      discipline: discipline || 'Visual Arts & Creative Writing',
      location: location || 'Studio Atelier',
      verified: true,
      artworksCount: 0,
      followersCount: 0,
      followingCount: 0,
      badges: ['Verified Artist']
    };

    // Set secure HTTP-only cookie for session isolation
    const tokenValue = encodeURIComponent(JSON.stringify(userProfile));
    const isProduction = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    const cookieString = `__session=${tokenValue}; Path=/; Max-Age=1209600; HttpOnly; SameSite=Lax${
      isProduction ? '; Secure' : ''
    }`;
    res.setHeader('Set-Cookie', cookieString);

    return res.status(200).json({
      success: true,
      user: userProfile,
      message: 'Artist Profile successfully created and verified.'
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Registration failed',
      details: error?.message || 'Internal server error'
    });
  }
}
