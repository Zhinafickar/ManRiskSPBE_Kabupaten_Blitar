'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, writeBatch } from 'firebase/firestore';
import { generateFictitiousData } from '@/ai/flows/generate-fictitious-data';
import { suggestContinuityPlan } from '@/ai/flows/suggest-continuity-plan';
import { getRiskLevel } from '@/lib/risk-matrix';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';

interface GenerationParams {
  role: string;
  surveyCount: number;
  planCount: number;
}

interface GenerationResult {
    success: boolean;
    message: string;
    surveys: Survey[];
    continuityPlans: ContinuityPlan[];
}


export async function addFictitiousData({ role, surveyCount, planCount }: GenerationParams): Promise<GenerationResult> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, message: 'Firebase not configured.', surveys: [], continuityPlans: [] };
    }

    try {
        // Step 1: Generate survey data using AI
        const fictitiousSurveyData = await generateFictitiousData({ role, surveyCount });
        
        const surveys: Survey[] = [];
        const continuityPlans: ContinuityPlan[] = [];

        const batch = writeBatch(db);
        const surveysCollection = collection(db, 'surveys');
        const continuityPlansCollection = collection(db, 'continuityPlans');

        // Step 2: Process and save survey data
        for (const survey of fictitiousSurveyData.surveys) {
            const riskLevel = getRiskLevel(survey.frequency, survey.impactMagnitude).level || 'Minor';
            const newSurveyRef = collection(db, surveysCollection.path).doc();
            
            const surveyToAdd: Omit<Survey, 'id'> = {
                ...survey,
                userId: 'fictitious_user',
                userRole: role,
                surveyType: 1,
                eventDate: new Date(),
                createdAt: new Date().toISOString(),
                riskLevel: riskLevel,
                isFictitious: true,
            };
            batch.set(newSurveyRef, surveyToAdd);
            surveys.push({ ...surveyToAdd, id: newSurveyRef.id });
        }

        // Step 3: Generate and save continuity plans based on the generated surveys
        const surveysForPlans = surveys.slice(0, planCount);

        for (const survey of surveysForPlans) {
            const planSuggestion = await suggestContinuityPlan({
                selectedSurveyDetails: {
                    riskEvent: survey.riskEvent,
                    impactArea: survey.impactArea,
                    cause: survey.cause,
                    impact: survey.impact,
                    riskLevel: survey.riskLevel || 'N/A'
                },
                allSurveyData: JSON.stringify(surveys),
            });

            const newPlanRef = collection(db, continuityPlansCollection.path).doc();
            
            const planToAdd: Omit<ContinuityPlan, 'id'> = {
                userId: 'fictitious_user',
                userRole: role,
                risiko: `${survey.riskEvent} - ${survey.impactArea}`,
                rto: `${Math.floor(Math.random() * 24) + 1} Jam`,
                rpo: `${Math.floor(Math.random() * 4) + 1} Jam`,
                createdAt: new Date().toISOString(),
                isFictitious: true,
                ...planSuggestion
            };
            batch.set(newPlanRef, planToAdd);
            continuityPlans.push({ ...planToAdd, id: newPlanRef.id });
        }

        await batch.commit();

        return {
            success: true,
            message: 'Data fiktif berhasil dibuat.',
            surveys,
            continuityPlans
        };

    } catch (error) {
        console.error("Error generating fictitious data:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { success: false, message: `Gagal membuat data: ${errorMessage}`, surveys: [], continuityPlans: [] };
    }
}
