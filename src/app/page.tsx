"use client";
import { SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [teamSlug, setTeamSlug] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: string;
      name: string;
      slug: string;
      isOwner: boolean;
      isMember: boolean;
      status?: string;
    }[]
  >([]);
  const [teams, setTeams] = useState<
    {
      id: string;
      name: string;
      slug: string;
      pinned: boolean;
      status: string;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [pin, setPin] = useState("");

  const handleSearch = async (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setTeamSlug(e.target.value);
    if (e.target.value === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetchWithAuth(
        `/api/team/search?query=${e.target.value}&userId=${user?.id}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }
      const data = await response.json();
      setSearchResults(data.teams);
    } catch (error) {
      console.error("Error searching teams:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleJoinTeam = (team: { id: string; name: string; slug: string }) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setSelectedTeam(team);
    setShowModal(true);
  };

  const handleJoinRequest = async () => {
    if (!selectedTeam) return;

    try {
      const response = await fetchWithAuth(
        `/api/team/${selectedTeam.slug}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user?.id, pin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setShowModal(false);
        return;
      }

      setTeams((prevTeams: any) => [
        ...prevTeams,
        { ...selectedTeam, pinned: false, status: "pending" },
      ]);
      setShowModal(false);
      setPin("");
      setSuccessMessage(data.message);
    } catch (error) {
      console.error("Error joining team:", error);
      setError("An unexpected error occurred. Please try again.");
      setShowModal(false);
    }
  };

  const isUserPartOfTeam = (team: {
    id: any;
    name?: string;
    slug?: string;
    isOwner: any;
    isMember: any;
    status?: string;
  }) => {
    return (
      teams.some((t) => t.id === team.id && t.status !== "pending") ||
      team.isOwner ||
      team.isMember
    );
  };

  const isUserPendingApproval = (team: {
    id: any;
    name?: string;
    slug?: string;
    status?: string;
  }) => {
    return teams.some((t) => t.id === team.id && t.status === "pending");
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="h-screen flex items-center justify-center">
      <Card className={cn("w-[380px]")}>
        <CardHeader>
          <CardTitle>Enter the Team ID</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Input
              type="text"
              placeholder="eg. skavl"
              value={teamSlug}
              onChange={handleSearch}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Search Results</h2>
              {searchResults.map((team) => (
                <Card
                  key={team.id}
                  className={`mb-4 ${
                    isUserPartOfTeam(team)
                      ? "opacity-100"
                      : isUserPendingApproval(team)
                      ? "opacity-50"
                      : "opacity-30"
                  }`}
                >
                  <CardHeader>
                    <CardTitle>{team.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Slug: {team.slug}</p>
                  </CardContent>
                  <CardFooter>
                    {isUserPartOfTeam(team) ? (
                      <Button
                        onClick={() => router.push(`/team/${team.slug}/links`)}
                      >
                        View Links
                      </Button>
                    ) : isUserPendingApproval(team) ? (
                      <Button disabled>Applied</Button>
                    ) : (
                      <Button onClick={() => handleJoinTeam(team)}>Join</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {error && (
        <Toast variant="error">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>{error}</ToastDescription>
        </Toast>
      )}
      {successMessage && (
        <Toast variant="success">
          <ToastTitle>Success</ToastTitle>
          <ToastDescription>{successMessage}</ToastDescription>
        </Toast>
      )}
      {showModal && (
        <Modal>
          <ModalHeader>
            <ModalTitle>Enter PIN for {selectedTeam?.name}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="border p-2 w-full"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleJoinRequest}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Submit
            </Button>
            <Button onClick={() => setShowModal(false)} className="ml-2">
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </main>
  );
}
function setTeams(arg0: (prevTeams: any) => any[]) {
  throw new Error("Function not implemented.");
}
