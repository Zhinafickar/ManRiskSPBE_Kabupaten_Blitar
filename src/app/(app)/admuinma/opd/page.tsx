
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/services/user-service';
import { getAllSurveyData } from '@/services/survey-service';
import { ROLES } from '@/constants/data';
import type { UserProfile } from '@/types/user';
import type { Survey } from '@/types/survey';
import { Building, Search, FileDown, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DepartmentDetailsDialog } from './_components/department-details-dialog';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCsv } from '@/lib/excel-export';


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

type DepartmentStatus = 'Kosong' | 'Ada User' | 'User Menginput';

function StatusBadge({ status }: { status: DepartmentStatus }) {
    switch (status) {
        case 'User Menginput':
            return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">User Menginput</Badge>;
        case 'Ada User':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Ada User</Badge>;
        case 'Kosong':
            return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">Kosong</Badge>;
        default:
            return <Badge variant="outline">N/A</Badge>;
    }
}


export default function OPDPage() {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getAllUsers(),
            getAllSurveyData()
        ]).then(([userResults, surveyResults]) => {
            setUsers(userResults);
            setSurveys(surveyResults);
        }).finally(() => setLoading(false));
    }, []);

    const filteredDepartments = useMemo(() => {
        const assignedRoles = new Set(users.map(user => user.role));
        const rolesWithSurveys = new Set(surveys.map(survey => survey.userRole));
        
        const allDepartments = ROLES.filter(role => role !== 'Penguji Coba').map(role => {
            let status: DepartmentStatus;
            const isTaken = assignedRoles.has(role);
            const hasInput = rolesWithSurveys.has(role);

            if (isTaken && hasInput) {
                status = 'User Menginput';
            } else if (isTaken) {
                status = 'Ada User';
            } else {
                status = 'Kosong';
            }
            
            return {
                name: role,
                isTaken,
                status
            }
        }).sort((a, b) => a.name.localeCompare(b.name));

        if (!searchTerm) {
            return allDepartments;
        }

        return allDepartments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [users, surveys, searchTerm]);
    
    const handleExportExcel = () => {
        const dataForSheet = filteredDepartments.map(dept => ({
            'OPD': dept.name,
            'Status': dept.status,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataForSheet);

        ws['!cols'] = [{ wch: 60 }, { wch: 20 }];

        XLSX.utils.book_append_sheet(wb, ws, 'Status OPD');
        XLSX.writeFile(wb, `${userProfile?.role}_Status_OPD.xlsx`);
    };

    const handleExportCsv = () => {
        const fileName = `${userProfile?.role}_Status_OPD`;
        const dataForCsv = filteredDepartments.map(dept => ({
            'OPD': dept.name,
            'Status': dept.status,
        }));
        exportToCsv({ data: dataForCsv, fileName });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-6 w-6" />
                            Daftar Organisasi Perangkat Daerah (OPD)
                        </CardTitle>
                        <CardDescription>
                            Berikut adalah daftar semua Organisasi Perangkat Daerah (OPD) yang tersedia dalam sistem beserta status keterisiannya.
                        </CardDescription>
                    </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={loading}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Download
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={handleExportExcel}>Download Excel</DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleExportCsv}>Download CSV</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                                                       <StatusBadge status={dept.status} />
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
