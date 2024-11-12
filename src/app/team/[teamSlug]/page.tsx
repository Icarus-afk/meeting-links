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
import { getSupabseClient } from "@/supaClient/index";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export default function TeamPage({ params }: { params: { teamSlug: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [team, setTeam] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [meetings, setMeetings] = useState<
    { id: string; title: string; link: string }[]
  >([]);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeamAndMeetings = async () => {
      try {
        const supabase = getSupabseClient();
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("slug", params.teamSlug)
          .single<{
            id: string;
            name: string;
            slug: string;
            owner_id: string;
          }>();

        if (teamError) {
          setError(teamError.message);
          return;
        }

        setTeam({
          id: teamData.id,
          name: teamData.name,
          slug: teamData.slug,
        });
        setIsOwner(teamData.owner_id === user?.id);

        const { data: meetingsData, error: meetingsError } = await supabase
          .from("meetings")
          .select("*")
          .eq("team_id", teamData.id as string);

        if (meetingsError) {
          setError(meetingsError.message);
          return;
        }

        setMeetings(
          meetingsData as { id: string; title: string; link: string }[]
        );
      } catch (error) {
        console.error("Error fetching team and meetings:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    };

    if (user) {
      fetchTeamAndMeetings();
    }
  }, [user, params.teamSlug]);

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

  const handleMeetingClick = (meetingId: string) => {
    router.push(`/team/${params.teamSlug}/meetings`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{team?.name} Meetings</h1>
      {meetings.length > 0 ? (
        meetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="mb-4 max-w-lg mx-auto"
            onClick={() => handleMeetingClick(meeting.id)}
          >
            <CardHeader>
              <CardTitle>{meeting.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Link: {meeting.link}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No meetings found.</p>
      )}
      <CardFooter>
        <Button
          onClick={() => router.push(`/team/${params.teamSlug}/create-meeting`)}
          className="bg-primary text-white p-2 rounded"
        >
          + Create Meeting
        </Button>
      </CardFooter>
    </div>
  );
}
