import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Recycle } from 'lucide-react';

export default function ContinuityPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Recycle className="h-6 w-6" />
          Kontinuitas/Keberlanjutan
        </CardTitle>
        <CardDescription>
          Manajemen keberlanjutan dan kontinuitas layanan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Konten untuk halaman ini akan segera tersedia.</p>
        </div>
      </CardContent>
    </Card>
  );
}
