"use client";

import { SetStateAction, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

export default function CreateLinkPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `/api/team/${params.teamSlug}/links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description, url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      router.push(`/team/${params.teamSlug}/links`);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setDescription(e.target.value)
                }
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            {error && (
              <Toast variant="error">
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>{error}</ToastDescription>
              </Toast>
            )}
            <CardFooter>
              <Button
                type="submit"
                className="bg-primary text-white p-2 rounded"
              >
                Create Meeting
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
