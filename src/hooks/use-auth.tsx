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

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (unsubscribeProfile) unsubscribeProfile();

      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        unsubscribeProfile = onSnapshot(userDocRef, async (profileDoc) => {
          if (profileDoc.exists()) {
            // Profile exists, we are good to go.
            setUser(authUser);
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false);
          } else {
            // Profile does not exist. This could be a new user, or a special user on first login.
            // For special users, we create the profile here.
            let profileToCreate: UserProfile | null = null;
            if (authUser.email === 'admin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Admin', role: 'admin' };
            } else if (authUser.email === 'superadmin@gmail.com') {
              profileToCreate = { uid: authUser.uid, email: authUser.email, fullName: 'Super Admin', role: 'superadmin' };
            }

            if (profileToCreate) {
              await setDoc(userDocRef, profileToCreate).catch(console.error);
              // The onSnapshot listener will fire again with the new data, and loading will be set to false then.
            } else {
              // For a regular new user, the registration form is responsible for creation.
              // We will keep loading=true until the profile appears.
              setUser(authUser);
              setUserProfile(null);
              // We intentionally DON'T set loading to false here. We wait for the profile.
            }
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
