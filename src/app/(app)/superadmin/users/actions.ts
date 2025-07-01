'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// NOTE: Firebase Admin SDK would be required for creating/deleting users server-side without password.
// For simplicity, this example only handles Firestore data updates.
// Full user creation/deletion would require a more complex setup with Firebase Admin.

const userSchema = z.object({
  uid: z.string(),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
});

export async function updateUser(formData: z.infer<typeof userSchema>) {
  const validatedData = userSchema.safeParse(formData);

  if (!validatedData.success) {
    return { success: false, message: 'Invalid data provided.' };
  }

  const { uid, ...userData } = validatedData.data;

  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
    revalidatePath('/superadmin/users');
    return { success: true, message: 'User updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update user.' };
  }
}

export async function deleteUser(uid: string) {
    if (!uid) {
        return { success: false, message: 'User ID is required.' };
    }
    try {
        // This only deletes the Firestore record.
        // Deleting from Firebase Auth requires Admin SDK or client-side re-authentication.
        const userRef = doc(db, 'users', uid);
        await deleteDoc(userRef);
        revalidatePath('/superadmin/users');
        return { success: true, message: 'User data deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Failed to delete user data.' };
    }
}
