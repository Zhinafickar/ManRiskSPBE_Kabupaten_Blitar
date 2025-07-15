
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSurveyData } from "@/services/survey-service";
import type { Survey } from '@/types/survey';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { TrendingUp } from 'lucide-react';

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
  risks: { label: 'Risiko Tinggi & Sedang' },
} satisfies ChartConfig;

// --- Skeleton Component ---
function VisualizationSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="size-64 rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

const barColors = [
    riskLevelColors.Bahaya,
    riskLevelColors.Sedang,
    riskLevelColors.Rendah,
    riskLevelColors.Minor,
    'hsl(var(--chart-5))',
    'hsl(262, 80%, 55%)',
    'hsl(310, 80%, 55%)',
    'hsl(350, 80%, 55%)',
    'hsl(30, 80%, 55%)',
    'hsl(60, 80%, 55%)',
];

// --- Main Visualization Component ---
export default function VisualizationPage() {
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
      .map(([name, risks], index) => ({ name, risks, fill: barColors[index % barColors.length] }))
      .sort((a, b) => b.risks - a.risks)
      .slice(0, 10); // Show top 10 roles with most high/medium risks

    return { pieData, totalValidSurveys, barData };
  }, [surveys]);

  if (loading) {
    return <VisualizationSkeleton />;
  }

  if (!chartData || surveys.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Graphical insights from the collected survey data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No survey data available to display visualizations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
         <h1 className="text-3xl font-bold">Data Visualization</h1>
         <p className="text-muted-foreground">
            Graphical insights from all collected survey data.
         </p>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Tingkat Risiko</CardTitle>
            <CardDescription>Persentase tingkat risiko dari semua survei.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                        formatter={(value) => `${value} (${((Number(value) / chartData.totalValidSurveys) * 100).toFixed(0)}%)`}
                        hideLabel
                    />
                  }
                />
                <Pie data={chartData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                   {chartData.pieData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-mt-4" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Departemen dengan Risiko Tertinggi
            </CardTitle>
            <CardDescription>Jumlah risiko dengan tingkat 'Bahaya' dan 'Sedang' per departemen (Top 10).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[400px] w-full">
               <BarChart data={chartData.barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false}
                        tick={false}
                        height={1}
                    />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar dataKey="risks" radius={4}>
                         <LabelList position="top" offset={5} className="fill-foreground" fontSize={12} />
                         {chartData.barData.map((entry) => (
                           <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
