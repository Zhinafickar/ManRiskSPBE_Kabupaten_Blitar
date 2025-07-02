import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TutorialPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutorial</CardTitle>
        <CardDescription>
          How to use the Risk Navigator application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Tutorial content will be available here soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
