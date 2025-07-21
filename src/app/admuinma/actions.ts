'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface VerificationResult {
    success: boolean;
    message: string;
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

        if (tokenData.name.toLowerCase() === name.toLowerCase()) {
            return { success: true, message: 'Token berhasil diverifikasi.' };
        } else {
            return { success: false, message: 'Nama yang terkait dengan token ini tidak cocok.' };
        }
    } catch (error: any) {
        console.error("Error during server-side token verification: ", error);
        return { success: false, message: 'Terjadi kesalahan pada server saat verifikasi token.' };
    }
}
