---
description: Permanent rule enforcing centralized real-time cloud database synchronization for all artworks, likes, and comments across high-concurrency sessions (500+ users).
always_on: true
---

# Global Real-Time Feed & Universal Interaction Protocol

## 1. Centralized Real-Time Cloud Routing
- **ALL** uploaded artworks, poetry cards, motion loops, likes, and comments **MUST** route directly through the centralized real-time cloud database (Cloud Firestore: `artworks` and `comments` collections).
- **NEVER** rely solely on localized state, static-only rendering, or isolated user-specific arrays for the main public gallery.
- Real-time listeners (`subscribeToCloudArtworks`, `subscribeToCloudComments`) utilizing WebSocket connections must remain actively connected on the client to receive live broadcasts.

## 2. High-Concurrency Environment (500+ Active Creators & Visitors)
- The architecture must always assume a high-concurrency multi-user environment where hundreds of creators and visitors are active simultaneously.
- When any user (Artist or Guest) publishes an artwork, likes a piece, or posts a comment in one session, the change **MUST** broadcast in sub-second real-time to all other active browsers, devices, and tabs without requiring a manual page refresh.

## 3. Universal Open Participation (Guests & Authenticated Artists)
- Both signed-in artists and unauthenticated guests have full permissions to publish creations, like pieces, and write comments on the global feed.
- Guest uploads must include customizable artist attribution (Display Name & Handle) and be written to the cloud database with full real-time propagation.

## 4. Zero Data Loss & Non-Destructive Merging
- Incoming real-time cloud snapshots must merge non-destructively with existing baseline masterpieces and cached vault records (`GalleryService.mergeCloudArtworks`, `GalleryService.mergeCloudComments`).
- **NEVER** wipe, reset, or overwrite existing artwork schemas, collections, or storage buckets during real-time synchronization.
