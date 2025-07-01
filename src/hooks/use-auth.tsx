'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      // Always start with a loading state during auth changes
      setLoading(true);

      if (currentUser) {
        setUser(currentUser);
        // Try to fetch or create the user profile from Firestore
        if (db) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserProfile(userDoc.data() as UserProfile);
            } else {
              // Document doesn't exist. Check if it's a special user to create a profile.
              let profileToCreate: UserProfile | null = null;
              if (currentUser.email === 'admin@gmail.com') {
                profileToCreate = { uid: currentUser.uid, email: currentUser.email, fullName: 'Admin', role: 'admin' };
              } else if (currentUser.email === 'superadmin@gmail.com') {
                profileToCreate = { uid: currentUser.uid, email: currentUser.email, fullName: 'Super Admin', role: 'superadmin' };
              }

              if (profileToCreate) {
                // Create the document for the special user
                await setDoc(userDocRef, profileToCreate);
                setUserProfile(profileToCreate);
              } else {
                // It's a regular user, but their profile doc is missing.
                // This is an invalid state, so we'll set profile to null.
                setUserProfile(null);
              }
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
          }
        } else {
          // Database isn't configured, can't get a profile.
          setUserProfile(null);
        }
      } else {
        // User is logged out
        setUser(null);
        setUserProfile(null);
      }
      // Finished all checks, set loading to false.
      setLoading(false);
    });

    return () => unsubscribe();
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
