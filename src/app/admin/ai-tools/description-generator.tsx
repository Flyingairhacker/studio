
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateProjectDescription } from "@/ai/flows/generate-project-description";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Terminal } from "lucide-react";

const schema = z.object({
  keywords: z.string().min(3, "Please enter at least one keyword."),
});

type FormData = z.infer<typeof schema>;

export default function DescriptionGenerator() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const response = await generateProjectDescription({ keywords: data.keywords });
        if (response.description) {
          setResult(response.description);
        } else {
            setError("The AI failed to generate a description. Please try again.");
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "An error occurred while communicating with the AI. Please check the console.");
      }
    });
  };

  return (
    <>
      <AlertDialog open={!!error} onOpenChange={(open) => !open && setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Terminal className="h-5 w-5"/> Generation Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            {...register("keywords")}
            placeholder="e.g., 'Flutter, IoT, real-time data, fleet management'"
            disabled={isPending}
          />
          {errors.keywords && (
            <p className="text-sm text-destructive mt-1">{errors.keywords.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate Description"}
        </Button>

        {result && (
          <div className="space-y-2 mt-4">
              <Label htmlFor="description">Generated Description</Label>
              <Textarea
                  id="description"
                  readOnly
                  value={result}
                  className="h-32 bg-muted/50"
              />
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(result)}>Copy to Clipboard</Button>
          </div>
        )}
      </form>
    </>
  );
}
