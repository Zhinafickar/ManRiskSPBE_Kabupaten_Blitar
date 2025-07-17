
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AreaChart, Building, ClipboardCheck } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";
import { AiRiskSummaryCard } from "@/app/(app)/_components/ai-risk-summary-card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review organization-wide risk data and analyses.
        </p>
      </div>

      <RiskAnalysisCard />

      <AiRiskSummaryCard />

      <Card>
        <CardHeader>
            <CardTitle>Menu Manajemen</CardTitle>
            <CardDescription>Akses cepat ke semua fitur pelaporan dan data organisasi.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
                <h4 className="font-semibold">Data & Laporan</h4>
                <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/admuinma/results"><FileText className="mr-2 h-4 w-4" />Semua Hasil Survei</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/admuinma/continuity-results"><ClipboardCheck className="mr-2 h-4 w-4" />Rencana Kontinuitas</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/admuinma/visualization"><AreaChart className="mr-2 h-4 w-4" />Visualisasi Data</Link>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Organisasi</h4>
                <div className="flex flex-col gap-2">
                     <Button asChild variant="outline" className="justify-start">
                        <Link href="/admuinma/opd"><Building className="mr-2 h-4 w-4" />Organisasi Perangkat Daerah (OPD)</Link>
                    </Button>
                </div>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
