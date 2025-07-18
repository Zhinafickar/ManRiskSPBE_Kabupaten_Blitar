
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
  const [userSurveys, setUserSurveys] = useState<Survey[]>([]);
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
        getUserSurveys(user.uid).then(setUserSurveys);
        getAllSurveyData().then(setAllSurveyData);
    }
  }, [user]);

  const availableRisks = userSurveys.map(survey => `${survey.riskEvent} - ${survey.impactArea}`);

  const handleAiSuggestion = async () => {
    if (!selectedRisk) {
        toast({ variant: 'destructive', title: 'Error', description: 'Silakan pilih risiko terlebih dahulu.' });
        return;
    }

    const selectedSurvey = userSurveys.find(s => `${s.riskEvent} - ${s.impactArea}` === selectedRisk);
    
    if (!selectedSurvey) {
        toast({ variant: 'destructive', title: 'Error', description: 'Detail survei untuk risiko yang dipilih tidak ditemukan.' });
        return;
    }

    setIsAiLoading(true);

    try {
        const currentPlans = form.getValues('plans');
        // Get a list of non-empty, existing plan activities to provide as context
        const existingActivities = currentPlans
            .map(p => p.aktivitas.trim())
            .filter(a => a.length > 0);
            
        const suggestion = await suggestContinuityPlan({
            selectedSurveyDetails: {
                riskEvent: selectedSurvey.riskEvent,
                impactArea: selectedSurvey.impactArea,
                cause: selectedSurvey.cause,
                impact: selectedSurvey.impact,
                riskLevel: selectedSurvey.riskLevel || 'N/A'
            },
            allSurveyData: JSON.stringify(allSurveyData),
            existingPlans: existingActivities,
        });
        
        if (suggestion.aktivitas === "Tidak ada rencana lain yang terpikirkan") {
            toast({
                title: 'Tidak Ada Saran Baru',
                description: 'AI tidak dapat menemukan rencana pemulihan baru yang berbeda dari yang sudah ada.',
            });
            setIsAiLoading(false);
            return;
        }

        const lastPlanIndex = currentPlans.length - 1;
        const lastPlan = currentPlans[lastPlanIndex];

        // If the last plan is completely empty, fill it. Otherwise, append a new plan.
        if (lastPlan && !lastPlan.aktivitas && !lastPlan.targetWaktu && !lastPlan.pic && !lastPlan.sumberdaya) {
             form.setValue(`plans.${lastPlanIndex}.aktivitas`, suggestion.aktivitas, { shouldValidate: true });
             form.setValue(`plans.${lastPlanIndex}.targetWaktu`, suggestion.targetWaktu, { shouldValidate: true });
             form.setValue(`plans.${lastPlanIndex}.pic`, suggestion.pic, { shouldValidate: true });
             form.setValue(`plans.${lastPlanIndex}.sumberdaya`, suggestion.sumberdaya, { shouldValidate: true });
             toast({ title: 'Saran Diterapkan', description: 'Saran telah diterapkan pada rencana saat ini.' });
        } else {
            append({
                ...suggestion,
                rto: '', // RTO and RPO should be filled by user
                rpo: '',
            });
            toast({ title: 'Saran Baru Ditambahkan', description: 'Saran baru telah ditambahkan sebagai rencana di bawah.' });
        }

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
        form.reset({
            risiko: values.risiko, // Keep the selected risk
            plans: [{ aktivitas: '', targetWaktu: '', pic: '', sumberdaya: '', rto: '', rpo: '' }]
        });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan satu atau lebih rencana.' });
    } finally {
        setIsLoading(false);
    }
  }

  const handleRiskChange = (value: string) => {
    form.reset({
        risiko: value,
        plans: [{ aktivitas: '', targetWaktu: '', pic: '', sumberdaya: '', rto: '', rpo: '' }]
    });
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
                   <Select onValueChange={handleRiskChange} value={field.value}>
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
