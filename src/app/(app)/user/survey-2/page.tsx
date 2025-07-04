'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RISK_EVENTS } from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { getRiskLevel } from '@/lib/risk-matrix';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SurveyTableRow } from './_components/survey-table-row';

const singleSurveySchema = z.object({
  riskEvent: z.string(),
  impactArea: z.string().optional(),
  areaDampak: z.string().optional(),
  eventDate: z.date().optional(),
  frequency: z.string().optional(),
  impactMagnitude: z.string().optional(),
  cause: z.string().optional(),
  impact: z.string().optional(),
  kontrolOrganisasi: z.array(z.string()).optional(),
  kontrolOrang: z.array(z.string()).optional(),
  kontrolFisik: z.array(z.string()).optional(),
  kontrolTeknologi: z.array(z.string()).optional(),
  mitigasi: z.string().optional(),
});

const formSchema = z.object({
  surveys: z.array(singleSurveySchema),
});

export default function Survey2Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveys: RISK_EVENTS.map(event => ({
        riskEvent: event.name,
        impactArea: '',
        areaDampak: '',
        eventDate: undefined,
        frequency: '',
        impactMagnitude: '',
        cause: '',
        impact: '',
        kontrolOrganisasi: [],
        kontrolOrang: [],
        kontrolFisik: [],
        kontrolTeknologi: [],
        mitigasi: '',
      })),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan survei.' });
        return;
    }

    const surveysToSubmit = values.surveys.filter(
        s => s.impactArea && s.eventDate && s.frequency && s.impactMagnitude && s.areaDampak
    );

    if (surveysToSubmit.length === 0) {
        toast({ variant: 'destructive', title: 'Tidak Ada Data', description: 'Silakan isi setidaknya satu baris yang lengkap untuk dikirim.' });
        return;
    }

    setIsLoading(true);

    try {
        const submissionPromises = surveysToSubmit.map(surveyRow => {
            const indicator = getRiskLevel(surveyRow.frequency!, surveyRow.impactMagnitude!);
            return addSurvey({ 
                ...surveyRow,
                areaDampak: surveyRow.areaDampak!,
                impactArea: surveyRow.impactArea!,
                eventDate: surveyRow.eventDate!,
                frequency: surveyRow.frequency!,
                impactMagnitude: surveyRow.impactMagnitude!,
                surveyType: 2, 
                userId: user.uid, 
                userRole: userProfile.role, 
                riskLevel: indicator.level ?? undefined,
            });
        });

        await Promise.all(submissionPromises);

        toast({ title: 'Sukses', description: `${surveysToSubmit.length} kejadian risiko berhasil dikirim.` });
        form.reset();

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengirim survei.' });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleClearRow = (index: number) => {
    form.setValue(`surveys.${index}.impactArea`, '');
    form.setValue(`surveys.${index}.areaDampak`, '');
    form.setValue(`surveys.${index}.eventDate`, undefined);
    form.setValue(`surveys.${index}.cause`, '');
    form.setValue(`surveys.${index}.impact`, '');
    form.setValue(`surveys.${index}.frequency`, '');
    form.setValue(`surveys.${index}.impactMagnitude`, '');
    form.setValue(`surveys.${index}.kontrolOrganisasi`, []);
    form.setValue(`surveys.${index}.kontrolOrang`, []);
    form.setValue(`surveys.${index}.kontrolFisik`, []);
    form.setValue(`surveys.${index}.kontrolTeknologi`, []);
    form.setValue(`surveys.${index}.mitigasi`, '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Survey (Tampilan Tabel)</CardTitle>
        <CardDescription>Isi data untuk setiap kejadian risiko yang telah ditentukan. Hanya baris yang terisi lengkap yang akan dikirim.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="overflow-x-auto border rounded-lg">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] font-semibold sticky left-0 bg-background z-10">Kategori Risiko</TableHead>
                    <TableHead className="w-[300px] font-semibold">Risiko</TableHead>
                    <TableHead className="w-[200px] font-semibold">Area Dampak</TableHead>
                    <TableHead className="w-[170px] font-semibold">Waktu Kejadian</TableHead>
                    <TableHead className="w-[250px] font-semibold">Penyebab</TableHead>
                    <TableHead className="w-[250px] font-semibold">Dampak</TableHead>
                    <TableHead className="w-[180px] font-semibold">Frekuensi</TableHead>
                    <TableHead className="w-[180px] font-semibold">Besaran Dampak</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold">Tingkat Risiko</TableHead>
                    <TableHead className="w-[200px] font-semibold">Kontrol Organisasi</TableHead>
                    <TableHead className="w-[200px] font-semibold">Kontrol Orang</TableHead>
                    <TableHead className="w-[200px] font-semibold">Kontrol Fisik</TableHead>
                    <TableHead className="w-[200px] font-semibold">Kontrol Teknologi</TableHead>
                    <TableHead className="w-[200px] font-semibold">Mitigasi</TableHead>
                    <TableHead className="w-[80px] font-semibold text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RISK_EVENTS.map((riskEvent, index) => (
                    <SurveyTableRow
                      key={riskEvent.name}
                      index={index}
                      riskEvent={riskEvent}
                      handleClearRow={handleClearRow}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <FormMessage>{form.formState.errors.surveys?.root?.message}</FormMessage>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim Semua'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
