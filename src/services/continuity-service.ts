import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, deleteDoc } from 'firebase/firestore';
import { ContinuityPlan } from '@/types/continuity';

export async function addContinuityPlan(planData: Omit<ContinuityPlan, 'id' | 'createdAt'>) {
    if (!isFirebaseConfigured || !db) {
        console.error("Firebase not configured, cannot add plan.");
        throw new Error("Firebase not configured");
    }
    const plansCollection = collection(db, 'continuityPlans');
    await addDoc(plansCollection, {
        ...planData,
        createdAt: new Date(),
    });
}

export async function getAllContinuityPlans(): Promise<ContinuityPlan[]> {
    if (!isFirebaseConfigured || !db) return [];
    const plansCol = collection(db, 'continuityPlans');
    const planSnapshot = await getDocs(plansCol);
    const planList = planSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            userRole: data.userRole,
            risiko: data.risiko,
            aktivitas: data.aktivitas,
            targetWaktu: data.targetWaktu,
            pic: data.pic,
            sumberdaya: data.sumberdaya,
            rto: data.rto,
            rpo: data.rpo,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as ContinuityPlan;
    });
    planList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return planList;
}

export async function getUserContinuityPlans(userId: string): Promise<ContinuityPlan[]> {
    if (!isFirebaseConfigured || !db) return [];
    const plansCol = collection(db, 'continuityPlans');
    // Remove orderBy to avoid needing a composite index. Sorting is now done on the client.
    const q = query(plansCol, where("userId", "==", userId));
    const planSnapshot = await getDocs(q);
    const planList = planSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            userRole: data.userRole,
            risiko: data.risiko,
            aktivitas: data.aktivitas,
            targetWaktu: data.targetWaktu,
            pic: data.pic,
            sumberdaya: data.sumberdaya,
            rto: data.rto,
            rpo: data.rpo,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as ContinuityPlan;
    });

    // Sort the results on the client-side in descending order of creation time
    planList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return planList;
}

export async function deleteContinuityPlan(planId: string): Promise<{ success: boolean, message: string }> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        const planRef = doc(db, 'continuityPlans', planId);
        await deleteDoc(planRef);
        return { success: true, message: 'Rencana kontinuitas berhasil dihapus.' };
    } catch (error) {
        console.error("Error deleting continuity plan: ", error);
        return { success: false, message: 'Gagal menghapus rencana kontinuitas.' };
    }
}
