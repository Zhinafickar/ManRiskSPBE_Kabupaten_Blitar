import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function VisualizationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
        <CardDescription>
          Graphical insights from the collected survey data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Visualization charts will be available here soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
