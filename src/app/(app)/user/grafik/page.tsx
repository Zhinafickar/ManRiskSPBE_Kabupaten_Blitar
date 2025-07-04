'use client';

import { useEffect, useState } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys } from '@/services/survey-service';
import { AreaChart } from 'lucide-react';

const riskLevelColors = {
  Bahaya: 'hsl(var(--destructive))', // Red
  Sedang: 'hsl(var(--chart-4))',      // Yellow/Orange
  Rendah: 'hsl(var(--chart-2))',      // Teal/Green
  Minor: 'hsl(var(--chart-1))',       // Blue/Primary
};

const chartConfig = {
  count: {
    label: 'Jumlah',
  },
  Bahaya: {
    label: 'Bahaya',
    color: riskLevelColors.Bahaya,
  },
  Sedang: {
    label: 'Sedang',
    color: riskLevelColors.Sedang,
  },
  Rendah: {
    label: 'Rendah',
    color: riskLevelColors.Rendah,
  },
  Minor: {
    label: 'Minor',
    color: riskLevelColors.Minor,
  },
} satisfies ChartConfig;

type ChartData = {
  name: keyof typeof riskLevelColors;
  value: number;
  fill: string;
}[];

function GrafikSkeleton() {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="size-64 rounded-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
        </div>
    );
}

export default function GrafikPage() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartData>([]);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserSurveys(user.uid).then(surveys => {
        const riskCounts: { [key: string]: number } = {
          Bahaya: 0,
          Sedang: 0,
          Rendah: 0,
          Minor: 0,
        };

        let validSurveys = 0;
        surveys.forEach(survey => {
          if (survey.riskLevel && survey.riskLevel in riskCounts) {
            riskCounts[survey.riskLevel]++;
            validSurveys++;
          }
        });
        
        setTotalSurveys(validSurveys);

        const dataForChart = Object.entries(riskCounts)
          .filter(([, value]) => value > 0)
          .map(([name, value]) => ({
            name: name as keyof typeof riskLevelColors,
            value,
            fill: riskLevelColors[name as keyof typeof riskLevelColors],
          }));

        setChartData(dataForChart);
      }).finally(() => {
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AreaChart className="h-6 w-6" />
            Grafik Hasil Tingkat Risiko
        </CardTitle>
        <CardDescription>
          Visualisasi data persentase tingkat risiko dari survei yang telah Anda kirimkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <GrafikSkeleton />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
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
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      className="text-lg font-bold"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-mt-4"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Tidak ada data survei yang ditemukan untuk ditampilkan dalam grafik.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
