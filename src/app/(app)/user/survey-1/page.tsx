
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
    IMPACT_MAGNITUDES,
    ORGANIZATIONAL_CONTROLS,
    PEOPLE_CONTROLS,
    PHYSICAL_CONTROLS,
    TECHNOLOGICAL_CONTROLS,
    MITIGATION_OPTIONS,
    AREA_DAMPAK_OPTIONS,
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Sparkles, TrendingDown, TrendingUp, Loader2, RotateCw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { getRiskLevel, type RiskIndicator } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { suggestCauseImpact } from '@/ai/flows/suggest-cause-impact';
import { determineRiskSentiment } from '@/ai/flows/determine-risk-sentiment';
import { sortRelevantControls } from '@/ai/flows/sort-relevant-controls';
import type { SortRelevantControlsInput } from '@/types/controls';


const formSchema = z.object({
  riskEvent: z.string({ required_error: 'Silakan pilih kategori risiko.' }).min(1, { message: 'Kategori risiko harus diisi.' }),
  impactArea: z.string({ required_error: 'Silakan pilih risiko.' }).min(1, { message: 'Risiko harus diisi.' }),
  areaDampak: z.string({ required_error: 'Area dampak harus diisi.' }).min(1, { message: 'Area dampak harus diisi.' }),
  eventDate: z.date({ required_error: 'Waktu kejadian harus diisi.' }),
  cause: z.string().min(10, { message: 'Penyebab harus diisi minimal 10 karakter.' }),
  impact: z.string().min(10, { message: 'Dampak harus diisi minimal 10 karakter.' }),
  frequency: z.string().min(1, { message: "Frekuensi kejadian harus dipilih." }),
  impactMagnitude: z.string().min(1, { message: "Besaran dampak harus dipilih." }),
  kontrolOrganisasi: z.array(z.string()).optional(),
  kontrolOrang: z.array(z.string()).optional(),
  kontrolFisik: z.array(z.string()).optional(),
  kontrolTeknologi: z.array(z.string()).optional(),
  mitigasi: z.string().min(1, { message: "Mitigasi harus dipilih." }),
});

export default function Survey1Page({ params, searchParams }: { params: any, searchParams: any}) {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiCauseImpactLoading, setIsAiCauseImpactLoading] = useState(false);
  const [isAiControlsLoading, setIsAiControlsLoading] = useState(false);

  // State for popovers
  const [riskEventOpen, setRiskEventOpen] = useState(false);
  const [impactAreaOpen, setImpactAreaOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [kontrolOrganisasiOpen, setKontrolOrganisasiOpen] = useState(false);
  const [kontrolOrangOpen, setKontrolOrangOpen] = useState(false);
  const [kontrolFisikOpen, setKontrolFisikOpen] = useState(false);
  const [kontrolTeknologiOpen, setKontrolTeknologiOpen] = useState(false);
  
  const [availableImpactAreas, setAvailableImpactAreas] = useState<string[]>([]);
  const [riskIndicator, setRiskIndicator] = useState<RiskIndicator>({ level: null, color: '' });
  const [riskSentiment, setRiskSentiment] = useState<'Positif' | 'Negatif' | 'Netral' | null>(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);

  // Sorted controls state
  const [sortedOrganizational, setSortedOrganizational] = useState(ORGANIZATIONAL_CONTROLS);
  const [sortedPeople, setSortedPeople] = useState(PEOPLE_CONTROLS);
  const [sortedPhysical, setSortedPhysical] = useState(PHYSICAL_CONTROLS);
  const [sortedTechnological, setSortedTechnological] = useState(TECHNOLOGICAL_CONTROLS);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskEvent: '',
      impactArea: '',
      areaDampak: '',
      eventDate: undefined,
      cause: '',
      impact: '',
      frequency: '',
      impactMagnitude: '',
      kontrolOrganisasi: [],
      kontrolOrang: [],
      kontrolFisik: [],
      kontrolTeknologi: [],
      mitigasi: '',
    },
  });

  const selectedRiskEvent = form.watch('riskEvent');
  const frequency = form.watch('frequency');
  const impactMagnitude = form.watch('impactMagnitude');

  useEffect(() => {
    const riskEventObject = RISK_EVENTS.find(event => event.name === selectedRiskEvent);
    setAvailableImpactAreas(riskEventObject ? riskEventObject.impactAreas : []);
    form.setValue('impactArea', '');
  }, [selectedRiskEvent, form]);

  useEffect(() => {
    setRiskIndicator(getRiskLevel(frequency, impactMagnitude));
  }, [frequency, impactMagnitude]);
  
  useEffect(() => {
    const { riskEvent, impactArea } = form.getValues();
    if (riskEvent && impactArea) {
      setIsSentimentLoading(true);
      determineRiskSentiment({ riskCategory: riskEvent, risk: impactArea })
        .then(result => setRiskSentiment(result.sentiment))
        .catch(() => setRiskSentiment(null))
        .finally(() => setIsSentimentLoading(false));
    } else {
      setRiskSentiment(null);
    }
  }, [form.watch('riskEvent'), form.watch('impactArea')]);


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
        // Reset controls to default order after submission
        setSortedOrganizational(ORGANIZATIONAL_CONTROLS);
        setSortedPeople(PEOPLE_CONTROLS);
        setSortedPhysical(PHYSICAL_CONTROLS);
        setSortedTechnological(TECHNOLOGICAL_CONTROLS);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengirim survei.' });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleCauseImpactSuggestion = async () => {
    const { riskEvent, impactArea, areaDampak } = form.getValues();
    if (!riskEvent || !impactArea || !areaDampak) {
      toast({ variant: 'destructive', title: 'Data Kurang', description: 'Pilih Kategori Risiko, Risiko, dan Area Dampak terlebih dahulu.' });
      return;
    }
    setIsAiCauseImpactLoading(true);
    try {
      const result = await suggestCauseImpact({ riskCategory: riskEvent, risk: impactArea, impactArea: areaDampak });
      form.setValue('cause', result.cause, { shouldValidate: true });
      form.setValue('impact', result.impact, { shouldValidate: true });
      toast({ title: 'Saran Diterapkan', description: 'Kolom Penyebab dan Dampak telah diisi oleh AI.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal mendapatkan saran dari AI.' });
    } finally {
      setIsAiCauseImpactLoading(false);
    }
  };
  
  const handleSortControls = async () => {
      const { riskEvent, impactArea, areaDampak, cause, impact, frequency, impactMagnitude } = form.getValues();
      const { level: riskLevel } = getRiskLevel(frequency, impactMagnitude);

      if (!riskEvent || !impactArea || !areaDampak || !cause || !impact || !riskLevel) {
          toast({ variant: 'destructive', title: 'Data Kurang Lengkap', description: 'Harap isi semua kolom identifikasi risiko (sampai besaran dampak) untuk mendapatkan saran penyortiran.' });
          return;
      }

      setIsAiControlsLoading(true);
      try {
          const result = await sortRelevantControls({ riskEvent, impactArea, areaDampak, cause, impact, riskLevel });
          setSortedOrganizational(result.sortedOrganizational);
          setSortedPeople(result.sortedPeople);
          setSortedPhysical(result.sortedPhysical);
          setSortedTechnological(result.sortedTechnological);
          toast({ title: 'Sukses', description: 'Urutan pilihan kontrol telah disesuaikan oleh AI.' });
      } catch (e) {
          console.error("Failed to sort controls with AI", e);
          toast({ variant: 'destructive', title: 'Gagal', description: 'Gagal mendapatkan saran dari AI. Silakan coba lagi.' });
      } finally {
          setIsAiControlsLoading(false);
      }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Kejadian Risiko</CardTitle>
        <CardDescription>Isi formulir penilaian risiko di bawah ini. Anda dapat meminta AI untuk menyortir pilihan kontrol berdasarkan konteks yang Anda berikan.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Risk Category and Specific Risk */}
            <FormField
              control={form.control}
              name="riskEvent"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Kategori Risiko (ISO 31000 dan Cobit 5 for risk)</FormLabel>
                   <Popover open={riskEventOpen} onOpenChange={setRiskEventOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                          {field.value ? RISK_EVENTS.find(event => event.name === field.value)?.name : "Pilih kategori risiko..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari kategori risiko..." />
                        <CommandEmpty>Kategori risiko tidak ditemukan.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {RISK_EVENTS.map((event) => (
                              <CommandItem key={event.name} value={event.name} onSelect={() => { form.setValue("riskEvent", event.name); setRiskEventOpen(false); }}>
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
                  <FormLabel>Risiko (ISO 31000 dan Cobit 5 for risk)</FormLabel>
                  <Popover open={impactAreaOpen} onOpenChange={setImpactAreaOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" disabled={!selectedRiskEvent || availableImpactAreas.length === 0} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                          {field.value ? availableImpactAreas.find((area) => area === field.value) : "Pilih risiko..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari risiko..." />
                        <CommandEmpty>Risiko tidak ditemukan.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {availableImpactAreas.map((area) => (
                              <CommandItem key={area} value={area} onSelect={() => { form.setValue("impactArea", area); setImpactAreaOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", area === field.value ? "opacity-100" : "opacity-0")} />
                                {area}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="h-5 mt-1.5">
                    {isSentimentLoading ? (<div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Menganalisis...</span></div>) : 
                     riskSentiment === 'Positif' ? (<div className="flex items-center gap-2 text-sm text-green-600"><TrendingUp className="h-4 w-4" /><span>Risiko ini bersifat Positif (Peluang)</span></div>) : 
                     riskSentiment === 'Negatif' ? (<div className="flex items-center gap-2 text-sm text-red-600"><TrendingDown className="h-4 w-4" /><span>Risiko ini bersifat Negatif (Ancaman)</span></div>) : null}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Impact Area and Date */}
             <FormField control={form.control} name="areaDampak" render={({ field }) => (<FormItem><FormLabel>Area Dampak</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih area dampak" /></SelectTrigger></FormControl><SelectContent>{AREA_DAMPAK_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Waktu Kejadian</FormLabel>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={(date) => { if (date) { field.onChange(date); setDatePickerOpen(false); }}} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Cause and Impact with AI */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="cause" render={({ field }) => (<FormItem><FormLabel>Penyebab</FormLabel><FormControl><Textarea placeholder="Jelaskan penyebab kejadian risiko..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="impact" render={({ field }) => (<FormItem><div className='flex items-center justify-between'><FormLabel>Dampak</FormLabel><Button type="button" variant="ghost" size="sm" onClick={handleCauseImpactSuggestion} disabled={isAiCauseImpactLoading || !form.getValues('riskEvent') || !form.getValues('impactArea') || !form.getValues('areaDampak')} className="h-auto px-2 py-1 text-xs -translate-y-1"><Sparkles className="mr-1 h-3 w-3" />Beri Saran (AI)</Button></div><FormControl><Textarea placeholder="Jelaskan potensi dampaknya..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            {/* Frequency and Magnitude */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>Frekuensi Kejadian</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih frekuensi" /></SelectTrigger></FormControl><SelectContent>{FREQUENCY_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="impactMagnitude" render={({ field }) => (<FormItem><FormLabel>Besaran Dampak</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih besaran dampak" /></SelectTrigger></FormControl><SelectContent>{IMPACT_MAGNITUDES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            {/* Risk Indicator */}
            <div className="space-y-2 rounded-lg border p-4">
                <FormLabel>Analisis Risiko</FormLabel>
                <div className='pt-2'>{riskIndicator.level ? (<Badge className={cn("text-base", riskIndicator.color)}>{riskIndicator.level}</Badge>) : (<p className="text-sm text-muted-foreground">Indikator Risiko Anda Akan Keluar Disini</p>)}</div>
            </div>
            {/* Controls Section */}
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                  <FormLabel>Kendali Sesuai ISO 27001</FormLabel>
                   <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSortControls}
                        disabled={isAiControlsLoading}
                        className="h-auto px-2 py-1 text-xs"
                    >
                        {isAiControlsLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCw className="mr-1 h-3 w-3" />}
                        {isAiControlsLoading ? 'Menyortir...' : 'Sortir Pilihan dengan AI'}
                    </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <FormField control={form.control} name="kontrolOrganisasi" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Kontrol Organisasi</FormLabel><Popover open={kontrolOrganisasiOpen} onOpenChange={setKontrolOrganisasiOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : "Pilih kontrol organisasi..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Cari kontrol..." /><CommandEmpty>Kontrol tidak ditemukan.</CommandEmpty><CommandList><CommandGroup>{sortedOrganizational.map((item) => (<CommandItem key={item} value={item} onSelect={() => { const value = field.value || []; const newValue = value.includes(item) ? value.filter((i) => i !== item) : [...value, item]; form.setValue("kontrolOrganisasi", newValue);}}><Check className={cn("mr-2 h-4 w-4", field.value?.includes(item) ? "opacity-100" : "opacity-0")} />{item}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="kontrolOrang" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Kontrol Orang</FormLabel><Popover open={kontrolOrangOpen} onOpenChange={setKontrolOrangOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : "Pilih kontrol orang..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Cari kontrol..." /><CommandEmpty>Kontrol tidak ditemukan.</CommandEmpty><CommandList><CommandGroup>{sortedPeople.map((item) => (<CommandItem key={item} value={item} onSelect={() => { const value = field.value || []; const newValue = value.includes(item) ? value.filter((i) => i !== item) : [...value, item]; form.setValue("kontrolOrang", newValue);}}><Check className={cn("mr-2 h-4 w-4", field.value?.includes(item) ? "opacity-100" : "opacity-0")} />{item}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="kontrolFisik" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Kontrol Fisik</FormLabel><Popover open={kontrolFisikOpen} onOpenChange={setKontrolFisikOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : "Pilih kontrol fisik..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Cari kontrol..." /><CommandEmpty>Kontrol tidak ditemukan.</CommandEmpty><CommandList><CommandGroup>{sortedPhysical.map((item) => (<CommandItem key={item} value={item} onSelect={() => { const value = field.value || []; const newValue = value.includes(item) ? value.filter((i) => i !== item) : [...value, item]; form.setValue("kontrolFisik", newValue);}}><Check className={cn("mr-2 h-4 w-4", field.value?.includes(item) ? "opacity-100" : "opacity-0")} />{item}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                 <FormField control={form.control} name="kontrolTeknologi" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Kontrol Teknologi</FormLabel><Popover open={kontrolTeknologiOpen} onOpenChange={setKontrolTeknologiOpen}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>{field.value && field.value.length > 0 ? `${field.value.length} terpilih` : "Pilih kontrol teknologi..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Cari kontrol..." /><CommandEmpty>Kontrol tidak ditemukan.</CommandEmpty><CommandList><CommandGroup>{sortedTechnological.map((item) => (<CommandItem key={item} value={item} onSelect={() => { const value = field.value || []; const newValue = value.includes(item) ? value.filter((i) => i !== item) : [...value, item]; form.setValue("kontrolTeknologi", newValue);}}><Check className={cn("mr-2 h-4 w-4", field.value?.includes(item) ? "opacity-100" : "opacity-0")} />{item}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
              </div>
            </div>
             <FormField
                control={form.control}
                name="mitigasi"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mitigasi</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih mitigasi" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <TooltipProvider>
                            {MITIGATION_OPTIONS.map((option) => (
                            <Tooltip key={option.name} delayDuration={300}>
                                <TooltipTrigger asChild>
                                <SelectItem value={option.name} className="w-full">
                                    <div className="flex items-center justify-between w-full">
                                    <span>{option.name}</span>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </SelectItem>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="start">
                                <p className="max-w-xs">{option.description}</p>
                                </TooltipContent>
                            </Tooltip>
                            ))}
                        </TooltipProvider>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim Survei'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
