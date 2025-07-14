import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { ADMIN_ROLES } from '@/constants/admin-data';

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
  // Admin roles are not considered "taken" in the same way as unique departmental roles
  if (ADMIN_ROLES.includes(role)) return false;

  const roleDocRef = doc(db, 'roles', role);
  const roleDoc = await getDoc(roleDocRef);

  if (!roleDoc.exists()) {
    return false; // Role is not taken
  }

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
        const isOldRoleDepartmental = !ADMIN_ROLES.includes(oldRole);
        const isNewRoleDepartmental = !ADMIN_ROLES.includes(newRole);

        const batch = writeBatch(db);

        // Update user document
        batch.set(userRef, { 
            fullName: user.fullName, 
            role: newRole, 
            phoneNumber: user.phoneNumber || null 
        }, { merge: true });

        // Handle role change in 'roles' collection if it changed
        if (oldRole !== newRole) {
            // If new role is departmental, check if it's taken
            if (isNewRoleDepartmental) {
                const newRoleRef = doc(db, 'roles', newRole);
                const newRoleDoc = await getDoc(newRoleRef);
                if (newRoleDoc.exists() && newRoleDoc.data().uid !== user.uid) {
                    return { success: false, message: `Role '${newRole}' is already taken.` };
                }
                // Create lock for new role
                batch.set(newRoleRef, { uid: user.uid, createdAt: new Date() });
            }
            
            // If old role was departmental, remove the lock
            if (isOldRoleDepartmental && oldRole) {
                const oldRoleRef = doc(db, 'roles', oldRole);
                batch.delete(oldRoleRef);
            }
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
            return { success: true, message: 'User data not found, nothing to delete.' };
        }

        const userRole = userDoc.data().role;
        const isDepartmentalRole = !ADMIN_ROLES.includes(userRole);

        const batch = writeBatch(db);
        batch.delete(userRef);
        
        // If it was a departmental role, also delete the role lock
        if (isDepartmentalRole && userRole) {
            const roleRef = doc(db, 'roles', userRole);
            const roleDocSnapshot = await getDoc(roleRef);
            // Only delete if the lock belongs to this user
            if (roleDocSnapshot.exists() && roleDocSnapshot.data().uid === uid) {
                 batch.delete(roleRef);
            }
        }

        await batch.commit();

        return { success: true, message: 'User data and role deleted successfully.' };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return { success: false, message: 'Failed to delete user data.' };
    }
}
