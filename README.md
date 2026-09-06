# The Artisan's Quill — Digital Fine Art & Poetry Sanctuary

<div align="center">
  <p><em>An atmospheric digital atelier and curated sanctuary for paintings, drawings, generative digital media, and coffee-stained lyrical poetry.</em></p>
  <p>
    <a href="https://the-artisans-quill-digital-art-poet.vercel.app/"><strong>Explore Live Production Sanctuary →</strong></a>
  </p>
</div>

---

## ✦ Development & Engineering Contributions Table

The following contributions table chronicles the features, architectural enhancements, and production deployments implemented on **Yesterday (September 6, 2026)** and **Today (September 7, 2026)**:

| Date | Milestone / Feature | Category | Impacted Files | Architectural & Curatorial Impact | Status |
|---|---|---|---|---|---|
| **Sep 6, 2026** *(Yesterday)* | **IM Fell English Typography** | Typography & Aesthetic | `index.html`, `src/index.css` | Integrated classical 17th-century editorial typeface *IM Fell English* (Italic & Regular) from Google Fonts for authentic bookbinding aesthetic. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **Coffee-Stained Parchment CSS Suite** | Styling & Shaders | `src/index.css` | Implemented 12 CSS utilities: torn deckle edges (`clip-path`), coffee ring halos (`radial-gradient`), margin guidelines, parchment textures, reader overlays, bookmark tabs, and drop-caps. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **Poetry Data Model Extension** | Data Architecture | `src/types.ts` | Extended `PoetryData` interface with `dedication`, `poemNumber`, `stainVariant` (0–3), `paperTone` (5 tones), and `excerpt` for customized verse cards. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **Founding Curatorial Poems** | Content & Curatorial | `src/data/initialData.ts` | Authored and indexed 3 foundational masterworks: *Late Kettle* (I.), *Marginalia* (II.), and *Second Cup* (III.) with persistent tea & coffee motifs. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **Authorship Provenance Protocol** | Security & Auth | `src/services/api.ts` | Added `recordClientAuthoredArtwork` & `isClientAuthor` to track creator session ownership without forced login. Protected founding poems from deletion. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **CustomPoemModal Component** | Frontend UI & State | `src/components/CustomPoemModal.tsx` | Built full-featured interactive writing & editing modal with multi-stanza editor, dedication, paper tone swatches, coffee stain selectors, and live parchment preview. | ✅ Completed |
| **Sep 6, 2026** *(Yesterday)* | **PoetrySanctuaryView Component** | Frontend UI & Views | `src/components/PoetrySanctuaryView.tsx` | Created 3-mode gallery view (**📚 Shelf**, **🖊 Desk**, **⊞ Grid**) plus an immersive full-screen reading room with animated bookmark close tab. | ✅ Completed |
| **Sep 7, 2026** *(Today)* | **Sanctuary State & View Integration** | State Management | `src/App.tsx` | Wired `PoetrySanctuaryView` into category selector, replacing generic grid when poetry is selected; connected `CustomPoemModal` write/edit handlers. | ✅ Completed |
| **Sep 7, 2026** *(Today)* | **Universal CRUD & Store Synchronization** | Store & Sync | `src/App.tsx`, `src/services/api.ts` | Connected `handleWritePoem`, `handleEditPoem`, `handleDeletePoem`, and `handlePoemSubmit` with non-destructive merge and toast alerts. | ✅ Completed |
| **Sep 7, 2026** *(Today)* | **TypeScript & Build Verification** | QA & Testing | `dist/` | Executed full production build verification with 0 TypeScript/ESLint errors (2,195 modules transformed in 24.73s). | ✅ Completed |
| **Sep 7, 2026** *(Today)* | **Vercel Production Deployment** | DevOps & CI/CD | `.vercel/`, Vercel Edge | Configured Vercel device authorization and deployed live production build (`dpl_BUKrB1sLWtwdc5q3fU38V8qDxEkb`) aliased to production domains. | ✅ Live |
| **Sep 7, 2026** *(Today)* | **Interactive Contributions Table in UI** | Documentation & UI | `src/components/AboutUsView.tsx` | Embedded interactive Contributions Table and GitHub activity log directly into the Atelier's About section for transparent provenance. | ✅ Live |

---

## 🛠 Tech Stack & Architecture

- **Frontend:** React 19, TypeScript 5.8, Vite 6.4, Tailwind CSS 4.1
- **Typography:** IM Fell English, Cormorant Garamond, Cinzel, Playfair Display, Plus Jakarta Sans
- **Styling:** Vanilla CSS3 Deckle-Edge Clip Paths, Glassmorphism, Canvas Grain Shaders
- **Cloud Database:** Supabase PostgreSQL (Public RLS, IndexedDB caching)
- **Real-Time Edge:** Supabase Realtime Channels + Firebase Cloud Sync (WebSocket listeners)
- **Deployment:** Vercel Edge Network (Zero edge caching on dynamic routes)

---

## 🚀 Running Locally

```bash
# 1. Clone repository
git clone https://github.com/Afshaan-shaik/Artisan-s-Quill-.git
cd Artisan-s-Quill-

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and configure your Supabase/Firebase credentials

# 4. Launch development server
npm run dev

# 5. Production build check
npm run build
```

---

## 🏛 Live Deployments

- **Live Production URL:** [https://the-artisans-quill-digital-art-poet.vercel.app/](https://the-artisans-quill-digital-art-poet.vercel.app/)
- **Alternative Domain:** [https://the-artisans-quill-digital-art-poetry-sanctuary.vercel.app/](https://the-artisans-quill-digital-art-poetry-sanctuary.vercel.app/)
- **Repository:** [https://github.com/Afshaan-shaik/Artisan-s-Quill-](https://github.com/Afshaan-shaik/Artisan-s-Quill-)

---

*Curated with devotion by Afshaan Shaikh — Artist, Poet & Software Developer.*
