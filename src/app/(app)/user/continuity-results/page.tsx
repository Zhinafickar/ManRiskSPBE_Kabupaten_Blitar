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
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContinuityResultsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getUserContinuityPlans(user.uid)
        .then(setPlans)
        .finally(() => setLoading(false));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hasil Rencana Kontinuitas</CardTitle>
        <CardDescription>Berikut adalah semua rencana kontinuitas yang telah Anda kirimkan.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : plans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risiko</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead>Target Waktu</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>RTO</TableHead>
                <TableHead>RPO</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium max-w-xs truncate">{plan.risiko}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.aktivitas}</TableCell>
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
