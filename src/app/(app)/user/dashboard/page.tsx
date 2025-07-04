'use client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  FilePenLine,
  TableProperties,
  AreaChart,
  FileText,
  Recycle,
} from 'lucide-react';

export default function UserDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Selamat Datang, {userProfile?.fullName}!
        </h1>
        <p className="text-muted-foreground">
          Kelola penilaian risiko dan rencana keberlanjutan Anda di sini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Penilaian Risiko</CardTitle>
            <CardDescription>
              Mulai penilaian baru menggunakan formulir tunggal atau tabel untuk
              beberapa entri sekaligus.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/user/survey-1">
                <FilePenLine className="mr-2 h-4 w-4" />
                Input Form Tunggal
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/user/survey-2">
                <TableProperties className="mr-2 h-4 w-4" />
                Input Form Tabel
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rencana Kontinuitas</CardTitle>
            <CardDescription>
              Buat dan lihat rencana keberlanjutan bisnis Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/user/continuity">
                <Recycle className="mr-2 h-4 w-4" />
                Kelola Rencana
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lihat Hasil Anda</CardTitle>
            <CardDescription>
              Tinjau semua survei yang telah Anda kirimkan dalam format tabel
              atau grafik.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/user/results">
                <FileText className="mr-2 h-4 w-4" />
                Lihat Tabel Hasil
              </Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/user/grafik">
                <AreaChart className="mr-2 h-4 w-4" />
                Lihat Grafik
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Panduan Cepat</CardTitle>
            <CardDescription>
                Langkah-langkah utama penggunaan aplikasi.
            </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
            <div>
                <h4 className="font-semibold text-foreground">1. Isi Survei Risiko</h4>
                <p>Buka menu 'Manajement Risiko' untuk mulai mengisi data menggunakan formulir tunggal atau tabel.</p>
            </div>
            <div>
                <h4 className="font-semibold text-foreground">2. Buat Rencana Kontinuitas</h4>
                <p>Setelah mengisi survei, Anda dapat membuat rencana keberlanjutan di menu 'Kontinuitas'.</p>
            </div>
            <div>
                <h4 className="font-semibold text-foreground">3. Tinjau Hasil</h4>
                <p>Lihat semua data yang telah Anda kirimkan dalam bentuk tabel dan grafik di menu hasil masing-masing.</p>
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
