
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import type { UserProfile } from '@/types/user';
import { Building, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DepartmentDetailsDialog } from './_components/department-details-dialog';

function OPDTableSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export default function OPDPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    useEffect(() => {
        getAllUsers()
            .then(setUsers)
            .finally(() => setLoading(false));
    }, []);

    const filteredDepartments = useMemo(() => {
        const assignedRoles = new Set(users.map(user => user.role));
        
        const allDepartments = ROLES
            .filter(role => role !== 'Penguji Coba')
            .map(role => ({
                name: role,
                isTaken: assignedRoles.has(role)
            })).sort((a, b) => a.name.localeCompare(b.name));

        if (!searchTerm) {
            return allDepartments;
        }

        return allDepartments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [users, searchTerm]);
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-6 w-6" />
                        Daftar Organisasi Perangkat Daerah (OPD)
                    </CardTitle>
                    <CardDescription>
                        Berikut adalah daftar semua Organisasi Perangkat Daerah (OPD) yang tersedia dalam sistem beserta status keterisiannya.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <OPDTableSkeleton />
                    ) : (
                        <>
                            <div className="relative mb-4">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari nama OPD..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <ScrollArea className="h-[350px] rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="sticky top-0 z-10 bg-primary hover:bg-primary/90 border-b-primary/20">
                                            <TableHead className="text-primary-foreground">Nama OPD</TableHead>
                                            <TableHead className="text-right text-primary-foreground">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDepartments.length > 0 ? (
                                            filteredDepartments.map(dept => (
                                                <TableRow key={dept.name}>
                                                    <TableCell className="font-medium">
                                                        <Button 
                                                            variant="link" 
                                                            className="p-0 h-auto text-left whitespace-normal"
                                                            onClick={() => setSelectedDepartment(dept.name)}
                                                            disabled={!dept.isTaken}
                                                        >
                                                            {dept.name}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {dept.isTaken ? (
                                                            <Badge variant="secondary" className="border-green-300 text-green-800">Terisi</Badge>
                                                        ) : (
                                                            <Badge variant="outline">Kosong</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                    Tidak ada OPD yang cocok dengan pencarian Anda.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </>
                    )}
                </CardContent>
            </Card>
            <DepartmentDetailsDialog 
                departmentName={selectedDepartment}
                isOpen={!!selectedDepartment}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedDepartment(null);
                    }
                }}
            />
        </>
    );
}
