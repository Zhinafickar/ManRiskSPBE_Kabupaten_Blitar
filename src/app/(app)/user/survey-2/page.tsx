'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
    IMPACT_AREAS,
    FREQUENCY_LEVELS,
    IMPACT_MAGNITUDES
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { getRiskLevel } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const singleSurveySchema = z.object({
  riskEvent: z.string().min(5, { message: 'Minimal 5 karakter.' }),
  impactArea: z.string({ required_error: 'Pilih area dampak.' }),
  eventDate: z.date({ required_error: 'Pilih tanggal.' }),
  frequency: z.string({ required_error: 'Pilih frekuensi.' }),
  impactMagnitude: z.string({ required_error: 'Pilih besaran.' }),
  // These fields are not in the new UI, so they are made optional.
  cause: z.string().optional(),
  impact: z.string().optional(),
  kontrolOrganisasi: z.string().optional(),
  kontrolOrang: z.string().optional(),
  kontrolFisik: z.string().optional(),
  kontrolTeknologi: z.string().optional(),
});

const formSchema = z.object({
  surveys: z.array(singleSurveySchema).min(1, 'Harus ada setidaknya satu baris untuk dikirim.'),
});

const defaultRowValue = {
    riskEvent: '',
    impactArea: '',
    eventDate: undefined as Date | undefined,
    frequency: '',
    impactMagnitude: ''
};

export default function Survey2Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveys: [defaultRowValue],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "surveys",
  });
  
  const watchedSurveys = form.watch('surveys');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan survei.' });
        return;
    }
    setIsLoading(true);

    try {
        const submissionPromises = values.surveys.map(surveyRow => {
            const indicator = getRiskLevel(surveyRow.frequency, surveyRow.impactMagnitude);
            return addSurvey({ 
                ...surveyRow, 
                surveyType: 2, 
                userId: user.uid, 
                userRole: userProfile.role, 
                riskLevel: indicator.level ?? undefined,
                cause: surveyRow.cause || '',
                impact: surveyRow.impact || '',
            });
        });

        await Promise.all(submissionPromises);

        toast({ title: 'Sukses', description: `${values.surveys.length} kejadian risiko berhasil dikirim.` });
        form.reset({ surveys: [defaultRowValue] });

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengirim survei.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Survey (Tampilan Tabel)</CardTitle>
        <CardDescription>Isi satu atau lebih kejadian risiko dalam format seperti Excel. Klik "Tambah Baris" untuk menambah data baru.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Kejadian Risiko TIK</TableHead>
                    <TableHead className="min-w-[200px]">Area Dampak</TableHead>
                    <TableHead className="min-w-[170px]">Waktu Kejadian</TableHead>
                    <TableHead className="min-w-[180px]">Frekuensi</TableHead>
                    <TableHead className="min-w-[180px]">Besaran Dampak</TableHead>
                    <TableHead className="text-center">Tingkat Risiko</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const { level, color } = getRiskLevel(watchedSurveys[index]?.frequency, watchedSurveys[index]?.impactMagnitude);
                    return (
                        <TableRow key={field.id}>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.riskEvent`}
                                    render={({ field }) => (
                                        <FormItem><FormControl><Input placeholder="Jelaskan kejadian..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.impactArea`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih area..." /></SelectTrigger></FormControl>
                                                <SelectContent>{IMPACT_AREAS.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.eventDate`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.frequency`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih frekuensi" /></SelectTrigger></FormControl>
                                                <SelectContent>{FREQUENCY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.impactMagnitude`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih besaran" /></SelectTrigger></FormControl>
                                                <SelectContent>{IMPACT_MAGNITUDES.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                {level ? <Badge className={cn("text-base", color)}>{level}</Badge> : <span className="text-xs text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell>
                                <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
             <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append(defaultRowValue)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Baris
            </Button>
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
