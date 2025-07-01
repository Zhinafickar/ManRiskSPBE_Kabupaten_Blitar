'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
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

  // This effect only handles auth state changes (subscribing to the user object)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth!, (currentUser) => {
      setLoading(true); // Always set loading true on auth change
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // This effect handles profile fetching via a reactive listener
  useEffect(() => {
    if (!user || !db) {
      if (!user) setLoading(false); // If there's no user, we're not loading a profile
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(
      userDocRef,
      async (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          // Profile doesn't exist. Check for special users to auto-create profile.
          let profileToCreate: UserProfile | null = null;
          if (user.email === 'admin@gmail.com') {
            profileToCreate = { uid: user.uid, email: user.email, fullName: 'Admin', role: 'admin' };
          } else if (user.email === 'superadmin@gmail.com') {
            profileToCreate = { uid: user.uid, email: user.email, fullName: 'Super Admin', role: 'superadmin' };
          }
          
          if (profileToCreate) {
            // This will trigger the onSnapshot listener again with the new data
            await setDoc(userDocRef, profileToCreate).catch(console.error);
          } else {
            // For regular users (during registration or error), profile is null for now
            setUserProfile(null);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to user profile:", error);
        setUserProfile(null);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

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
