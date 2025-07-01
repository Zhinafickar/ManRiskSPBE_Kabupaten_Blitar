'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe, setDoc } from 'firebase/firestore';
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
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'users', authUser.uid);
        
        profileUnsubscribe = onSnapshot(userDocRef, async (profileDoc) => {
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false);
          } else {
            // Profile doesn't exist. This could be a new registration.
            // We'll keep loading until the profile is created by the registration form.
            // The `onSnapshot` will fire again when it's created.
            // Special case for pre-defined admin/superadmin accounts.
             if (authUser.email === 'admin@gmail.com') {
              const adminProfile = { uid: authUser.uid, email: authUser.email, fullName: 'Admin', role: 'admin' };
              await setDoc(userDocRef, adminProfile).catch(console.error);
            } else if (authUser.email === 'superadmin@gmail.com') {
              const superAdminProfile = { uid: authUser.uid, email: authUser.email, fullName: 'Super Admin', role: 'superadmin' };
              await setDoc(userDocRef, superAdminProfile).catch(console.error);
            } else {
                // For a regular user registering, we just wait.
                // setLoading remains true.
                setUserProfile(null);
            }
          }
        });
      } else {
        // No user is signed in.
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

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