"use client";

import { Fingerprint, Loader } from "lucide-react";
import LoginForm from "./login-form";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background pattern-bg">
          <Loader className="h-16 w-16 animate-spin text-primary"/>
          <p className="mt-4 text-muted-foreground">Verifying credentials...</p>
       </div>
    );
  }

  return (
    <div className="font-code flex min-h-screen flex-col items-center justify-center bg-background p-4 pattern-bg">
      <div className="w-full max-w-lg rounded-lg border border-primary/20 bg-background/50 p-6 shadow-[0_0_20px_theme(colors.primary/0.2)] backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary text-glow">
            Operator Login
          </h1>
          <Fingerprint className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="text-yellow-400">
            &gt; Authentication required. Please provide your operator credentials.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-primary/20 pt-4 text-center text-xs text-muted-foreground">
          <p>System Initialized. Awaiting operator input.</p>
          <p>Unauthorized access is monitored and logged.</p>
        </div>
      </div>
    </div>
  );
}
