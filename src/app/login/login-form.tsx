"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  
  const auth = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "admin@domain.com",
      password: "password",
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    startTransition(async () => {
      if (!auth) {
        setError("Auth service not available.");
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        router.push("/admin");
      } catch (e: any) {
        switch (e.code) {
          case 'auth/user-not-found':
            // If user does not exist, create it
            try {
              await createUserWithEmailAndPassword(auth, data.email, data.password);
              router.push("/admin");
            } catch (creationError: any) {
              setError("Failed to create a new admin account.");
              console.error(creationError);
            }
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            setError("Invalid credentials. Please try again.");
            break;
          default:
            setError("An unknown error occurred. Please try again later.");
            console.error(e);
        }
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="space-y-2">
           <Input
            id="email"
            type="email"
            {...register("email")}
            className="font-code bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/50"
            placeholder="operator@domain.sec"
            disabled={isPending}
          />
           {errors.email && <p className="text-red-500 text-xs px-1">{errors.email.message}</p>}
        </div>
        <div className="relative space-y-2">
            <div className="relative">
                 <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="font-code bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/50 pr-10"
                    placeholder="****************"
                    disabled={isPending}
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-primary"
                    disabled={isPending}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18} />}
                </button>
            </div>

          {errors.password && <p className="text-red-500 text-xs px-1">{errors.password.message}</p>}
        </div>
        
        <Button type="submit" className="w-full font-bold" disabled={isPending}>
          {isPending ? "Authenticating..." : "Authorize"}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
