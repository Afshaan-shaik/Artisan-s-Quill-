---
description: Permanent rule enforcing strict session isolation, zero global state bleeding, and no-cache policies for user authentication.
always_on: true
---

# Strict Session Isolation & Multi-User Architecture Rules

## 1. Zero Global State Bleeding
- **NEVER** use global variables, static variables, or shared `localStorage` fallbacks upon initial application load to determine authentication.
- **NEVER** assume a visitor is an authenticated artist or the founder on initial load.
- Fresh browser tabs, incognito windows, external visitors, and direct shared links **MUST** initialize in a clean, unauthenticated `GUEST_USER` state unless a verified session token (`__session` HTTP-only cookie or active `sessionStorage` credential) is explicitly present for that client.

## 2. No-Cache Headers for Authentication & Profile Routes
- **NEVER** permit CDN edge caching, proxy caching, or static-generation caching on authentication, profile, or session-specific endpoints.
- All `/api/auth/*` routes and profile API endpoints must enforce:
  ```http
  Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0
  ```

## 3. Secure Session Mechanism & Persistence
- User authentication and persona switching must rely exclusively on isolated, client-scoped tokens (e.g., HTTP-only `__session` cookies or tab-scoped credentials).
- Profile data must synchronize directly with persistent Cloud Firestore (`profiles` collection) and isolated IndexedDB vaults.
- **DO NOT** use in-memory arrays or local JSON files for session tracking or profile persistence.

## 4. Strict Isolation from Artwork & Gallery Schemas
- Authentication, session lifecycle, and profile changes must remain 100% decoupled from artwork collections, media items, poetry cards, and exhibition records.
- Session operations must never mutate or delete gallery artworks or underlying database schemas.
