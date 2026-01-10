"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const schema = z.object({
  password: z.string().min(1, "Access key is required."),
});

type FormData = z.infer<typeof schema>;

const DecryptingText = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [decryptedText, setDecryptedText] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let i = 0;
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    
    interval = setInterval(() => {
      let newText = text.substring(0, i + 1);
      for (let j = i + 1; j < text.length; j++) {
        newText += chars[Math.floor(Math.random() * chars.length)];
      }
      setDecryptedText(newText);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDecryptedText(text);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span className="text-primary">{decryptedText}</span>;
}

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDecrypting, setIsDecrypting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setIsDecrypting(true);
    startTransition(async () => {
      // The decryption animation will call this after it's done
    });
  };

  const handleDecryptionComplete = async () => {
    const formData = new FormData();
    // Have to get value directly because react-hook-form state might be stale
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    formData.append("password", passwordInput.value);
    
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setIsDecrypting(false);
    }
    // On success, the server action will redirect.
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="relative">
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="font-code bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/50"
            placeholder="****************"
            disabled={isPending || isDecrypting}
          />
        </div>
        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
        <Button type="submit" className="w-full font-bold" disabled={isPending || isDecrypting}>
          {isPending || isDecrypting ? "Authenticating..." : "Authorize"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isDecrypting && !error && (
        <div className="mt-4 text-green-400 text-sm">
          <p>&gt; Access key received. Decrypting...</p>
          <p>&gt; <DecryptingText text="****************" onComplete={handleDecryptionComplete} /></p>
        </div>
      )}
    </>
  );
}
