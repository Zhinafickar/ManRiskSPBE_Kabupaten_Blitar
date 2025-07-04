import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function ConclusionPage({}: {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6" />
            Conclusion/Kesimpulan
        </CardTitle>
        <CardDescription>
          Summary and conclusions from your risk assessments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Content for this page will be available soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
