'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/services/user-service';
import { ROLES } from '@/constants/data';
import type { UserProfile } from '@/types/user';
import { Building } from 'lucide-react';

function OPDListSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-20" />
                </div>
            ))}
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
                    <OPDListSkeleton />
                ) : (
                    <div className="space-y-2">
                        {departmentStatus.map(dept => (
                            <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <p className="font-medium">{dept.name}</p>
                                {dept.isTaken ? (
                                    <Badge variant="secondary" className="border-green-300 text-green-800">Terisi</Badge>
                                ) : (
                                    <Badge variant="outline">Kosong</Badge>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
