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

    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const fetchUserProfile = async () => {
          if (db) {
            try {
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              
              if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile);
              } else {
                // Profile doesn't exist, let's check if it's a special user.
                let profileToCreate: UserProfile | null = null;
                if (user.email === 'admin@gmail.com') {
                  profileToCreate = { uid: user.uid, email: user.email, fullName: 'Admin', role: 'admin' };
                } else if (user.email === 'superadmin@gmail.com') {
                  profileToCreate = { uid: user.uid, email: user.email, fullName: 'Super Admin', role: 'superadmin' };
                }
                
                if (profileToCreate) {
                  // This is a special user, create their profile document in Firestore
                  // to prevent this from happening again.
                  await setDoc(userDocRef, profileToCreate);
                  setUserProfile(profileToCreate);
                } else {
                  // This is a regular user with a missing profile document.
                  // Setting profile to null will trigger the logout in AppLayout.
                  setUserProfile(null);
                }
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
              setUserProfile(null);
            } finally {
              setLoading(false);
            }
          } else {
            setUserProfile(null);
            setLoading(false);
          }
        };
        fetchUserProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
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
