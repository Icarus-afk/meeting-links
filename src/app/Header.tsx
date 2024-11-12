"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RocketIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<
    { id: string; team_name: string; user_email: string }[]
  >([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (user) {
        try {
          const response = await fetch(
            `/api/team/pending-requests?userId=${user.id}`
          );
          if (response.ok) {
            const data = await response.json();
            setPendingRequests(data.pendingRequests);
          }
        } catch (error) {
          console.error("Error fetching pending requests:", error);
        }
      }
    };

    fetchPendingRequests();
  }, [user]);

  const handleCreateTeam = () => {
    if (user) {
      router.push("/team/create");
    } else {
      router.push(
        `/auth/login?redirectTo=${encodeURIComponent("/team/create")}`
      );
    }
  };

  const handleMyTeams = () => {
    if (user) {
      router.push("/team/my-teams");
    } else {
      router.push(
        `/auth/login?redirectTo=${encodeURIComponent("/team/my-teams")}`
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) {
      alert("User is not logged in.");
      return;
    }
    try {
      const response = await fetch("/api/team/approve-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, userId: user.id }),
      });

      if (response.ok) {
        setPendingRequests((prevRequests) =>
          prevRequests.filter((request) => request.id !== requestId)
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error("Error approving join request:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
        <RocketIcon
          className="h-8 w-8 text-primary cursor-pointer"
          onClick={() => router.push("/")}
        />
        <div className="ml-auto flex gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleCreateTeam}>
                Create Team
              </Button>
              <Button variant="ghost" onClick={handleMyTeams}>
                My Teams
              </Button>
              {pendingRequests.length > 0 && (
                <div className="relative">
                  <Button variant="ghost">
                    Notifications ({pendingRequests.length})
                  </Button>
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="p-2 border-b">
                        <p>
                          Join request for team {request.team_name} from{" "}
                          {request.user_email}
                        </p>
                        <Button
                          variant="ghost"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/auth/login");
                }}
              >
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  router.push("/auth/signup");
                }}
              >
                Create Account
              </Button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
