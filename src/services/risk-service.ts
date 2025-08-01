import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, doc, runTransaction, arrayUnion } from 'firebase/firestore';
import type { RiskEvent } from '@/types/risk';
import { RISK_EVENTS } from '@/constants/data'; // Keep this for initial seeding or as fallback

export async function getRiskEvents(): Promise<RiskEvent[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Returning constant data.");
        // Fallback to constant data if Firebase is not set up
        return RISK_EVENTS;
    }

    try {
        const riskCategoriesCol = collection(db, 'risk_categories');
        const snapshot = await getDocs(riskCategoriesCol);

        if (snapshot.empty) {
            // If the collection is empty, you might want to seed it with initial data
            // For now, just return empty or the constant data
            return RISK_EVENTS; 
        }

        const events: RiskEvent[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                name: doc.id,
                impactAreas: data.impactAreas || []
            } as RiskEvent;
        });

        events.sort((a, b) => a.name.localeCompare(b.name));
        return events;
    } catch (error) {
        console.error("Error fetching risk events from Firestore:", error);
        // Fallback to constant data in case of an error
        return RISK_EVENTS;
    }
}

export async function addRisk(category: string, risk: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase not configured");
    }

    const categoryRef = doc(db, 'risk_categories', category);

    try {
        await runTransaction(db, async (transaction) => {
            const categoryDoc = await transaction.get(categoryRef);

            if (!categoryDoc.exists()) {
                // If the category does not exist, create it with the new risk
                transaction.set(categoryRef, { impactAreas: [risk] });
            } else {
                // If the category exists, add the new risk to the impactAreas array
                const data = categoryDoc.data();
                if (data.impactAreas && data.impactAreas.includes(risk)) {
                    // Risk already exists, do nothing or throw an error
                    throw new Error(`Risiko "${risk}" sudah ada di kategori "${category}".`);
                }
                transaction.update(categoryRef, {
                    impactAreas: arrayUnion(risk)
                });
            }
        });
    } catch (error) {
        console.error("Error adding risk:", error);
        throw error; // Re-throw the error to be caught by the calling function
    }
}
