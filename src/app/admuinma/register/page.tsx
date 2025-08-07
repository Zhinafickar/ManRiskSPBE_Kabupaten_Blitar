
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import Image from 'next/image';
import { TokenVerification } from '../_components/token-verification';
import { useAdminVerification } from '../_components/admin-verification-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getAllUsers } from '@/services/user-service';
import { ADMIN_ROLES } from '@/constants/admin-data';
import { Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.string({ required_error: 'Please select an admin role.' }).min(1, {message: "Please select an admin role."}),
});

function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableAdminRoles, setAvailableAdminRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function checkSuperAdminAndSetRoles() {
      setRolesLoading(true);
      try {
        const users = await getAllUsers();
        const aSuperAdminExists = users.some(u => u.role === 'superadmin');
        
        const roles = aSuperAdminExists
          ? ADMIN_ROLES.filter(role => role !== 'superadmin')
          : ADMIN_ROLES;
        
        setAvailableAdminRoles(roles);
      } catch (error) {
          console.error("Failed to fetch users for role check:", error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Gagal memuat peran yang tersedia. Silakan coba lagi.'
          });
          // Fallback to only allowing 'admin' role if check fails
          setAvailableAdminRoles(['admin']);
      } finally {
        setRolesLoading(false);
      }
    }
    checkSuperAdminAndSetRoles();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        toast({
          variant: 'destructive',
          title: 'Firebase Not Configured',
          description: 'Please add your Firebase credentials to the .env file to enable registration.',
        });
        setIsLoading(false);
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        phoneNumber: '', // Initialize phone number for admins
      });

      await signOut(auth);

      toast({
        title: 'Admin Registration Successful',
        description: 'Please check your email to verify your account before logging in.',
      });
      
      router.push('/admuinma/login');
    } catch (error: any) {
      let description = 'An unknown error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use by another account.';
      } else {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: description,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={130} height={130} className="mx-auto" />
            <CardTitle className="text-2xl font-bold mt-4">Create Admin Account</CardTitle>
            <CardDescription>
                This form is for admin registration only.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Admin Name" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
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
                                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute inset-y-0 right-0 h-full px-3"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                                </Button>
                            </div>
                          </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Admin Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={rolesLoading}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select admin role"} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {availableAdminRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading || rolesLoading}>
                    {isLoading ? 'Creating account...' : 'Create Admin Account'}
                    </Button>
                </form>
            </FormProvider>
            <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an admin account?{' '}
            <Link href="/admuinma/login" className="font-medium text-primary hover:underline">
                Login here
            </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminRegisterPage() {
  const { isVerified, setIsVerified } = useAdminVerification();
  const [isCheckingRoles, setIsCheckingRoles] = useState(true);

  useEffect(() => {
    async function checkSuperAdmin() {
        if (isVerified) {
            setIsCheckingRoles(false);
            return;
        }

        try {
            const users = await getAllUsers();
            const superAdminExists = users.some(u => u.role === 'superadmin');
            if (!superAdminExists) {
                setIsVerified(true);
            }
        } catch (error) {
            console.error("Failed to check for superadmin:", error);
        } finally {
            setIsCheckingRoles(false);
        }
    }
    checkSuperAdmin();
  }, [isVerified, setIsVerified]);

  if (isCheckingRoles) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                  </div>
              </div>
          </div>
      );
  }

  if (!isVerified) {
    return <TokenVerification />;
  }

  return <RegisterForm />;
}
