
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import type { UserProfile } from '@/types/user';
import { Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

function OPDTableSkeleton() {
    return (
        <div className="space-y-2">
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

    useEffect(() => {
        getAllUsers()
            .then(setUsers)
            .finally(() => setLoading(false));
    }, []);

    const departmentStatus = useMemo(() => {
        const assignedRoles = new Set(users.map(user => user.role));
        
        return ROLES.map(role => ({
            name: role,
            isTaken: assignedRoles.has(role) && role !== 'Penguji Coba'
        })).sort((a, b) => a.name.localeCompare(b.name));

    }, [users]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    Daftar OPD/Departemen
                </CardTitle>
                <CardDescription>
                    Berikut adalah daftar semua OPD/Departemen yang tersedia dalam sistem beserta status keterisiannya.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <OPDTableSkeleton />
                ) : (
                    <ScrollArea className="h-[350px] rounded-md border">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted z-10">
                                <TableRow>
                                    <TableHead>Nama Departemen</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departmentStatus.map(dept => (
                                    <TableRow key={dept.name}>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell className="text-right">
                                            {dept.isTaken ? (
                                                <Badge variant="secondary" className="border-green-300 text-green-800">Terisi</Badge>
                                            ) : (
                                                <Badge variant="outline">Kosong</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
