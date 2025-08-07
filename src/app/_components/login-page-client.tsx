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
      <div
        className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://www.blitarkab.go.id/wp-content/uploads/2017/02/pendopo-kanigoro.jpg')",
        }}
      >
        <Card className="w-full max-w-md shadow-xl border border-white/30 bg-white bg-opacity-95 backdrop-blur-md rounded-xl">
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
                        <Input placeholder="name123@example.com" {...field} />
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
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? 'Hide password' : 'Show password'}
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

        {/* Credit Section */}
        <div className="mt-4 flex items-center justify-center gap-3 text-white">
          <span className="text-sm font-medium">Collaboration</span>
          <Image
            src="https://diskominfo.penajamkab.go.id/wp-content/uploads/2020/02/logo-kominfo.png"
            alt="Logo 1"
            width={40}
            height={40}
          />
          <span className="text-sm font-medium">&</span>
          <Image
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/35574985-86cb-4a95-8103-3e4d240fb5be/dg0hbf8-1f3be10c-c786-4261-adb9-d05a4200cfa0.png/v1/fill/w_1280,h_1393/logo_uin_malang_terbaru_ulul_albab_by_sahlannags_dg0hbf8-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTM5MyIsInBhdGgiOiJcL2ZcLzM1NTc0OTg1LTg2Y2ItNGE5NS04MTAzLTNlNGQyNDBmYjViZVwvZGcwaGJmOC0xZjNiZTEwYy1jNzg2LTQyNjEtYWRiOS1kMDVhNDIwMGNmYTAucG5nIiwid2lkdGgiOiI8PTEyODAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.5iC6ylWFkZqNrml8RCCjDT-HgerS03lWlt7FYqQQz1E"
            alt="Logo 2"
            width={40}
            height={40}
          />
        </div>
      </div>
    </>
  );
}
