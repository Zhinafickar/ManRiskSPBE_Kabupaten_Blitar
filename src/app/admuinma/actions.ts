
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
        // Query for a document where the token field matches the provided token
        const q = query(tokensRef, where("token", "==", token));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, message: 'Token tidak valid atau tidak ditemukan.' };
        }

        // Assuming tokens are unique, there should only be one document.
        const tokenDoc = querySnapshot.docs[0];
        const tokenData = tokenDoc.data();

        // Check if the name associated with the found token matches the provided name (case-insensitive)
        if (tokenData.name.toLowerCase() !== name.toLowerCase()) {
            return { success: false, message: 'Nama yang terkait dengan token ini tidak cocok.' };
        }
        
        // If both token and name match, verification is successful
        return { 
            success: true, 
            message: 'Token berhasil diverifikasi.',
        };

    } catch (error: any) {
        console.error("Error during server-side token verification: ", error);
        // Provide a more generic but helpful error message for server-side issues
        return { success: false, message: 'Terjadi kesalahan pada server saat verifikasi. Silakan periksa log server untuk detailnya.' };
    }
}
