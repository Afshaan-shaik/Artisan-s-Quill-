import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  serverTimestamp
} from 'firebase/firestore';
import { Artwork, UserProfile, Comment, Exhibition } from '../types';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = 'atelier_firebase_custom_config_v1';

/**
 * Retrieves the active Firebase configuration.
 * Priority: 1. LocalStorage custom config -> 2. Environment variables -> 3. Default demo template
 */
export function getActiveFirebaseConfig(): FirebaseConfigParams {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDI2VK3aGth1Xghio-ifnf8G8zntWnNMFM",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "the-artisans-quill.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "the-artisans-quill",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "the-artisans-quill.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "820591578317",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:820591578317:web:3f4ae9f1334c2a9cc9ad84"
  };
}

/**
 * Checks if a real non-empty API key is present
 */
export function isFirebaseConfigured(): boolean {
  const config = getActiveFirebaseConfig();
  return Boolean(config.apiKey && config.apiKey.length > 10 && !config.apiKey.includes('DemoKey'));
}

/**
 * Parses raw pasted Firebase config (JS object or JSON) and saves it permanently
 */
export function saveCustomFirebaseConfig(rawInput: string): { success: boolean; config?: FirebaseConfigParams; error?: string } {
  try {
    let parsed: any = null;

    // Clean input if user pasted `const firebaseConfig = { ... };`
    let clean = rawInput.trim();
    if (clean.includes('{') && clean.includes('}')) {
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      clean = clean.substring(start, end + 1);
    }

    try {
      parsed = JSON.parse(clean);
    } catch {
      // Try parsing JavaScript object format (where keys aren't quoted)
      const sanitized = clean
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}');
      parsed = JSON.parse(sanitized);
    }

    if (!parsed || !parsed.apiKey || !parsed.projectId) {
      return { success: false, error: 'Configuration must contain at least "apiKey" and "projectId".' };
    }

    const config: FirebaseConfigParams = {
      apiKey: parsed.apiKey.trim(),
      authDomain: (parsed.authDomain || `${parsed.projectId}.firebaseapp.com`).trim(),
      projectId: parsed.projectId.trim(),
      storageBucket: (parsed.storageBucket || `${parsed.projectId}.appspot.com`).trim(),
      messagingSenderId: (parsed.messagingSenderId || '').trim(),
      appId: (parsed.appId || '').trim()
    };

    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    reinitializeFirebase(config);

    return { success: true, config };
  } catch (err: any) {
    return { success: false, error: 'Could not parse configuration format. Please verify your keys from Firebase Console.' };
  }
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let currentConfigString = '';

export function reinitializeFirebase(config?: FirebaseConfigParams): void {
  try {
    if (typeof window === 'undefined') return;

    const conf = config || getActiveFirebaseConfig();
    if (!conf.apiKey) return;

    const newConfigStr = JSON.stringify(conf);
    if (app && auth && db && googleProvider && currentConfigString === newConfigStr) {
      return; // Already initialized with the same configuration
    }

    if (getApps().length > 0) {
      for (const a of getApps()) {
        deleteApp(a).catch(() => {});
      }
    }

    app = initializeApp(conf);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    currentConfigString = newConfigStr;
  } catch (err) {
    console.warn('[Firebase Init Warning]:', err);
  }
}

// Initial setup on module load
try {
  reinitializeFirebase();
} catch {
  // Safe resilience
}

export { auth, db };

/**
 * Signs out from Firebase Authentication if an active session exists.
 */
export async function signOutFirebaseUser(): Promise<void> {
  if (auth && auth.currentUser) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('[Firebase SignOut]:', err);
    }
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function subscribeToFirebaseAuthState(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    reinitializeFirebase();
  }
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

/**
 * Builds a standardized UserProfile from Google identity data.
 */
export function buildUserProfileFromGoogleData(googleData: {
  uid?: string;
  name?: string;
  email?: string;
  photoURL?: string;
}): UserProfile {
  const email = (googleData.email || '').trim();
  const name = (googleData.name || 'Atelier Artist').trim();
  const rawHandle = email ? email.split('@')[0] : name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle || 'artist'}`;
  const avatar = googleData.photoURL || '';

  const isFounder =
    email.toLowerCase() === 'afshaan100@gmail.com' ||
    email.toLowerCase().includes('afshaan') ||
    name.toLowerCase().includes('afshaan');

  return {
    id: isFounder ? 'user-my-atelier' : `user-${googleData.uid || 'google-' + Date.now()}`,
    name: isFounder ? 'Afshaan Shaikh' : name,
    handle: isFounder ? '@afshaanshaikh' : handle,
    avatar: avatar || (isFounder ? 'https://uskuzbtvbhfqlxvbbrvw.supabase.co/storage/v1/object/public/avatars/profiles/avatars-1788606890329-suv7gl.jpeg' : 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=400&q=80'),
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80',
    bio: isFounder
      ? 'Artist, poet, coder, and software developer. Crafting at the confluence of expressive fine art, lyrical verse, and algorithmic software architecture.'
      : 'Fine artist and collector exploring physical and digital media on The Artisan’s Quill.',
    discipline: isFounder ? 'Artist | Poet | Coder | Software Developer' : 'Visual Artist & Poet',
    location: isFounder ? 'Atelier Studio • Global Digital Sanctuary' : 'Global Atelier',
    favoriteQuote: {
      text: 'Where algorithmic precision meets the lyrical soul of fine art.',
      author: isFounder ? 'Afshaan Shaikh' : name
    },
    website: '',
    email: email,
    phone: '',
    verified: true,
    artworksCount: 0,
    followersCount: 0,
    followingCount: 0,
    badges: isFounder
      ? ['Artist', 'Poet', 'Coder', 'Software Developer', 'Atelier Founder']
      : ['Verified Artist', 'Google Authenticated']
  };
}

/**
 * Synchronizes any UserProfile to Firestore
 */
export async function syncUserProfileToCloud(userProfile: UserProfile): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'profiles', userProfile.id), {
      ...userProfile,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (e) {
    console.warn('[Firestore Sync Warning]: Could not push profile to cloud:', e);
    return false;
  }
}

/**
 * Google Sign-In with popup.
 * Authenticates user and converts Firebase User into Atelier UserProfile.
 */
export async function signInWithGoogleAccount(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
  isConfigError?: boolean;
  isUnauthorizedDomain?: boolean;
  unauthorizedDomainName?: string;
  isPopupBlocked?: boolean;
}> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      isConfigError: true,
      error: 'Firebase API key not configured yet. Please configure your Firebase credentials.'
    };
  }

  if (!auth || !googleProvider) {
    reinitializeFirebase();
  }

  if (!auth || !googleProvider) {
    return {
      success: false,
      isConfigError: true,
      error: 'Firebase Authentication is initializing. Please try again.'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;

    const userProfile = buildUserProfileFromGoogleData({
      uid: fbUser.uid,
      name: fbUser.displayName || '',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || ''
    });

    // Save profile to Cloud Firestore if available
    await syncUserProfileToCloud(userProfile).catch(() => {});

    return { success: true, user: userProfile };
  } catch (err: any) {
    console.warn('[Google Sign-In Notice]:', err?.code || err?.message);

    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.host : 'the-artisans-quill-digital-art-poetry-sanctuary.vercel.app';
      return {
        success: false,
        isUnauthorizedDomain: true,
        unauthorizedDomainName: currentHost,
        error: `Domain "${currentHost}" is not yet listed in Firebase Console. Please add "${currentHost}" to Authorized Domains in Firebase Console.`
      };
    }

    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      return { 
        success: false, 
        error: 'Google Sign-In window was closed. Please click "Continue with Google" to try again.' 
      };
    }

    if (err.code === 'auth/popup-blocked') {
      return {
        success: false,
        isPopupBlocked: true,
        error: 'Google Sign-In popup was blocked by your browser. Please allow popups or use Google Redirect.'
      };
    }

    if (err.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: 'Google Sign-in provider is not enabled in Firebase Console (Build > Authentication > Sign-in method > Google).'
      };
    }

    if (
      err.code === 'auth/api-key-not-valid' ||
      err.code === 'auth/invalid-api-key' ||
      err.message?.includes('api-key-not-valid') ||
      err.message?.includes('API key')
    ) {
      return {
        success: false,
        isConfigError: true,
        error: 'Firebase API Key verification needed. Please check your Firebase configuration.'
      };
    }

    return { success: false, error: err.message || 'Google authentication could not be completed. Please try again.' };
  }
}

/**
 * Initiates Google Sign-In with Redirect (for browsers where popups are blocked)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  if (!auth || !googleProvider) {
    reinitializeFirebase();
  }
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is not ready.');
  }
  await signInWithRedirect(auth, googleProvider);
}

/**
 * Handles the redirect result when user returns from Google OAuth redirect
 */
export async function handleGoogleRedirectResult(): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  if (!auth) {
    reinitializeFirebase();
  }
  if (!auth) return { success: false };

  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const fbUser = result.user;
      const userProfile = buildUserProfileFromGoogleData({
        uid: fbUser.uid,
        name: fbUser.displayName || '',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || ''
      });
      await syncUserProfileToCloud(userProfile).catch(() => {});
      return { success: true, user: userProfile };
    }
    return { success: false };
  } catch (err: any) {
    console.warn('[Google Redirect Auth Notice]:', err?.message);
    return { success: false, error: err?.message };
  }
}

/**
 * Cloud Sync: Push Artwork to Firestore
 */
export async function syncArtworkToCloud(artwork: Artwork): Promise<boolean> {
  if (!db) return false;
  try {
    const artDocRef = doc(db, 'artworks', artwork.id);
    const sanitizedArtwork = JSON.parse(JSON.stringify(artwork));
    await setDoc(artDocRef, {
      ...sanitizedArtwork,
      syncedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore Sync]: Could not sync artwork to cloud:', err);
    return false;
  }
}

/**
 * Cloud Sync: Delete Artwork from Firestore
 */
export async function deleteArtworkFromCloud(artworkId: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, 'artworks', artworkId));
    return true;
  } catch (err) {
    console.warn('[Firestore Sync]: Could not delete artwork from cloud:', err);
    return false;
  }
}

/**
 * Real-time Listener for Artworks
 * Enables 500+ users across any browser to see new creations and updates instantly.
 */
let firestoreAvailable = true;

/**
 * Real-time Listener for Artworks
 * Enables 500+ users across any browser to see new creations and updates instantly.
 */
export function subscribeToCloudArtworks(onUpdate: (artworks: Artwork[]) => void): () => void {
  if (!db || !firestoreAvailable) return () => {};

  try {
    const q = collection(db, 'artworks');
    let unsubscribed = false;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudArtworks: Artwork[] = [];
        snapshot.forEach((docSnap) => {
          cloudArtworks.push(docSnap.data() as Artwork);
        });
        if (cloudArtworks.length > 0) {
          onUpdate(cloudArtworks);
        }
      },
      (error) => {
        // Silently deactivate if Firestore API is unprovisioned or permission is denied
        if (
          error.code === 'permission-denied' ||
          error.message?.includes('PERMISSION_DENIED') ||
          error.message?.includes('has not been used')
        ) {
          firestoreAvailable = false;
          if (!unsubscribed) {
            unsubscribed = true;
            try { unsubscribe(); } catch {}
          }
          return;
        }
      }
    );
    return () => {
      unsubscribed = true;
      try { unsubscribe(); } catch {}
    };
  } catch {
    return () => {};
  }
}

/**
 * Real-time Likes Sync
 */
export async function syncArtworkLikeToCloud(artworkId: string, likesCount: number): Promise<boolean> {
  if (!db || !firestoreAvailable) return false;
  try {
    const artDocRef = doc(db, 'artworks', artworkId);
    await updateDoc(artDocRef, {
      likesCount,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch {
    try {
      const artDocRef = doc(db, 'artworks', artworkId);
      await setDoc(artDocRef, { likesCount, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Real-time Comment Sync
 */
export async function syncCommentToCloud(comment: Comment): Promise<boolean> {
  if (!db || !firestoreAvailable) return false;
  try {
    const commDocRef = doc(db, 'comments', comment.id);
    const sanitizedComment = JSON.parse(JSON.stringify(comment));
    await setDoc(commDocRef, {
      ...sanitizedComment,
      syncedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Real-time Listener for Comments
 */
export function subscribeToCloudComments(onUpdate: (comments: Comment[]) => void): () => void {
  if (!db || !firestoreAvailable) return () => {};

  try {
    const q = collection(db, 'comments');
    let unsubscribed = false;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudComments: Comment[] = [];
        snapshot.forEach((docSnap) => {
          cloudComments.push(docSnap.data() as Comment);
        });
        if (cloudComments.length > 0) {
          onUpdate(cloudComments);
        }
      },
      (error) => {
        if (
          error.code === 'permission-denied' ||
          error.message?.includes('PERMISSION_DENIED') ||
          error.message?.includes('has not been used')
        ) {
          firestoreAvailable = false;
          if (!unsubscribed) {
            unsubscribed = true;
            try { unsubscribe(); } catch {}
          }
          return;
        }
      }
    );
    return () => {
      unsubscribed = true;
      try { unsubscribe(); } catch {}
    };
  } catch {
    return () => {};
  }
}
