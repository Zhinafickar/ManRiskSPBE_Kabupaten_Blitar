import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TutorialPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutorial</CardTitle>
        <CardDescription>
          Cara menggunakan aplikasi Manajemen Resiko.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Konten tutorial akan segera tersedia di sini.</p>
        </div>
      </CardContent>
    </Card>
  );
}
