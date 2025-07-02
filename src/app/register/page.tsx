'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { useState } from 'react';
import { isRoleTaken } from '@/services/user-service';
import { ROLES } from '@/constants/data';

const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.string({ required_error: 'Please select a role.' }).min(1, {message: "Please select a role."}),
});


export default function RegisterPage() {
  const availableRoles = ROLES;
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
        return;
      }
      
      const roleIsAlreadyTaken = await isRoleTaken(values.role);
      if (roleIsAlreadyTaken) {
          toast({
              variant: 'destructive',
              title: 'Peran Tidak Tersedia',
              description: `Peran '${values.role}' sudah dipilih orang lain. Silakan pilih peran yang berbeda.`,
          });
          form.setValue('role', '', { shouldValidate: true });
          return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      const batch = writeBatch(db);

      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      });

      const roleRef = doc(db, 'roles', values.role);
      batch.set(roleRef, { uid: user.uid });

      await batch.commit();

      toast({
        title: 'Registration Successful',
        description: 'Redirecting to your dashboard...',
      });
      
      router.push('/');
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
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Icons.Logo className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold mt-4">Create an Account</h1>
          <p className="text-muted-foreground">
            Fill in the details below to join Risk Navigator.
          </p>
        </div>

        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your role/department" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableRoles.length > 0 ? (
                            availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                                {role}
                            </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-roles" disabled>
                            No available roles
                            </SelectItem>
                        )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || availableRoles.length === 0}>
                {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
            </form>
        </FormProvider>
        
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
