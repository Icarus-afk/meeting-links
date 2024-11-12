"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { FaThumbtack } from "react-icons/fa";

export default function MyTeams() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [teams, setTeams] = useState<
    { id: string; name: string; slug: string; pinned: boolean }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetchWithAuth(`/api/team?userId=${user?.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error);
          return;
        }
        const data = await response.json();
        setTeams(data.teams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    if (user) {
      fetchTeams();
    }
  }, [user]);

  const handlePinClick = async (team: {
    id: any;
    name?: string;
    slug: string;
    pinned: boolean;
  }) => {
    try {
      const response = await fetchWithAuth(`/api/team/${team.slug}/pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id, pin: !team.pinned }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      setTeams((prevTeams) =>
        prevTeams.map((t) =>
          t.id === team.id ? { ...t, pinned: !t.pinned } : t
        )
      );
    } catch (error) {
      console.error("Error updating pinned status:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleTeamClick = (teamSlug: string) => {
    router.push(`/team/${teamSlug}/links`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (error) {
    return (
      <Toast variant="error">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>{error}</ToastDescription>
      </Toast>
    );
  }

  const pinnedTeams = teams.filter((team) => team.pinned);
  const unpinnedTeams = teams.filter((team) => !team.pinned);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Teams</h1>
      {pinnedTeams.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-2">Pinned Teams</h2>
          {pinnedTeams.map((team) => (
            <Card key={team.id} className="mb-4 max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Slug: {team.slug}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleTeamClick(team.slug)}>
                  View Links
                </Button>
                <FaThumbtack
                  onClick={() => handlePinClick(team)}
                  className="ml-2 cursor-pointer"
                  style={{ color: team.pinned ? "black" : "gray" }}
                />
              </CardFooter>
            </Card>
          ))}
        </>
      )}
      {unpinnedTeams.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-2">Other Teams</h2>
          {unpinnedTeams.map((team) => (
            <Card key={team.id} className="mb-4 max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Slug: {team.slug}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleTeamClick(team.slug)}>
                  View Links
                </Button>
                <FaThumbtack
                  onClick={() => handlePinClick(team)}
                  className="ml-2 cursor-pointer"
                  style={{ color: team.pinned ? "black" : "gray" }}
                />
              </CardFooter>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
