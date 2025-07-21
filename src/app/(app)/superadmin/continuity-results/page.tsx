
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { getAllContinuityPlans, deleteContinuityPlan } from "@/services/continuity-service";
import type { ContinuityPlan } from '@/types/continuity';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function SuperAdminContinuityResultsPage() {
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getAllContinuityPlans()
      .then(data => {
        const filteredData = data.filter(plan => plan.userRole !== 'Penguji Coba');
        setPlans(filteredData);
      })
      .finally(() => setLoading(false));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Continuity Plans</CardTitle>
        <CardDescription>A comprehensive list of all continuity plans submitted by all users.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ResultsTableSkeleton />
        ) : plans.length > 0 ? (
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
