'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys } from '@/services/survey-service';
import { Survey } from '@/types/survey';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserResultsPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserSurveys(user.uid)
        .then(setSurveys)
        .finally(() => setLoading(false));
    }
  }, [user]);

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
                <TableHead>Date</TableHead>
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
                  <TableCell>{new Date(survey.createdAt).toLocaleDateString()}</TableCell>
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
