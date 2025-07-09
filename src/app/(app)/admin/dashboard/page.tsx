'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AreaChart, HelpCircle } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Review organization-wide risk data and analyses.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <RiskAnalysisCard />
        </div>
        <div className="lg:col-span-1">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-6 w-6" />
                        Admin Guide
                    </CardTitle>
                    <CardDescription>
                        Your role and capabilities on this platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                    <div>
                        <h4 className="font-semibold text-foreground">Review All Data</h4>
                        <p>View all survey results and business continuity plans submitted by every user.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Analyze Trends</h4>
                        <p>The AI-Powered analysis provides a summary of emerging risk trends across the organization.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Explore Visualizations</h4>
                        <p>Use the data visualization page to see graphical representations of risk distribution.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>View All Survey Results</CardTitle>
            <CardDescription>
              Access a comprehensive table of all survey data submitted by users.
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
            </Description>
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
