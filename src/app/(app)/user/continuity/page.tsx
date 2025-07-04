import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Recycle } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContinuityPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-6 w-6" />
          Kontinuitas/Keberlanjutan
        </CardTitle>
        <CardDescription>
          Isi formulir untuk perencanaan keberlanjutan dan kontinuitas layanan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="risiko">RISIKO</Label>
            <Textarea id="risiko" placeholder="Deskripsikan risiko yang dihadapi..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aktivitas">AKTIVITAS</Label>
            <Textarea id="aktivitas" placeholder="Jelaskan aktivitas pemulihan yang akan dilakukan..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="target-waktu">TARGET WAKTU</Label>
                <Input id="target-waktu" placeholder="Contoh: 24 Jam" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pic">PIC</Label>
                <Input id="pic" placeholder="Nama atau departemen penanggung jawab" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sumberdaya">Sumberdaya yang dibutuhkan</Label>
            <Textarea id="sumberdaya" placeholder="Sebutkan semua sumber daya yang diperlukan (manusia, teknis, dll.)..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="rto">Recovery Time Objective (RTO)</Label>
                <Input id="rto" placeholder="Contoh: 4 Jam" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="rpo">Recovery Point Objective (RPO)</Label>
                <Input id="rpo" placeholder="Contoh: Data 1 jam terakhir" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button>Simpan Rencana</Button>
      </CardFooter>
    </Card>
  );
}
