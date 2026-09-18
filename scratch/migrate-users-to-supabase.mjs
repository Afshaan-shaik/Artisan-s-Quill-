/**
 * migrate-users-to-supabase.mjs
 *
 * One-time migration script that syncs ALL known users to Supabase Auth + profiles table.
 * Includes:
 *   - Sanctuary Founder (Afshaan Shaikh)
 *   - All seed/initial artist profiles from initialData.ts
 *   - Any real users found in the Supabase profiles table who are missing from Auth
 *
 * Usage:
 *   node scratch/migrate-users-to-supabase.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment or .env file.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uskuzbtvbhfqlxvbbrvw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY is required. Set it in your environment.');
  console.error('    Example: $env:SUPABASE_SERVICE_ROLE_KEY="your-key" ; node scratch/migrate-users-to-supabase.mjs');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ──────────────────────────────────────────────────────────────────────────────
// KNOWN USERS TO MIGRATE
// These are all the canonical artist profiles known to the platform.
// Real sign-ups will be discovered automatically from the profiles table below.
// ──────────────────────────────────────────────────────────────────────────────
const KNOWN_USERS = [
  {
    id: 'user-my-atelier',
    name: 'Afshaan Shaikh',
    handle: '@afshaanshaikh',
    email: 'afshaan100@gmail.com',
    password: 'atelier2026',           // Founder passcode → their Supabase Auth password
    discipline: 'Artist | Poet | Coder | Software Developer',
    bio: 'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.',
    location: 'Atelier Studio • Global Digital Sanctuary',
    avatar: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg',
    verified: true,
    badges: ['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder']
  },
  {
    id: 'artist-1',
    name: 'Julian Thorne',
    handle: '@julianthorne',
    email: 'contact@julianthorne.art',
    discipline: 'Oil & Pigment Painting',
    bio: 'Contemporary abstract expressionist exploring deep earth pigments, mineral layers, and gold leaf on heavy linen.',
    location: 'Edinburgh, UK',
    avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['Oil Master', 'Exhibition Laureate']
  },
  {
    id: 'artist-2',
    name: 'Aria Chen',
    handle: '@ariachen.verse',
    email: 'aria@ariachen.verse',
    discipline: 'Poetic Literature & Lyrical Stanzas',
    bio: 'Poet and essayist writing on rain meditations, silence, architecture, and sensory verse.',
    location: 'Kyoto, Japan',
    avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['Lyric Laureate', 'Sanctuary Poet']
  },
  {
    id: 'artist-3',
    name: 'Kaelen Vance',
    handle: '@kaelen.vfx',
    email: 'studio@kaelenvfx.de',
    discipline: 'Macro Cinematography & Motion Loops',
    bio: 'Digital filmmaker and motion artist exploring organic fluid dynamics and high-speed macro loops.',
    location: 'Berlin, Germany',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['Motion Director', 'Digital Alchemist']
  },
  {
    id: 'artist-4',
    name: 'Mathieu Laurent',
    handle: '@mathieu.ink',
    email: 'mathieu@laurentstudio.fr',
    discipline: 'Charcoal, Graphite & Sumi Ink',
    bio: 'Master of vine charcoal, compressed graphite, and sumi ink washes on heavyweight Arches cotton paper.',
    location: 'Lyon, France',
    avatar: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['Carbon Draftsman', 'Ink Master']
  },
  {
    id: 'artist-6',
    name: 'Dr. Soraya Malek',
    handle: '@soraya.digital',
    email: 'malek@cern-art.ch',
    discipline: 'Generative Neural Shaders & 3D Media',
    bio: 'Computational researcher and generative artist visualizing subconscious memory recall as interlocking photonic crystal lattices.',
    location: 'Geneva, Switzerland',
    avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    verified: true,
    badges: ['Generative Pioneer', 'Shader Architect']
  }
];

// ──────────────────────────────────────────────────────────────────────────────
// STEP 1: Discover any extra users who registered via the app but aren't in
//         the known list above — fetch them from the profiles table
// ──────────────────────────────────────────────────────────────────────────────
async function discoverExtraUsers() {
  console.log('\n🔍  Discovering additional users from Supabase profiles table...');
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, handle, email, avatar_url, bio, discipline, location, verified, badges');

    if (error) {
      console.warn('   ⚠️  Could not fetch profiles table:', error.message);
      return [];
    }

    const knownEmails = new Set(KNOWN_USERS.map(u => u.email.toLowerCase()));
    const extra = [];

    for (const row of (data || [])) {
      const email = (row.email || '').trim().toLowerCase();
      // Skip guests, placeholders, auto-generated emails, and already-known users
      if (
        !email ||
        email.endsWith('@atelier.art') ||
        email.includes('placeholder') ||
        email.includes('probe_artist') ||
        email === 'guest@artisansquill.app' ||
        knownEmails.has(email)
      ) continue;

      extra.push({
        id: row.id,
        name: row.name || row.handle,
        handle: row.handle,
        email,
        discipline: row.discipline || 'Visual Arts & Creative Writing',
        bio: row.bio || 'Fine art creator on The Artisan\'s Quill.',
        location: row.location || 'Studio Atelier',
        avatar: row.avatar_url || '/curatorial-masterpiece.svg',
        verified: row.verified ?? true,
        badges: row.badges || ['Verified Artist']
      });

      knownEmails.add(email);
    }

    console.log(`   ✅  Found ${extra.length} additional real user(s) in profiles table.`);
    return extra;
  } catch (e) {
    console.warn('   ⚠️  Profiles discovery error:', e.message);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 2: Fetch existing Supabase Auth users to avoid duplicate attempts
// ──────────────────────────────────────────────────────────────────────────────
async function getExistingAuthUsers() {
  console.log('\n🔐  Fetching existing Supabase Auth users...');
  const existing = new Map();
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      console.warn('   ⚠️  Could not list Auth users:', error.message);
      return existing;
    }
    for (const u of (data?.users || [])) {
      if (u.email) existing.set(u.email.toLowerCase(), u);
    }
    console.log(`   ✅  ${existing.size} existing Auth user(s) found.`);
  } catch (e) {
    console.warn('   ⚠️  Auth list error:', e.message);
  }
  return existing;
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 3: Sync each user to Supabase Auth + profiles table
// ──────────────────────────────────────────────────────────────────────────────
async function syncUser(user, existingAuthUsers) {
  const cleanHandle = user.handle?.trim().startsWith('@') ? user.handle.trim() : `@${user.handle?.trim()}`;
  const cleanEmail = user.email?.trim().toLowerCase();
  const defaultPassword = user.password || `artisan-${cleanHandle.replace('@', '')}-2026`;

  let authUserId = user.id;
  let authStatus = '';

  const existingAuth = existingAuthUsers.get(cleanEmail);

  if (existingAuth) {
    // User already in Auth — update their metadata to keep it current
    try {
      await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
        user_metadata: {
          name: user.name,
          handle: cleanHandle,
          avatar_url: user.avatar || '/curatorial-masterpiece.svg',
          discipline: user.discipline,
          bio: user.bio,
          location: user.location
        }
      });
      authUserId = existingAuth.id;
      authStatus = '✅ auth_updated';
    } catch (e) {
      authUserId = existingAuth.id;
      authStatus = `⚠️  auth_update_error: ${e.message}`;
    }
  } else {
    // Create new Supabase Auth user
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          handle: cleanHandle,
          avatar_url: user.avatar || '/curatorial-masterpiece.svg',
          discipline: user.discipline,
          bio: user.bio,
          location: user.location
        }
      });

      if (!authError && authData?.user) {
        authUserId = authData.user.id;
        authStatus = '✅ auth_created';
      } else {
        authStatus = `❌ auth_error: ${authError?.message || 'unknown'}`;
      }
    } catch (e) {
      authStatus = `❌ auth_exception: ${e.message}`;
    }
  }

  // Always upsert to profiles table to ensure record exists
  let profileStatus = '';
  try {
    const { error: profErr } = await supabaseAdmin.from('profiles').upsert(
      {
        id: authUserId,
        name: user.name,
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

    if (!profErr) {
      profileStatus = '✅ profile_upserted';
    } else {
      // Try by handle
      const { error: profErr2 } = await supabaseAdmin.from('profiles').upsert(
        {
          id: authUserId,
          name: user.name,
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
      profileStatus = profErr2
        ? `❌ profile_error: ${profErr2.message}`
        : '✅ profile_upserted_by_handle';
    }
  } catch (e) {
    profileStatus = `❌ profile_exception: ${e.message}`;
  }

  return { handle: cleanHandle, email: cleanEmail, authUserId, authStatus, profileStatus };
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  The Artisan\'s Quill — Supabase User Migration Script');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Target: ${SUPABASE_URL}`);
  console.log('');

  const extraUsers = await discoverExtraUsers();
  const allUsers = [...KNOWN_USERS, ...extraUsers];
  const existingAuthUsers = await getExistingAuthUsers();

  console.log(`\n🚀  Migrating ${allUsers.length} user(s) to Supabase Auth + profiles table...\n`);
  console.log('─'.repeat(70));

  const results = [];
  for (const user of allUsers) {
    const result = await syncUser(user, existingAuthUsers);
    const icon = result.authStatus.startsWith('✅') ? '✅' : '⚠️ ';
    console.log(`${icon}  ${result.handle.padEnd(25)} ${result.email}`);
    console.log(`     Auth:    ${result.authStatus}`);
    console.log(`     Profile: ${result.profileStatus}`);
    console.log('');
    results.push(result);
  }

  const created = results.filter(r => r.authStatus.includes('created')).length;
  const updated = results.filter(r => r.authStatus.includes('updated')).length;
  const failed = results.filter(r => r.authStatus.includes('❌')).length;

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Migration Complete`);
  console.log(`  ✅ Created : ${created}`);
  console.log(`  🔄 Updated : ${updated}`);
  console.log(`  ❌ Failed  : ${failed}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log('\n⚠️  Some users failed. Check errors above. Re-run to retry.');
  } else {
    console.log('\n🎨  All users are now stored in Supabase Auth & profiles table!');
    console.log('   Users can sign in with their email + password on the live site.');
    console.log('   Afshaan → afshaan100@gmail.com / atelier2026');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
