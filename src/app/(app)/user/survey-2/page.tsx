'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
    RISK_EVENTS,
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
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// Make fields optional to allow submitting only filled rows.
const singleSurveySchema = z.object({
  riskEvent: z.string(), // This is pre-filled, so it will always be there.
  impactArea: z.string().optional(),
  eventDate: z.date().optional(),
  frequency: z.string().optional(),
  impactMagnitude: z.string().optional(),
  cause: z.string().optional(),
  impact: z.string().optional(),
  kontrolOrganisasi: z.string().optional(),
  kontrolOrang: z.string().optional(),
  kontrolFisik: z.string().optional(),
  kontrolTeknologi: z.string().optional(),
});

const formSchema = z.object({
  surveys: z.array(singleSurveySchema),
});

export default function Survey2Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [openImpactAreaPopovers, setOpenImpactAreaPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Initialize the form with all risk events.
    defaultValues: {
      surveys: RISK_EVENTS.map(event => ({
        riskEvent: event.name,
        impactArea: '',
        eventDate: undefined,
        frequency: '',
        impactMagnitude: ''
      })),
    },
  });

  const watchedSurveys = form.watch('surveys');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan survei.' });
        return;
    }

    const surveysToSubmit = values.surveys.filter(
        s => s.impactArea && s.eventDate && s.frequency && s.impactMagnitude
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
                riskEvent: surveyRow.riskEvent,
                impactArea: surveyRow.impactArea!,
                eventDate: surveyRow.eventDate!,
                frequency: surveyRow.frequency!,
                impactMagnitude: surveyRow.impactMagnitude!,
                surveyType: 2, 
                userId: user.uid, 
                userRole: userProfile.role, 
                riskLevel: indicator.level ?? undefined,
                cause: surveyRow.cause || '',
                impact: surveyRow.impact || '',
                kontrolOrganisasi: surveyRow.kontrolOrganisasi || '',
                kontrolOrang: surveyRow.kontrolOrang || '',
                kontrolFisik: surveyRow.kontrolFisik || '',
                kontrolTeknologi: surveyRow.kontrolTeknologi || '',
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
  
  const toggleImpactAreaPopover = (index: number) => {
    setOpenImpactAreaPopovers(prev => {
        const newStates = [...prev];
        newStates[index] = !newStates[index];
        return newStates;
    });
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px] font-semibold">Kejadian Risiko TIK</TableHead>
                    <TableHead className="min-w-[300px] font-semibold">Area Dampak</TableHead>
                    <TableHead className="min-w-[170px] font-semibold">Waktu Kejadian</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Frekuensi</TableHead>
                    <TableHead className="min-w-[180px] font-semibold">Besaran Dampak</TableHead>
                    <TableHead className="text-center font-semibold">Tingkat Risiko</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RISK_EVENTS.map((riskEvent, index) => {
                    const { level, color } = getRiskLevel(watchedSurveys[index]?.frequency, watchedSurveys[index]?.impactMagnitude);
                    const availableImpactAreas = riskEvent.impactAreas || [];
                    
                    return (
                        <TableRow key={riskEvent.name}>
                            <TableCell className="font-medium align-top pt-5">
                                {riskEvent.name}
                            </TableCell>
                            <TableCell>
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.impactArea`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Popover open={openImpactAreaPopovers[index]} onOpenChange={() => toggleImpactAreaPopover(index)}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                            <span className="truncate">{field.value ? field.value : "Pilih area..."}</span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Cari area dampak..." />
                                                        <CommandEmpty>Area dampak tidak ditemukan.</CommandEmpty>
                                                        <CommandList>
                                                            <CommandGroup>
                                                                {availableImpactAreas.map((area) => (
                                                                    <CommandItem
                                                                        key={area}
                                                                        value={area}
                                                                        onSelect={() => {
                                                                            form.setValue(`surveys.${index}.impactArea`, area);
                                                                            toggleImpactAreaPopover(index);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", area === field.value ? "opacity-100" : "opacity-0")} />
                                                                        <span className="flex-1">{area}</span>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
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
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
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
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih besaran" /></SelectTrigger></FormControl>
                                                <SelectContent>{IMPACT_MAGNITUDES.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell className="text-center align-middle">
                                {level ? <Badge className={cn("text-base", color)}>{level}</Badge> : <span className="text-xs text-muted-foreground">-</span>}
                            </TableCell>
                        </TableRow>
                    )
                  })}
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
