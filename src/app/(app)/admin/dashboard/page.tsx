import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AreaChart } from "lucide-react";

export default function AdminDashboard({}: {}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and review all user-submitted risk surveys.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>View All Survey Results</CardTitle>
            <CardDescription>
              Access and review a comprehensive table of all survey data submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/results">
                <FileText className="mr-2 h-4 w-4" />
                View All Results
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>
              Explore graphical representations of the survey data for better insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/visualization">
                <AreaChart className="mr-2 h-4 w-4" />
                Go to Visualization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
