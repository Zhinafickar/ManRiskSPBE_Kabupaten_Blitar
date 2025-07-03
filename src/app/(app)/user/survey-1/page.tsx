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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
    RISK_EVENTS,
    FREQUENCY_LEVELS,
    IMPACT_MAGNITUDES
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { getRiskLevel, type RiskIndicator } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const formSchema = z.object({
  riskEvent: z.string({ required_error: 'Silakan pilih kejadian risiko.' }).min(1, { message: 'Kejadian risiko harus diisi.' }),
  impactArea: z.string({ required_error: 'Silakan pilih area dampak.' }).min(1, { message: 'Area dampak harus diisi.' }),
  eventDate: z.date({ required_error: 'Waktu kejadian harus diisi.' }),
  cause: z.string().min(10, { message: 'Penyebab harus diisi minimal 10 karakter.' }),
  impact: z.string().min(10, { message: 'Dampak harus diisi minimal 10 karakter.' }),
  frequency: z.string({ required_error: 'Silakan pilih frekuensi.' }),
  impactMagnitude: z.string({ required_error: 'Silakan pilih besaran dampak.' }),
  kontrolOrganisasi: z.string().optional(),
  kontrolOrang: z.string().optional(),
  kontrolFisik: z.string().optional(),
  kontrolTeknologi: z.string().optional(),
});

export default function Survey1Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [riskEventOpen, setRiskEventOpen] = useState(false);
  const [impactAreaOpen, setImpactAreaOpen] = useState(false);
  const [availableImpactAreas, setAvailableImpactAreas] = useState<string[]>([]);
  const [riskIndicator, setRiskIndicator] = useState<RiskIndicator>({ level: null, color: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskEvent: '',
      impactArea: '',
      eventDate: undefined,
      cause: '',
      impact: '',
      frequency: '',
      impactMagnitude: '',
      kontrolOrganisasi: '',
      kontrolOrang: '',
      kontrolFisik: '',
      kontrolTeknologi: '',
    },
  });

  const selectedRiskEvent = form.watch('riskEvent');
  const frequency = form.watch('frequency');
  const impactMagnitude = form.watch('impactMagnitude');

  useEffect(() => {
    const riskEventObject = RISK_EVENTS.find(event => event.name === selectedRiskEvent);
    if (riskEventObject) {
      setAvailableImpactAreas(riskEventObject.impactAreas);
    } else {
      setAvailableImpactAreas([]);
    }
    form.setValue('impactArea', '');
  }, [selectedRiskEvent, form]);

  useEffect(() => {
    if (frequency && impactMagnitude) {
        const indicator = getRiskLevel(frequency, impactMagnitude);
        setRiskIndicator(indicator);
    } else {
        setRiskIndicator({ level: null, color: '' });
    }
  }, [frequency, impactMagnitude]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan survei.' });
        return;
    }
    setIsLoading(true);
    const indicator = getRiskLevel(values.frequency, values.impactMagnitude);
    try {
        await addSurvey({ ...values, surveyType: 1, userId: user.uid, userRole: userProfile.role, riskLevel: indicator.level ?? undefined });
        toast({ title: 'Sukses', description: 'Survei berhasil dikirim.' });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengirim survei.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Kejadian Risiko</CardTitle>
        <CardDescription>Isi formulir penilaian risiko di bawah ini. Pilih kejadian risiko untuk melihat area dampak yang relevan.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="riskEvent"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Kejadian Risiko</FormLabel>
                   <Popover open={riskEventOpen} onOpenChange={setRiskEventOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? RISK_EVENTS.find(event => event.name === field.value)?.name
                            : "Pilih kejadian risiko..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari kejadian risiko..." />
                        <CommandEmpty>Kejadian risiko tidak ditemukan.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {RISK_EVENTS.map((event) => (
                              <CommandItem
                                key={event.name}
                                value={event.name}
                                onSelect={() => {
                                  form.setValue("riskEvent", event.name);
                                  setRiskEventOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", event.name === field.value ? "opacity-100" : "opacity-0")} />
                                {event.name}
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
             <FormField
              control={form.control}
              name="impactArea"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Area Dampak Risiko</FormLabel>
                  <Popover open={impactAreaOpen} onOpenChange={setImpactAreaOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedRiskEvent || availableImpactAreas.length === 0}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? availableImpactAreas.find(
                                (area) => area === field.value
                              )
                            : "Pilih area dampak..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
                                  form.setValue("impactArea", area);
                                  setImpactAreaOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    area === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {area}
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
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Waktu Kejadian</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penyebab</FormLabel>
                  <FormControl><Textarea placeholder="Jelaskan penyebab kejadian risiko..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dampak</FormLabel>
                  <FormControl><Textarea placeholder="Jelaskan potensi dampaknya..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Frekuensi Kejadian</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih frekuensi" /></SelectTrigger></FormControl>
                        <SelectContent>{FREQUENCY_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="impactMagnitude"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Besaran Dampak</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih besaran dampak" /></SelectTrigger></FormControl>
                        <SelectContent>{IMPACT_MAGNITUDES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="space-y-2 rounded-lg border p-4">
                <FormLabel>Analisis Risiko</FormLabel>
                <div className='pt-2'>
                {riskIndicator.level ? (
                    <Badge className={cn("text-base", riskIndicator.color)}>
                    {riskIndicator.level}
                    </Badge>
                ) : (
                    <p className="text-sm text-muted-foreground">Indikator Risiko Anda Akan Keluar Disini</p>
                )}
                </div>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <FormLabel>Kontrol yang Sudah Ada</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <FormField
                  control={form.control}
                  name="kontrolOrganisasi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontrol Organisasi</FormLabel>
                      <FormControl><Textarea placeholder="Jelaskan kontrol organisasi yang ada..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kontrolOrang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontrol Orang</FormLabel>
                      <FormControl><Textarea placeholder="Jelaskan kontrol orang yang ada..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kontrolFisik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontrol Fisik</FormLabel>
                      <FormControl><Textarea placeholder="Jelaskan kontrol fisik yang ada..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="kontrolTeknologi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontrol Teknologi</FormLabel>
                      <FormControl><Textarea placeholder="Jelaskan kontrol teknologi yang ada..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim Survei'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
