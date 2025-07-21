
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, PlusCircle, Copy, Trash2, Loader2 } from 'lucide-react';
import { createAdminToken, getAdminTokens, deleteAdminToken } from '@/services/user-service';
import type { AdminToken } from '@/types/token';

function TokenPageSkeleton() {
    return (
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/4" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
}

export default function TokenManagementPage() {
    const { userProfile } = useAuth();
    const { toast } = useToast();
    const [tokens, setTokens] = useState<AdminToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [adminName, setAdminName] = useState('');

    const fetchTokens = async () => {
        getAdminTokens().then(setTokens).finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchTokens();
    }, []);
    
    const handleGenerateToken = async () => {
        if (!adminName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nama admin tidak boleh kosong.' });
            return;
        }
        if (!userProfile) return;

        setIsCreating(true);
        try {
            // Generate a secure random token on the client
            const array = new Uint8Array(16);
            window.crypto.getRandomValues(array);
            const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

            await createAdminToken(adminName.trim(), token, userProfile.uid);
            toast({ title: 'Sukses', description: `Token untuk ${adminName.trim()} berhasil dibuat.` });
            setAdminName('');
            await fetchTokens(); // Refresh the list
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal membuat token.' });
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };
    
    const handleDeleteToken = async (tokenId: string) => {
        setIsDeleting(tokenId);
        try {
            await deleteAdminToken(tokenId);
            toast({ title: 'Sukses', description: 'Token berhasil dihapus.' });
            await fetchTokens(); // Refresh list
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus token.' });
        } finally {
            setIsDeleting(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Disalin!', description: 'Token telah disalin ke clipboard.' });
    };

    if (loading) {
        return <TokenPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-6 w-6" />
                        Buat Token Akses Admin Baru
                    </CardTitle>
                    <CardDescription>
                        Buat token yang dapat digunakan kembali untuk admin. Admin harus memasukkan nama dan token ini untuk mengakses halaman login/register.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nama Lengkap Admin Baru"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            disabled={isCreating}
                        />
                        <Button onClick={handleGenerateToken} disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            {isCreating ? 'Membuat...' : 'Buat Token'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Token Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                    {tokens.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Admin</TableHead>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map(token => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">{token.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm blur-sm hover:blur-none transition-all">{token.token}</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(token.token)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(token.createdAt).toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="destructive" 
                                                size="icon" 
                                                className="h-8 w-8" 
                                                onClick={() => handleDeleteToken(token.id)}
                                                disabled={isDeleting === token.id}
                                            >
                                                {isDeleting === token.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Tidak ada token aktif.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
