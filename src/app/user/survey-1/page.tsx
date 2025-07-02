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
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  riskEvent: z.string({ required_error: 'Please select a risk event.' }).min(1, { message: 'Risk event is required.' }),
  impactArea: z.string({ required_error: 'Please select an impact area.' }).min(1, { message: 'Impact area is required.' }),
  cause: z.string().min(10, { message: 'Cause must be at least 10 characters.' }),
  impact: z.string().min(10, { message: 'Impact must be at least 10 characters.' }),
  frequency: z.string({ required_error: 'Please select a frequency.' }),
  impactMagnitude: z.string({ required_error: 'Please select an impact magnitude.' }),
});

export default function Survey1Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [availableImpactAreas, setAvailableImpactAreas] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskEvent: '',
      impactArea: '',
      cause: '',
      impact: '',
      frequency: '',
      impactMagnitude: '',
    },
  });

  const selectedRiskEvent = form.watch('riskEvent');

  useEffect(() => {
    const riskEventObject = RISK_EVENTS.find(event => event.name === selectedRiskEvent);
    if (riskEventObject) {
      setAvailableImpactAreas(riskEventObject.impactAreas);
    } else {
      setAvailableImpactAreas([]);
    }
    form.setValue('impactArea', '');
  }, [selectedRiskEvent, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a survey.' });
        return;
    }
    setIsLoading(true);
    try {
        await addSurvey({ ...values, surveyType: 1, userId: user.uid, userRole: userProfile.role });
        toast({ title: 'Success', description: 'Survey submitted successfully.' });
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
        <CardTitle>Input Risk Event</CardTitle>
        <CardDescription>Fill out the risk assessment form below. Select a risk event to see the relevant impact areas.</CardDescription>
      </CardHeader>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="riskEvent"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>ICT Risk Event</FormLabel>
                   <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? RISK_EVENTS.find(event => event.name === field.value)?.name
                            : "Select a risk event..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search risk events..." />
                        <CommandEmpty>No risk event found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {RISK_EVENTS.map((event) => (
                              <CommandItem
                                key={event.name}
                                value={event.name}
                                onSelect={() => {
                                  form.setValue("riskEvent", event.name);
                                  setOpen(false);
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
                <FormItem>
                  <FormLabel>Impact Area</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedRiskEvent || availableImpactAreas.length === 0}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Select an impact area" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {availableImpactAreas.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cause</FormLabel>
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
                  <FormLabel>Impact</FormLabel>
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
                    <FormLabel>Event Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormLabel>Impact Magnitude</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select impact magnitude" /></SelectTrigger></FormControl>
                        <SelectContent>{IMPACT_MAGNITUDES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
