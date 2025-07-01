import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getAllUsers() {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(usersCollection);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return userList;
}

export async function getAssignedRoles() {
  const users = await getAllUsers();
  return users.map(user => user.role);
}
