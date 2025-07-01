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

    let profileUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      // Cleanup previous profile listener
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        profileUnsubscribe = onSnapshot(userDocRef, async (profileDoc) => {
          if (profileDoc.exists()) {
            setUser(authUser);
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false);
          } else {
            // Profile doesn't exist yet. Keep loading.
            // Handle special user creation.
            let profileToCreate: UserProfile | null = null;
            if (authUser.email === 'admin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Admin', role: 'admin' };
            } else if (authUser.email === 'superadmin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Super Admin', role: 'superadmin' };
            }
            
            if (profileToCreate) {
                // The snapshot will fire again once this is set. We don't stop loading yet.
                await setDoc(userDocRef, profileToCreate).catch(console.error);
            }
            // For regular new users, we just wait. `loading` stays true.
          }
        });
      } else {
        // User logged out
        setUser(null);
        setUserProfile(null);
        setLoading(false);
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
