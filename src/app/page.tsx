"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { cn } from "../lib/utils";

export default function Home() {
  const router = useRouter();

  const [teamSlug, setTeamSlug] = useState("");
  const onSubmit = async () => {
    if (!teamSlug) {
      return;
    }
    document.cookie = `teamSlug=${teamSlug}`;
    router.push(`/${teamSlug}`);
  };

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
              onChange={(e) => setTeamSlug(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onSubmit}>Show Meetings</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
