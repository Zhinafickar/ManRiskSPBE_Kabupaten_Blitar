
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Activity, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { getUserSurveys } from '@/services/survey-service';
import { getUserContinuityPlans } from '@/services/continuity-service';
import { cn } from '@/lib/utils';

// User Info Card Component
function UserInfoCard() {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" /> Profil Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-0">
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-lg p-6 text-left transition-colors hover:bg-muted/50">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" /> Profil Anda
              </CardTitle>
              <CardDescription>
                Informasi akun Anda yang terdaftar dalam sistem.
              </CardDescription>
            </div>
            {isOpen ? (
              <EyeOff className="h-5 w-5 shrink-0" />
            ) : (
              <Eye className="h-5 w-5 shrink-0" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama Lengkap</span>
              <span className="font-medium">{userProfile.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peran/Jabatan</span>
              <span className="font-medium">{userProfile.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{userProfile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Telepon</span>
              <span className="font-medium">
                {userProfile.phoneNumber || 'N/A'}
              </span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Risk Summary Card Component
function RiskSummaryCard() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [plans, setPlans] = useState<ContinuityPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
        Promise.all([
            getUserSurveys(user.uid),
            getUserContinuityPlans(user.uid)
        ]).then(([userSurveys, userPlans]) => {
            setSurveys(userSurveys);
            setPlans(userPlans);
        }).finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6" /> Ringkasan Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const riskCounts: { [key: string]: number } = {
    Bahaya: 0,
    Sedang: 0,
    Rendah: 0,
    Minor: 0,
  };

  surveys.forEach(survey => {
    if (survey.riskLevel && survey.riskLevel in riskCounts) {
      riskCounts[survey.riskLevel]++;
    }
  });

  const RiskCountBadge = ({ level, count }: { level: string; count: number }) => {
    let colorClass = 'bg-gray-400 hover:bg-gray-500';
    let textColor = 'text-white';
    switch (level) {
        case 'Bahaya': colorClass = 'bg-red-600 hover:bg-red-700'; break;
        case 'Sedang': 
            colorClass = 'bg-yellow-500 hover:bg-yellow-600';
            textColor = 'text-black';
            break;
        case 'Rendah': colorClass = 'bg-green-600 hover:bg-green-700'; break;
        case 'Minor': colorClass = 'bg-blue-600 hover:bg-blue-700'; break;
    }

    return (
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{level}</span>
            <Badge className={cn("text-base font-bold", colorClass, textColor)}>{count}</Badge>
        </div>
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6" /> Ringkasan Aktivitas
        </CardTitle>
        <CardDescription>Jumlah data yang telah Anda laporkan dan tingkat risikonya.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center">
            <div>
                <p className="text-sm text-muted-foreground">Total Survei</p>
                <p className="text-4xl font-bold">{surveys.length}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Total Kontinuitas</p>
                <p className="text-4xl font-bold">{plans.length}</p>
            </div>
        </div>
        {surveys.length > 0 ? (
            <div className="space-y-2 rounded-lg border p-4">
                <RiskCountBadge level="Bahaya" count={riskCounts.Bahaya} />
                <RiskCountBadge level="Sedang" count={riskCounts.Sedang} />
                <RiskCountBadge level="Rendah" count={riskCounts.Rendah} />
                <RiskCountBadge level="Minor" count={riskCounts.Minor} />
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
                Anda belum melaporkan survei risiko apa pun.
            </div>
        )}
      </CardContent>
    </Card>
  );
}


// Quick Guide Card Component
function QuickGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Panduan Cepat
        </CardTitle>
        <CardDescription>
            Langkah-langkah utama penggunaan aplikasi untuk manajemen risiko.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        <div>
            <h4 className="font-semibold text-foreground">1. Pelajari Referensi & Tutorial</h4>
            <p>Buka menu 'Informasi Penting' untuk melihat 'Referensi Perhitungan' dan 'Tutorial' agar Anda memahami cara kerja aplikasi.</p>
        </div>
        <div>
            <h4 className="font-semibold text-foreground">2. Isi Survei Risiko</h4>
            <p>Di menu 'Manajemen Risiko', gunakan 'Input Form' untuk satu risiko atau 'Input Tabel' untuk beberapa risiko sekaligus. Manfaatkan fitur saran AI untuk membantu pengisian.</p>
        </div>
        <div>
            <h4 className="font-semibold text-foreground">3. Buat Rencana Kontinuitas</h4>
            <p>Setelah survei diisi, buka menu 'Kontinuitas' untuk membuat rencana pemulihan berdasarkan risiko yang telah Anda identifikasi.</p>
        </div>
         <div>
            <h4 className="font-semibold text-foreground">4. Tinjau & Cetak Laporan</h4>
            <p>Gunakan menu 'Grafik' untuk visualisasi dan 'Laporan Akhir' untuk melihat ringkasan lengkap yang siap untuk dicetak.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Dashboard Component
export default function UserDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          Selamat Datang, perwakilan dari {userProfile?.role}!
        </h1>
        <p className="text-muted-foreground">
          Dasboard ini memberikan ringkasan tentang profil dan aktivitas Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UserInfoCard />
        <RiskSummaryCard />
      </div>

      <div className="grid gap-6">
        <QuickGuideCard />
      </div>
      
    </div>
  );
}
