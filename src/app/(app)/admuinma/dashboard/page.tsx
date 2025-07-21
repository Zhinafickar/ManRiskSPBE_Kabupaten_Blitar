
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AreaChart, Building, ClipboardCheck, Info } from "lucide-react";
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
              <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6" />
                  Panduan Admin
              </CardTitle>
              <CardDescription>
                  Berikut adalah kapabilitas utama yang Anda miliki sebagai admin.
              </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground">1. Pemantauan & Pelaporan Data Global</h4>
                  <p>Gunakan menu 'Data & Laporan' untuk mengakses semua data survei, rencana kontinuitas, dan visualisasi dari seluruh OPD. Anda memiliki akses penuh ke semua data yang ada di sistem.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">2. Manajemen Laporan</h4>
                  <p>Anda dapat mengunduh semua data hasil survei dan rencana kontinuitas dalam format Excel melalui tombol "Download Excel" yang tersedia di halaman masing-masing.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">3. Pantau Aktivitas OPD</h4>
                  <p>Menu 'Organisasi' memungkinkan Anda untuk melihat daftar semua OPD, status keterisiannya, dan detail data spesifik untuk setiap OPD yang telah memiliki pengguna terdaftar.</p>
              </div>
          </CardContent>
      </Card>

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
