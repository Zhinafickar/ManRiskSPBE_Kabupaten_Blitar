'use client';

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
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
      // If a profile listener is active from a previous user, unsubscribe from it.
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
      
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        profileUnsubscribe = onSnapshot(userDocRef, (profileDoc) => {
          if (profileDoc.exists()) {
            // Profile found. User is fully authenticated.
            setUser(authUser);
            setUserProfile(profileDoc.data() as UserProfile);
            setLoading(false);
          } else {
            // Profile doesn't exist. This could be a new registration or an error state.
            const creationTime = new Date(authUser.metadata.creationTime!).getTime();
            const now = new Date().getTime();
            const isNewUser = (now - creationTime) < 10000; // 10-second window for registration

            if (isNewUser) {
              // It's a new user. We wait for the registration form to create the profile.
              // The app remains in a loading state.
              setUser(authUser);
              setUserProfile(null);
              setLoading(true);
            } else {
              // It's an existing user with a missing profile. This is an error state.
              // Silently log them out to prevent them from getting stuck.
              auth.signOut();
            }
          }
        }, (error) => {
            console.error("Error fetching user profile:", error);
            auth.signOut();
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
