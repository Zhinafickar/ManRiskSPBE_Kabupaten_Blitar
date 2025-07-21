
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc, writeBatch, addDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';
import { ADMIN_ROLES } from '@/constants/admin-data';
import type { AdminToken } from '@/types/token';

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

// --- Token Management Functions ---

export async function createAdminToken(name: string, token: string, createdBy: string) {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase not configured");
    
    const tokenRef = collection(db, 'adminTokens');
    await addDoc(tokenRef, {
        name,
        token,
        createdBy,
        createdAt: serverTimestamp(),
    });
}

export async function getAdminTokens(): Promise<AdminToken[]> {
    if (!isFirebaseConfigured || !db) return [];

    const tokensCollection = collection(db, 'adminTokens');
    const tokenSnapshot = await getDocs(tokensCollection);
    
    const tokenList = tokenSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            token: data.token,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };
    });
    // Sort tokens by creation date, newest first
    tokenList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return tokenList;
}

export async function deleteAdminToken(tokenId: string) {
    if (!isFirebaseConfigured || !db) throw new Error("Firebase not configured");
    const tokenRef = doc(db, 'adminTokens', tokenId);
    await deleteDoc(tokenRef);
}

export async function verifyAndConsumeToken(name: string, token: string): Promise<{ success: boolean; message: string }> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, message: 'Layanan tidak tersedia. Silakan coba lagi nanti.' };
    }

    const tokensRef = collection(db, "adminTokens");
    
    try {
        // Fetch all documents and filter on the client side to avoid query permission issues for unauthenticated users.
        // This is acceptable as the number of admin tokens is expected to be small.
        const querySnapshot = await getDocs(tokensRef);

        if (querySnapshot.empty) {
            return { success: false, message: 'Token tidak valid atau tidak ditemukan.' };
        }

        // Find the token that matches the provided token string.
        const matchingToken = querySnapshot.docs.find(doc => doc.data().token === token);
        
        if (!matchingToken) {
            return { success: false, message: 'Token tidak valid.' };
        }
        
        const tokenData = matchingToken.data();

        // Verify that the name associated with the token also matches.
        if (tokenData.name === name) {
            return { success: true, message: 'Token berhasil diverifikasi.' };
        } else {
            return { success: false, message: 'Nama atau token tidak valid.' };
        }

    } catch (error: any) {
        console.error("Error during token verification: ", error);
        if (error.code === 'permission-denied') {
             return { success: false, message: 'Terjadi kesalahan: Izin ditolak. Silakan periksa aturan keamanan Firestore Anda.' };
        }
        return { success: false, message: 'Terjadi kesalahan saat verifikasi token.' };
    }
}
