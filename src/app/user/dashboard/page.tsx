'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function UserDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {userProfile?.fullName}!</h1>
        <p className="text-muted-foreground">
          Here you can manage your risk assessment surveys.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Risk Event</CardTitle>
            <CardDescription>
              Report a new risk event for assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/user/survey-1">Input Risk Event</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Your Results</CardTitle>
            <CardDescription>
              Review all the surveys you have previously submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/user/results">View My Surveys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
