import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://uskuzbtvbhfqlxvbbrvw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const FOUNDER_EMAIL = 'afshaan100@gmail.com';
const FOUNDER_PASSCODES = ['atelier2026', 'sanctuary2026', 'afshaan2026', 'sanctuary@2026', 'atelier@2026'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { identifier, password } = req.body || {};

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Artist handle/email and password are required.' });
    }

    const query = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Founder Authentication Fast-Path
    const isFounderQuery =
      query === FOUNDER_EMAIL ||
      query === '@afshaanshaikh' ||
      query === 'afshaanshaikh' ||
      query === '@afshaan' ||
      query === 'afshaan' ||
      query === '@afshaan.creator' ||
      query === 'afshaan.creator';

    if (isFounderQuery) {
      if (FOUNDER_PASSCODES.includes(cleanPass)) {
        let founderAvatar = 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg';
        
        // Fetch latest founder profile from Supabase if available
        if (SUPABASE_URL && (SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)) {
          try {
            const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);
            const { data } = await client.from('profiles').select('*').eq('id', 'user-my-atelier').single();
            if (data?.avatar_url) founderAvatar = data.avatar_url;
          } catch {}
        }

        const founderProfile = {
          id: 'user-my-atelier',
          name: 'Afshaan Shaikh',
          handle: '@afshaanshaikh',
          avatar: founderAvatar,
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
          bio: 'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.',
          discipline: 'Artist | Poet | Coder | Software Developer',
          location: 'Atelier Studio • Global Digital Sanctuary',
          email: FOUNDER_EMAIL,
          verified: true,
          artworksCount: 12,
          followersCount: 1420,
          followingCount: 18,
          badges: ['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder']
        };

        const tokenValue = encodeURIComponent(JSON.stringify(founderProfile));
        const isProduction = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
        res.setHeader('Set-Cookie', `__session=${tokenValue}; Path=/; Max-Age=1209600; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`);

        return res.status(200).json({
          success: true,
          user: founderProfile,
          message: 'Welcome back, Sanctuary Founder Afshaan Shaikh! Private atelier controls active.'
        });
      } else {
        return res.status(401).json({ error: 'Invalid founder passcode. Access restricted exclusively to Afshaan Shaikh.' });
      }
    }

    // 2. Standard Artist Account Authentication via Supabase
    if (!SUPABASE_URL) {
      return res.status(503).json({ error: 'Database service unavailable.' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY);
    const supabaseAdmin = SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : supabase;

    let targetEmail = query;

    // If identifier is a handle, look up user's email in profiles table
    if (!query.includes('@') || query.startsWith('@')) {
      const normalizedHandle = query.startsWith('@') ? query : `@${query}`;
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('handle', normalizedHandle)
        .maybeSingle();

      if (prof?.email) {
        targetEmail = prof.email;
      } else {
        return res.status(404).json({ error: `No registered artist account found for "${identifier}". Please verify your credentials or create a profile.` });
      }
    }

    // Attempt sign-in with email & password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: cleanPass
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Incorrect passcode or email for this artist account. Please try again.' });
    }

    // Retrieve full profile from profiles table
    const { data: profileRow } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    const userProfile = {
      id: authData.user.id,
      name: profileRow?.name || authData.user.user_metadata?.name || targetEmail.split('@')[0],
      handle: profileRow?.handle || authData.user.user_metadata?.handle || `@${targetEmail.split('@')[0]}`,
      avatar: profileRow?.avatar_url || authData.user.user_metadata?.avatar_url || '/curatorial-masterpiece.svg',
      bio: profileRow?.bio || 'Artist on The Artisan’s Quill.',
      discipline: profileRow?.discipline || 'Visual Artist & Poet',
      location: profileRow?.location || 'Global Atelier',
      email: targetEmail,
      verified: true,
      artworksCount: profileRow?.artworks_count || 0,
      followersCount: profileRow?.followers_count || 0,
      followingCount: profileRow?.following_count || 0,
      badges: profileRow?.badges || ['Verified Artist']
    };

    const tokenValue = encodeURIComponent(JSON.stringify(userProfile));
    const isProduction = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', `__session=${tokenValue}; Path=/; Max-Age=1209600; HttpOnly; SameSite=Lax${isProduction ? '; Secure' : ''}`);

    return res.status(200).json({
      success: true,
      user: userProfile,
      message: `Signed in successfully as ${userProfile.name}.`
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Authentication failed',
      details: error?.message || 'Internal server error'
    });
  }
}
