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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/user';
import { useEffect, useState } from 'react';
import { updateUserData } from '@/services/user-service';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  uid: z.string(),
  fullName: z.string().min(1, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phoneNumber: z.string().optional(),
  role: z.string({ required_error: 'Please select a role.' }),
});

interface UserFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: UserProfile | null;
  allRoles: string[];
}

export function UserForm({ isOpen, setIsOpen, user, allRoles }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      role: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        ...user,
        phoneNumber: user.phoneNumber || '',
      });
    } else {
      form.reset({
        uid: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        role: '',
      });
    }
  }, [user, isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    // Note: Add user is not implemented as it requires Admin SDK for passwordless creation.
    // This form only handles updates.
    if (!values.uid) {
        toast({ variant: 'destructive', title: 'Error', description: 'Adding new users via this form is not supported. Please update an existing user.' });
        setIsLoading(false);
        return;
    }

    const result = await updateUserData(values);

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      router.refresh(); // This will re-run the server component's fetch logic on the page
      setIsOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {user ? 'Update the user details below.' : 'To add a new user, they must first register through the public registration page. You can then edit their role and details here.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="name@example.com" {...field} disabled /></FormControl>
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
                  <FormControl><Input placeholder="e.g. 081234567890" {...field} type="tel" /></FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {allRoles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading || !user}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
