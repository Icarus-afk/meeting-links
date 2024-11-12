"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function TeamLinks() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [team, setTeam] = useState<{ name: string } | null>(null);
  const [links, setLinks] = useState<
    { id: string; title: string; description: string; url: string }[]
  >([]);
  const [error, setError] = useState("");

  const fetchTeamAndLinks = async () => {
    try {
      const response = await fetchWithAuth(
        `/api/team/${params.teamSlug}/links`
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }
      const data = await response.json();
      setTeam(data.team);
      setLinks(data.links);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    fetchTeamAndLinks();
  }, [params.teamSlug]);

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

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>{team?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            {links.length > 0 ? (
              links.map((link) => (
                <div key={link.id} className="mb-4">
                  <Card className="max-w-lg mx-auto">
                    <CardHeader>
                      <CardTitle>{link.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{link.description}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.url}
                      </a>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <p>No links found.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push(`/team/${params.teamSlug}/create-link`)}
            className="bg-primary text-white p-2 rounded"
          >
            + Create Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
