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
      setLoading(false);
      return;
    }

    let unsubscribeProfile: Unsubscribe | undefined;
    let profileTimeout: NodeJS.Timeout | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      // Clean up previous listeners and timeouts
      if (unsubscribeProfile) unsubscribeProfile();
      if (profileTimeout) clearTimeout(profileTimeout);

      if (authUser) {
        setLoading(true); // Always start in loading state for an authenticated user
        const userDocRef = doc(db, 'users', authUser.uid);

        unsubscribeProfile = onSnapshot(userDocRef, async (profileDoc) => {
          if (profileTimeout) clearTimeout(profileTimeout);

          if (profileDoc.exists()) {
            setUser(authUser);
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false);
          } else {
            setUser(authUser);
            setUserProfile(null);
            
            let profileToCreate: UserProfile | null = null;
            if (authUser.email === 'admin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Admin', role: 'admin' };
            } else if (authUser.email === 'superadmin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Super Admin', role: 'superadmin' };
            }

            if (profileToCreate) {
              await setDoc(userDocRef, profileToCreate).catch(console.error);
              return; // The listener will fire again with the created profile.
            }

            // For regular new users, set a timeout. If the profile doesn't appear, it's an error.
            profileTimeout = setTimeout(() => {
                console.error("Profile not found after a delay. This could indicate an error during registration or a missing database record.");
                setLoading(false); // End loading, will trigger error handling in layout
            }, 7000); // 7-second timeout
          }
        }, (error) => {
            console.error("Error listening to user profile:", error);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
        });
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (profileTimeout) clearTimeout(profileTimeout);
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
