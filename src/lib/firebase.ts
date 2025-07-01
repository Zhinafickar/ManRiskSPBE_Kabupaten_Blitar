// lib/firebase.ts

// Firebase core + modular SDKs
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  Firestore,
} from 'firebase/firestore';

// Load from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all values are defined and not placeholders
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('YOUR_API_KEY') &&
  !!firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('YOUR_PROJECT_ID');

// Declare instances
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  // Initialize app if not already done
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  // Auth instance
  auth = getAuth(app);

  // Firestore instance
  if (typeof window !== 'undefined') {
    // On the client: try enabling persistent local cache
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({}),
      });
    } catch (error) {
      // If already initialized, fall back to default instance
      db = getFirestore(app);
    }
  } else {
    // On the server: use default Firestore without persistence
    db = getFirestore(app);
  }
} else {
  // Warn developer if Firebase is not properly configured
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ Firebase not configured correctly. Check your .env.local file. App will run in limited mode.'
    );
  }
}

// Export for use across the app
export { app, auth, db };
