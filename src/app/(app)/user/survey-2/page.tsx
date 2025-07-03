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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
    IMPACT_AREAS,
    FREQUENCY_LEVELS,
    IMPACT_MAGNITUDES
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getRiskLevel, type RiskIndicator } from '@/lib/risk-matrix';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  riskEvent: z.string().min(5, { message: 'Risk event must be at least 5 characters.' }),
  impactArea: z.string({ required_error: 'Please select an impact area.' }),
  eventDate: z.date({ required_error: 'Waktu kejadian harus diisi.' }),
  cause: z.string().min(10, { message: 'Cause must be at least 10 characters.' }),
  impact: z.string().min(10, { message: 'Impact must be at least 10 characters.' }),
  frequency: z.string({ required_error: 'Please select a frequency level.' }),
  impactMagnitude: z.string({ required_error: 'Please select an impact magnitude.' }),
  kontrolOrganisasi: z.string().optional(),
  kontrolOrang: z.string().optional(),
  kontrolFisik: z.string().optional(),
  kontrolTeknologi: z.string().optional(),
});

export default function Survey2Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [riskIndicator, setRiskIndicator] = useState<RiskIndicator>({ level: null, color: '' });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskEvent: '',
      eventDate: undefined,
      cause: '',
      impact: '',
      kontrolOrganisasi: '',
      kontrolOrang: '',
      kontrolFisik: '',
      kontrolTeknologi: '',
    },
  });

  const frequency = form.watch('frequency');
  const impactMagnitude = form.watch('impactMagnitude');

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
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a survey.' });
        return;
    }
    setIsLoading(true);
    const indicator = getRiskLevel(values.frequency, values.impactMagnitude);
    try {
        await addSurvey({ ...values, surveyType: 2, userId: user.uid, userRole: userProfile.role, riskLevel: indicator.level ?? undefined });
        toast({ title: 'Success', description: 'Survey 2 submitted successfully.' });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit survey.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Survey 2</CardTitle>
        <CardDescription>Please fill out the risk assessment form below. You can describe the risk event freely.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="riskEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kejadian Risiko TIK</FormLabel>
                  <FormControl><Input placeholder="Describe the risk event..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="impactArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Dampak</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an impact area" /></SelectTrigger></FormControl>
                    <SelectContent>{IMPACT_AREAS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
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
                  <FormControl><Textarea placeholder="Describe the cause of the risk event..." {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="Describe the potential impact..." {...field} /></FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select impact magnitude" /></SelectTrigger></FormControl>
                        <SelectContent>{IMPACT_MAGNITUDES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="space-y-2 rounded-lg border p-4">
                <FormLabel>Indikator Risiko</FormLabel>
                <div className='pt-2'>
                {riskIndicator.level ? (
                    <Badge className={cn("text-base", riskIndicator.color)}>
                    {riskIndicator.level}
                    </Badge>
                ) : (
                    <p className="text-sm text-muted-foreground">Pilih frekuensi dan besaran dampak untuk melihat indikator.</p>
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
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Survey'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
