
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ADMIN_ROLES } from '@/constants/admin-data';

interface VerificationResult {
    success: boolean;
    message: string;
    availableRoles?: string[];
}

export async function verifyAdminTokenAction(name: string, token: string): Promise<VerificationResult> {
    if (!db) {
        return { success: false, message: 'Layanan tidak tersedia. Silakan coba lagi nanti.' };
    }

    try {
        const tokensRef = collection(db, "adminTokens");
        const q = query(tokensRef, where("token", "==", token));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, message: 'Token tidak valid atau tidak ditemukan.' };
        }

        const tokenDoc = querySnapshot.docs[0];
        const tokenData = tokenDoc.data();

        if (tokenData.name.toLowerCase() !== name.toLowerCase()) {
            return { success: false, message: 'Nama yang terkait dengan token ini tidak cocok.' };
        }
        
        // Token and name are valid, now check for available admin roles.
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const superAdminExists = usersSnapshot.docs.some(doc => doc.data().role === 'superadmin');

        const availableRoles = superAdminExists 
            ? ADMIN_ROLES.filter(role => role !== 'superadmin')
            : ADMIN_ROLES;

        return { 
            success: true, 
            message: 'Token berhasil diverifikasi.',
            availableRoles: availableRoles
        };

    } catch (error: any) {
        console.error("Error during server-side token verification: ", error);
        return { success: false, message: 'Terjadi kesalahan pada server saat verifikasi token.' };
    }
}
