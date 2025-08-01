
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import React, { useEffect, useState } from 'react';
import { Wrench, ChevronDown, ChevronRight, Loader2, PlusCircle } from 'lucide-react';
import { getRiskEvents, addRiskCategory, addRiskToCategory } from '@/services/risk-service';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function RiskTable({ riskEvents, loading }: { riskEvents: RiskEvent[], loading: boolean }) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
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
                    <React.Fragment key={event.id}>
                        <TableRow onClick={() => toggleCategory(event.id)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium flex items-center gap-2">
                                {expandedCategories.has(event.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                {event.name}
                            </TableCell>
                            <TableCell className="text-right">{event.impactAreas.length}</TableCell>
                        </TableRow>
                        {expandedCategories.has(event.id) && (
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

function AddRiskForm({ riskEvents, onDataAdded }: { riskEvents: RiskEvent[], onDataAdded: () => void }) {
    const { toast } = useToast();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newRiskForNewCategory, setNewRiskForNewCategory] = useState('');
    const [existingCategoryId, setExistingCategoryId] = useState('');
    const [newRiskForExistingCategory, setNewRiskForExistingCategory] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddNewCategory = async () => {
        if (!newCategoryName || !newRiskForNewCategory) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nama kategori dan risiko spesifik harus diisi.' });
            return;
        }
        setIsLoading(true);
        try {
            await addRiskCategory(newCategoryName, newRiskForNewCategory);
            toast({ title: 'Sukses', description: 'Kategori baru berhasil ditambahkan.' });
            setNewCategoryName('');
            setNewRiskForNewCategory('');
            onDataAdded();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal menambahkan kategori baru.' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddRiskToCategory = async () => {
        if (!existingCategoryId || !newRiskForExistingCategory) {
            toast({ variant: 'destructive', title: 'Error', description: 'Kategori dan risiko spesifik harus diisi.' });
            return;
        }
        setIsLoading(true);
        try {
            await addRiskToCategory(existingCategoryId, newRiskForExistingCategory);
            toast({ title: 'Sukses', description: 'Risiko baru berhasil ditambahkan.' });
            setExistingCategoryId('');
            setNewRiskForExistingCategory('');
            onDataAdded();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal menambahkan risiko.' });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Tabs defaultValue="new-category">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="new-category">Tambah Kategori Baru</TabsTrigger>
                <TabsTrigger value="existing-category">Tambah Risiko ke Kategori</TabsTrigger>
            </TabsList>
            <TabsContent value="new-category" className="space-y-4 pt-4">
                 <Input
                    placeholder="Nama Kategori Risiko Baru"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isLoading}
                />
                 <Input
                    placeholder="Nama Risiko Spesifik Pertama"
                    value={newRiskForNewCategory}
                    onChange={(e) => setNewRiskForNewCategory(e.target.value)}
                    disabled={isLoading}
                />
                 <Button onClick={handleAddNewCategory} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Simpan Kategori Baru
                </Button>
            </TabsContent>
            <TabsContent value="existing-category" className="space-y-4 pt-4">
                <Select onValueChange={setExistingCategoryId} value={existingCategoryId} disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori yang ada" />
                    </SelectTrigger>
                    <SelectContent>
                        {riskEvents.map(event => (
                            <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Input
                    placeholder="Nama Risiko Spesifik Baru"
                    value={newRiskForExistingCategory}
                    onChange={(e) => setNewRiskForExistingCategory(e.target.value)}
                    disabled={isLoading}
                />
                 <Button onClick={handleAddRiskToCategory} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Simpan Risiko
                </Button>
            </TabsContent>
        </Tabs>
    )
}

export default function RiskManagementPage() {
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    getRiskEvents()
      .then(setRiskEvents)
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wrench className="h-6 w-6"/> Manajemen Risiko</CardTitle>
                <CardDescription>
                    Halaman ini menampilkan daftar Kategori Risiko dan Risiko spesifik yang ada di sistem. Gunakan formulir di bawah untuk menambahkan data baru.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RiskTable riskEvents={riskEvents} loading={loading} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Tambah Data Risiko Baru</CardTitle>
                <CardDescription>
                    Pilih apakah Anda ingin menambahkan kategori baru atau menambahkan risiko ke kategori yang sudah ada.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddRiskForm riskEvents={riskEvents} onDataAdded={fetchData} />
            </CardContent>
        </Card>
    </div>
  );
}
