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
import { Wrench, FileText, ClipboardCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES } from '@/constants/data';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { addFictitiousData } from '@/services/dev-service';
import type { Survey } from '@/types/survey';
import type { ContinuityPlan } from '@/types/continuity';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  role: z.string({ required_error: 'Role is required.' }),
  surveyCount: z.coerce.number().min(1, "Minimal 1 survei.").max(10, "Maksimal 10 survei."),
  planCount: z.coerce.number().min(0, "Minimal 0 rencana.").max(10, "Maksimal 10 rencana."),
});

type GeneratedData = {
    surveys: Survey[];
    continuityPlans: ContinuityPlan[];
}

export default function DevOtPage() {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: '',
            surveyCount: 3,
            planCount: 2,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setGeneratedData(null);
        toast({ title: "Membuat Data Fiktif...", description: "AI sedang bekerja. Ini mungkin memakan waktu beberapa saat." });

        try {
            const result = await addFictitiousData(values);
            if (result.success) {
                toast({ title: "Sukses!", description: `Data fiktif untuk ${values.role} berhasil dibuat.` });
                setGeneratedData({
                    surveys: result.surveys,
                    continuityPlans: result.continuityPlans,
                });
            } else {
                 toast({ variant: 'destructive', title: 'Gagal', description: result.message });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan saat membuat data.' });
        } finally {
            setIsLoading(false);
        }
    }
    
    // Lock page for non-superadmins
    if (userProfile?.role !== 'superadmin') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6" />
                        Akses Ditolak
                    </CardTitle>
                    <CardDescription>
                       Halaman ini hanya dapat diakses oleh Super Admin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground text-center">
                            Anda tidak memiliki izin untuk melihat halaman ini.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-6 w-6" />
                    Generator Data Fiktif (Dev Only)
                    </CardTitle>
                    <CardDescription>
                    Fitur ini memungkinkan Super Admin membuat data survei dan kontinuitas fiktif untuk tujuan demonstrasi atau pengujian. Data yang dihasilkan akan ditandai sebagai 'fiktif' dan tidak akan memengaruhi laporan produksi.
                    </CardDescription>
                </CardHeader>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Pilih OPD</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih OPD untuk dibuatkan data..." />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="surveyCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jumlah Survei</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="planCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jumlah Rencana</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Membuat Data...' : 'Buat Data Contoh'}
                            </Button>
                        </CardFooter>
                    </form>
                </FormProvider>
            </Card>
            
            {generatedData && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText/>Hasil Survei Fiktif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] border rounded-md">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Kategori Risiko</TableHead><TableHead>Risiko</TableHead><TableHead>Tingkat</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {generatedData.surveys.map(s => <TableRow key={s.id}><TableCell>{s.riskEvent}</TableCell><TableCell>{s.impactArea}</TableCell><TableCell>{s.riskLevel}</TableCell></TableRow>)}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ClipboardCheck/>Hasil Rencana Kontinuitas Fiktif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px] border rounded-md">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Risiko</TableHead><TableHead>Aktivitas</TableHead><TableHead>PIC</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {generatedData.continuityPlans.map(p => <TableRow key={p.id}><TableCell>{p.risiko}</TableCell><TableCell className="truncate max-w-xs">{p.aktivitas}</TableCell><TableCell>{p.pic}</TableCell></TableRow>)}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
