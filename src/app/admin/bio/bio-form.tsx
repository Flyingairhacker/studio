"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Bio } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { updateBio } from "./actions";

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type BioFormData = z.infer<typeof bioSchema>;

const BIO_DOC_ID = "main-bio";

export default function BioForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const bioRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "bio", BIO_DOC_ID) : null),
    [firestore]
  );
  const { data: bio, isLoading } = useDoc<Bio>(bioRef);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
  });

  useEffect(() => {
    if (bio) {
      reset({
        name: bio.name || "",
        title: bio.title || "",
        description: bio.description || "",
        avatarUrl: bio.avatarUrl || "",
      });
    }
  }, [bio, reset]);

  const processSubmit = async (data: BioFormData) => {
    startTransition(async () => {
      const result = await updateBio(data);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Bio Updated",
          description: "Your public biography has been successfully updated.",
        });
        reset(data); // Resets the form's dirty state
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="Your Name" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Your Professional Title" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="A short bio about your skills and experience." className="min-h-24" />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input id="avatarUrl" {...register("avatarUrl")} placeholder="https://example.com/avatar.png" />
        {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
