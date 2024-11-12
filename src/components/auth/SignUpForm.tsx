"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      router.push("/auth/login");
    } else {
      setError(data.error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && (
          <Toast variant="error">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{error}</ToastDescription>
          </Toast>
        )}
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <Button
          onClick={handleSignup}
          className="bg-primary text-white p-2 rounded w-full"
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
}
