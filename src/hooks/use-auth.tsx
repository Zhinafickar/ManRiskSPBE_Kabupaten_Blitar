'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      console.warn("Firebase is not configured. Authentication will not work.");
      setLoading(false);
      return;
    }

    let profileUnsubscribe: Unsubscribe | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Clean up previous profile listener if it exists
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (authUser) {
        setUser(authUser); // Set the Firebase user immediately
        setLoading(true); // Always be loading until we resolve the profile

        const userDocRef = doc(db, 'users', authUser.uid);
        profileUnsubscribe = onSnapshot(userDocRef, async (profileDoc) => {
          if (profileDoc.exists()) {
            // Profile exists, we are good to go.
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false); // Stop loading, we have everything.
          } else {
            // Profile doesn't exist.
            // This could be a new registration, or a special admin user logging in for the first time.
            let profileToCreate: UserProfile | null = null;
            if (authUser.email === 'admin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Admin', role: 'admin' };
            } else if (authUser.email === 'superadmin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Super Admin', role: 'superadmin' };
            }

            if (profileToCreate) {
              // Create the profile; the onSnapshot listener will fire again and resolve the state.
              await setDoc(userDocRef, profileToCreate).catch(console.error);
            } else {
              // This is a regular user during registration.
              // We do nothing and keep `loading` as `true`.
              // The `register-form.tsx` is responsible for creating the document.
              // Once it's created, this `onSnapshot` will fire again and the `if (profileDoc.exists())` block will run.
              // This correctly handles the race condition by simply waiting.
              setUserProfile(null); // Ensure profile is null while we wait
            }
          }
        });
      } else {
        // User logged out
        setUser(null);
        setUserProfile(null);
        setLoading(false); // Stop loading, we are in a final "logged out" state.
      }
    });

    // Cleanup on component unmount
    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);