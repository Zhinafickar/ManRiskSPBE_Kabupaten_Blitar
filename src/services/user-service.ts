import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!isFirebaseConfigured || !db) return [];
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(usersCollection);
  const userList: UserProfile[] = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    };
  });
  return userList;
}

export async function isRoleTaken(role: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false; // Assume role is not taken if Firebase is not configured
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('role', '==', role));
  const userSnapshot = await getDocs(q);
  return !userSnapshot.empty; // If the snapshot is not empty, the role is taken
}

// Note: The actual user creation (with auth) happens in src/app/register/_components/register-form.tsx.
// We will modify that component to use the isRoleTaken check.

export async function getAssignedRoles() {
  if (!isFirebaseConfigured || !db) return [];
  const users = await getAllUsers();
  return users.map(user => user.role);
}


export async function updateUserData(user: Pick<UserProfile, 'uid' | 'fullName' | 'role' >) {
    if (!isFirebaseConfigured || !db) return { success: false, message: 'Firebase is not configured.' };
    try {
        const userRef = doc(db, 'users', user.uid);
        // Do not update email, only fullName and role
        await setDoc(userRef, { fullName: user.fullName, role: user.role }, { merge: true });
        return { success: true, message: 'User updated successfully.' };
    } catch (error) {
        console.error("Error updating user: ", error);
        return { success: false, message: 'Failed to update user.' };
    }
}

export async function deleteUserData(uid: string) {
    if (!isFirebaseConfigured || !db) return { success: false, message: 'Firebase is not configured.' };
    try {
        const userRef = doc(db, 'users', uid);
        await deleteDoc(userRef);
        return { success: true, message: 'User data deleted successfully.' };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return { success: false, message: 'Failed to delete user data.' };
    }
}
