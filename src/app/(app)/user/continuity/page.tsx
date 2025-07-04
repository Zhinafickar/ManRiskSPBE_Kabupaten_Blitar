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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Recycle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { addContinuityPlan } from '@/services/continuity-service';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

const formSchema = z.object({
  risiko: z.string().min(1, { message: 'Risiko harus diisi.' }),
  aktivitas: z.string().min(1, { message: 'Aktivitas harus diisi.' }),
  targetWaktu: z.string().min(1, { message: 'Target waktu harus diisi.' }),
  pic: z.string().min(1, { message: 'PIC harus diisi.' }),
  sumberdaya: z.string().min(1, { message: 'Sumberdaya harus diisi.' }),
  rto: z.string().min(1, { message: 'RTO harus diisi.' }),
  rpo: z.string().min(1, { message: 'RPO harus diisi.' }),
});


export default function ContinuityPage({}: {}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      risiko: '',
      aktivitas: '',
      targetWaktu: '',
      pic: '',
      sumberdaya: '',
      rto: '',
      rpo: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Anda harus masuk untuk mengirimkan rencana.' });
        return;
    }
    setIsLoading(true);
    try {
        await addContinuityPlan({ ...values, userId: user.uid });
        toast({ title: 'Sukses', description: 'Rencana kontinuitas berhasil disimpan.' });
        form.reset();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan rencana.' });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-6 w-6" />
          Kontinuitas/Keberlanjutan
        </CardTitle>
        <CardDescription>
          Isi formulir untuk perencanaan keberlanjutan dan kontinuitas layanan.
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
                  <FormControl><Textarea placeholder="Deskripsikan risiko yang dihadapi..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aktivitas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AKTIVITAS</FormLabel>
                  <FormControl><Textarea placeholder="Jelaskan aktivitas pemulihan yang akan dilakukan..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="targetWaktu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TARGET WAKTU</FormLabel>
                    <FormControl><Input placeholder="Contoh: 24 Jam" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIC</FormLabel>
                    <FormControl><Input placeholder="Nama atau departemen penanggung jawab" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sumberdaya"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sumberdaya yang dibutuhkan</FormLabel>
                  <FormControl><Textarea placeholder="Sebutkan semua sumber daya yang diperlukan (manusia, teknis, dll.)..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="rto"
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
                name="rpo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Point Objective (RPO)</FormLabel>
                    <FormControl><Input placeholder="Contoh: Data 1 jam terakhir" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan Rencana'}</Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
