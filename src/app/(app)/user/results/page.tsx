
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys, deleteSurvey } from '@/services/survey-service';
import { getUserContinuityPlans } from '@/services/continuity-service';
import { Survey } from '@/types/survey';
import { ContinuityPlan } from '@/types/continuity';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FileDown, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { exportToExcel, exportToCsv } from '@/lib/excel-export';

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

export default function UserResultsPage() {
  const { user, userProfile } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [continuityPlans, setContinuityPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        getUserSurveys(user.uid),
        getUserContinuityPlans(user.uid)
      ]).then(([userSurveys, userPlans]) => {
        setSurveys(userSurveys);
        setContinuityPlans(userPlans);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (surveyId: string) => {
    const result = await deleteSurvey(surveyId);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        setSurveys(surveys.filter(s => s.id !== surveyId));
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleExportExcel = () => {
    if (!userProfile) return;
    const fileName = `${userProfile.role}_Hasil_Management_Risiko`;
    exportToExcel({ surveys, continuityPlans, fileName, userProfile });
  };
  
  const handleExportCsv = () => {
    if (!userProfile) return;
    const fileName = `${userProfile.role}_Hasil_Survei`;
    const dataForCsv = surveys.map(s => ({
        'Kategori Risiko': s.riskEvent,
        'Risiko': s.impactArea,
        'Area Dampak': s.areaDampak,
        'Tingkat Risiko': s.riskLevel,
        'Mitigasi': s.mitigasi,
        'Tanggal': s.createdAt ? new Date(s.createdAt).toLocaleDateString('id-ID') : 'N/A',
    }));
    exportToCsv({ data: dataForCsv, fileName });
  }

  const surveysAvailable = surveys.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Hasil Survei Saya</CardTitle>
            <CardDescription>Berikut adalah semua survei yang telah Anda kirimkan.</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button disabled={!surveysAvailable}>
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
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : surveysAvailable ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">Kategori Risiko</TableHead>
                <TableHead className="text-primary-foreground">Risiko</TableHead>
                <TableHead className="text-primary-foreground">Area Dampak</TableHead>
                <TableHead className="text-primary-foreground">Frekuensi</TableHead>
                <TableHead className="text-primary-foreground">Dampak</TableHead>
                <TableHead className="text-primary-foreground">Tingkat Risiko</TableHead>
                <TableHead className="text-primary-foreground">Mitigasi</TableHead>
                <TableHead className="text-right text-primary-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium max-w-xs whitespace-normal">{survey.riskEvent}</TableCell>
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
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(survey.id)}
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
            <p className="text-muted-foreground">Anda belum mengirimkan survei apa pun.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
