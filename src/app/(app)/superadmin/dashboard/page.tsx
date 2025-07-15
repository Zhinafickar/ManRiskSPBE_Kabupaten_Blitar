
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, AreaChart, Shield, Building, ClipboardCheck, KeyRound, Info } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";
import { Separator } from "@/components/ui/separator";

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
                  <h4 className="font-semibold text-foreground">1. Manajemen Token Admin</h4>
                  <p>Buat token unik di menu 'Manajemen Token' untuk mendaftarkan akun admin baru. Berikan token dan nama yang Anda daftarkan kepada calon admin.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">2. Manajemen Pengguna dan Peran</h4>
                  <p>Lihat, edit, atau hapus pengguna melalui 'Manajemen Pengguna'. Anda juga bisa mengelola peran dan melihat siapa saja yang terdaftar di 'Manajemen Peran'.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground">3. Pantau Data Organisasi</h4>
                  <p>Akses semua data survei, rencana kontinuitas, dan visualisasi data dari seluruh departemen melalui menu 'Data & Laporan'.</p>
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
                        <Link href="/superadmin/opd"><Building className="mr-2 h-4 w-4" />OPD/Departemen Lain</Link>
                    </Button>
                </div>
            </div>
        </CardContent>
       </Card>

    </div>
  );
}
