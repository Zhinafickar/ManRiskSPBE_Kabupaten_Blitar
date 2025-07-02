'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys, deleteSurvey } from '@/services/survey-service';
import { Survey } from '@/types/survey';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

function RiskIndicatorBadge({ level }: { level?: string }) {
    if (!level) return <Badge variant="outline">N/A</Badge>;

    let colorClass = 'bg-gray-400 text-white hover:bg-gray-500';
    switch (level) {
        case 'Bahaya':
            colorClass = 'bg-red-600 text-white hover:bg-red-700';
            break;
        case 'Sedang':
            colorClass = 'bg-yellow-500 text-white hover:bg-yellow-600';
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
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUserSurveys(user.uid)
        .then(setSurveys)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (surveyId: string) => {
    const result = await deleteSurvey(surveyId);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Survey Results</CardTitle>
        <CardDescription>Here are all the surveys you have submitted.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : surveys.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Event</TableHead>
                <TableHead>Survey Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium max-w-xs truncate">{survey.riskEvent}</TableCell>
                  <TableCell>
                    <Badge variant={survey.surveyType === 1 ? 'default' : 'secondary'}>
                      Survey {survey.surveyType}
                    </Badge>
                  </TableCell>
                  <TableCell>{survey.frequency}</TableCell>
                  <TableCell>{survey.impactMagnitude}</TableCell>
                  <TableCell><RiskIndicatorBadge level={survey.riskLevel} /></TableCell>
                  <TableCell>{new Date(survey.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this survey data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(survey.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">You haven't submitted any surveys yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
