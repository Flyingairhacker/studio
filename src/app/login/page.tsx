"use client";

import { Fingerprint } from "lucide-react";
import LoginForm from "./login-form";

const TypingAnimation = () => (
  <style jsx>{`
    .typing-effect {
      width: 0;
      overflow: hidden;
      white-space: nowrap;
      animation: typing 2s steps(30, end) forwards;
    }
    .line2 { animation-delay: 2s; }
    .line3 { animation-delay: 4s; }
    .line4 { animation-delay: 5s; }
    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }
  `}</style>
);

export default function LoginPage() {
  return (
    <div className="font-code flex min-h-screen flex-col items-center justify-center bg-background p-4 pattern-bg">
      <TypingAnimation />
      <div className="w-full max-w-lg rounded-lg border border-primary/20 bg-background/50 p-6 shadow-[0_0_20px_theme(colors.primary/0.2)] backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary text-glow">
            Operator Challenge
          </h1>
          <Fingerprint className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="typing-effect line1 text-green-400">
            &gt; Establishing secure connection...
          </p>
          <p className="typing-effect line2 text-green-400">
            &gt; Connection established. Encrypted channel active.
          </p>
          <p className="typing-effect line3 text-yellow-400">
            &gt; Authentication required. Please provide credentials.
          </p>
          <p className="typing-effect line4 text-primary-foreground">
            &gt; Enter access key to proceed:
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
