import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { Survey } from '@/types/survey';

export async function getAllSurveyData() {
  const surveysCol = collection(db, 'surveys');
  const surveySnapshot = await getDocs(surveysCol);
  const surveyList = surveySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      // Ensure createdAt is serializable
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
    };
  });
  return surveyList;
}

export async function addSurvey(surveyData: Omit<Survey, 'id' | 'createdAt'>) {
    const surveysCollection = collection(db, 'surveys');
    await addDoc(surveysCollection, {
        ...surveyData,
        createdAt: new Date(),
    });
}

export async function getUserSurveys(userId: string) {
    const surveysCol = collection(db, 'surveys');
    const q = query(surveysCol, where("userId", "==", userId));
    const surveySnapshot = await getDocs(q);
    const surveyList = surveySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
        } as Survey;
    });
    return surveyList;
}
