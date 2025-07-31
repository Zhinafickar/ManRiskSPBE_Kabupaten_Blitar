
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserContinuityPlans, deleteContinuityPlan } from '@/services/continuity-service';
import type { ContinuityPlan } from '@/types/continuity';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FileDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserSurveys } from '@/services/survey-service';
import { exportToCsv, exportToExcel } from '@/lib/excel-export';
import type { Survey } from '@/types/survey';

export default function ContinuityResultsPage() {
  const { user, userProfile } = useAuth();
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        getUserContinuityPlans(user.uid),
        getUserSurveys(user.uid)
      ]).then(([userPlans, userSurveys]) => {
        setPlans(userPlans);
        setSurveys(userSurveys);
      }).finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleDelete = async (planId: string) => {
    const result = await deleteContinuityPlan(planId);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        setPlans(plans.filter(p => p.id !== planId));
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleExportExcel = () => {
    if (!userProfile) return;
    const fileName = `${userProfile.role}_Hasil_Management_Risiko`;
    exportToExcel({ surveys, continuityPlans: plans, fileName, userProfile });
  };

  const handleExportCsv = () => {
    if (!userProfile) return;
    const fileName = `${userProfile.role}_Hasil_Rencana_Kontinuitas`;
    const dataForCsv = plans.map(p => ({
        'Risiko': p.risiko,
        'Aktivitas': p.aktivitas,
        'Target Waktu': p.targetWaktu,
        'PIC': p.pic,
        'Sumberdaya': p.sumberdaya,
        'RTO': p.rto,
        'RPO': p.rpo,
        'Tanggal Dibuat': new Date(p.createdAt).toLocaleString('id-ID'),
    }));
    exportToCsv({ data: dataForCsv, fileName });
  };

  const plansAvailable = plans.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Rencana Kontinuitas</CardTitle>
            <CardDescription>Berikut adalah semua rencana kontinuitas yang telah Anda kirimkan.</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={!plansAvailable}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleExportExcel}>Download Excel</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportCsv}>Download CSV</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : plansAvailable ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">Risiko</TableHead>
                <TableHead className="text-primary-foreground">Aktivitas</TableHead>
                <TableHead className="text-primary-foreground">Target Waktu</TableHead>
                <TableHead className="text-primary-foreground">PIC (Person In Charge)</TableHead>
                <TableHead className="text-primary-foreground">RTO</TableHead>
                <TableHead className="text-primary-foreground">RPO</TableHead>
                <TableHead className="text-right text-primary-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium max-w-xs whitespace-normal">{plan.risiko}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{plan.aktivitas}</TableCell>
                  <TableCell>{plan.targetWaktu}</TableCell>
                  <TableCell>{plan.pic}</TableCell>
                  <TableCell>{plan.rto}</TableCell>
                  <TableCell>{plan.rpo}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Anda belum mengirimkan rencana kontinuitas apa pun.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
