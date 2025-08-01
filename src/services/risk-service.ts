
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import type { RiskEvent } from '@/types/risk';

export async function getRiskEvents(): Promise<RiskEvent[]> {
    if (!isFirebaseConfigured || !db) {
        console.error("Firebase not configured, cannot fetch risk events.");
        return [];
    }
    const eventsCollection = collection(db, 'risk_events');
    const eventSnapshot = await getDocs(eventsCollection);
    const eventList = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as RiskEvent));

    // Sort alphabetically by name
    eventList.sort((a, b) => a.name.localeCompare(b.name));
    
    return eventList;
}

export async function addRiskCategory(categoryName: string, firstRisk: string) {
    if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase not configured");
    }
    const eventsCollection = collection(db, 'risk_events');
    await addDoc(eventsCollection, {
        name: categoryName,
        impactAreas: [firstRisk],
    });
}

export async function addRiskToCategory(categoryId: string, newRisk: string) {
    if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase not configured");
    }
    const eventRef = doc(db, 'risk_events', categoryId);
    await updateDoc(eventRef, {
        impactAreas: arrayUnion(newRisk)
    });
}
