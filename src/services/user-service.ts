import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

export async function getAllUsers(): Promise<UserProfile[]> {
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

export async function getAssignedRoles() {
  const users = await getAllUsers();
  return users.map(user => user.role);
}
