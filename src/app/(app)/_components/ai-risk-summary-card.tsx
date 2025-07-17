
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';
import { getAllSurveyData } from '@/services/survey-service';
import { getAllContinuityPlans } from '@/services/continuity-service';
import { summarizeRisksAndPlans } from '@/ai/flows/summarize-risks-and-plans';

function AiSummarySkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    Analisis Tren Risiko (AI)
                </CardTitle>
                <CardDescription>AI sedang menganalisis data terbaru untuk memberikan wawasan...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    )
}

export function AiRiskSummaryCard() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAndSummarize() {
            try {
                const [surveys, plans] = await Promise.all([
                    getAllSurveyData(),
                    getAllContinuityPlans()
                ]);

                if (surveys.length === 0) {
                    setSummary('Belum ada data survei yang masuk untuk dianalisis oleh AI.');
                    return;
                }

                const result = await summarizeRisksAndPlans({
                    allSurveyData: JSON.stringify(surveys),
                    allContinuityData: JSON.stringify(plans),
                });
                
                setSummary(result.summary);

            } catch (error) {
                console.error("Failed to get AI summary:", error);
                setSummary('Gagal memuat ringkasan AI. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        }
        
        fetchAndSummarize();
    }, []);

    if (loading) {
        return <AiSummarySkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Analisis Tren Risiko (AI)
                </CardTitle>
                <CardDescription>Ringkasan otomatis dari semua risiko dan rencana kontinuitas yang teridentifikasi.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
            </CardContent>
        </Card>
    );
}
