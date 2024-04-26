"use client";
import { useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Pin({ teamSlug }: { teamSlug: string }) {
  const [pin, setPin] = useState("");

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className={cn("w-[380px]")}>
        <CardHeader>
          <CardTitle>Enter Pin</CardTitle>
          <CardDescription>Enter the 6 digit pin</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={pin}
              onChange={(value) => {
                setPin(value);
              }}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              document.cookie = `${teamSlug}_pin=${pin}; max-age=3600`;
              location.reload();
            }}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
