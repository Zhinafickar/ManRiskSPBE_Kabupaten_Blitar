
'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSurveyData } from '@/services/survey-service';
import { getAllContinuityPlans } from '@/services/continuity-service';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DepartmentDetailsDialogProps {
  departmentName: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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


const riskLevelColors = {
  Bahaya: 'hsl(0, 72%, 51%)',
  Sedang: 'hsl(45, 93%, 47%)',
  Rendah: 'hsl(142, 69%, 31%)',
  Minor: 'hsl(221, 83%, 53%)',
};

const pieChartConfig = {
  count: { label: 'Jumlah' },
  Bahaya: { label: 'Bahaya', color: riskLevelColors.Bahaya },
  Sedang: { label: 'Sedang', color: riskLevelColors.Sedang },
  Rendah: { label: 'Rendah', color: riskLevelColors.Rendah },
  Minor: { label: 'Minor', color: riskLevelColors.Minor },
} satisfies ChartConfig;


export function DepartmentDetailsDialog({ departmentName, isOpen, onOpenChange }: DepartmentDetailsDialogProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && departmentName) {
      setLoading(true);
      Promise.all([
        getAllSurveyData(),
        getAllContinuityPlans()
      ]).then(([allSurveys, allPlans]) => {
        setSurveys(allSurveys.filter(s => s.userRole === departmentName));
        setPlans(allPlans.filter(p => p.userRole === departmentName));
      }).finally(() => setLoading(false));
    }
  }, [isOpen, departmentName]);

  const pieData = useMemo(() => {
    const riskCounts = { Bahaya: 0, Sedang: 0, Rendah: 0, Minor: 0 };
    let total = 0;
    surveys.forEach(s => {
      if (s.riskLevel && s.riskLevel in riskCounts) {
        riskCounts[s.riskLevel as keyof typeof riskCounts]++;
        total++;
      }
    });

    const data = Object.entries(riskCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name as keyof typeof riskLevelColors,
        value,
        fill: riskLevelColors[name as keyof typeof riskLevelColors],
      }));
      
    return { data, total };
  }, [surveys]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Detail OPD: {departmentName}</DialogTitle>
          <DialogDescription>
            Menampilkan data survei, kontinuitas, dan grafik risiko untuk OPD yang dipilih.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        ) : (
          <Tabs defaultValue="surveys" className="flex flex-col h-full overflow-hidden">
            <TabsList>
              <TabsTrigger value="surveys">Hasil Survei ({surveys.length})</TabsTrigger>
              <TabsTrigger value="plans">Rencana Kontinuitas ({plans.length})</TabsTrigger>
              <TabsTrigger value="graph">Grafik Risiko</TabsTrigger>
            </TabsList>
            
            <ScrollArea className="flex-grow mt-4">
              <TabsContent value="surveys">
                {surveys.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risiko</TableHead>
                        <TableHead>Area Dampak</TableHead>
                        <TableHead>Tingkat Risiko</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveys.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="max-w-xs truncate">{s.riskEvent} - {s.impactArea}</TableCell>
                          <TableCell>{s.areaDampak}</TableCell>
                          <TableCell><RiskIndicatorBadge level={s.riskLevel} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-center text-muted-foreground p-4">Tidak ada data survei.</p>}
              </TabsContent>

              <TabsContent value="plans">
                {plans.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risiko</TableHead>
                        <TableHead>Aktivitas</TableHead>
                        <TableHead>PIC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="max-w-xs truncate">{p.risiko}</TableCell>
                          <TableCell className="max-w-xs truncate">{p.aktivitas}</TableCell>
                          <TableCell>{p.pic}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-center text-muted-foreground p-4">Tidak ada data kontinuitas.</p>}
              </TabsContent>

              <TabsContent value="graph">
                {pieData.data.length > 0 ? (
                  <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[400px]">
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => `${value} (${((Number(value) / pieData.total) * 100).toFixed(0)}%)`}
                                    hideLabel
                                />
                            }
                        />
                        <Pie data={pieData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                            {pieData.data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : <p className="text-center text-muted-foreground p-4">Tidak ada data untuk ditampilkan di grafik.</p>}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
