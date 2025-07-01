'use client';

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, Bot, AreaChart } from "lucide-react";
import { analyzeRiskTrends, type AnalyzeRiskTrendsOutput } from "@/ai/flows/risk-trend-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllSurveyData } from "@/services/survey-service";
import { isFirebaseConfigured } from "@/lib/firebase";

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

function RiskAnalysisCard() {
  const [analysis, setAnalysis] = useState<AnalyzeRiskTrendsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      if (!isFirebaseConfigured) {
        setError("Firebase is not configured. Cannot fetch data for analysis.");
        setLoading(false);
        return;
      }

      try {
        const surveys = await getAllSurveyData();
        if (surveys.length === 0) {
          setAnalysis({ summary: 'No survey data has been submitted yet. AI analysis requires data.' });
          return;
        }
        const result = await analyzeRiskTrends({ surveyData: JSON.stringify(surveys) });
        setAnalysis(result);
      } catch (err) {
        console.error(err);
        setError("Failed to generate AI analysis.");
      } finally {
        setLoading(false);
      }
    };

    generateAnalysis();
  }, []);


  if (loading) {
    return <RiskAnalysisSkeleton />;
  }

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
        {error ? (
           <p className="text-sm text-destructive">{error}</p>
        ) : (
           <p className="text-sm text-foreground">{analysis?.summary || "No summary available."}</p>
        )}
      </CardContent>
    </Card>
  );
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
      
      <RiskAnalysisCard />

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
