
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, AreaChart, Shield, Building, ClipboardCheck, KeyRound, Info } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
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
                    <p>Buat token unik di menu 'Token Management' untuk mendaftarkan akun admin baru. Berikan token dan nama yang Anda daftarkan kepada calon admin.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground">2. Manajemen Pengguna dan Peran</h4>
                    <p>Lihat, edit, atau hapus pengguna melalui 'User Management'. Anda juga bisa mengelola peran dan melihat siapa saja yang terdaftar di 'Role Management'.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground">3. Pantau Data Organisasi</h4>
                    <p>Akses semua data survei, rencana kontinuitas, dan visualisasi data dari seluruh departemen melalui menu 'Data & Laporan'.</p>
                </div>
            </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription>Tambah, edit, atau hapus akun pengguna dan kelola peran.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/users"><Users className="mr-2 h-4 w-4" />Kelola Pengguna</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Peran</CardTitle>
            <CardDescription>Lihat semua peran dan pengguna yang ditugaskan untuk peran tersebut.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/role-management"><Shield className="mr-2 h-4 w-4" />Kelola Peran</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Token</CardTitle>
            <CardDescription>Buat dan kelola token akses untuk admin baru.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/token-management"><KeyRound className="mr-2 h-4 w-4" />Kelola Token</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>OPD/Departemen Lain</CardTitle>
            <CardDescription>Lihat daftar semua departemen terdaftar dan data mereka.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/opd"><Building className="mr-2 h-4 w-4" />Lihat Departemen</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
              <CardTitle>Semua Hasil Survei</CardTitle>
              <CardDescription>Akses daftar lengkap semua kiriman survei, dengan opsi untuk melihat dan mengekspor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/superadmin/results"><FileText className="mr-2 h-4 w-4" />Lihat Semua Hasil Survei</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visualisasi Data</CardTitle>
              <CardDescription>Jelajahi representasi grafis dari data survei.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/superadmin/visualization"><AreaChart className="mr-2 h-4 w-4" />Buka Visualisasi</Link>
              </Button>
            </CardContent>
          </Card>
       </div>
       
       <Card>
            <CardHeader>
                <CardTitle>Semua Rencana Kontinuitas</CardTitle>
                <CardDescription>Tinjau dan kelola semua rencana kontinuitas bisnis yang dikirimkan di seluruh organisasi.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/superadmin/continuity-results"><ClipboardCheck className="mr-2 h-4 w-4" />Lihat Semua Rencana Kontinuitas</Link>
                </Button>
            </CardContent>
       </Card>

    </div>
  );
}
