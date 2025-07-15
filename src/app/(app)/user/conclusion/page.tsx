
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserSurveys } from '@/services/survey-service';
import { getUserContinuityPlans } from '@/services/continuity-service';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// --- Chart Configs ---
const riskLevelColors = {
  Bahaya: 'hsl(var(--destructive))',
  Sedang: 'hsl(48, 100%, 60%)',
  Rendah: 'hsl(var(--chart-2))',
  Minor: 'hsl(var(--chart-1))',
};

const pieChartConfig = {
  count: { label: 'Jumlah' },
  Bahaya: { label: 'Bahaya', color: riskLevelColors.Bahaya },
  Sedang: { label: 'Sedang', color: riskLevelColors.Sedang },
  Rendah: { label: 'Rendah', color: riskLevelColors.Rendah },
  Minor: { label: 'Minor', color: riskLevelColors.Minor },
} satisfies ChartConfig;

const barChartConfig = {
  jumlah: { label: "Jumlah Risiko", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

// --- Helper Components ---
function RiskIndicatorBadge({ level }: { level?: string }) {
    if (!level) return <Badge variant="outline">N/A</Badge>;
    let colorClass = 'bg-gray-400 text-white hover:bg-gray-500';
    switch (level) {
        case 'Bahaya': colorClass = 'bg-red-600 text-white hover:bg-red-700'; break;
        case 'Sedang': colorClass = 'bg-yellow-500 text-black hover:bg-yellow-600'; break;
        case 'Rendah': colorClass = 'bg-green-600 text-white hover:bg-green-700'; break;
        case 'Minor': colorClass = 'bg-blue-600 text-white hover:bg-blue-700'; break;
    }
    return <Badge className={cn("badge-print", colorClass)}>{level}</Badge>;
}

function ReportSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}

// --- Main Component ---
export default function ReportPage() {
    const { user, userProfile } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [plans, setPlans] = useState<ContinuityPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

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

    const reportData = useMemo(() => {
        if (!surveys || surveys.length === 0) return null;
        
        const surveyMap = new Map<string, Survey>(surveys.map(s => [`${s.riskEvent} - ${s.impactArea}`, s]));

        // Uraian 1 Data
        const impactAreaCounts = surveys.reduce((acc, survey) => {
            if (survey.areaDampak) {
                acc[survey.areaDampak] = (acc[survey.areaDampak] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        const tikCount = impactAreaCounts['Operasional dan Aset TIK'] || 0;
        const sdmCount = impactAreaCounts['Sumber Daya Manusia'] || 0;
        const totalImpactAreas = surveys.filter(s => s.areaDampak).length;
        const isTikSdmDominant = totalImpactAreas > 0 && (tikCount + sdmCount) / totalImpactAreas > 0.5;
        const uraian1 = isTikSdmDominant ? "Mayoritas area dampak terdapat pada Teknologi Informasi dan SDM, maka departemen TIK dan HRD diprioritaskan dalam mitigasi awal." : "Distribusi area dampak beragam, mitigasi perlu mempertimbangkan berbagai area secara seimbang.";

        // Uraian 2 Data
        const riskLevelCounts = surveys.reduce((acc, survey) => {
             if (survey.riskLevel) {
                acc[survey.riskLevel] = (acc[survey.riskLevel] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        const highMediumCount = (riskLevelCounts['Bahaya'] || 0) + (riskLevelCounts['Sedang'] || 0);
        const lowMinorCount = (riskLevelCounts['Rendah'] || 0) + (riskLevelCounts['Minor'] || 0);
        const isHighMediumDominant = highMediumCount > lowMinorCount;
        const uraian2 = isHighMediumDominant ? "Risiko dengan kategori 'Bahaya' dan 'Sedang' mendominasi, maka risiko-risiko tersebut menjadi prioritas mitigasi awal." : "Risiko didominasi oleh kategori 'Rendah' dan 'Minor', namun tetap memerlukan pemantauan berkelanjutan.";

        // Pie Chart Data
        const pieChartData = Object.entries(riskLevelCounts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name as keyof typeof riskLevelColors,
                value,
                fill: riskLevelColors[name as keyof typeof riskLevelColors],
            }));
        
        // Bar Chart & Uraian 3 Data
        const riskCategoryCounts = surveys.reduce((acc, survey) => {
            acc[survey.riskEvent] = (acc[survey.riskEvent] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const barChartData = Object.entries(riskCategoryCounts).map(([name, jumlah]) => ({ name, jumlah }));
        
        const highRiskByCategory = surveys.reduce((acc, survey) => {
            if (survey.riskLevel === 'Bahaya') {
                acc[survey.riskEvent] = (acc[survey.riskEvent] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        const dominantHighRiskCategory = Object.keys(highRiskByCategory).length > 0 ? Object.entries(highRiskByCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0] : null;
        const uraian3 = dominantHighRiskCategory ? `Dominasi risiko berada pada kategori '${dominantHighRiskCategory}' dengan tingkat 'Bahaya', maka prioritas harus pada penguatan sistem keamanan informasi di area terkait.` : "Tidak ada dominasi risiko 'Bahaya' pada kategori tertentu, namun kewaspadaan menyeluruh tetap diperlukan.";

        // Uraian 4 Data
        const weakControls = surveys.filter(s => (s.kontrolTeknologi?.length || 0) < 1 || (s.kontrolOrang?.length || 0) < 1).length;
        const isControlWeak = surveys.length > 0 && (weakControls / surveys.length) > 0.5;
        const uraian4 = isControlWeak ? "Banyak kontrol yang masih lemah terutama di sisi teknologi dan orang, maka disarankan peningkatan pelatihan dan pembaruan sistem keamanan." : "Kontrol yang ada secara umum sudah cukup memadai, namun peninjauan berkala tetap direkomendasikan.";

        // Uraian 5 Data
        const allHighPrioHavePlans = surveys
          .filter(s => s.riskLevel === 'Bahaya' || s.riskLevel === 'Sedang')
          .every(risk => plans.some(plan => plan.risiko === `${risk.riskEvent} - ${risk.impactArea}`));
        const highPrioRisksExist = surveys.some(s => s.riskLevel === 'Bahaya' || s.riskLevel === 'Sedang');

        const uraian5 = highPrioRisksExist && allHighPrioHavePlans ? "Seluruh strategi keberlanjutan untuk risiko prioritas telah diisi dan diterapkan, maka organisasi dinyatakan siap menghadapi risiko SPBE secara berkelanjutan." : "Beberapa risiko prioritas belum memiliki strategi keberlanjutan. Disarankan untuk segera melengkapi rencana kontinuitas untuk memastikan kesiapan organisasi.";


        return {
            uraian1,
            uraian2,
            uraian3,
            uraian4,
            uraian5,
            pieChartData,
            barChartData,
            totalSurveys: surveys.length,
            surveyMap,
        };
    }, [surveys, plans]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <ReportSkeleton />;
    }
    
    if (!userProfile || !reportData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Laporan Akhir Analisis Risiko</CardTitle>
                    <CardDescription>
                        Generate laporan akhir hasil analisis risiko SPBE.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground text-center">
                            Anda belum mengirimkan survei risiko apa pun. <br/> Laporan akan tersedia setelah Anda memasukkan data.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { uraian1, uraian2, uraian3, uraian4, uraian5, pieChartData, barChartData, totalSurveys, surveyMap } = reportData;

    return (
      <div className="space-y-6">
          <style jsx global>{`
            @media print {
              @page {
                size: A4;
                margin: 1in;
              }
              body * {
                visibility: hidden;
              }
              .printable-area, .printable-area * {
                visibility: visible;
              }
              .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0;
                margin: 0;
                color: black;
                font-size: 12pt;
              }
              .no-print {
                display: none;
              }
              .print-cover-page {
                display: flex !important;
                flex-direction: column;
                justify-content: space-between;
                height: 100vh;
                page-break-after: always;
              }
              .card-print {
                border: none;
                box-shadow: none;
                background-color: white;
                break-inside: avoid;
              }
              .printable-area table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10pt;
              }
              .printable-area th,
              .printable-area td {
                border: 1px solid black;
                padding: 6px;
                text-align: left;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
              }
              .printable-area th {
                background-color: #f2f2f2 !important;
                font-weight: bold;
              }
              .printable-area .badge-print {
                border: 1px solid #ccc;
                padding: 2px 6px;
                border-radius: 9999px;
              }
              .print-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10pt;
              }
              .print-table th, .print-table td {
                border: 1px solid black;
                padding: 6px;
                text-align: left;
                vertical-align: top;
                height: 2.5em; /* Give some height to cells */
              }
            }
          `}</style>
          
          <div className="flex justify-between items-center no-print">
              <h1 className="text-3xl font-bold">Laporan Akhir</h1>
              <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Laporan
              </Button>
          </div>

          <div className="printable-area">
             {/* --- Cover Page --- */}
            <div className="hidden print-cover-page">
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo Kabupaten Blitar" width={150} height={150} />
                  <h2 className="text-xl font-bold uppercase mb-4 mt-8">
                      Laporan Manajemen Risiko SPBE
                  </h2>
                  <h1 className="text-2xl font-bold uppercase mb-6">
                      OPD {userProfile.role}
                      <br/>
                      Kabupaten Blitar
                  </h1>
              </div>
              <div className="space-y-6">
                  <table className="print-table">
                      <thead>
                          <tr>
                              <th className="w-1/2 text-center">Disusun oleh</th>
                              <th className="w-1/2 text-center">Disahkan oleh</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr><td></td><td></td></tr>
                      </tbody>
                  </table>
                  <table className="print-table">
                       <thead>
                           <tr>
                               <th colSpan={4} className="text-center">Pembuatan Laporan</th>
                           </tr>
                          <tr>
                              <th className="w-1/6">Versi</th>
                              <th className="w-1/4">Tanggal</th>
                              <th className="w-1/4">Diusulkan Oleh</th>
                              <th>Deskripsi dan Riwayat Perubahan</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                            <td>1.0</td>
                            <td>{today}</td>
                            <td>{userProfile.role}</td>
                            <td>Pembuatan dokumen awal</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
            </div>

            {/* --- Main Content --- */}
            <div className="space-y-8">
              <div className="text-center space-y-2 mb-8">
                <div className="flex justify-center">
                    <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo Kabupaten Blitar" width={100} height={100} />
                </div>
                <h1 className="text-2xl font-bold">Laporan Akhir Hasil Analisis Risiko SPBE</h1>
                <p className="text-muted-foreground">{userProfile.role}</p>
              </div>
              
              <Card className="card-print">
                  <CardHeader><CardTitle>Biografi Pengguna</CardTitle></CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                          <div><span className="font-semibold block text-muted-foreground">Nama:</span> {userProfile.fullName}</div>
                          <div><span className="font-semibold block text-muted-foreground">Jabatan/Departemen:</span> {userProfile.role}</div>
                          <div><span className="font-semibold block text-muted-foreground">Tanggal Laporan:</span> {today}</div>
                          <div><span className="font-semibold block text-muted-foreground">Email:</span> {userProfile.email}</div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="card-print">
                  <CardHeader>
                      <CardTitle>Klasifikasi Risiko dan Area Terdampak</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader><TableRow><TableHead>Kategori Risiko</TableHead><TableHead>Risiko</TableHead><TableHead>Area Dampak</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {surveys.map(s => (
                                  <TableRow key={s.id}><TableCell>{s.riskEvent}</TableCell><TableCell>{s.impactArea}</TableCell><TableCell>{s.areaDampak}</TableCell></TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
                  <CardFooter><p className="text-sm text-muted-foreground italic">{uraian1}</p></CardFooter>
              </Card>

              <Card className="card-print">
                  <CardHeader>
                      <CardTitle>Analisis Kuantitatif Risiko</CardTitle>
                  </CardHeader>
                  <CardContent>
                       <Table>
                          <TableHeader><TableRow><TableHead>Kategori Risiko</TableHead><TableHead>Risiko</TableHead><TableHead>Frekuensi</TableHead><TableHead>Besaran Dampak</TableHead><TableHead>Tingkat Risiko</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {surveys.map(s => (
                                  <TableRow key={s.id}>
                                      <TableCell>{s.riskEvent}</TableCell>
                                      <TableCell>{s.impactArea}</TableCell>
                                      <TableCell>{s.frequency}</TableCell>
                                      <TableCell>{s.impactMagnitude}</TableCell>
                                      <TableCell><RiskIndicatorBadge level={s.riskLevel} /></TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
                   <CardFooter><p className="text-sm text-muted-foreground italic">{uraian2}</p></CardFooter>
              </Card>

              <Card className="card-print">
                  <CardHeader>
                      <CardTitle>Grafik Analisis Risiko</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                          <h3 className="font-semibold text-center mb-2">Distribusi Tingkat Risiko</h3>
                          <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[250px]">
                              <PieChart>
                                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} (${((Number(value) / totalSurveys) * 100).toFixed(0)}%)`} hideLabel />} />
                                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} label>
                                      {pieChartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.fill} />))}
                                  </Pie>
                                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                              </PieChart>
                          </ChartContainer>
                      </div>
                      <div>
                          <h3 className="font-semibold text-center mb-2">Jumlah Risiko per Kategori</h3>
                           <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                                <BarChart data={barChartData} layout="vertical" margin={{ left: 120 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, width: 110 }} interval={0} />
                                    <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="jumlah" fill="var(--color-jumlah)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                      </div>
                  </CardContent>
                  <CardFooter><p className="text-sm text-muted-foreground italic">{uraian3}</p></CardFooter>
              </Card>

               <Card className="card-print">
                  <CardHeader>
                      <CardTitle>Evaluasi Kontrol dan Mitigasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader><TableRow><TableHead>Risiko</TableHead><TableHead>Kontrol Organisasi</TableHead><TableHead>Kontrol Orang</TableHead><TableHead>Kontrol Fisik</TableHead><TableHead>Kontrol Teknologi</TableHead><TableHead>Mitigasi</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {surveys.map(s => (
                                  <TableRow key={s.id}>
                                      <TableCell className="whitespace-normal">{s.riskEvent} - {s.impactArea}</TableCell>
                                      <TableCell className="whitespace-normal">{(s.kontrolOrganisasi || []).join(', ') || 'N/A'}</TableCell>
                                      <TableCell className="whitespace-normal">{(s.kontrolOrang || []).join(', ') || 'N/A'}</TableCell>
                                      <TableCell className="whitespace-normal">{(s.kontrolFisik || []).join(', ') || 'N/A'}</TableCell>
                                      <TableCell className="whitespace-normal">{(s.kontrolTeknologi || []).join(', ') || 'N/A'}</TableCell>
                                      <TableCell>{s.mitigasi}</TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </CardContent>
                  <CardFooter><p className="text-sm text-muted-foreground italic">{uraian4}</p></CardFooter>
              </Card>

              <Card className="card-print">
                  <CardHeader>
                      <CardTitle>Keberlanjutan</CardTitle>
                  </CardHeader>
                  <CardContent>
                       <Table>
                          <TableHeader><TableRow><TableHead>Risiko</TableHead><TableHead>Tingkat Risiko</TableHead><TableHead>Strategi Keberlanjutan</TableHead></TableRow></TableHeader>
                          <TableBody>
                              {plans.length > 0 ? (
                                plans.map(plan => {
                                  const survey = surveyMap.get(plan.risiko);
                                  return (
                                    <TableRow key={plan.id}>
                                      <TableCell>{plan.risiko}</TableCell>
                                      <TableCell>
                                          {survey?.riskLevel ? (
                                              <RiskIndicatorBadge level={survey.riskLevel} />
                                          ) : (
                                              <Badge variant="outline" className="badge-print">N/A</Badge>
                                          )}
                                      </TableCell>
                                      <TableCell>{plan.aktivitas}</TableCell>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                  <TableRow>
                                      <TableCell colSpan={3} className="text-center text-muted-foreground">Tidak ada rencana kontinuitas yang dibuat.</TableCell>
                                  </TableRow>
                              )}
                          </TableBody>
                      </Table>
                  </CardContent>
                  <CardFooter><p className="text-sm text-muted-foreground italic">{uraian5}</p></CardFooter>
              </Card>
            </div>
          </div>
      </div>
    );
}
