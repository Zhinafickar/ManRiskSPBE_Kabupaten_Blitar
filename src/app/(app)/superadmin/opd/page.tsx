
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import type { UserProfile } from '@/types/user';
import { Building, Search, FileDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DepartmentDetailsDialog } from './_components/department-details-dialog';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/use-auth';

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
    const { userProfile } = useAuth();
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
        
        const allDepartments = ROLES.map(role => ({
            name: role,
            isTaken: assignedRoles.has(role) && role !== 'Penguji Coba'
        })).sort((a, b) => a.name.localeCompare(b.name));

        if (!searchTerm) {
            return allDepartments;
        }

        return allDepartments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [users, searchTerm]);
    
    const handleExport = () => {
        const dataForSheet = filteredDepartments.map(dept => ({
            'OPD': dept.name,
            'Status': dept.isTaken ? 'Terisi' : 'Kosong',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataForSheet);

        ws['!cols'] = [{ wch: 60 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, ws, 'Status OPD');
        XLSX.writeFile(wb, `${userProfile?.role}_Status_OPD.xlsx`);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Daftar OPD/Departemen
                        </CardTitle>
                        <CardDescription>
                            Berikut adalah daftar semua OPD/Departemen yang tersedia dalam sistem beserta status keterisiannya.
                        </CardDescription>
                    </div>
                    <Button onClick={handleExport} disabled={loading}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download Excel
                    </Button>
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
                                    <TableHeader className="sticky top-0 z-10 bg-muted">
                                        <TableRow>
                                            <TableHead>OPD</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
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
                                                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Terisi</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Kosong</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                                    Tidak ada departemen yang cocok dengan pencarian Anda.
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
