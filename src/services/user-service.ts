import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
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
  if (!isFirebaseConfigured || !db) return false;
  const roleDocRef = doc(db, 'roles', role);
  const roleDoc = await getDoc(roleDocRef);
  return roleDoc.exists();
}

export async function getAssignedRoles() {
    if (!isFirebaseConfigured || !db) return [];
    const rolesCollection = collection(db, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);
    return rolesSnapshot.docs.map(doc => doc.id);
}

export async function updateUserData(user: Pick<UserProfile, 'uid' | 'fullName' | 'role' >) {
    if (!isFirebaseConfigured || !db) return { success: false, message: 'Firebase is not configured.' };
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, message: 'User not found.' };
        }

        const oldRole = userDoc.data().role;
        const newRole = user.role;

        const batch = writeBatch(db);

        batch.set(userRef, { fullName: user.fullName, role: newRole }, { merge: true });

        if (oldRole !== newRole) {
            const newRoleRef = doc(db, 'roles', newRole);
            const newRoleDoc = await getDoc(newRoleRef);
            if (newRoleDoc.exists()) {
                return { success: false, message: `Role '${newRole}' is already taken.` };
            }
            
            const oldRoleRef = doc(db, 'roles', oldRole);
            batch.delete(oldRoleRef);
            batch.set(newRoleRef, { uid: user.uid });
        }

        await batch.commit();

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
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, message: 'User not found.' };
        }

        const userRole = userDoc.data().role;
        const roleRef = doc(db, 'roles', userRole);

        const batch = writeBatch(db);
        batch.delete(userRef);
        batch.delete(roleRef);
        await batch.commit();

        return { success: true, message: 'User data and role deleted successfully.' };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return { success: false, message: 'Failed to delete user data.' };
    }
}
