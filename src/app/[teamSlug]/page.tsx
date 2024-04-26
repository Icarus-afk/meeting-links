import { cookies } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Pin from "./pin";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";

const getData = async (teamSlug: string, pin: string) => {
  const response = await fetch(
    `${process.env.SERVER_BASE_URL}/api/meet/${teamSlug}?pin=${pin}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      return {
        error: "Invalid pin",
        code: 401,
      };
    }
  } else if (response.status === 404) {
    return {
      error: "Team not found",
      code: 404,
    };
  } else if (response.status === 500) {
    return {
      error: "Error getting meetings",
      code: 500,
    };
  }
  const data = await response.json();
  return {
    error: null,
    data,
    code: 200,
  };
};

export default async function TeamHome({
  params,
}: {
  params: { teamSlug: string };
}) {
  const teamSlug = params.teamSlug;
  const pin = cookies().get(teamSlug + "_pin");

  if (!pin) {
    return <Pin teamSlug={teamSlug} />;
  }
  if (!teamSlug) {
    return <div>Missing teamSlug</div>;
  }

  const { data, code, error } = await getData(teamSlug, pin.value);

  if (code === 404) {
    return <div>Data not found</div>;
  }
  if (code === 401) {
    return <Pin teamSlug={teamSlug} />;
  }
  if (code === 500) {
    return <div>Error getting meetings</div>;
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
