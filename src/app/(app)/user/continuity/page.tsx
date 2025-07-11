
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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
import { Recycle, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addContinuityPlan } from '@/services/continuity-service';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserSurveys } from '@/services/survey-service';
import { suggestContinuityPlan } from '@/ai/flows/suggest-continuity-plan';
import { getAllSurveyData } from '@/services/survey-service';
import type { Survey } from '@/types/survey';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const planSchema = z.object({
  aktivitas: z.string().min(1, "Aktivitas harus diisi."),
  targetWaktu: z.string().min(1, "Target waktu harus diisi."),
  pic: z.string().min(1, "PIC harus diisi."),
  sumberdaya: z.string().min(1, "Sumberdaya harus diisi."),
  rto: z.string().min(1, "RTO harus diisi."),
  rpo: z.string().min(1, "RPO harus diisi."),
});

const formSchema = z.object({
  risiko: z.string({ required_error: 'Risiko harus dipilih.' }).min(1, { message: 'Risiko harus dipilih.' }),
  plans: z.array(planSchema).min(1, "Harus ada setidaknya satu rencana."),
});

export default function ContinuityPage() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [availableRisks, setAvailableRisks] = useState<string[]>([]);
  const [allSurveyData, setAllSurveyData] = useState<Survey[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      risiko: '',
      plans: [{ aktivitas: '', targetWaktu: '', pic: '', sumberdaya: '', rto: '', rpo: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "plans"
  });

  const selectedRisk = form.watch('risiko');

  useEffect(() => {
    if (user) {
        getUserSurveys(user.uid).then(surveys => {
          const uniqueRisks = new Set<string>();
          surveys.forEach(survey => {
            if (survey.riskEvent && survey.impactArea) {
              uniqueRisks.add(`${survey.riskEvent} - ${survey.impactArea}`);
            }
          });
          setAvailableRisks(Array.from(uniqueRisks));
        });
        getAllSurveyData().then(setAllSurveyData);
    }
  }, [user]);

  const handleAiSuggestion = async () => {
    if (!selectedRisk) {
        toast({ variant: 'destructive', title: 'Error', description: 'Silakan pilih risiko terlebih dahulu.' });
        return;
    }
    setIsAiLoading(true);
    try {
        const suggestion = await suggestContinuityPlan({
            risiko: selectedRisk,
            allSurveyData: JSON.stringify(allSurveyData),
        });
        
        // If the first plan is empty, fill it. Otherwise, append a new one.
        const firstPlan = form.getValues('plans.0');
        if (fields.length === 1 && !firstPlan.aktivitas && !firstPlan.targetWaktu && !firstPlan.pic && !firstPlan.sumberdaya) {
             form.setValue('plans.0', {
                aktivitas: suggestion.aktivitas,
                targetWaktu: suggestion.targetWaktu,
                pic: suggestion.pic,
                sumberdaya: suggestion.sumberdaya,
                rto: '',
                rpo: '',
             }, { shouldValidate: true });
        } else {
            append({
                aktivitas: suggestion.aktivitas,
                targetWaktu: suggestion.targetWaktu,
                pic: suggestion.pic,
                sumberdaya: suggestion.sumberdaya,
                rto: '', 
                rpo: '',
            });
        }
        
        toast({ title: 'Saran Dibuat', description: 'Saran rencana kontinuitas telah ditambahkan.' });
    } catch (error) {
        console.error("AI suggestion error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal mendapatkan saran dari AI.' });
    } finally {
        setIsAiLoading(false);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan rencana.' });
        return;
    }
    setIsLoading(true);

    const submissionPromises = values.plans.map(plan => addContinuityPlan({
        ...plan,
        risiko: values.risiko,
        userId: user.uid,
        userRole: userProfile.role
    }));

    try {
        await Promise.all(submissionPromises);
        toast({ title: 'Sukses', description: `${values.plans.length} rencana kontinuitas berhasil disimpan.` });
        form.reset();
         // After reset, the field array is empty. We need to add back the initial empty form.
        form.setValue('plans', [{ aktivitas: '', targetWaktu: '', pic: '', sumberdaya: '', rto: '', rpo: '' }]);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan satu atau lebih rencana.' });
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
          Isi formulir untuk perencanaan keberlanjutan. Pilih satu risiko, lalu tambahkan satu atau lebih rencana aktivitas untuk risiko tersebut.
        </CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
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

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="relative bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Rencana #{index + 1}</CardTitle>
                    </CardHeader>
                  <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name={`plans.${index}.aktivitas`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Aktivitas</FormLabel>
                            <FormControl><Textarea placeholder="Aktivitas pemulihan..." {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name={`plans.${index}.sumberdaya`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Sumberdaya yang dibutuhkan</FormLabel>
                            <FormControl><Textarea placeholder="Sumber daya dibutuhkan..." {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`plans.${index}.targetWaktu`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Target Waktu</FormLabel>
                                <FormControl><Input placeholder="Contoh: 24 Jam" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name={`plans.${index}.pic`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>PIC</FormLabel>
                                <FormControl><Input placeholder="Departemen/Jabatan" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        <FormField
                            control={form.control}
                            name={`plans.${index}.rto`}
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
                            name={`plans.${index}.rpo`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Recovery Point Objective (RPO)</FormLabel>
                                <FormControl><Input placeholder="Contoh: 1 Jam" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                  </CardContent>
                   {fields.length > 1 && (
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   )}
                </Card>
              ))}
            </div>

             <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ aktivitas: '', targetWaktu: '', pic: '', sumberdaya: '', rto: '', rpo: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Rencana
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAiSuggestion}
                    disabled={isAiLoading || !selectedRisk}
                >
                    {isAiLoading ? 'Memproses...' : '✨ Beri Saya Saran (AI)'}
                </Button>
            </div>
             {form.formState.errors.plans?.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.plans.root.message}</p>
            )}
            
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Semua Rencana'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}

