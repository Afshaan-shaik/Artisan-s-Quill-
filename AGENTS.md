# Project Architecture & Security Guidelines: The Artisan's Quill

## 1. Authentication & Session Isolation Protocol (Strict Enforcement)

1. **Zero Global Memory for Authentication**:
   - Never use global variables, static variables, or shared `localStorage` fallbacks on mount to set user identity.
   - Any fresh browser tab, incognito session, or shared link must initialize as `GUEST_USER`.
   
2. **Session Verification & HTTP-Only Cookies**:
   - Authentication must rely strictly on isolated client tokens or server-validated `__session` HTTP-only cookies (`/api/auth/session`, `/api/auth/me`, `/api/auth/logout`).
   
3. **No-Cache Policy**:
   - Authenticated routes and profile API endpoints must strictly disable edge and browser caching (`Cache-Control: no-store, no-cache, must-revalidate, max-age=0`).

4. **Persistent Infrastructure**:
   - User profile data is stored in Cloud Firestore and IndexedDB vaults, completely decoupled from deployment lifecycles. No in-memory arrays or local JSON files for session tracking.

5. **Artwork & Gallery Preservation**:
   - Auth and session operations must remain strictly isolated from all artworks, media, poetry, and exhibitions.

---

## 2. Global Real-Time Artwork Feed & Universal Interaction Protocol

1. **Centralized Real-Time Cloud Synchronization**:
   - All uploaded artworks, poetry cards, video loops, likes, and comments **MUST** route directly through our centralized real-time cloud database (Cloud Firestore: `artworks` and `comments` collections).
   - **NEVER** use localized-only state, static-only rendering, or isolated user-specific arrays for the main gallery.

2. **High-Concurrency Environment (500+ Users)**:
   - The platform architecture must always assume a high-concurrency environment (500+ simultaneous creators and visitors).
   - Every upload, like, and comment in any session **MUST** instantly broadcast via edge WebSocket listeners (`subscribeToCloudArtworks`, `subscribeToCloudComments`) across all active browsers, devices, and tabs without requiring a hard refresh.

3. **Universal Open Participation**:
   - Both authenticated artists and unauthenticated guests can view, publish, like, and comment across all artworks.
   - Guest creators have full support for custom display name and handle attribution on the live feed.

4. **Zero Data Loss & Non-Destructive Merging**:
   - Live cloud sync must merge non-destructively with foundational artworks and cached records. Never overwrite or wipe existing artwork collections or database schemas.
