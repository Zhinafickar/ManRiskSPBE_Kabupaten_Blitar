
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from 'react';
import { Wrench, ChevronDown, ChevronRight } from 'lucide-react';
import { getRiskEvents } from '@/services/risk-service';
import type { RiskEvent } from '@/types/risk';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

function RiskTable({ riskEvents, loading }: { riskEvents: RiskEvent[], loading: boolean }) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                    <TableHead className="text-primary-foreground">Kategori Risiko</TableHead>
                    <TableHead className="w-[150px] text-right text-primary-foreground">Jumlah Risiko</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {riskEvents.map(event => (
                    <React.Fragment key={event.name}>
                        <TableRow onClick={() => toggleCategory(event.name)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium flex items-center gap-2">
                                {expandedCategories.has(event.name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {event.name}
                            </TableCell>
                            <TableCell className="text-right">{event.impactAreas.length}</TableCell>
                        </TableRow>
                        {expandedCategories.has(event.name) && (
                             <TableRow>
                                <TableCell colSpan={2} className="p-0">
                                    <div className="p-4 bg-muted/30">
                                        <ul className="list-disc pl-8 space-y-1 text-sm">
                                            {event.impactAreas.map(area => <li key={area}>{area}</li>)}
                                        </ul>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))}
            </TableBody>
        </Table>
    );
}

export default function RiskManagementPage() {
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiskEvents()
      .then(setRiskEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wrench className="h-6 w-6"/> Manajemen Risiko</CardTitle>
                <CardDescription>
                    Halaman ini menampilkan daftar Kategori Risiko dan Risiko spesifik yang ada di sistem. 
                    Data ini bersifat read-only dan dikelola oleh developer langsung di dalam file <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded-sm">src/constants/data.ts</code>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RiskTable riskEvents={riskEvents} loading={loading} />
            </CardContent>
        </Card>
    </div>
  );
}
