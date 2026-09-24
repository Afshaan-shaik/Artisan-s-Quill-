import { Artwork, Exhibition, UserProfile, Comment, MarginReflection, DatabaseTableSchema } from '../types';

// Blank visitor profile — shown to anyone who opens the site without an account
export const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest Visitor',
  handle: '@visitor',
  avatar: '',
  coverImage: '',
  bio: '',
  discipline: 'Visitor',
  location: '',
  verified: false,
  artworksCount: 0,
  followersCount: 0,
  followingCount: 0,
  badges: []
};

export const DEFAULT_USER: UserProfile = {
  id: 'user-my-atelier',
  name: 'Afshaan Shaikh',
  handle: '@afshaanshaikh',
  avatar: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
  bio: 'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.',
  discipline: 'Artist | Poet | Coder | Software Developer',
  location: 'Atelier Studio • Global Digital Sanctuary',
  favoriteQuote: {
    text: 'Where algorithmic precision meets the lyrical soul of fine art.',
    author: 'Afshaan Shaikh'
  },
  website: 'https://afshaanshaikh.dev',
  instagram: '',
  twitter: '',
  email: 'afshaan100@gmail.com',
  phone: '+91 9611263884',
  verified: true,
  artworksCount: 2,
  followersCount: 148,
  followingCount: 12,
  badges: ['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder']
};

export const INITIAL_ARTIST_PROFILES: UserProfile[] = [
  DEFAULT_USER
];

export const CURRENT_USER: UserProfile = DEFAULT_USER;

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'coffee-poem-1',
    title: 'Late Kettle',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Lyrical Free Verse',
    year: 2026,
    description: 'A quiet meditation on the lateness of things — the kettle that boils after the guest has gone, the sentence you compose after the conversation ends.',
    curatorNote: 'Artisan Quill Founder Poem — Coffee-Stained Parchment Series, Poem I.',
    tags: ['Poetry', 'Nocturne', 'Solitude', 'Coffee Stained', 'Parchment'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-09-01T22:00:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#261F18', '#DFC8A5', '#8B6331', '#4A3728'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      preferredVoiceAccent: 'founder-poet',
      stanzas: [
        'The kettle boils for no one now,\na thin white column, patient, spent.\nI keep refilling what has gone\nbecause the habit has not left.',
        'Outside, the lane is dark and wet\nwith something close to permanence.\nThe cup I set for you grows cold\nin the particular silence of the late.',
        'I have not moved the second chair.\nI will not, yet — not tonight.\nLet the steam rise. Let the window fog.\nSome vigils are their own goodbye.'
      ],
      theme: 'vellum',
      fontStyle: 'cormorant',
      alignment: 'left',
      readingTimeMinutes: 2,
      authorSignature: '— Afshaan Shaikh, 2026',
      subtitle: 'from the Coffee-Stained Parchment Series',
      dedication: '— for anyone still at the table',
      poemNumber: 'I.',
      stainVariant: 1,
      paperTone: '#EDE0C8',
      excerpt: 'The kettle boils for no one now, a thin white column, patient, spent.'
    }
  },
  {
    id: 'coffee-poem-2',
    title: 'Marginalia',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Lyrical Free Verse',
    year: 2026,
    description: 'On the practice of writing in the margins — of books, of meetings, of days that asked too much.',
    curatorNote: 'Artisan Quill Founder Poem — Coffee-Stained Parchment Series, Poem II.',
    tags: ['Poetry', 'Marginalia', 'Writing', 'Coffee Stained', 'Parchment'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-09-02T23:15:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#1C1510', '#D4B896', '#7A5830', '#3E2E20'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      preferredVoiceAccent: 'founder-poet',
      stanzas: [
        'I have always written in the margins,\nthat narrow corridor between the printed\nand the felt — a country of small addenda\nwhere the real argument lives.',
        'Here: a question mark beside a certainty.\nThere: a word you underlined in pencil,\nso soft the text still shows through\nlike a bruise that healed before it finished.',
        'We annotate what we cannot answer.\nWe asterisk the passages that break us\nand close the book and carry them\ninto everything we say to strangers.'
      ],
      theme: 'obsidian',
      fontStyle: 'cormorant',
      alignment: 'left',
      readingTimeMinutes: 2,
      authorSignature: '— Afshaan Shaikh, 2026',
      subtitle: 'from the Coffee-Stained Parchment Series',
      dedication: '— for the reader who left notes in every margin',
      poemNumber: 'II.',
      stainVariant: 2,
      paperTone: '#DFC8A5',
      excerpt: 'I have always written in the margins, that narrow corridor between the printed and the felt.'
    }
  },
  {
    id: 'coffee-poem-3',
    title: 'Second Cup',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Lyrical Free Verse',
    year: 2026,
    description: 'The second cup is always the honest one — poured not from want but from the inability to end the morning.',
    curatorNote: 'Artisan Quill Founder Poem — Coffee-Stained Parchment Series, Poem III.',
    tags: ['Poetry', 'Morning', 'Rituals', 'Coffee Stained', 'Parchment'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-09-03T07:30:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#241C15', '#C9A875', '#6B4F30', '#3A2B1E'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      preferredVoiceAccent: 'founder-poet',
      stanzas: [
        'The second cup is always the honest one:\npoured not from want but from the refusal\nto let the morning end before\nwe understood what it was trying to say.',
        'The first is urgency, the alarm still ringing\nsomewhere inside the chest.\nThe second is the hand that stops the clock,\nthat says: not yet — there is still this light.',
        'I sit with both hands curved around the heat\nand read last night still cooling in the room.\nOutside, the world assembles itself again.\nI let it. I am not done with the quiet.'
      ],
      theme: 'vellum',
      fontStyle: 'cormorant',
      alignment: 'left',
      readingTimeMinutes: 2,
      authorSignature: '— Afshaan Shaikh, 2026',
      subtitle: 'from the Coffee-Stained Parchment Series',
      dedication: '— for the mornings that asked to be extended',
      poemNumber: 'III.',
      stainVariant: 3,
      paperTone: '#EDE0C8',
      excerpt: 'The second cup is always the honest one: poured not from want but from the refusal to let the morning end.'
    }
  },
  {
    id: 'art-1787665037985-nnxxg',
    title: 'I Suppose',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'video',
    mediaUrl: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/artworks-1787665014401-qbv149.mp4',
    thumbnailUrl: 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/artworks/uploads/artworks-1787665014401-qbv149.mp4',
    dimensions: '4K Ultra-HD Motion Cinema (3840 x 2160)',
    medium: '4K Volumetric Fluid Dynamics & Motion Loop',
    year: 2026,
    description: 'A hypnotic, high-frequency 4K motion loop capturing fluid dynamic textures and ambient light refraction. Represents quiet contemplative motion at the frontier of digital cinema and artisan craft.',
    curatorNote: 'Selected as the #1 Masterpiece of the Day and Permanent Curatorial Spotlight. Hypnotic visual motion and pristine fluid fidelity.',
    tags: ['Masterpiece of the Day', 'Curatorial Spotlight', 'Video Cinema', 'Fluid Dynamics', 'Motion Loop'],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: '2026-08-25T13:37:17.985Z',
    aspectRatio: 'wide',
    colorPalette: ['#090a0f', '#c9a875', '#24283b', '#e2d9cc', '#635340'],
    isLiked: false,
    isSaved: false,
    featured: true,
    videoData: {
      duration: '0:30 (Loop)',
      isLoop: true,
      resolution: '4K Cinema',
      hasAudio: true
    }
  },
  {
    id: 'spotlight-masterpiece-1',
    title: 'The Young Connoisseur (Noir Reverie)',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'digital',
    mediaUrl: '/curatorial-masterpiece.svg',
    thumbnailUrl: '/curatorial-masterpiece.svg',
    dimensions: '4000 x 3000 (Fine Art Master)',
    medium: 'Digital Fine Art & Cinematic Portraiture',
    year: 2026,
    description: 'An evocative digital fine art portrait study capturing quiet introspection, vintage cinema tonality, and atmospheric warmth. The composition frames a poised figure wearing dark sunglasses and a brimmed hat against a warm ambient bistro nocturnal glow.',
    curatorNote: 'Selected as the #1 Masterpiece of the Day and Permanent Curatorial Spotlight. Masterful lighting atmosphere, cinematic depth, and nostalgic poise.',
    tags: ['Masterpiece of the Day', 'Curatorial Spotlight', 'Digital Art', 'Cinematic Portrait', 'Noir Aesthetics'],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: '2026-08-16T12:00:00Z',
    aspectRatio: 'portrait',
    colorPalette: ['#121520', '#c9a875', '#3e2c1e', '#8c6b45', '#f0e6d6'],
    isLiked: false,
    isSaved: false,
    featured: true,
    exhibitionId: 'exh-2',
    exhibitionName: 'Synthetic Transcendence & Masterpieces'
  },
  {
    id: 'afshaan-poetry-1',
    title: 'The Algorithm of Silence',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Lyrical Free Verse & Computational Philosophy',
    year: 2026,
    description: 'A poetic exploration into the confluence of algorithmic precision and the timeless resonance of human creative expression.',
    curatorNote: 'Selected Atelier Sanctuary Founder Lyric Anthem.',
    tags: ['Poetry', 'Philosophy', 'Algorithmic Art', 'Nocturnes'],
    likesCount: 0,
    viewsCount: 0,
    savesCount: 0,
    createdAt: '2026-08-15T18:30:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#0d1117', '#c9a875', '#21262d', '#f0e6d6'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      preferredVoiceAccent: 'founder-poet',
      stanzas: [
        'We write in languages that machines can execute,\nyet whisper in cadences only the soul understands.\nBetween each clock cycle and the quiet dark,\na universe of intent waits to be discovered.',
        'The canvas is not merely pixels or linen,\nbut a resonant chamber of human contemplation.\nWhere code ends and beauty begins,\nthere lies the eternal sanctuary.'
      ],
      theme: 'obsidian',
      fontStyle: 'cormorant',
      alignment: 'center',
      readingTimeMinutes: 2,
      authorSignature: '— Afshaan Shaikh, Founder of The Artisan’s Quill',
      subtitle: 'From "Reflections at the Confluence"'
    }
  },
  {
    id: 'urdu-ghazal-ghalib',
    title: 'Dard Aur Khamoshi (درد اور خاموشی)',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Classical Ghazal in Roman Urdu & Nastaliq',
    year: 2026,
    description: 'A timeless, soulful classical Ghazal exploring unrequited longing, silent devotion, and the eloquence of unspoken grief in lyrical Roman Urdu.',
    curatorNote: 'Featured Urdu Masterpiece — Celebrates the lyrical soul of Urdu Shairi with native cadence voice recitation.',
    tags: ['Urdu Poetry', 'Ghazal', 'Shayari', 'Roman Urdu', 'Native Voice', 'Masterpiece'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-09-12T12:00:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#100d14', '#dfbd87', '#3d2b1f', '#f5ebd7'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      preferredVoiceAccent: 'founder-poet',
      stanzas: [
        'Har ek baat pe kehte ho tum ke tu kya hai,\nTumhi kaho ke yeh andaaz-e-guftagu kya hai.\n\nہر ایک بات پہ کہتے ہو تم کہ تو کیا ہے\nتمہیں کہو کہ یہ اندازِ گفتگو کیا ہے',
        'Ragon mein daudte phirne ke hum nahi qayal,\nJab aankh hi se na tapka toh phir lahu kya hai.\n\nرگوں میں دوڑتے پھرنے کے ہم نہیں قائل\nجب آنکھ ہی سے نہ ٹپکا تو پھر لہو کیا ہے',
        'Mohabbat mein nahi hai farq jeene aur marne ka,\nUsi ko dekh kar jeete hain jis kaafir pe dam nikle.\n\nمحبت میں نہیں ہے فرق جینے اور مرنے کا\nاسی کو دیکھ کر جیتے ہیں جس کافر پہ دم نکلے'
      ],
      theme: 'midnight',
      fontStyle: 'cormorant',
      alignment: 'center',
      readingTimeMinutes: 2,
      authorSignature: '— Mirza Ghalib • Preserved by Afshaan Shaikh',
      subtitle: 'Classical Ghazal in Roman Urdu & Nastaliq Script',
      dedication: '— for lovers of timeless Hindustani & Urdu Shairi',
      poemNumber: 'GHAZAL I.',
      excerpt: 'Har ek baat pe kehte ho tum ke tu kya hai, Tumhi kaho ke yeh andaaz-e-guftagu kya hai.'
    }
  },
  {
    id: 'music-1',
    title: 'Nocturne in C-sharp Minor (Sanctuary Reverie)',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: DEFAULT_USER.avatar,
      verified: true,
      location: 'Atelier Studio • Global Digital Sanctuary'
    },
    category: 'music',
    mediaUrl: '/audio/wsKhe5rTKw8.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    medium: 'Acoustic Piano & Cinematic Ambient Soundscape',
    dimensions: 'Master Vinyl Studio Recording',
    year: 2026,
    description: 'An evocative acoustic piano composition intertwined with gentle tape warmth and midnight reverb, crafted as an acoustic sanctuary for solitary thought and late evening creative writing.',
    tags: ['Music', 'Original Song', 'Acoustic Piano', 'Ambient', 'Soundscape', 'Vinyl'],
    likesCount: 14,
    viewsCount: 182,
    savesCount: 9,
    createdAt: '2026-09-03T21:00:00Z',
    aspectRatio: 'square',
    colorPalette: ['#14151e', '#c9a875', '#3d3425', '#f1eadc', '#2c3144'],
    isLiked: false,
    isSaved: false,
    featured: true,
    musicData: {
      audioUrl: '/audio/wsKhe5rTKw8.mp4',
      coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      album: 'Sanctuary Nocturnes Vol. I',
      durationSeconds: 215,
      duration: '3:35',
      genre: 'Neo-Classical / Ambient Piano',
      isOriginalComposition: true,
      composer: 'Afshaan Shaikh',
      key: 'C# Minor',
      bpm: '72 BPM',
      lyrics: 'Soft falls the lantern glow upon the keys,\nA wandering cadence adrift upon the breeze.\nNo words required when the shadows speak in chord,\nA quiet reverie that time and silence hoard.'
    }
  }
];

export const INITIAL_EXHIBITIONS: Exhibition[] = [
  {
    id: 'exh-1',
    title: 'Chiaroscuro & Nocturnes',
    subtitle: 'A Salon of Shadows, Heavy Pigments & Whispered Elegies',
    curator: 'Afshaan Shaikh & The Curatorial Board',
    coverImage: 'https://images.unsplash.com/photo-1578925518470-4def7aa53bc9?auto=format&fit=crop&w=1200&q=80',
    description: 'An atelier sanctuary collection exploring the metaphysical weight of darkness, candlelight, and nocturnal contemplation.',
    dates: 'August 1 — September 30, 2026',
    theme: 'Dark Romanticism & Expressive Media',
    artworkIds: ['spotlight-masterpiece-1', 'coffee-poem-1', 'coffee-poem-2', 'coffee-poem-3', 'afshaan-poetry-1'],
    location: 'Virtual Hall I & Grand Atrium'
  },
  {
    id: 'exh-2',
    title: 'Synthetic Transcendence',
    subtitle: 'Generative Consciousness, Fluid Motion & Digital Verse',
    curator: 'Afshaan Shaikh & The Sanctuary Atelier',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Showcasing 4K volumetric fluid simulations, cinematic noir masterworks, and classical Urdu verse.',
    dates: 'August 15 — October 15, 2026',
    theme: 'Digital Media & Algorithmic Expression',
    artworkIds: ['art-1787665037985-nnxxg', 'spotlight-masterpiece-1', 'urdu-ghazal-ghalib'],
    location: 'Bioluminescent Pavilion'
  }
];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_MARGIN_REFLECTIONS: MarginReflection[] = [];

export const DATABASE_SCHEMAS: DatabaseTableSchema[] = [
  {
    tableName: 'users',
    description: 'Core artist & collector authentication and identity profile records',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'Unique identifier' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'Secure encrypted email address' },
      { name: 'username_handle', type: 'VARCHAR(64)', nullable: false, description: 'Unique artist public handle' },
      { name: 'full_name', type: 'VARCHAR(128)', nullable: false, description: 'Display name' },
      { name: 'avatar_url', type: 'TEXT', nullable: true, description: 'S3/CDN hosted avatar key' },
      { name: 'bio_statement', type: 'TEXT', nullable: true, description: 'Artist statement & philosophy' },
      { name: 'discipline', type: 'VARCHAR(64)', nullable: false, description: 'Primary artistic discipline' },
      { name: 'is_verified', type: 'BOOLEAN', nullable: false, description: 'Curator vetted status' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Registration timestamp' }
    ]
  },
  {
    tableName: 'artworks',
    description: 'Master metadata record for paintings, drawings, digital media, and video works',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'Unique artwork identifier' },
      { name: 'artist_id', type: 'UUID', isForeign: true, foreignTable: 'users.id', nullable: false, description: 'Author foreign key' },
      { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Artwork or poem title' },
      { name: 'category', type: 'ENUM (painting, drawing, digital, video, poetry)', nullable: false, description: 'Discipline category' },
      { name: 'media_storage_url', type: 'TEXT', nullable: true, description: 'High-res image or video stream CDN path' },
      { name: 'medium_description', type: 'VARCHAR(128)', nullable: true, description: 'e.g. Oil on Belgian Linen' },
      { name: 'dimensions', type: 'VARCHAR(64)', nullable: true, description: 'Physical or digital resolution specs' },
      { name: 'creation_year', type: 'INTEGER', nullable: false, description: 'Year of completion' },
      { name: 'description', type: 'TEXT', nullable: true, description: 'Detailed artist statement' },
      { name: 'color_palette', type: 'JSONB (hex string array)', nullable: true, description: 'Extracted key tonal hex codes' },
      { name: 'likes_count', type: 'INTEGER', nullable: false, description: 'Indexed like counter cache' },
      { name: 'views_count', type: 'INTEGER', nullable: false, description: 'Total exhibition impressions' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Publish timestamp' }
    ]
  },
  {
    tableName: 'poetry_cards',
    description: 'Specialized relational table for typography styling, stanzas, and recitation tracks',
    columns: [
      { name: 'artwork_id', type: 'UUID', isPrimary: true, isForeign: true, foreignTable: 'artworks.id', nullable: false, description: '1-to-1 relationship with artworks table' },
      { name: 'stanzas_json', type: 'JSONB (string array of stanzas)', nullable: false, description: 'Parsed stanzas maintaining line breaks' },
      { name: 'card_theme', type: 'ENUM (obsidian, vellum, midnight, emerald, crimson)', nullable: false, description: 'Visual parchment card styling' },
      { name: 'font_pairing', type: 'ENUM (cormorant, newsreader, playfair)', nullable: false, description: 'Selected luxury serif typography' },
      { name: 'alignment', type: 'VARCHAR(16)', nullable: false, description: 'Left, Center, or Justified flow' },
      { name: 'audio_recitation_url', type: 'TEXT', nullable: true, description: 'Spoken word audio voiceover track' },
      { name: 'reading_time_mins', type: 'INTEGER', nullable: false, description: 'Estimated recitation duration' },
      { name: 'author_signature', type: 'VARCHAR(128)', nullable: true, description: 'Custom sign-off or collection citation' }
    ]
  },
  {
    tableName: 'social_interactions',
    description: 'Polymorphic social graph managing user likes, saves, follows, and curate awards',
    columns: [
      { name: 'id', type: 'BIGSERIAL', isPrimary: true, nullable: false, description: 'Auto-incrementing interaction ID' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users.id', nullable: false, description: 'Initiating user' },
      { name: 'artwork_id', type: 'UUID', isForeign: true, foreignTable: 'artworks.id', nullable: false, description: 'Target artwork or poem' },
      { name: 'interaction_type', type: 'ENUM (like, bookmark, curator_pick)', nullable: false, description: 'Action type' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Timestamp' }
    ]
  },
  {
    tableName: 'comments',
    description: 'Artist discussions, critique threads, and curatorial observations',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, nullable: false, description: 'Unique comment identifier' },
      { name: 'artwork_id', type: 'UUID', isForeign: true, foreignTable: 'artworks.id', nullable: false, description: 'Artwork foreign key' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'users.id', nullable: false, description: 'Commenter foreign key' },
      { name: 'content', type: 'TEXT', nullable: false, description: 'Comment text content' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Creation timestamp' }
    ]
  }
];
