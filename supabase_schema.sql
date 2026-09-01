-- ==============================================================================
-- THE ARTISAN'S QUILL — SUPABASE POSTGRESQL SCHEMA & CLOUD STORAGE SETUP
-- ==============================================================================
-- Run this complete SQL script in your Supabase Dashboard: SQL Editor -> New Query -> Run.
-- It initializes all relational tables, RLS policies, real-time channels, and storage buckets.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE (Artists & Curators)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    discipline TEXT DEFAULT 'Visual Artist & Poet',
    location TEXT DEFAULT 'Global Atelier',
    quote_text TEXT,
    quote_author TEXT,
    website TEXT,
    instagram TEXT,
    twitter TEXT,
    email TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT false,
    artworks_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    badges TEXT[] DEFAULT ARRAY['Verified Artist']::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. ARTWORKS TABLE (Paintings, Drawings, Digital Art, Videos & Poetry Cards)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.artworks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    artist_name TEXT NOT NULL DEFAULT 'Guest Artist',
    artist_handle TEXT NOT NULL DEFAULT '@guest',
    artist_avatar TEXT,
    title TEXT NOT NULL DEFAULT 'Untitled Creation',
    category TEXT NOT NULL DEFAULT 'digital',
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    dimensions TEXT DEFAULT 'Original Canvas',
    medium TEXT DEFAULT 'Digital Media',
    year INT DEFAULT EXTRACT(YEAR FROM now()),
    description TEXT,
    curator_note TEXT,
    tags TEXT[] DEFAULT ARRAY['Atelier Submission']::TEXT[],
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 1,
    saves_count INT DEFAULT 0,
    aspect_ratio TEXT DEFAULT 'tall',
    color_palette TEXT[] DEFAULT ARRAY['#12141c', '#c9a875', '#333b4d', '#f0f3fa']::TEXT[],
    featured BOOLEAN DEFAULT false,
    poetry_content JSONB,
    video_data JSONB,
    exhibition_id TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indices for rapid feed filtering and pagination across 500+ creators
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_likes_count ON public.artworks(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_is_deleted ON public.artworks(is_deleted);
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON public.artworks(user_id);

-- ==============================================================================
-- 4. COMMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'guest',
    user_name TEXT NOT NULL DEFAULT 'Guest Critic',
    user_handle TEXT NOT NULL DEFAULT '@guest',
    user_avatar TEXT,
    user_verified BOOLEAN DEFAULT false,
    text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_artwork_id ON public.comments(artwork_id);

-- ==============================================================================
-- 5. MARGIN REFLECTIONS TABLE (Marginalia System)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.margin_reflections (
    id TEXT PRIMARY KEY,
    artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    stanza_index INT DEFAULT 0,
    line_index INT,
    verse_snippet TEXT,
    user_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'Sanctuary Poet',
    author_handle TEXT NOT NULL DEFAULT '@poet',
    author_avatar TEXT,
    author_verified BOOLEAN DEFAULT false,
    text TEXT NOT NULL,
    ink_color TEXT DEFAULT 'gold',
    upvotes INT DEFAULT 1,
    is_curator_pick BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_margins_artwork_id ON public.margin_reflections(artwork_id);

-- ==============================================================================
-- 6. COLLECTIONS & EXHIBITIONS TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    artwork_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exhibitions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    curator TEXT DEFAULT 'Curatorial Board',
    cover_image TEXT NOT NULL,
    description TEXT,
    dates TEXT,
    theme TEXT,
    artwork_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    location TEXT DEFAULT 'Grand Atelier Gallery',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.margin_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public Read & Insert/Update
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Profiles SELECT" ON public.profiles;
    CREATE POLICY "Public Profiles SELECT" ON public.profiles FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Profiles INSERT" ON public.profiles;
    CREATE POLICY "Public Profiles INSERT" ON public.profiles FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Profiles UPDATE" ON public.profiles;
    CREATE POLICY "Public Profiles UPDATE" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
END $$;

-- Artworks: Public Read, Insert, Update, Delete
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Artworks SELECT" ON public.artworks;
    CREATE POLICY "Public Artworks SELECT" ON public.artworks FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Artworks INSERT" ON public.artworks;
    CREATE POLICY "Public Artworks INSERT" ON public.artworks FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Artworks UPDATE" ON public.artworks;
    CREATE POLICY "Public Artworks UPDATE" ON public.artworks FOR UPDATE USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Artworks DELETE" ON public.artworks;
    CREATE POLICY "Public Artworks DELETE" ON public.artworks FOR DELETE USING (true);
END $$;

-- Comments: Public Read & Insert
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Comments SELECT" ON public.comments;
    CREATE POLICY "Public Comments SELECT" ON public.comments FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Comments INSERT" ON public.comments;
    CREATE POLICY "Public Comments INSERT" ON public.comments FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Comments UPDATE" ON public.comments;
    CREATE POLICY "Public Comments UPDATE" ON public.comments FOR UPDATE USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Comments DELETE" ON public.comments;
    CREATE POLICY "Public Comments DELETE" ON public.comments FOR DELETE USING (true);
END $$;

-- Margin Reflections: Public Read & Insert
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Margins SELECT" ON public.margin_reflections;
    CREATE POLICY "Public Margins SELECT" ON public.margin_reflections FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Margins INSERT" ON public.margin_reflections;
    CREATE POLICY "Public Margins INSERT" ON public.margin_reflections FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Margins UPDATE" ON public.margin_reflections;
    CREATE POLICY "Public Margins UPDATE" ON public.margin_reflections FOR UPDATE USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Margins DELETE" ON public.margin_reflections;
    CREATE POLICY "Public Margins DELETE" ON public.margin_reflections FOR DELETE USING (true);
END $$;

-- Collections & Exhibitions: Public Access
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Collections ALL" ON public.collections;
    CREATE POLICY "Public Collections ALL" ON public.collections FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Public Exhibitions ALL" ON public.exhibitions;
    CREATE POLICY "Public Exhibitions ALL" ON public.exhibitions FOR ALL USING (true);
END $$;

-- ==============================================================================
-- 8. REALTIME REPLICATION SETUP
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.margin_reflections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKETS (CDN MEDIA STORAGE)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('artworks', 'artworks', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp3']),
    ('avatars', 'avatars', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies allowing public read and uploads
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public Storage Read Artworks" ON storage.objects;
    CREATE POLICY "Public Storage Read Artworks" ON storage.objects FOR SELECT USING (bucket_id IN ('artworks', 'avatars'));
    
    DROP POLICY IF EXISTS "Public Storage Insert Artworks" ON storage.objects;
    CREATE POLICY "Public Storage Insert Artworks" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('artworks', 'avatars'));
    
    DROP POLICY IF EXISTS "Public Storage Update Artworks" ON storage.objects;
    CREATE POLICY "Public Storage Update Artworks" ON storage.objects FOR UPDATE USING (bucket_id IN ('artworks', 'avatars'));
    
    DROP POLICY IF EXISTS "Public Storage Delete Artworks" ON storage.objects;
    CREATE POLICY "Public Storage Delete Artworks" ON storage.objects FOR DELETE USING (bucket_id IN ('artworks', 'avatars'));
END $$;

-- ==============================================================================
-- 10. SEED FOUNDER PROFILE & MASTERWORKS (NON-DESTRUCTIVE INSERT)
-- ==============================================================================
INSERT INTO public.profiles (
    id, name, handle, avatar_url, cover_url, bio, discipline, location, quote_text, quote_author, website, email, phone, verified, artworks_count, badges
) VALUES (
    'user-my-atelier',
    'Afshaan Shaikh',
    '@afshaanshaikh',
    '/curatorial-masterpiece.svg',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.',
    'Artist | Poet | Coder | Software Developer',
    'Atelier Studio • Global Digital Sanctuary',
    'Where algorithmic precision meets the lyrical soul of fine art.',
    'Afshaan Shaikh',
    'https://afshaanshaikh.dev',
    'afshaan100@gmail.com',
    '+91 9611263884',
    true,
    2,
    ARRAY['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder']::TEXT[]
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    avatar_url = EXCLUDED.avatar_url,
    discipline = EXCLUDED.discipline,
    verified = true;

-- Seed Spotlight Masterpiece
INSERT INTO public.artworks (
    id, user_id, artist_name, artist_handle, artist_avatar, title, category, media_url, thumbnail_url,
    dimensions, medium, year, description, curator_note, tags, likes_count, views_count, saves_count,
    aspect_ratio, color_palette, featured
) VALUES (
    'spotlight-masterpiece-1',
    'user-my-atelier',
    'Afshaan Shaikh',
    '@afshaanshaikh',
    '/curatorial-masterpiece.svg',
    'The Obsidian Alchemist',
    'digital',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    '3840 x 2160 px (Ultra-HD)',
    'Algorithmic Shader Code & Fluid Dynamics',
    2026,
    'A high-frequency digital study capturing molten obsidian flowing across golden contours. Represents the synthesis between software engineering precision and organic painterly expression.',
    'Curator Note: Exemplifies the sanctuary spirit where code acts as a brush.',
    ARRAY['Spotlight', 'Featured', 'Digital Media', 'Fluid Dynamics']::TEXT[],
    342,
    1820,
    89,
    'tall',
    ARRAY['#090a0f', '#c9a875', '#24283b', '#e2d9cc', '#635340']::TEXT[],
    true
) ON CONFLICT (id) DO NOTHING;

-- Seed Founder Poetry Piece
INSERT INTO public.artworks (
    id, user_id, artist_name, artist_handle, artist_avatar, title, category, media_url, thumbnail_url,
    dimensions, medium, year, description, tags, likes_count, views_count, saves_count,
    aspect_ratio, color_palette, featured, poetry_content
) VALUES (
    'afshaan-poetry-1',
    'user-my-atelier',
    'Afshaan Shaikh',
    '@afshaanshaikh',
    '/curatorial-masterpiece.svg',
    'Algorithms of the Midnight Sky',
    'poetry',
    '/curatorial-masterpiece.svg',
    '/curatorial-masterpiece.svg',
    'Poetry Parchment',
    'Lyrical Stanza & Typography Design',
    2026,
    'A meditation on algorithmic geometry, starlight, and the quiet artisan craft of software development.',
    ARRAY['Poetry', 'Philosophy', 'Code & Art', 'Sanctuary']::TEXT[],
    215,
    1140,
    64,
    'portrait',
    ARRAY['#12141c', '#c9a875', '#333b4d', '#f0f3fa']::TEXT[],
    true,
    '{
        "stanzas": [
            "In lines of logic, clean and deep,\nWhere quiet micro-currents sweep,\nWe sculpt the dark with keystroke light,\nAnd build cathedrals in the night.",
            "Between the pixel and the soul,\nA silent symmetry takes hold—\nNot merely code that machines comprehend,\nBut art where heart and math transcend."
        ],
        "theme": "obsidian",
        "fontStyle": "cormorant",
        "alignment": "center",
        "readingTimeMinutes": 1,
        "authorSignature": "— Afshaan Shaikh",
        "subtitle": "From the Atelier Nocturne Collection"
    }'::JSONB
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. INQUIRIES & CONCIERGE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry_type TEXT NOT NULL DEFAULT 'art-acquisition',
    message TEXT NOT NULL,
    channel TEXT DEFAULT 'both',
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public select on inquiries"
ON public.inquiries FOR SELECT
USING (true);

