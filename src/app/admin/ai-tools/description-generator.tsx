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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      } catch (e) {
        console.error(e);
        setError("An error occurred while communicating with the AI. Please check the console.");
      }
    });
  };

  return (
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

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
  );
}
