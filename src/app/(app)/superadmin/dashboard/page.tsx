
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, AreaChart, Shield, Building, ClipboardCheck, KeyRound, Info } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";
import { Separator } from "@/components/ui/separator";
import { AiRiskSummaryCard } from "@/app/(app)/_components/ai-risk-summary-card";

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kontrol penuh atas platform, pengguna, dan analisis data.
        </p>
      </div>
      
      <RiskAnalysisCard />

      <AiRiskSummaryCard />

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6" />
                  Panduan Super Admin
              </CardTitle>
              <CardDescription>
                  Berikut adalah kapabilitas utama yang Anda miliki sebagai superadmin.
              </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground">1. Manajemen Token & Akses Admin</h4>
                  <p>Buat token unik di menu 'Manajemen Token' untuk mendaftarkan akun admin baru. Berikan token dan nama yang Anda daftarkan kepada calon admin untuk mereka gunakan di halaman login admin.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">2. Manajemen Pengguna dan Peran</h4>
                  <p>Akses 'Manajemen Pengguna' untuk melihat, mengedit (termasuk mengubah peran), atau menghapus semua pengguna. Di 'Manajemen Peran', Anda bisa melihat daftar semua peran dan pengguna yang terdaftar di dalamnya.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">3. Pemantauan & Pelaporan Data Global</h4>
                  <p>Gunakan menu 'Data & Laporan' untuk mengakses semua data survei, rencana kontinuitas, dan visualisasi dari seluruh OPD. Anda memiliki akses penuh ke semua data yang ada di sistem.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground">4. Akses Penuh sebagai Admin</h4>
                  <p>Sebagai Super Admin, Anda juga memiliki semua hak akses yang dimiliki oleh peran Admin, termasuk melihat dan mengelola data OPD secara keseluruhan.</p>
              </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Menu Manajemen</CardTitle>
            <CardDescription>Akses cepat ke semua fitur manajemen dan pelaporan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
                <h4 className="font-semibold">Akses & Pengguna</h4>
                <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/users"><Users className="mr-2 h-4 w-4" />Manajemen Pengguna</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/role-management"><Shield className="mr-2 h-4 w-4" />Manajemen Peran</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/token-management"><KeyRound className="mr-2 h-4 w-4" />Manajemen Token</Link>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Data & Laporan</h4>
                <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/results"><FileText className="mr-2 h-4 w-4" />Semua Hasil Survei</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/continuity-results"><ClipboardCheck className="mr-2 h-4 w-4" />Rencana Kontinuitas</Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/visualization"><AreaChart className="mr-2 h-4 w-4" />Visualisasi Data</Link>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold">Organisasi</h4>
                <div className="flex flex-col gap-2">
                     <Button asChild variant="outline" className="justify-start">
                        <Link href="/superadmin/opd"><Building className="mr-2 h-4 w-4" />Organisasi Perangkat Daerah (OPD)</Link>
                    </Button>
                </div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
