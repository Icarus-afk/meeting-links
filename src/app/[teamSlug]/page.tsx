import { cookies } from "next/headers";
import { RocketIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Pin from "./pin";

const getData = async (teamSlug: string, pin: string) => {
  const response = await fetch(
    `${process.env.SERVER_BASE_URL}/api/meet/${teamSlug}?pin=${pin}`
  );

  if (response.status === 401) {
    return { error: "Invalid pin", code: 401 };
  } else if (response.status === 404) {
    return { error: "Team not found", code: 404 };
  } else if (response.status === 500) {
    return { error: "Error getting meetings", code: 500 };
  }

  const data = await response.json();
  return { error: null, data, code: 200 };
};

interface TeamHomeProps {
  params: { teamSlug: string };
}

export default async function TeamHome({ params }: TeamHomeProps) {
  const { teamSlug } = params;
  const pin = (await cookies()).get(`${teamSlug}_pin`);

  if (!pin) {
    return <Pin teamSlug={teamSlug} />;
  }

  const { data, code, error } = await getData(teamSlug, pin.value);

  if (code === 401) {
    return <Pin teamSlug={teamSlug} error={error || undefined} />;
  }

  if (code === 404 || code === 403 || code === 500) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className={cn("w-[380px]")}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className={cn("w-[380px]")}>
        <CardHeader>
          <CardTitle>{data.team.name} Team</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {data?.meetings.map((meeting: any) => (
            <a href={meeting.link} key={meeting.id}>
              <Alert>
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>{meeting.title}</AlertTitle>
                <AlertDescription>{meeting.link}</AlertDescription>
              </Alert>
            </a>
          ))}
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
