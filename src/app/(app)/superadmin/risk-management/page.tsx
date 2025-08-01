
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import React, { useEffect, useState } from 'react';
import { Wrench, PlusCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { addRisk, getRiskEvents } from '@/services/risk-service';
import type { RiskEvent } from '@/types/risk';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  category: z.string().min(1, 'Kategori harus diisi.'),
  risk: z.string().min(1, 'Risiko spesifik harus diisi.'),
  isNewCategory: z.boolean().default(false),
});

function RiskTable({ riskEvents, loading }: { riskEvents: RiskEvent[], loading: boolean }) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b-primary/20 bg-primary hover:bg-primary/90">
                    <TableHead className="text-primary-foreground">Kategori Risiko</TableHead>
                    <TableHead className="w-[150px] text-right text-primary-foreground">Jumlah Risiko</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {riskEvents.map(event => (
                    <React.Fragment key={event.name}>
                        <TableRow onClick={() => toggleCategory(event.name)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium flex items-center gap-2">
                                {expandedCategories.has(event.name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {event.name}
                            </TableCell>
                            <TableCell className="text-right">{event.impactAreas.length}</TableCell>
                        </TableRow>
                        {expandedCategories.has(event.name) && (
                             <TableRow>
                                <TableCell colSpan={2} className="p-0">
                                    <div className="p-4 bg-muted/30">
                                        <ul className="list-disc pl-8 space-y-1 text-sm">
                                            {event.impactAreas.map(area => <li key={area}>{area}</li>)}
                                        </ul>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </React.Fragment>
                ))}
            </TableBody>
        </Table>
    );
}

export default function RiskManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRiskEvents()
      .then(setRiskEvents)
      .finally(() => setLoading(false));
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        category: '',
        risk: '',
        isNewCategory: true,
    },
  });

  const isNewCategory = form.watch('isNewCategory');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        await addRisk(values.category, values.risk);
        toast({ title: 'Sukses', description: 'Data risiko berhasil disimpan.' });
        // Refresh data
        getRiskEvents().then(setRiskEvents);
        form.reset({
            category: '',
            risk: '',
            isNewCategory: values.isNewCategory // keep the toggle state
        });
        router.refresh();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Gagal menyimpan data.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wrench className="h-6 w-6"/> Manajemen Risiko</CardTitle>
                <CardDescription>Lihat, tambah, atau kelola Kategori Risiko dan Risiko spesifik di dalam sistem.</CardDescription>
            </CardHeader>
            <CardContent>
                <RiskTable riskEvents={riskEvents} loading={loading} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Tambah Data Risiko Baru</CardTitle>
                <CardDescription>Gunakan formulir ini untuk menambahkan kategori baru atau risiko baru ke kategori yang sudah ada.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Button type="button" variant={isNewCategory ? 'default' : 'outline'} onClick={() => form.setValue('isNewCategory', true)}>Tambah Kategori Baru</Button>
                            <Button type="button" variant={!isNewCategory ? 'default' : 'outline'} onClick={() => form.setValue('isNewCategory', false)}>Tambah Risiko ke Kategori Lama</Button>
                        </div>
                        
                        {isNewCategory ? (
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nama Kategori Risiko Baru</FormLabel>
                                    <FormControl><Input placeholder="Contoh: Keamanan Jaringan" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Pilih Kategori Risiko</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori yang sudah ada" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {riskEvents.map(event => <SelectItem key={event.name} value={event.name}>{event.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        
                        <FormField
                            control={form.control}
                            name="risk"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nama Risiko Spesifik Baru</FormLabel>
                                <FormControl><Input placeholder="Contoh: Serangan DDoS pada server utama" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    </div>
  );
}
