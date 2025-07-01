// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required Firebase config values are provided and are not placeholders
export const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('YOUR_API_KEY') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('YOUR_PROJECT_ID');

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // On the client, we want to initialize with persistence.
  if (typeof window !== 'undefined') {
    try {
      // initializeFirestore can only be called once, and it throws
      // if it's called again. This can happen with Next.js's hot reloading.
      // The try/catch block handles this.
      db = initializeFirestore(app, {
        cache: persistentLocalCache({})
      });
    } catch (e) {
      // If it's already initialized, just get the existing instance
      db = getFirestore(app);
    }
  } else {
    // On the server, we just get the default instance without persistence.
    db = getFirestore(app);
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn(
      "Firebase is not configured. Please add your Firebase credentials to the .env file. The app will run in a limited mode without database or authentication features."
    );
  }
}

export { app, auth, db };
