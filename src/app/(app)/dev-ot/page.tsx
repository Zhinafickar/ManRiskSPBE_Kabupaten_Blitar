import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function DevOtPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-6 w-6" />
          Dev Ot
        </CardTitle>
        <CardDescription>
          Fitur mendatang.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground text-center">
              Halaman ini sedang dalam pengembangan.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
