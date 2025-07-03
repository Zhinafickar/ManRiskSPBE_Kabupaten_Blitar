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
      phoneNumber: data.phoneNumber,
    };
  });
  return userList;
}

export async function isRoleTaken(role: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  const roleDocRef = doc(db, 'roles', role);
  const roleDoc = await getDoc(roleDocRef);

  if (!roleDoc.exists()) {
    return false; // Role is not taken
  }

  const roleData = roleDoc.data();
  const existingUid = roleData.uid;
  const creationTime = roleData.createdAt?.toDate(); // Firestore timestamp

  // Cleanup threshold: 1 minute (60 * 1000 ms)
  const STALE_THRESHOLD_MS = 60 * 1000;

  if (creationTime && (new Date().getTime() - creationTime.getTime() > STALE_THRESHOLD_MS)) {
      // The role reservation is older than the threshold.
      // We assume the user is unverified and clean up their data.
      // This does NOT delete their Firebase Auth account, only their user data and role reservation.
      console.warn(`Stale role reservation '${role}' for UID ${existingUid} is being cleared.`);
      await deleteUserData(existingUid);
      return false; // The role is now considered available.
  }

  // If not stale, the role is considered taken.
  return true;
}

export async function getAssignedRoles() {
    if (!isFirebaseConfigured || !db) return [];
    const rolesCollection = collection(db, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);
    return rolesSnapshot.docs.map(doc => doc.id);
}

export async function updateUserData(user: Pick<UserProfile, 'uid' | 'fullName' | 'role'> & { phoneNumber?: string }) {
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

        batch.set(userRef, { 
            fullName: user.fullName, 
            role: newRole, 
            phoneNumber: user.phoneNumber || null 
        }, { merge: true });

        if (oldRole !== newRole) {
            const newRoleRef = doc(db, 'roles', newRole);
            const newRoleDoc = await getDoc(newRoleRef);
            if (newRoleDoc.exists() && newRoleDoc.data().uid !== user.uid) {
                return { success: false, message: `Role '${newRole}' is already taken.` };
            }
            
            if (oldRole) {
                const oldRoleRef = doc(db, 'roles', oldRole);
                batch.delete(oldRoleRef);
            }
            batch.set(newRoleRef, { uid: user.uid, createdAt: new Date() });
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
        
        // Check if the role document actually exists before trying to delete it
        const roleDocSnapshot = await getDoc(roleRef);
        if (roleDocSnapshot.exists() && roleDocSnapshot.data().uid === uid) {
             batch.delete(roleRef);
        }

        await batch.commit();

        return { success: true, message: 'User data and role deleted successfully.' };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return { success: false, message: 'Failed to delete user data.' };
    }
}
