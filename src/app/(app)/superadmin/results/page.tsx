
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { getAllSurveyData, deleteSurvey } from "@/services/survey-service";
import { getAllContinuityPlans } from '@/services/continuity-service';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { exportToExcel } from '@/lib/excel-export';
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

function RiskIndicatorBadge({ level }: { level?: string }) {
    if (!level) return <Badge variant="outline">N/A</Badge>;

    let colorClass = 'bg-gray-400 text-white hover:bg-gray-500';
    switch (level) {
        case 'Bahaya':
            colorClass = 'bg-red-600 text-white hover:bg-red-700';
            break;
        case 'Sedang':
            colorClass = 'bg-yellow-500 text-black hover:bg-yellow-600';
            break;
        case 'Rendah':
            colorClass = 'bg-green-600 text-white hover:bg-green-700';
            break;
        case 'Minor':
            colorClass = 'bg-blue-600 text-white hover:bg-blue-700';
            break;
    }

    return (
        <Badge className={cn(colorClass)}>
            {level}
        </Badge>
    );
}

export default function SuperAdminResultsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [continuityPlans, setContinuityPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([
        getAllSurveyData(),
        getAllContinuityPlans()
    ]).then(([surveyData, planData]) => {
        const filteredSurveys = surveyData.filter(survey => survey.userRole !== 'Penguji Coba');
        const filteredPlans = planData.filter(plan => plan.userRole !== 'Penguji Coba');
        setSurveys(filteredSurveys);
        setContinuityPlans(filteredPlans);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (surveyId: string) => {
    const result = await deleteSurvey(surveyId);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        setSurveys(surveys.filter(s => s.id !== surveyId));
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };
  
  const handleExport = () => {
    const roleName = userProfile?.role || 'SuperAdmin';
    const fileName = `${roleName}_Hasil_Management_Risiko`;
    exportToExcel({ surveys, continuityPlans, fileName, userProfile });
  };

  const surveysAvailable = surveys.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Survey Results</CardTitle>
          <CardDescription>A comprehensive list of all surveys submitted by all users.</CardDescription>
        </div>
        <Button onClick={handleExport} disabled={!surveysAvailable}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Excel
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ResultsTableSkeleton />
        ) : surveysAvailable ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">User Role</TableHead>
                <TableHead className="text-primary-foreground">Kategori Risiko</TableHead>
                <TableHead className="text-primary-foreground">Risiko</TableHead>
                <TableHead className="text-primary-foreground">Area Dampak</TableHead>
                <TableHead className="text-primary-foreground">Frequency</TableHead>
                <TableHead className="text-primary-foreground">Impact</TableHead>
                <TableHead className="text-primary-foreground">Risk Level</TableHead>
                <TableHead className="text-primary-foreground">Mitigasi</TableHead>
                <TableHead className="text-right text-primary-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium max-w-xs truncate">{survey.userRole || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{survey.riskEvent}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{survey.impactArea}</TableCell>
                  <TableCell className="max-w-xs truncate">{survey.areaDampak || 'N/A'}</TableCell>
                  <TableCell>{survey.frequency}</TableCell>
                  <TableCell>{survey.impactMagnitude}</TableCell>
                   <TableCell><RiskIndicatorBadge level={survey.riskLevel} /></TableCell>
                  <TableCell className="max-w-xs truncate">{survey.mitigasi || 'N/A'}</TableCell>
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
                          onSelect={() => handleDelete(survey.id)}
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
            <p className="text-muted-foreground">No surveys have been submitted yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
