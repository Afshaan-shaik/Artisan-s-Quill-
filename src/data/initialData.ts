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
  DEFAULT_USER,
  {
    id: 'artist-1',
    name: 'Julian Thorne',
    handle: '@julianthorne',
    avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1400&q=80',
    bio: 'Contemporary abstract expressionist exploring deep earth pigments, mineral layers, and gold leaf on heavy linen.',
    discipline: 'Oil & Pigment Painting',
    location: 'Edinburgh, UK',
    favoriteQuote: {
      text: 'Color is a power which directly influences the soul.',
      author: 'Wassily Kandinsky'
    },
    website: 'https://julianthorne.art',
    instagram: 'julianthorne.studio',
    twitter: 'julian_thorne',
    email: 'contact@julianthorne.art',
    verified: true,
    artworksCount: 2,
    followersCount: 0,
    followingCount: 0,
    badges: ['Oil Master', 'Exhibition Laureate']
  },
  {
    id: 'artist-2',
    name: 'Aria Chen',
    handle: '@ariachen.verse',
    avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    bio: 'Poet and essayist writing on rain meditations, silence, architecture, and sensory verse.',
    discipline: 'Poetic Literature & Lyrical Stanzas',
    location: 'Kyoto, Japan',
    favoriteQuote: {
      text: 'Poetry is the rhythmical creation of beauty in words.',
      author: 'Edgar Allan Poe'
    },
    website: 'https://ariachen.verse',
    instagram: 'ariachen.words',
    twitter: 'ariachen_lyric',
    email: 'aria@ariachen.verse',
    verified: true,
    artworksCount: 2,
    followersCount: 0,
    followingCount: 0,
    badges: ['Lyric Laureate', 'Sanctuary Poet']
  },
  {
    id: 'artist-3',
    name: 'Kaelen Vance',
    handle: '@kaelen.vfx',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1400&q=80',
    bio: 'Digital filmmaker and motion artist exploring organic fluid dynamics and high-speed macro loops.',
    discipline: 'Macro Cinematography & Motion Loops',
    location: 'Berlin, Germany',
    favoriteQuote: {
      text: 'Motion in stillness is the secret of visual cinema.',
      author: 'Kaelen Vance'
    },
    website: 'https://kaelenvfx.de',
    instagram: 'kaelen.vfx',
    email: 'studio@kaelenvfx.de',
    verified: true,
    artworksCount: 1,
    followersCount: 0,
    followingCount: 0,
    badges: ['Motion Director', 'Digital Alchemist']
  },
  {
    id: 'artist-4',
    name: 'Mathieu Laurent',
    handle: '@mathieu.ink',
    avatar: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1400&q=80',
    bio: 'Master of vine charcoal, compressed graphite, and sumi ink washes on heavyweight Arches cotton paper.',
    discipline: 'Charcoal, Graphite & Sumi Ink',
    location: 'Lyon, France',
    favoriteQuote: {
      text: 'Drawing is the honesty of the art. There is no possibility of cheating.',
      author: 'Salvador Dalí'
    },
    website: 'https://mathieulaurent.fr',
    instagram: 'mathieu.ink',
    email: 'mathieu@laurentstudio.fr',
    verified: true,
    artworksCount: 2,
    followersCount: 0,
    followingCount: 0,
    badges: ['Carbon Draftsman', 'Ink Master']
  },
  {
    id: 'artist-6',
    name: 'Dr. Soraya Malek',
    handle: '@soraya.digital',
    avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1400&q=80',
    bio: 'Computational researcher and generative artist visualizing subconscious memory recall as interlocking photonic crystal lattices.',
    discipline: 'Generative Neural Shaders & 3D Media',
    location: 'Geneva, Switzerland',
    favoriteQuote: {
      text: 'Algorithms are the brushes of the post-digital renaissance.',
      author: 'Dr. Soraya Malek'
    },
    website: 'https://sorayamalek.ch',
    instagram: 'soraya.digital',
    twitter: 'soraya_malek',
    email: 'malek@cern-art.ch',
    verified: true,
    artworksCount: 2,
    followersCount: 0,
    followingCount: 0,
    badges: ['Generative Pioneer', 'Shader Architect']
  }
];

export const CURRENT_USER: UserProfile = DEFAULT_USER;

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'art-1787665037985-nnxxg',
    title: 'I Suppose',
    artist: {
      id: 'user-my-atelier',
      name: 'Afshaan Shaikh',
      handle: '@afshaanshaikh',
      avatar: '/curatorial-masterpiece.svg',
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
    likesCount: 540,
    viewsCount: 1980,
    savesCount: 86,
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
      avatar: '/curatorial-masterpiece.svg',
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
    likesCount: 24,
    viewsCount: 142,
    savesCount: 18,
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
      avatar: '/curatorial-masterpiece.svg',
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
    likesCount: 31,
    viewsCount: 195,
    savesCount: 22,
    createdAt: '2026-08-15T18:30:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#0d1117', '#c9a875', '#21262d', '#f0e6d6'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
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
    id: 'art-1-v2',
    title: 'Echoes of Gold and Rust',
    artist: {
      id: 'artist-1',
      name: 'Julian Thorne',
      handle: '@julianthorne',
      avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Edinburgh, UK'
    },
    category: 'painting',
    mediaUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=80',
    dimensions: '140 x 180 cm',
    medium: 'Oil and Acrylic on Canvas',
    year: 2025,
    description: 'A visceral expression of organic decay and renewal, featuring heavy textured layers and striking gold-leaf accents over a deep dark canvas.',
    curatorNote: 'Acquired for the permanent winter collection. Exceptional use of textural contrast and warmth.',
    tags: ['Oil Painting', 'Abstract Expressionism', 'Textural', 'Gold Leaf'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-11T10:15:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#12100e', '#c9a875', '#4a3b2c', '#8c704f', '#e6dac3'],
    isLiked: false,
    isSaved: false,
    featured: true,
    exhibitionId: 'exh-1',
    exhibitionName: 'Chiaroscuro & Nocturnes'
  },
  {
    id: 'poetry-1',
    title: 'Anatomy of the Night Wind',
    artist: {
      id: 'artist-2',
      name: 'Aria Chen',
      handle: '@ariachen.verse',
      avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Kyoto, Japan'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Free Verse & Spoken Resonance',
    year: 2026,
    description: 'A contemplative lyric piece exploring quiet transitions between memory, architecture, and silence in Kyoto midnight gardens.',
    tags: ['Poetry', 'Lyric Verse', 'Nocturne', 'Philosophy'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-12T09:15:00Z',
    aspectRatio: 'portrait',
    colorPalette: ['#0f121a', '#9bb4d0', '#25354e', '#e3ecf5'],
    isLiked: false,
    isSaved: false,
    featured: true,
    poetryContent: {
      stanzas: [
        'We traded lanterns for the cold precision\nof stars that had forgotten how to burn.\nYou spoke of stones as though they held a pulse,\nand I listened till the stones agreed.',
        'Between the cedar beams and fallen dew,\nthe house breathes out its century of dust.\nNothing is lost that was not first surrendered\nto the black river running beneath the floor.',
        'Now when the midnight bell dissolves in rain,\nI do not ask whose voice it meant to carry.\nOnly that the wind should keep its promises,\nand leave the shutter open to the dark.'
      ],
      theme: 'midnight',
      fontStyle: 'cormorant',
      alignment: 'center',
      readingTimeMinutes: 2,
      authorSignature: '— Aria Chen, from "Monasteries of the Rain"',
      subtitle: 'From the Kyoto Meditations'
    }
  },
  {
    id: 'art-2-v2',
    title: 'Macro Floral Study',
    artist: {
      id: 'artist-3',
      name: 'Kaelen Vance',
      handle: '@kaelen.vfx',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Berlin, Germany'
    },
    category: 'video',
    mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1400&q=80',
    dimensions: '1920 x 1080 (HD)',
    medium: 'Digital Video & Macro Photography',
    year: 2026,
    description: 'A mesmerizing macro study of a blossoming flower, capturing the delicate interplay of light and organic movement in stunning high definition.',
    tags: ['Digital Media', 'Macro Video', 'Floral', 'Motion Art'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-14T18:00:00Z',
    aspectRatio: 'wide',
    colorPalette: ['#08090c', '#e2b36e', '#1c1f2b', '#8f7042'],
    isLiked: false,
    isSaved: false,
    featured: true,
    videoData: {
      duration: '0:28 (Seamless Loop)',
      isLoop: true,
      resolution: '4K Ultra HD',
      hasAudio: true,
      frameRate: '60 FPS'
    }
  },
  {
    id: 'art-3',
    title: 'Study of the Whispering Ash',
    artist: {
      id: 'artist-4',
      name: 'Mathieu Laurent',
      handle: '@mathieu.ink',
      avatar: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
      verified: false,
      location: 'Lyon, France'
    },
    category: 'drawing',
    mediaUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80',
    dimensions: '90 x 120 cm',
    medium: 'Vine Charcoal & Graphite on Heavyweight Arches Cotton',
    year: 2025,
    description: 'Delicate yet ferocious tonal studies of burnt botanical specimens following the summer forest wildfires in southern France.',
    curatorNote: 'Masterful atmospheric depth achieved through raw erased highlights and compressed carbon.',
    tags: ['Drawing', 'Charcoal', 'Botanical', 'Fine Art'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-08T11:40:00Z',
    aspectRatio: 'square',
    colorPalette: ['#111112', '#787a82', '#32343a', '#c8c9ce'],
    isLiked: false,
    isSaved: false
  },
  {
    id: 'poetry-2',
    title: 'Epitaph for the Last Cartographer',
    artist: {
      id: 'artist-5',
      name: 'Gabriel Morales',
      handle: '@gabriel.verses',
      avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Valparaíso, Chile'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Poetic Prose & Deckle Vellum Typography',
    year: 2026,
    description: 'An ode to erased coastlines, maritime instruments, and uncharted frontiers of human intimacy.',
    tags: ['Poetry', 'Philosophy', 'Historical', 'Elegies'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-11T16:50:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#17130e', '#cbb084', '#3d3121', '#f3ebd9'],
    isLiked: false,
    isSaved: false,
    poetryContent: {
      stanzas: [
        'He drew the continent with trembling fingers,\nleaving wide gaps where no ships dared return.\n"Terra Incognita," he whispered to the candle,\n"is only another word for our forgiveness."',
        'The compass rose lay rusted in salt brine.\nThe longitude dissolved beneath his thumb.\nWhen they asked what lay beyond the southern cape,\nhe closed the atlas and named it after her.'
      ],
      theme: 'vellum',
      fontStyle: 'playfair',
      alignment: 'left',
      readingTimeMinutes: 1,
      authorSignature: '— Gabriel Morales, 2026',
      subtitle: 'From "Maps of the Disappeared"'
    }
  },
  {
    id: 'art-4',
    title: 'Luminescent Synapse',
    artist: {
      id: 'artist-6',
      name: 'Dr. Soraya Malek',
      handle: '@soraya.digital',
      avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Geneva, Switzerland'
    },
    category: 'digital',
    mediaUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    dimensions: 'Native Vector / Resolution Independent',
    medium: 'Generative Neural Shader & Custom Raymarching Code',
    year: 2026,
    description: 'Mathematical visualization of subconscious memory recall encoded as interlocking photonic crystal lattices.',
    tags: ['Digital Art', 'Generative', 'Raymarching', 'Cyberpunk Aesthetics'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-15T12:00:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#0d0c1d', '#9a48d0', '#e56ab3', '#241b47', '#ffd6e8'],
    isLiked: false,
    isSaved: false,
    featured: true,
    exhibitionId: 'exh-2',
    exhibitionName: 'Synthetic Transcendence'
  },
  {
    id: 'poetry-3',
    title: 'The Alchemist’s Soliloquy in Winter',
    artist: {
      id: 'artist-7',
      name: 'Seraphina Holt',
      handle: '@seraphina.words',
      avatar: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Prague, Czechia'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Sonnet & Typography on Crimson Obsidian',
    year: 2026,
    description: 'Reflections on transmutation, love as a thermal reaction, and the silent crucible of solitary craft.',
    tags: ['Sonnet', 'Poetry', 'Alchemy', 'Dark Romance'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-13T20:30:00Z',
    aspectRatio: 'square',
    colorPalette: ['#1c0c10', '#df526b', '#481720', '#fad5dc'],
    isLiked: false,
    isSaved: false,
    poetryContent: {
      stanzas: [
        'I turned the mercury to glass, the lead to stone,\nAnd burned twelve winters in a smoky room;\nYet every furnace left the soul alone,\nA spark of sulfur in a vault of gloom.',
        'Not gold I sought across the crucible’s rim,\nNor elixir to stay the clockwork breath,\nBut just one syllable to summon him\nWhose shadow gave a softer name to death.'
      ],
      theme: 'crimson',
      fontStyle: 'newsreader',
      alignment: 'center',
      readingTimeMinutes: 2,
      authorSignature: '— Seraphina Holt, Prague, 2026',
      subtitle: 'Opus Magnum No. VII'
    }
  },
  {
    id: 'art-5',
    title: 'Echoes of the High Plateau',
    artist: {
      id: 'artist-1',
      name: 'Julian Thorne',
      handle: '@julianthorne',
      avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Edinburgh, UK'
    },
    category: 'painting',
    mediaUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80',
    dimensions: '160 x 200 cm',
    medium: 'Oil, Encaustic Wax, and Volcanic Sand',
    year: 2026,
    description: 'Heavily layered mineral landscape capturing the severe winds and alpine frost of the Cairngorms in midwinter.',
    tags: ['Painting', 'Landscape', 'Mineral Pigment', 'Impasto'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-09T15:20:00Z',
    aspectRatio: 'wide',
    colorPalette: ['#14181c', '#a8b5c2', '#414d59', '#e8edf2'],
    isLiked: false,
    isSaved: false
  },
  {
    id: 'poetry-4',
    title: 'In the Greenhouse of Emerald Spores',
    artist: {
      id: 'artist-2',
      name: 'Aria Chen',
      handle: '@ariachen.verse',
      avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Kyoto, Japan'
    },
    category: 'poetry',
    mediaUrl: '',
    medium: 'Contemporary Verse & Moss Deckle Theme',
    year: 2026,
    description: 'A sensory meditation on botanical regeneration, humid glasshouses, and unhurried organic patience.',
    tags: ['Poetry', 'Nature', 'Botanical', 'Sensory Verse'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-07T10:10:00Z',
    aspectRatio: 'portrait',
    colorPalette: ['#0d1712', '#52b788', '#1b3b2c', '#d8f3dc'],
    isLiked: false,
    isSaved: false,
    poetryContent: {
      stanzas: [
        'The ferns do not argue with the glass.\nThey unfurl their green spiral geometry\nin slow, humid devotion to the mist.',
        'Here beneath the wet ribs of the conservatory,\ntime is counted in drops that fall\nfrom one leaf to the next,\nnever in a hurry to reach the soil.'
      ],
      theme: 'emerald',
      fontStyle: 'cormorant',
      alignment: 'left',
      readingTimeMinutes: 1,
      authorSignature: '— Aria Chen, Botanical Diary',
      subtitle: 'Kyoto Imperial Gardens'
    }
  },
  {
    id: 'art-6',
    title: 'Figure in Obsidian & Gold Leaf',
    artist: {
      id: 'artist-4',
      name: 'Mathieu Laurent',
      handle: '@mathieu.ink',
      avatar: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
      verified: false,
      location: 'Lyon, France'
    },
    category: 'drawing',
    mediaUrl: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1200&q=80',
    dimensions: '100 x 140 cm',
    medium: 'Japanese Sumi Ink, 24K Gold Leaf on Washi Paper',
    year: 2026,
    description: 'Exploration of physical tension and spiritual weight. The reflective gold leaf shimmers against the deep matte absorption of hand-ground pine soot ink.',
    tags: ['Drawing', 'Sumi Ink', 'Gold Leaf', 'Figurative'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-14T08:30:00Z',
    aspectRatio: 'tall',
    colorPalette: ['#0a0b0d', '#d4af37', '#2e2c22', '#f5e6a2'],
    isLiked: false,
    isSaved: false
  },
  {
    id: 'art-7',
    title: 'Voxel Horizon: The Silent Metropolis',
    artist: {
      id: 'artist-6',
      name: 'Dr. Soraya Malek',
      handle: '@soraya.digital',
      avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
      verified: true,
      location: 'Geneva, Switzerland'
    },
    category: 'digital',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    dimensions: '8K Render / 7680 x 4320',
    medium: 'Cinema4D, Redshift & Deep Neural Composition',
    year: 2026,
    description: 'An architectural fantasy imagining an abandoned computational monument floating through interstellar deep space.',
    tags: ['Digital Art', '3D Architecture', 'Surrealism', 'Sci-Fi'],
    likesCount: 0,
    viewsCount: 1,
    savesCount: 0,
    createdAt: '2026-08-06T19:45:00Z',
    aspectRatio: 'wide',
    colorPalette: ['#0d0e14', '#e28d5c', '#332738', '#f2d0b8'],
    isLiked: false,
    isSaved: false
  }
];

export const INITIAL_EXHIBITIONS: Exhibition[] = [
  {
    id: 'exh-1',
    title: 'Chiaroscuro & Nocturnes',
    subtitle: 'A Salon of Shadows, Heavy Pigments & Whispered Elegies',
    curator: 'Afshaan Shaikh & The Curatorial Board',
    coverImage: 'https://images.unsplash.com/photo-1578925518470-4def7aa53bc9?auto=format&fit=crop&w=1200&q=80',
    description: 'An international dialogue between oil masters and contemporary verse lyricists exploring the metaphysical weight of darkness, candlelight, and nocturnal isolation.',
    dates: 'August 1 — September 30, 2026',
    theme: 'Dark Romanticism & Physical Mediums',
    artworkIds: ['art-1-v2', 'poetry-1', 'art-3', 'poetry-3', 'art-6'],
    location: 'Virtual Hall I & Grand Atrium'
  },
  {
    id: 'exh-2',
    title: 'Synthetic Transcendence',
    subtitle: 'Generative Consciousness, Raymarched Voids & Digital Verse',
    curator: 'Dr. Soraya Malek',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Showcasing real-time shader pipelines, volumetric fluid simulations, neural poetry generators, and mathematical sculpture.',
    dates: 'August 15 — October 15, 2026',
    theme: 'Digital Media & Algorithmic Expression',
    artworkIds: ['art-2-v2', 'poetry-2', 'art-4', 'art-7'],
    location: 'Bioluminescent Pavilion'
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    artworkId: 'art-1',
    user: {
      id: 'artist-2',
      name: 'Aria Chen',
      handle: '@ariachen.verse',
      avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    text: 'The glaze depth on the lower right strata is astonishing. It feels like standing at the threshold of a cavern before dawn.',
    createdAt: '2026-08-11T16:20:00Z',
    likesCount: 18,
    isLiked: false
  },
  {
    id: 'comm-2',
    artworkId: 'poetry-1',
    user: {
      id: 'artist-1',
      name: 'Julian Thorne',
      handle: '@julianthorne',
      avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    text: '"Nothing is lost that was not first surrendered..." That line stopped my heartbeat. The cadence matches the rain outside my studio perfectly.',
    createdAt: '2026-08-12T11:45:00Z',
    likesCount: 34,
    isLiked: true
  }
];

export const INITIAL_MARGIN_REFLECTIONS: MarginReflection[] = [
  {
    id: 'margin-1',
    artworkId: 'poetry-1',
    stanzaIndex: 0,
    lineIndex: 0,
    verseSnippet: 'The wind does not speak in syllables',
    author: {
      id: 'artist-1',
      name: 'Julian Thorne',
      handle: '@julianthorne',
      avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    text: 'A profound opening. It immediately strips language down to primal texture before memory even enters.',
    inkColor: 'gold',
    createdAt: '2026-08-12T14:30:00Z',
    upvotes: 19,
    isUpvoted: false,
    isCuratorPick: true
  },
  {
    id: 'margin-2',
    artworkId: 'poetry-1',
    stanzaIndex: 1,
    lineIndex: 1,
    verseSnippet: 'It sifts through the cedar needles',
    author: {
      id: 'artist-4',
      name: 'Marcus Vance',
      handle: '@marcus.vance',
      avatar: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    text: 'The olfactory imagery here is staggering—one can literally smell the petrichor and resin.',
    inkColor: 'sepia',
    createdAt: '2026-08-13T09:15:00Z',
    upvotes: 12,
    isUpvoted: true,
    isCuratorPick: false
  },
  {
    id: 'margin-3',
    artworkId: 'poetry-2',
    stanzaIndex: 0,
    lineIndex: 0,
    verseSnippet: 'Between the clock cycles of quartz',
    author: {
      id: 'artist-6',
      name: 'Dr. Soraya Malek',
      handle: '@soraya.digital',
      avatar: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
      verified: true
    },
    text: 'Bridging computational cadence with human breath. The temporal dissonance is exquisite.',
    inkColor: 'gold',
    createdAt: '2026-08-14T18:00:00Z',
    upvotes: 27,
    isUpvoted: true,
    isCuratorPick: true
  }
];

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
