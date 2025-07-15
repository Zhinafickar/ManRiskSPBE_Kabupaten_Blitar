
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSurveyData } from "@/services/survey-service";
import type { Survey } from '@/types/survey';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

// --- Chart Configs ---
const riskLevelColors = {
  Bahaya: 'hsl(0, 72%, 51%)',     // bg-red-600
  Sedang: 'hsl(45, 93%, 47%)',    // bg-yellow-500
  Rendah: 'hsl(142, 69%, 31%)',   // bg-green-600
  Minor: 'hsl(221, 83%, 53%)',    // bg-blue-600
};

const pieChartConfig = {
  count: { label: 'Jumlah' },
  Bahaya: { label: 'Bahaya', color: riskLevelColors.Bahaya },
  Sedang: { label: 'Sedang', color: riskLevelColors.Sedang },
  Rendah: { label: 'Rendah', color: riskLevelColors.Rendah },
  Minor: { label: 'Minor', color: riskLevelColors.Minor },
} satisfies ChartConfig;

const barChartConfig = {
  risks: { label: 'Risiko Tinggi & Sedang', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

// --- Skeleton Component ---
function DashboardChartsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
        <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center">
            <Skeleton className="size-48 rounded-full" />
            <Skeleton className="h-4 w-32 mt-4" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskAnalysisCard() { // Keep the exported name the same to avoid breaking imports
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSurveyData()
      .then(data => {
        const filteredData = data.filter(survey => survey.userRole !== 'Penguji Coba');
        setSurveys(filteredData);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (surveys.length === 0) return null;

    // Data for Pie Chart
    const riskCounts: { [key: string]: number } = { Bahaya: 0, Sedang: 0, Rendah: 0, Minor: 0 };
    let totalValidSurveys = 0;
    surveys.forEach(survey => {
      if (survey.riskLevel && survey.riskLevel in riskCounts) {
        riskCounts[survey.riskLevel]++;
        totalValidSurveys++;
      }
    });

    const pieData = Object.entries(riskCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name as keyof typeof riskLevelColors,
        value,
        fill: riskLevelColors[name as keyof typeof riskLevelColors],
      }));

    // Data for Bar Chart
    const roleRiskCounts = surveys.reduce((acc, survey) => {
      if ((survey.riskLevel === 'Bahaya' || survey.riskLevel === 'Sedang') && survey.userRole) {
        acc[survey.userRole] = (acc[survey.userRole] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const barData = Object.entries(roleRiskCounts)
      .map(([name, risks]) => ({ name, risks }))
      .sort((a, b) => b.risks - a.risks)
      .slice(0, 5); // Show top 5 for dashboard brevity

    return { pieData, totalValidSurveys, barData };
  }, [surveys]);


  if (loading) {
    return <DashboardChartsSkeleton />;
  }
  
  if (!chartData || surveys.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Visual Risiko</CardTitle>
                <CardDescription>Visualisasi data risiko dari semua pengguna.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">
                    Data survei belum tersedia untuk menampilkan visualisasi.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Ringkasan Visual Risiko</CardTitle>
        <CardDescription>
          Distribusi tingkat risiko dan departemen dengan risiko tertinggi dari semua pengguna.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <PieChartIcon className="h-5 w-5" />
                Distribusi Risiko
            </h3>
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[250px]">
              <RechartsPieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                        formatter={(value) => `${value} (${((Number(value) / chartData.totalValidSurveys) * 100).toFixed(0)}%)`}
                        hideLabel
                    />
                  }
                />
                <Pie data={chartData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                   {chartData.pieData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="mt-2" />
              </RechartsPieChart>
            </ChartContainer>
        </div>
        <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                Top 5 Risiko Departemen
            </h3>
             <ChartContainer config={barChartConfig} className="h-[250px] w-full">
               {chartData.barData.length > 0 ? (
                <BarChart data={chartData.barData} layout="vertical" margin={{ left: 200, right: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10, width: 190, textAnchor: 'start' }} interval={0} />
                    <XAxis dataKey="risks" type="number" allowDecimals={false} />
                    <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar dataKey="risks" fill="var(--color-risks)" radius={4} />
                </BarChart>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Tidak ada risiko 'Bahaya' atau 'Sedang'.</p>
                    </div>
                )}
            </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

