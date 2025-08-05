
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ForgotPasswordDialog } from './forgot-password-dialog';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

interface LoginPageClientProps {
  isAdminLogin: boolean;
}

export function LoginPageClient({ isAdminLogin }: LoginPageClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          description:
            'Please verify your email address before logging in. Check your inbox for a verification link.',
        });
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (error: any) {
      let description = 'An unknown error occurred.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
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

  const pageTitle = isAdminLogin ? 'Admin Login' : 'Selamat Datang!';
  const pageDescription = isAdminLogin
    ? 'Silakan masuk untuk melanjutkan ke dasbor admin.'
    : 'Silakan masuk untuk melanjutkan ke dasbor Manajemen Risiko.';
  const registerLink = isAdminLogin ? '/admuinma/register' : '/register';
  const registerText = isAdminLogin ? 'Daftar disini' : 'Register';
  const registerPrompt = isAdminLogin
    ? 'Belum punya akun admin?'
    : 'Belum punya akun?';

  return (
    <>
      <ForgotPasswordDialog
        isOpen={isForgotPasswordOpen}
        onOpenChange={setIsForgotPasswordOpen}
      />
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
              <Image
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png"
                alt="Logo"
                width={130}
                height={130}
                className="mx-auto"
              />
              <CardTitle className="text-2xl font-bold mt-4">
                {pageTitle}
              </CardTitle>
              <CardDescription>{pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name123@example.com"
                            {...field}
                          />
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
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute inset-y-0 right-0 h-full px-3"
                              onClick={() =>
                                setShowPassword(!showPassword)
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {showPassword
                                  ? 'Hide password'
                                  : 'Show password'}
                              </span>
                            </Button>
                          </div>
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
              <div className="mt-4 text-center text-sm">
                <Button
                  variant="link"
                  type="button"
                  className="px-0 font-medium text-primary hover:underline"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  Lupa password?
                </Button>
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {registerPrompt}{' '}
                <Link
                  href={registerLink}
                  className="font-medium text-primary hover:underline"
                >
                  {registerText}
                </Link>
              </p>
            </CardContent>
          </Card>
      </div>
    </>
  );
}
