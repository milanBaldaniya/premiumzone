import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let authInstance = null;

// Lazy + only ever called from a click handler (browser-only): Firebase Auth
// touches window/indexedDB and must never initialize during Next.js SSR/static
// prerendering — that would run this on the server, where placeholder/empty
// env vars throw and break the build for every page sharing this chunk.
// (Also guards Fast Refresh re-evaluating this module against "Firebase App
// named '[DEFAULT]' already exists".)
function getFirebaseAuth() {
  if (!authInstance) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return authInstance;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Opens the Firebase Google sign-in popup and returns the resulting Firebase
 * ID token — the backend verifies this via the Firebase Admin SDK (see
 * backend/src/services/auth.service.js + config/firebase.js).
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
  return result.user.getIdToken();
}
