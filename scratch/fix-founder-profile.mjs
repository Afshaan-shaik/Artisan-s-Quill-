/**
 * fix-founder-profile.mjs
 * 
 * Fixes the founder's Supabase Auth → profiles link.
 * The profiles row with id='user-my-atelier' already exists and must stay
 * because artworks.user_id references it. We just UPDATE it in place and
 * also update the Supabase Auth user metadata to point to the correct ID.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://uskuzbtvbhfqlxvbbrvw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('🔧  Fixing founder profile in Supabase...\n');

  // 1. Find the newly created Supabase Auth user for afshaan100@gmail.com
  const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) { console.error('❌  List auth users failed:', listErr.message); process.exit(1); }

  const founderAuth = listData.users.find(u => u.email?.toLowerCase() === 'afshaan100@gmail.com');
  if (!founderAuth) { console.error('❌  Founder auth user not found.'); process.exit(1); }

  console.log(`✅  Found founder in Auth: ${founderAuth.id}`);
  console.log(`    Email: ${founderAuth.email}`);

  // 2. UPDATE the existing profiles row (id='user-my-atelier') — do NOT change the id 
  //    because artworks reference it via foreign key
  const { error: profErr } = await supabaseAdmin
    .from('profiles')
    .update({
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      email: 'afshaan100@gmail.com',
      avatar_url: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg',
      bio: 'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.',
      discipline: 'Artist | Poet | Coder | Software Developer',
      location: 'Atelier Studio • Global Digital Sanctuary',
      verified: true,
      badges: ['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder'],
      updated_at: new Date().toISOString()
    })
    .eq('id', 'user-my-atelier');

  if (profErr) {
    console.error('❌  Profile UPDATE failed:', profErr.message);
  } else {
    console.log('✅  Founder profiles row updated (id=user-my-atelier preserved).');
  }

  // 3. Update the Supabase Auth user metadata so their token has the correct handle
  const { error: metaErr } = await supabaseAdmin.auth.admin.updateUserById(founderAuth.id, {
    user_metadata: {
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar_url: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg',
      discipline: 'Artist | Poet | Coder | Software Developer',
      bio: 'Artist, poet, coder, and software developer.',
      location: 'Atelier Studio • Global Digital Sanctuary',
      canonical_profile_id: 'user-my-atelier'  // links Auth UUID → profiles.id
    }
  });

  if (metaErr) {
    console.error('❌  Auth metadata update failed:', metaErr.message);
  } else {
    console.log('✅  Founder Auth metadata updated with canonical_profile_id=user-my-atelier.');
  }

  // 4. Also fix the extra @afshaanshaikh discovered user (afshaan@klebcahubli.in) — 
  //    update their profile row similarly
  const extraFounder = listData.users.find(u => u.email?.toLowerCase() === 'afshaan@klebcahubli.in');
  if (extraFounder) {
    console.log(`\n✅  Found secondary Afshaan account: ${extraFounder.email} (${extraFounder.id})`);
    await supabaseAdmin.auth.admin.updateUserById(extraFounder.id, {
      user_metadata: {
        name: 'Afshaan Shaikh',
        handle: '@afshaanshaikh',
        canonical_profile_id: 'user-my-atelier'
      }
    });
    // Upsert a profile row with the correct Supabase Auth UUID for this account
    const { error: extraProfErr } = await supabaseAdmin.from('profiles').upsert(
      {
        id: extraFounder.id,
        name: 'Afshaan Shaikh',
        handle: '@afshaanshaikh-alt',   // alt handle to avoid unique conflict with main
        email: 'afshaan@klebcahubli.in',
        avatar_url: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg',
        bio: 'Afshaan Shaikh - alternate account.',
        discipline: 'Artist | Poet | Coder | Software Developer',
        location: 'Atelier Studio • Global Digital Sanctuary',
        verified: true,
        badges: ['Artist', 'Atelier Founder'],
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    if (extraProfErr) {
      console.warn('   ⚠️  Secondary profile upsert note:', extraProfErr.message);
    } else {
      console.log('   ✅  Secondary account profile stored.');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Founder fix complete.');
  console.log('  Sign in with: afshaan100@gmail.com / atelier2026');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(e => { console.error(e); process.exit(1); });
