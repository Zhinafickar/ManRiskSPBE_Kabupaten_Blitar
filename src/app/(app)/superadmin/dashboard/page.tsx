import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, Bot, AreaChart } from "lucide-react";
import { Suspense } from "react";
import { analyzeRiskTrends } from "@/ai/flows/risk-trend-analysis";
import { Skeleton } from "@/components/ui/skeleton";

async function RiskAnalysis() {
  const analysis = await analyzeRiskTrends({});
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI-Powered Risk Trend Analysis
        </CardTitle>
        <CardDescription>
          Emerging trends, prevalent issues, and potential impacts based on survey data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
}

function RiskAnalysisSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                     <Skeleton className="h-6 w-80" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-full" />
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    )
}

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Full control over the platform, users, and data analysis.
        </p>
      </div>

      <Suspense fallback={<RiskAnalysisSkeleton />}>
        <RiskAnalysis />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Add, edit, or remove user accounts and manage roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/users"><Users className="mr-2 h-4 w-4" />Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>All Survey Results</CardTitle>
            <CardDescription>Access a complete list of all survey submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/results"><FileText className="mr-2 h-4 w-4" />View All Results</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>Explore graphical representations of survey data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/visualization"><AreaChart className="mr-2 h-4 w-4" />Go to Visualization</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
