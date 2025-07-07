'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys } from '@/services/survey-service';
import { getUserContinuityPlans } from '@/services/continuity-service';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle2, FileCheck, Info, ShieldAlert } from 'lucide-react';

const riskLevelColors = {
  Bahaya: 'hsl(var(--destructive))', // Red
  Sedang: 'hsl(var(--chart-4))',      // Yellow/Orange
  Rendah: 'hsl(var(--chart-2))',      // Teal/Green
  Minor: 'hsl(var(--chart-1))',       // Blue/Primary
};

const chartConfig = {
  count: { label: 'Jumlah' },
  Bahaya: { label: 'Bahaya', color: riskLevelColors.Bahaya },
  Sedang: { label: 'Sedang', color: riskLevelColors.Sedang },
  Rendah: { label: 'Rendah', color: riskLevelColors.Rendah },
  Minor: { label: 'Minor', color: riskLevelColors.Minor },
} satisfies ChartConfig;

type ChartData = {
  name: keyof typeof riskLevelColors;
  value: number;
  fill: string;
}[];

function RiskIndicatorBadge({ level }: { level?: string }) {
    if (!level) return <Badge variant="outline">N/A</Badge>;
    let colorClass = 'bg-gray-400 text-white hover:bg-gray-500';
    switch (level) {
        case 'Bahaya': colorClass = 'bg-red-600 text-white hover:bg-red-700'; break;
        case 'Sedang': colorClass = 'bg-yellow-500 text-black hover:bg-yellow-600'; break;
        case 'Rendah': colorClass = 'bg-green-600 text-white hover:bg-green-700'; break;
        case 'Minor': colorClass = 'bg-blue-600 text-white hover:bg-blue-700'; break;
    }
    return <Badge className={cn(colorClass)}>{level}</Badge>;
}

function ConclusionSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    )
}

export default function ConclusionPage() {
    const { user } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [plans, setPlans] = useState<ContinuityPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                getUserSurveys(user.uid),
                getUserContinuityPlans(user.uid)
            ]).then(([userSurveys, userPlans]) => {
                setSurveys(userSurveys);
                setPlans(userPlans);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const { chartData, totalSurveys, topRisks, riskPlanMap } = useMemo(() => {
        const riskCounts: { [key: string]: number } = { Bahaya: 0, Sedang: 0, Rendah: 0, Minor: 0 };
        let validSurveys = 0;
        
        surveys.forEach(survey => {
            if (survey.riskLevel && survey.riskLevel in riskCounts) {
                riskCounts[survey.riskLevel]++;
                validSurveys++;
            }
        });

        const dataForChart = Object.entries(riskCounts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name as keyof typeof riskLevelColors,
                value,
                fill: riskLevelColors[name as keyof typeof riskLevelColors],
            }));
        
        const riskPriorityOrder = { 'Bahaya': 1, 'Sedang': 2, 'Rendah': 3, 'Minor': 4 };
        const sortedTopRisks = surveys
            .filter(s => s.riskLevel === 'Bahaya' || s.riskLevel === 'Sedang')
            .sort((a, b) => riskPriorityOrder[a.riskLevel as keyof typeof riskPriorityOrder] - riskPriorityOrder[b.riskLevel as keyof typeof riskPriorityOrder]);

        const planMap = new Map<string, ContinuityPlan>();
        plans.forEach(plan => {
            planMap.set(plan.risiko, plan);
        });

        return {
            chartData: dataForChart,
            totalSurveys: validSurveys,
            topRisks: sortedTopRisks,
            riskPlanMap: planMap
        };
    }, [surveys, plans]);

    if (loading) {
        return <ConclusionSkeleton />;
    }
    
    if (surveys.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-6 w-6" />
                        Conclusion/Kesimpulan
                    </CardTitle>
                    <CardDescription>
                        Summary and conclusions from your risk assessments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground text-center">
                            Anda belum mengirimkan survei risiko apa pun. <br/> Halaman ini akan menampilkan rangkuman setelah Anda memasukkan data.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="h-6 w-6" />
                        Conclusion/Kesimpulan
                    </CardTitle>
                    <CardDescription>
                       Ringkasan dan kesimpulan dari semua data penilaian risiko dan rencana kontinuitas yang telah Anda kirimkan.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Ringkasan Umum
                        </CardTitle>
                        <CardDescription>Jumlah total data yang telah Anda kirimkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <div className="flex justify-around">
                            <div>
                                <p className="text-4xl font-bold">{surveys.length}</p>
                                <p className="text-sm text-muted-foreground">Survei Risiko</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold">{plans.length}</p>
                                <p className="text-sm text-muted-foreground">Rencana Kontinuitas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            Distribusi Tingkat Risiko
                        </CardTitle>
                        <CardDescription>Visualisasi persentase tingkat risiko dari total survei.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
                                <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => `${value} (${((value / totalSurveys) * 100).toFixed(0)}%)`}
                                            hideLabel
                                        />
                                    }
                                />
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60}>
                                    {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="text-xs -mt-2" />
                            </PieChart>
                            </ChartContainer>
                        ) : (
                             <div className="flex items-center justify-center h-[200px]">
                                <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Risiko Prioritas (Bahaya & Sedang)
                    </CardTitle>
                    <CardDescription>Daftar risiko dengan tingkat tertinggi yang memerlukan perhatian dan rencana mitigasi.</CardDescription>
                </CardHeader>
                <CardContent>
                    {topRisks.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tingkat Risiko</TableHead>
                                    <TableHead>Risiko</TableHead>
                                    <TableHead>Area Dampak</TableHead>
                                    <TableHead className="text-center">Status Rencana Kontinuitas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topRisks.map((risk) => {
                                    const riskIdentifier = `${risk.riskEvent} - ${risk.impactArea}`;
                                    const hasPlan = riskPlanMap.has(riskIdentifier);
                                    return (
                                        <TableRow key={risk.id}>
                                            <TableCell><RiskIndicatorBadge level={risk.riskLevel} /></TableCell>
                                            <TableCell className="font-medium max-w-sm truncate">{risk.riskEvent}</TableCell>
                                            <TableCell className="max-w-sm truncate">{risk.impactArea}</TableCell>
                                            <TableCell className="text-center">
                                                {hasPlan ? (
                                                     <Badge variant="secondary" className="text-green-700 border-green-300">
                                                        <CheckCircle2 className="mr-2 h-4 w-4"/> Ada
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <AlertTriangle className="mr-2 h-4 w-4"/> Belum Ada
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">
                                Selamat! Tidak ada risiko dengan tingkat 'Bahaya' atau 'Sedang' yang teridentifikasi.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
