import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, deleteDoc } from 'firebase/firestore';
import { Survey } from '@/types/survey';

export async function getAllSurveyData() {
  if (!isFirebaseConfigured || !db) return [];
  const surveysCol = collection(db, 'surveys');
  const surveySnapshot = await getDocs(surveysCol);
  const surveyList = surveySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      // Ensure timestamps are serializable
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      eventDate: data.eventDate?.toDate ? data.eventDate.toDate().toISOString() : null
    };
  });
  return surveyList;
}

export async function addSurvey(surveyData: Omit<Survey, 'id' | 'createdAt'>) {
    if (!isFirebaseConfigured || !db) {
        console.error("Firebase not configured, cannot add survey.");
        throw new Error("Firebase not configured");
    }
    const surveysCollection = collection(db, 'surveys');
    await addDoc(surveysCollection, {
        ...surveyData,
        createdAt: new Date(),
    });
}

export async function getUserSurveys(userId: string) {
    if (!isFirebaseConfigured || !db) return [];
    const surveysCol = collection(db, 'surveys');
    const q = query(surveysCol, where("userId", "==", userId));
    const surveySnapshot = await getDocs(q);
    const surveyList = surveySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
            eventDate: data.eventDate?.toDate ? data.eventDate.toDate().toISOString() : null
        } as Survey;
    });
    return surveyList;
}

export async function deleteSurvey(surveyId: string): Promise<{ success: boolean, message: string }> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, message: 'Firebase is not configured.' };
    }
    try {
        const surveyRef = doc(db, 'surveys', surveyId);
        await deleteDoc(surveyRef);
        return { success: true, message: 'Survey deleted successfully.' };
    } catch (error) {
        console.error("Error deleting survey: ", error);
        return { success: false, message: 'Failed to delete survey.' };
    }
}
