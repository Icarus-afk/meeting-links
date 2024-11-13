"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export default function CreateTeam() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const debouncedTeamName = useDebounce(teamName, 500);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirectTo=/team/create");
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const handleCreateTeam = async () => {
    try {
      const response = await fetchWithAuth("/api/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName: debouncedTeamName,
          ownerId: user.id,
          pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/team/${data.slug}/links`);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create a New Team</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="border p-2 w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCreateTeam}
            className="bg-black text-white p-2 rounded"
          >
            Create Team
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
