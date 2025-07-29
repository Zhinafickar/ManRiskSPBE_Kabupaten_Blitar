

'use client';

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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { ROLES } from '@/constants/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Eye, EyeOff } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getAssignedRoles } from '@/services/user-service';
import { ADMIN_ROLES } from '@/constants/admin-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.string({ required_error: 'Please select a role.' }).min(1, {message: "Please select a role."}),
});

export default function RegisterPageContent() {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function fetchAvailableRoles() {
      const assignedRoles = await getAssignedRoles();
      // Filter out admin roles and roles that are already taken
      const unassignedRoles = ROLES.filter(role => 
        !ADMIN_ROLES.includes(role) && (!assignedRoles.includes(role) || role === 'Penguji Coba')
      );
      setAvailableRoles(unassignedRoles);
    }
    fetchAvailableRoles();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
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

      const batch = writeBatch(db);
      
      const userRole = values.role;

      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: userRole,
      });

      // Only set a lock for non-admin, non-test-user roles
      if (!ADMIN_ROLES.includes(userRole) && userRole !== 'Penguji Coba') {
        const roleRef = doc(db, 'roles', userRole);
        batch.set(roleRef, { uid: user.uid, createdAt: new Date() });
      }

      await batch.commit();

      await signOut(auth);

      toast({
        title: 'Registration Successful',
        description: 'Silakan periksa email Anda untuk memverifikasi akun Anda sebelum masuk.',
      });
      
      router.push('/');
    } catch (error: any) {
      let description = 'An unknown error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email address is already in use by another account.';
      } else if (error.code === 'permission-denied') {
        description = "Registration failed due to a database permission error. Please check Firestore rules.";
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <Image src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjm96r3FWka5963AzMK6SrYozoB5UTcMNGM2yUF7Isid0BsVcecBHk6lhVBGouTkSfBFuNPW-jPyWW_k2umwKI6sN3frHLk7g1Nd_Ubi0qz_a0G6svusKAmc3hy0-up0RPZGrk-MYnrl5g/s1600/kabupaten-blitar-vector-logo-idngrafis.png" alt="Logo" width={130} height={130} className="mx-auto" />
            <CardTitle className="text-2xl font-bold mt-4">Create an Account</CardTitle>
            <CardDescription>
                Fill in the details below to join. Please use a real email to receive a verification link.
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
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 081234567890" {...field} type="tel" />
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
                        <FormItem className="flex flex-col">
                        <FormLabel>Organisasi Perangkat Daerah (OPD)</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                >
                                {field.value
                                    ? availableRoles.find(role => role === field.value)
                                    : "Select your OPD"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search role..." />
                                <CommandEmpty>No available roles found.</CommandEmpty>
                                <CommandList>
                                <CommandGroup>
                                    {availableRoles.map((role) => (
                                    <CommandItem
                                        key={role}
                                        value={role}
                                        onSelect={() => {
                                        form.setValue("role", role);
                                        setOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", role === field.value ? "opacity-100" : "opacity-0")} />
                                        {role}
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
                    <Button type="submit" className="w-full" disabled={isLoading || availableRoles.length === 0}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>
            </FormProvider>
            <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-primary hover:underline">
                Login
            </Link>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
