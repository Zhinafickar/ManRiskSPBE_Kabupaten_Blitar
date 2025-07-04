'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Recycle, Bot } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { addContinuityPlan } from '@/services/continuity-service';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserSurveys } from '@/services/survey-service';
import type { Survey } from '@/types/survey';
import { suggestContinuityPlan } from '@/ai/flows/suggest-continuity-plan';


const formSchema = z.object({
  risiko: z.string({ required_error: 'Risiko harus dipilih.' }).min(1, { message: 'Risiko harus dipilih.' }),
  aktivitas: z.string().min(1, { message: 'Aktivitas harus diisi.' }),
  targetWaktu: z.string().min(1, { message: 'Target waktu harus diisi.' }),
  pic: z.string().min(1, { message: 'PIC harus diisi.' }),
  sumberdaya: z.string().min(1, { message: 'Sumberdaya harus diisi.' }),
  rto: z.string().min(1, { message: 'RTO harus diisi.' }),
  rpo: z.string().min(1, { message: 'RPO harus diisi.' }),
});


export default function ContinuityPage({}: {}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [allSurveys, setAllSurveys] = useState<Survey[]>([]);
  const [availableRisks, setAvailableRisks] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      risiko: '',
      aktivitas: '',
      targetWaktu: '',
      pic: '',
      sumberdaya: '',
      rto: '',
      rpo: '',
    },
  });

  useEffect(() => {
    if (user) {
      getUserSurveys(user.uid).then(surveys => {
        setAllSurveys(surveys);
        const uniqueRisks = new Set<string>();
        surveys.forEach(survey => {
          if (survey.riskEvent && survey.impactArea) {
            uniqueRisks.add(`${survey.riskEvent} - ${survey.impactArea}`);
          }
        });
        setAvailableRisks(Array.from(uniqueRisks));
      });
    }
  }, [user]);
  
  const handleAiSuggestion = async () => {
    const selectedRisk = form.getValues('risiko');
    if (!selectedRisk) {
        toast({
            variant: 'destructive',
            title: 'Pilih Risiko',
            description: 'Anda harus memilih risiko terlebih dahulu untuk mendapatkan saran AI.',
        });
        return;
    }
    
    setIsAiLoading(true);
    try {
        const result = await suggestContinuityPlan({
            risiko: selectedRisk,
            allSurveyData: JSON.stringify(allSurveys),
        });

        if (result) {
            form.setValue('aktivitas', result.aktivitas, { shouldValidate: true });
            form.setValue('targetWaktu', result.targetWaktu, { shouldValidate: true });
            form.setValue('pic', result.pic, { shouldValidate: true });
            form.setValue('sumberdaya', result.sumberdaya, { shouldValidate: true });
            toast({
                title: 'Saran AI Diterapkan',
                description: 'Formulir telah diisi dengan saran dari AI. Silakan tinjau kembali.',
            });
        }
    } catch (error) {
        console.error("Error getting AI suggestion:", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Mendapatkan Saran',
            description: 'Terjadi kesalahan saat berkomunikasi dengan AI.',
        });
    } finally {
        setIsAiLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan rencana.' });
        return;
    }
    setIsLoading(true);
    try {
        await addContinuityPlan({ ...values, userId: user.uid });
        toast({ title: 'Sukses', description: 'Rencana kontinuitas berhasil disimpan.' });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan rencana.' });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-6 w-6" />
          Kontinuitas/Keberlanjutan
        </CardTitle>
        <CardDescription>
          Isi formulir untuk perencanaan keberlanjutan dan kontinuitas layanan. Anda bisa mendapatkan saran dari AI setelah memilih risiko.
        </CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-end gap-2">
              <div className="w-full flex-grow">
                <FormField
                  control={form.control}
                  name="risiko"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RISIKO</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih risiko dari survei yang ada..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRisks.length > 0 ? (
                            availableRisks.map(risk => (
                              <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-risks" disabled>
                              Tidak ada risiko yang ditemukan dari survei Anda.
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <Button type="button" onClick={handleAiSuggestion} disabled={isAiLoading || availableRisks.length === 0} className="w-full sm:w-auto">
                    {isAiLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memproses...
                        </>
                    ) : (
                        <>
                            <Bot className="mr-2 h-4 w-4" />
                            Dapatkan Saran AI
                        </>
                    )}
                </Button>
            </div>
            <FormField
              control={form.control}
              name="aktivitas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AKTIVITAS</FormLabel>
                  <FormControl><Textarea placeholder="Jelaskan aktivitas pemulihan yang akan dilakukan..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetWaktu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TARGET WAKTU</FormLabel>
                    <FormControl><Input placeholder="Contoh: 24 Jam" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIC</FormLabel>
                    <FormControl><Input placeholder="Nama atau departemen penanggung jawab" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sumberdaya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sumberdaya yang dibutuhkan</FormLabel>
                  <FormControl><Textarea placeholder="Sebutkan semua sumber daya yang diperlukan (manusia, teknis, dll.)..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Time Objective (RTO)</FormLabel>
                    <FormControl><Input placeholder="Contoh: 4 Jam" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rpo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Point Objective (RPO)</FormLabel>
                    <FormControl><Input placeholder="Contoh: Data 1 jam terakhir" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Rencana'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
