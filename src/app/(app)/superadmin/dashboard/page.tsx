'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, FileText, AreaChart, Shield } from "lucide-react";
import { RiskAnalysisCard } from "@/app/(app)/_components/risk-analysis-card";

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Role Management</CardTitle>
            <CardDescription>View all roles and see which users are assigned to them.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/superadmin/role-management"><Shield className="mr-2 h-4 w-4" />Manage Roles</Link>
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
