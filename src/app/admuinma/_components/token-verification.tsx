
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminVerification } from '../_components/admin-verification-context';
import { verifyAdminTokenAction } from '../actions';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama harus diisi.' }),
  token: z.string().min(1, { message: 'Token harus diisi.' }),
});

export function TokenVerification() {
  const { setIsVerified, setAvailableRoles } = useAdminVerification();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', token: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        const result = await verifyAdminTokenAction(values.name, values.token);
        
        if (result.success) {
            toast({
                title: 'Verifikasi Berhasil',
                description: 'Silakan lanjutkan ke otentikasi admin.',
            });
            setAvailableRoles(result.availableRoles);
            setIsVerified(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Verifikasi Gagal',
                description: result.message,
            });
        }
    } catch (error) {
        console.error("Error during verification process:", error);
        toast({
            variant: 'destructive',
            title: 'Verifikasi Gagal',
            description: "Terjadi kesalahan pada server saat verifikasi.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
     <div className="flex min-h-screen items-center justify-center bg-red-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-background p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
            <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={100} height={100} />
            <h1 className="text-2xl font-bold mt-4">Verifikasi Akses Admin</h1>
            <p className="text-muted-foreground">
                Masukkan nama dan token yang diberikan oleh Superadmin untuk melanjutkan.
            </p>
        </div>
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nama Orang Dalam</FormLabel>
                        <FormControl>
                            <Input placeholder="Nama Lengkap Admin" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Token Akses</FormLabel>
                        <FormControl>
                            <Input placeholder="Masukkan token..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Memverifikasi...</> : 'Verifikasi'}
                </Button>
            </form>
        </FormProvider>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            Kembali ke login user
          </Link>
        </p>
      </div>
    </div>
  );
}
