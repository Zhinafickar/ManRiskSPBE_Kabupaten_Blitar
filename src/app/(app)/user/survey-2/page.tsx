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
    IMPACT_MAGNITUDES,
    ORGANIZATIONAL_CONTROLS,
    PEOPLE_CONTROLS,
    PHYSICAL_CONTROLS,
    TECHNOLOGICAL_CONTROLS,
    MITIGATION_OPTIONS
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { getRiskLevel } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';

const singleSurveySchema = z.object({
  riskEvent: z.string(),
  impactArea: z.string().optional(),
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
  
  const [openImpactAreaPopovers, setOpenImpactAreaPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));
  const [openKontrolOrganisasiPopovers, setOpenKontrolOrganisasiPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));
  const [openKontrolOrangPopovers, setOpenKontrolOrangPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));
  const [openKontrolFisikPopovers, setOpenKontrolFisikPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));
  const [openKontrolTeknologiPopovers, setOpenKontrolTeknologiPopovers] = useState<boolean[]>(Array(RISK_EVENTS.length).fill(false));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveys: RISK_EVENTS.map(event => ({
        riskEvent: event.name,
        impactArea: '',
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
                ...surveyRow,
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
  
  const togglePopover = (index: number, setPopoverState: React.Dispatch<React.SetStateAction<boolean[]>>) => {
    setPopoverState(prev => {
        const newStates = [...prev];
        newStates[index] = !newStates[index];
        return newStates;
    });
  };
  
  const handleClearRow = (index: number) => {
    form.setValue(`surveys.${index}.impactArea`, '');
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

  const renderMultiSelect = (
    index: number,
    fieldName: keyof z.infer<typeof singleSurveySchema>,
    options: readonly string[],
    placeholder: string,
    popoverOpenState: boolean[],
    setPopoverOpenState: React.Dispatch<React.SetStateAction<boolean[]>>
  ) => {
    const fieldNameStr = `surveys.${index}.${fieldName}` as const;
    
    return (
      <FormField
        control={form.control}
        name={fieldNameStr}
        render={({ field }) => (
          <FormItem>
            <Popover open={popoverOpenState[index]} onOpenChange={() => togglePopover(index, setPopoverOpenState)}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                    <span className="truncate">{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Cari..." />
                  <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {options.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={() => {
                            const value = (field.value as string[] | undefined) || [];
                            const newValue = value.includes(item)
                              ? value.filter((i) => i !== item)
                              : [...value, item];
                            form.setValue(fieldNameStr, newValue);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", (field.value as string[] | undefined)?.includes(item) ? "opacity-100" : "opacity-0")} />
                          <span className="flex-1 truncate">{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />
    );
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
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px] font-semibold sticky left-0 bg-background z-10">Kejadian Risiko TIK</TableHead>
                    <TableHead className="w-[300px] font-semibold">Area Dampak</TableHead>
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
                  {RISK_EVENTS.map((riskEvent, index) => {
                    const { level, color } = getRiskLevel(watchedSurveys[index]?.frequency, watchedSurveys[index]?.impactMagnitude);
                    const availableImpactAreas = riskEvent.impactAreas || [];
                    
                    return (
                        <TableRow key={riskEvent.name}>
                            <TableCell className="font-medium align-top sticky left-0 bg-background z-10 whitespace-normal break-words">
                                {riskEvent.name}
                            </TableCell>
                            <TableCell className="align-top">
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.impactArea`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Popover open={openImpactAreaPopovers[index]} onOpenChange={() => togglePopover(index, setOpenImpactAreaPopovers)}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className={cn("w-full justify-between text-left h-auto min-h-10", !field.value && "text-muted-foreground")}>
                                                          <span className="whitespace-normal break-words flex-1 pr-2">{field.value ? field.value : "Pilih area..."}</span>
                                                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                                                            togglePopover(index, setOpenImpactAreaPopovers);
                                                                        }}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", area === field.value ? "opacity-100" : "opacity-0")} />
                                                                        <span className="flex-1 whitespace-normal break-words">{area}</span>
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
                            <TableCell className="align-top">
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
                            <TableCell className="align-top">
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.cause`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl><Textarea placeholder="Jelaskan penyebab..." {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell className="align-top">
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.impact`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormControl><Textarea placeholder="Jelaskan dampak..." {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell className="align-top">
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
                            <TableCell className="align-top">
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
                            <TableCell className="align-top">
                                {renderMultiSelect(index, 'kontrolOrganisasi', ORGANIZATIONAL_CONTROLS, "Pilih kontrol...", openKontrolOrganisasiPopovers, setOpenKontrolOrganisasiPopovers)}
                            </TableCell>
                             <TableCell className="align-top">
                                {renderMultiSelect(index, 'kontrolOrang', PEOPLE_CONTROLS, "Pilih kontrol...", openKontrolOrangPopovers, setOpenKontrolOrangPopovers)}
                            </TableCell>
                             <TableCell className="align-top">
                                {renderMultiSelect(index, 'kontrolFisik', PHYSICAL_CONTROLS, "Pilih kontrol...", openKontrolFisikPopovers, setOpenKontrolFisikPopovers)}
                            </TableCell>
                            <TableCell className="align-top">
                                {renderMultiSelect(index, 'kontrolTeknologi', TECHNOLOGICAL_CONTROLS, "Pilih kontrol...", openKontrolTeknologiPopovers, setOpenKontrolTeknologiPopovers)}
                            </TableCell>
                             <TableCell className="align-top">
                                <FormField
                                    control={form.control}
                                    name={`surveys.${index}.mitigasi`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih mitigasi" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {MITIGATION_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                {option}
                                                </SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TableCell>
                            <TableCell className="text-center align-middle">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleClearRow(index)}
                                    title="Bersihkan baris"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    <span className="sr-only">Bersihkan baris</span>
                                </Button>
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
