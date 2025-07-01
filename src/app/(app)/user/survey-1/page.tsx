'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
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
    IMPACT_AREAS,
    RISK_EVENTS,
    FREQUENCY_LEVELS,
    IMPACT_MAGNITUDES
} from '@/constants/data';
import { addSurvey } from '@/services/survey-service';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

const formSchema = z.object({
  riskEvent: z.string({ required_error: 'Please select a risk event.' }),
  impactArea: z.string({ required_error: 'Please select an impact area.' }),
  cause: z.string().min(10, { message: 'Cause must be at least 10 characters.' }),
  impact: z.string().min(10, { message: 'Impact must be at least 10 characters.' }),
  frequency: z.string({ required_error: 'Please select a frequency level.' }),
  impactMagnitude: z.string({ required_error: 'Please select an impact magnitude.' }),
});

export default function Survey1Page() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cause: '',
      impact: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a survey.' });
        return;
    }
    setIsLoading(true);
    try {
        await addSurvey({ ...values, surveyType: 1, userId: user.uid, userRole: userProfile.role });
        toast({ title: 'Success', description: 'Survey 1 submitted successfully.' });
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
        <CardTitle>Input Survey 1</CardTitle>
        <CardDescription>Please fill out the risk assessment form below with predefined risk events.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="riskEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kejadian Risiko TIK</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a risk event" /></SelectTrigger></FormControl>
                    <SelectContent>{RISK_EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Survey'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
