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
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isFirebaseConfigured, db } from '@/lib/firebase';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getDoc, doc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' }),
});

interface LoginPageClientProps {
  isAdminLogin: boolean;
}

export function LoginPageClient({ isAdminLogin }: LoginPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!isFirebaseConfigured || !auth || !db) {
        toast({
            variant: 'destructive',
            title: 'Firebase Not Configured',
            description: 'Please check your .env file to configure Firebase.',
        });
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast({
          variant: 'destructive',
          title: 'Verification Required',
          description: 'Please verify your email address before logging in. Check your inbox for a verification link.',
        });
        await auth.signOut();
        setIsLoading(false);
        return;
      }
      
      router.push('/dashboard');

    } catch (error: any) {
      let description = 'An unknown error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password. Please try again.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={130} height={130} />
          <h1 className="text-2xl font-bold mt-4">{isAdminLogin ? 'Admin Login' : 'Selamat Datang!'}</h1>
          <p className="text-muted-foreground">
            {isAdminLogin ? 'Silakan masuk untuk melanjutkan ke dasbor admin.' : 'Silakan masuk untuk melanjutkan ke dasbor Manajemen Risiko.'}
          </p>
        </div>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </FormProvider>
        <p className="text-center text-sm text-muted-foreground">
            {isAdminLogin ? (
                <span>Bukan admin? <Link href="/" className="font-medium text-primary hover:underline">Login sebagai user</Link></span>
            ) : (
                <>
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-primary hover:underline">
                    Register
                </Link>
                </>
            )}
        </p>
      </div>
    </div>
  );
}
