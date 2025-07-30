
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { getAllContinuityPlans, deleteContinuityPlan } from "@/services/continuity-service";
import { getAllSurveyData } from '@/services/survey-service';
import type { ContinuityPlan } from '@/types/continuity';
import type { Survey } from '@/types/survey';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FileDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv, exportToExcel } from '@/lib/excel-export';
import { useAuth } from '@/hooks/use-auth';

function ResultsTableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function AdminContinuityResultsPage() {
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([
        getAllContinuityPlans(),
        getAllSurveyData()
    ]).then(([planData, surveyData]) => {
        const filteredPlans = planData.filter(plan => plan.userRole !== 'Penguji Coba');
        const filteredSurveys = surveyData.filter(survey => survey.userRole !== 'Penguji Coba');
        setPlans(filteredPlans);
        setSurveys(filteredSurveys);
    }).finally(() => setLoading(false));
  }, []);

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
    const roleName = userProfile?.role || 'Admin';
    const fileName = `${roleName}_Hasil_Management_Risiko`;
    exportToExcel({ surveys, continuityPlans: plans, fileName, userProfile });
  };

  const handleExportCsv = () => {
    const roleName = userProfile?.role || 'Admin';
    const fileName = `${roleName}_Hasil_Rencana_Kontinuitas`;
    const dataForCsv = plans.map(p => ({
        'Peran Pengguna': p.userRole,
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
            <CardTitle>All Continuity Plans</CardTitle>
            <CardDescription>A comprehensive list of all continuity plans submitted by all users.</CardDescription>
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={!plansAvailable}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Laporan
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
          <ResultsTableSkeleton />
        ) : plansAvailable ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">User Role</TableHead>
                <TableHead className="text-primary-foreground">Risiko</TableHead>
                <TableHead className="text-primary-foreground">Aktivitas</TableHead>
                <TableHead className="text-primary-foreground">Target Waktu</TableHead>
                <TableHead className="text-primary-foreground">PIC (Person In Charge)</TableHead>
                <TableHead className="text-primary-foreground">RTO</TableHead>
                <TableHead className="text-primary-foreground">RPO</TableHead>
                <TableHead className="text-right text-primary-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium max-w-xs truncate">{plan.userRole || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{plan.risiko}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{plan.aktivitas}</TableCell>
                  <TableCell>{plan.targetWaktu}</TableCell>
                  <TableCell>{plan.pic}</TableCell>
                  <TableCell>{plan.rto}</TableCell>
                  <TableCell>{plan.rpo}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
            <p className="text-muted-foreground">No continuity plans have been submitted yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
