
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { summarizeUserRisksAndPlans } from '@/ai/flows/summarize-user-risks-and-plans';

interface AiUserSummaryCardProps {
    surveys: Survey[];
    plans: ContinuityPlan[];
    userRole: string;
}

function AiSummarySkeleton() {
    return (
        <Card className="card-print">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    Ringkasan Manajemen Risiko
                </CardTitle>
                <CardDescription>AI sedang menganalisis data Anda untuk memberikan wawasan...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    )
}

export function AiUserSummaryCard({ surveys, plans, userRole }: AiUserSummaryCardProps) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAndSummarize() {
            setLoading(true);
            try {
                if (surveys.length === 0) {
                    setSummary('Belum ada data survei yang Anda masukkan untuk dianalisis oleh AI.');
                    return;
                }

                const result = await summarizeUserRisksAndPlans({
                    userRole: userRole,
                    userSurveyData: JSON.stringify(surveys),
                    userContinuityData: JSON.stringify(plans),
                });
                
                setSummary(result.summary);

            } catch (error) {
                console.error("Failed to get AI summary:", error);
                setSummary('Gagal memuat ringkasan AI. Silakan coba lagi nanti.');
            } finally {
                setLoading(false);
            }
        }
        
        if (userRole && surveys) {
            fetchAndSummarize();
        }
    }, [surveys, plans, userRole]);

    if (loading) {
        return <AiSummarySkeleton />;
    }

    return (
        <Card className="card-print">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    Ringkasan Manajemen Risiko
                </CardTitle>
                <CardDescription>Ringkasan otomatis dari semua risiko dan rencana kontinuitas yang telah Anda input.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
            </CardContent>
        </Card>
    );
}
