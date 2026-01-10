"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    tags: z.string().min(1, "Tags are required"),
    systemType: z.enum(['Mobile', 'IoT', 'Desktop', 'Web']),
    repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    imageUrl: z.string().url("Must be a valid URL"),
    imageHint: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    project?: Project;
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

export function ProjectForm({ project, children, onClose, isOpen }: ProjectFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();

    const { register, handleSubmit, control, formState: { errors } } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: project?.title || "",
            description: project?.description || "",
            tags: project?.tags?.join(", ") || "",
            systemType: project?.systemType || "Web",
            repoUrl: project?.repoUrl || "",
            liveUrl: project?.liveUrl || "",
            imageUrl: project?.imageUrl || "https://picsum.photos/seed/new/800/600",
            imageHint: project?.imageHint || "tech placeholder"
        },
    });

    const processSubmit = async (data: ProjectFormData) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Firestore is not available."
            });
            return;
        }

        startTransition(() => {
            const { tags, ...rest } = data;
            const projectData = {
                ...rest,
                tags: tags.split(',').map(tag => tag.trim()),
            };

            if (project?.id) {
                // Update existing project
                const projectRef = doc(firestore, "projects", project.id);
                updateDocumentNonBlocking(projectRef, {
                    ...projectData,
                    updatedAt: serverTimestamp(),
                });
                toast({
                    title: "Project Updated",
                    description: "Your project portfolio has been successfully updated."
                });
            } else {
                // Add new project
                const projectsCollection = collection(firestore, "projects");
                addDocumentNonBlocking(projectsCollection, {
                    ...projectData,
                    createdAt: serverTimestamp(),
                });
                toast({
                    title: "Project Added",
                    description: "Your new project has been added to the portfolio."
                });
            }
            onClose();
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[625px] glass-card">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-glow">{project ? "Edit Deployment" : "New Deployment"}</DialogTitle>
                    <DialogDescription>
                        {project ? "Update the details for this project." : "Add a new project to your portfolio."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(processSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" {...register("title")} className="col-span-3" />
                        {errors.title && <p className="col-span-4 text-sm text-destructive">{errors.title.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" {...register("description")} className="col-span-3" />
                        {errors.description && <p className="col-span-4 text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="systemType" className="text-right">System Type</Label>
                         <Controller
                            name="systemType"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a system type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Web">Web</SelectItem>
                                        <SelectItem value="Mobile">Mobile</SelectItem>
                                        <SelectItem value="IoT">IoT</SelectItem>
                                        <SelectItem value="Desktop">Desktop</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                         />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tags" className="text-right">Tags</Label>
                        <Input id="tags" {...register("tags")} placeholder="Flutter, Firebase, IoT" className="col-span-3" />
                        {errors.tags && <p className="col-span-4 text-sm text-destructive">{errors.tags.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                        <Input id="imageUrl" {...register("imageUrl")} className="col-span-3" />
                        {errors.imageUrl && <p className="col-span-4 text-sm text-destructive">{errors.imageUrl.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageHint" className="text-right">Image Hint</Label>
                        <Input id="imageHint" {...register("imageHint")} placeholder="e.g. 'futuristic dashboard'" className="col-span-3" />
                        {errors.imageHint && <p className="col-span-4 text-sm text-destructive">{errors.imageHint.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repoUrl" className="text-right">Repo URL</Label>
                        <Input id="repoUrl" {...register("repoUrl")} className="col-span-3" />
                        {errors.repoUrl && <p className="col-span-4 text-sm text-destructive">{errors.repoUrl.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="liveUrl" className="text-right">Live URL</Label>
                        <Input id="liveUrl" {...register("liveUrl")} className="col-span-3" />
                        {errors.liveUrl && <p className="col-span-4 text-sm text-destructive">{errors.liveUrl.message}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Project"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
