
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Bio } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  contactTitle: z.string().optional(),
  contactSubtitle: z.string().optional(),
  modelUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  showGamesSection: z.boolean().optional(),
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
    control,
    formState: { errors, isDirty },
  } = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
        name: "Rohit Kumar",
        title: "Flutter & IoT Developer",
        description: "Passionate Flutter Developer with a strong foundation in mobile application development, particularly in Android (Java) and cross-platform apps using Flutter. Adept at building scalable and high-performance applications, implementing unit testing, and working in Agile teams. Committed to continuous learning and contributing to innovative projects.",
        avatarUrl: "",
        contactTitle: "Request Intel",
        contactSubtitle: "Open a secure channel for inquiries, collaborations, or to discuss a project. All transmissions are monitored.",
        modelUrl: "",
        showGamesSection: false,
    }
  });

  useEffect(() => {
    if (bio) {
      reset({
        name: bio.name || "Rohit Kumar",
        title: bio.title || "Flutter & IoT Developer",
        description: bio.description || "Passionate Flutter Developer with a strong foundation in mobile application development, particularly in Android (Java) and cross-platform apps using Flutter. Adept at building scalable and high-performance applications, implementing unit testing, and working in Agile teams. Committed to continuous learning and contributing to innovative projects.",
        avatarUrl: bio.avatarUrl || "",
        contactTitle: bio.contactTitle || "Request Intel",
        contactSubtitle: bio.contactSubtitle || "Open a secure channel for inquiries, collaborations, or to discuss a project. All transmissions are monitored.",
        modelUrl: bio.modelUrl || "",
        showGamesSection: bio.showGamesSection || false,
      });
    }
  }, [bio, reset]);

  const processSubmit = async (data: BioFormData) => {
    if (!firestore || !bioRef) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firebase is not available.",
        });
        return;
    }
    
    startTransition(() => {
        setDocumentNonBlocking(bioRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });

        toast({
            title: "Bio Updated",
            description: "Your public biography has been successfully updated.",
        });
        reset(data); // Resets the form's dirty state
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
      <div>
        <h3 className="text-lg font-medium">Hero & Bio Section</h3>
        <p className="text-sm text-muted-foreground">This content appears at the top of your homepage.</p>
      </div>
      <div className="space-y-4">
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
        <div className="space-y-2">
            <Label htmlFor="modelUrl">Sketchfab Embed URL</Label>
            <Input id="modelUrl" {...register("modelUrl")} placeholder="https://sketchfab.com/models/.../embed" />
            {errors.modelUrl && <p className="text-sm text-destructive">{errors.modelUrl.message}</p>}
        </div>
      </div>

      <Separator />

       <div>
        <h3 className="text-lg font-medium">Contact Section</h3>
        <p className="text-sm text-muted-foreground">This content appears above the contact form.</p>
      </div>
       <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="contactTitle">Contact Title</Label>
            <Input id="contactTitle" {...register("contactTitle")} placeholder="Contact Section Title" />
            {errors.contactTitle && <p className="text-sm text-destructive">{errors.contactTitle.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="contactSubtitle">Contact Subtitle</Label>
            <Textarea id="contactSubtitle" {...register("contactSubtitle")} placeholder="A brief intro to the contact section." className="min-h-[4rem]" />
            {errors.contactSubtitle && <p className="text-sm text-destructive">{errors.contactSubtitle.message}</p>}
        </div>
      </div>
      
      <Separator />

       <div>
        <h3 className="text-lg font-medium">Homepage Sections</h3>
        <p className="text-sm text-muted-foreground">Control the visibility of optional sections on your main page.</p>
      </div>
       <div className="space-y-4">
          <Controller
              name="showGamesSection"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Show Training Simulations
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Display the "Sequence Breaker" game section on the homepage.
                        </p>
                    </div>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                </div>
              )}
            />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
