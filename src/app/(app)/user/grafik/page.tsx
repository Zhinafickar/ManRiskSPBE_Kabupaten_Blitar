import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AreaChart } from "lucide-react";

export default function GrafikPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <AreaChart className="h-6 w-6" />
            Grafik Hasil
        </CardTitle>
        <CardDescription>
          Visualisasi grafis dari data survei risiko Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Grafik dan visualisasi data akan segera tersedia di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
