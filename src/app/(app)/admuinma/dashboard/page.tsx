'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, AreaChart, Building, ClipboardCheck } from "lucide-react";
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

      <RiskAnalysisCard />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>View All Survey Results</CardTitle>
            <CardDescription>
              Access a comprehensive table of all survey data submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admuinma/results">
                <FileText className="mr-2 h-4 w-4" />
                View Survey Results
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>View Continuity Plans</CardTitle>
            <CardDescription>
              See all business continuity plans submitted across the organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admuinma/continuity-results">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                View Continuity Plans
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>
              Explore graphical representations of survey data for better insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admuinma/visualization">
                <AreaChart className="mr-2 h-4 w-4" />
                Go to Visualization
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OPD/Departemen Lain</CardTitle>
            <CardDescription>
              View the list of all registered departments and their data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admuinma/opd">
                <Building className="mr-2 h-4 w-4" />
                View Departments
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
