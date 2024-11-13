"use client";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabseClient } from "@/supaClient/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loadingscreen";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

const supabase = getSupabseClient();

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle email/password login
  const handleLogin = async () => {
    setLoading(true);
    console.log("Logging in with email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      console.log("Response data:", data);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session) {
        localStorage.setItem("auth-token", session.access_token);
        const redirectTo = searchParams.get("redirectTo") || "/";
        console.log("Redirecting:", redirectTo);
        router.push(redirectTo);
      } else {
        setError("No session found. Please log in again.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error logging in:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      console.log("Google login response:", data); // Inspect this response
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session) {
        console.log("Logged in with session:", session);

        localStorage.setItem("auth-token", session.access_token);
        const redirectTo = searchParams.get("redirectTo") || "/";
        router.push(redirectTo);
      } else {
        setError("No session found. Please log in again.");
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="container mx-auto p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
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
            onClick={handleLogin}
            className="bg-gray-800 text-white p-2 rounded w-full"
          >
            Login
          </Button>

          <div className="mt-4">
            {/* Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Google login error");
                setError("Google login failed. Please try again.");
              }}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
