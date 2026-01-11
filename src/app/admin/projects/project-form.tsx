"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Project, TechStack } from "@/lib/types";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    techStackIds: z.array(z.string()).optional(),
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

    const techStacksQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "tech_stacks"), orderBy("name"));
    }, [firestore]);
    const { data: techStacks, isLoading: isLoadingTechStacks } = useCollection<TechStack>(techStacksQuery);

    const { register, handleSubmit, control, formState: { errors } } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: project?.title || "",
            description: project?.description || "",
            techStackIds: project?.techStackIds || [],
            systemType: project?.systemType || "Web",
            repoUrl: project?.repoUrl || "",
            liveUrl: project?.liveUrl || "",
            imageUrl: project?.imageUrl || "https://picsum.photos/seed/new/800/600",
            imageHint: project?.imageHint || "tech placeholder"
        },
    });

     useEffect(() => {
        if (project && isOpen) {
            handleSubmit((d) => {})(); // re-validate to clear previous errors
        }
    }, [project, isOpen, handleSubmit]);


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
            const projectData = {
                ...data,
            };

            if (project?.id) {
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
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" {...register("title")} />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Tech Stacks</Label>
                         <Controller
                            name="techStackIds"
                            control={control}
                            render={({ field }) => (
                                <ScrollArea className="h-32 w-full rounded-md border p-4">
                                {isLoadingTechStacks ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-6 w-2/3" />
                                        <Skeleton className="h-6 w-1/2" />
                                    </div>
                                ) : techStacks?.map((tech) => (
                                    <div key={tech.id} className="flex items-center space-x-2 mb-2">
                                        <Checkbox
                                            id={`tech-${tech.id}`}
                                            checked={field.value?.includes(tech.id)}
                                            onCheckedChange={(checked) => {
                                                const newValue = checked
                                                    ? [...(field.value || []), tech.id]
                                                    : (field.value || []).filter((id) => id !== tech.id);
                                                field.onChange(newValue);
                                            }}
                                        />
                                        <label
                                            htmlFor={`tech-${tech.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {tech.name}
                                        </label>
                                    </div>
                                ))}
                                </ScrollArea>
                            )}
                         />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="systemType">System Type</Label>
                             <Controller
                                name="systemType"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
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
                         <div className="space-y-2">
                            <Label htmlFor="imageHint">Image Hint</Label>
                            <Input id="imageHint" {...register("imageHint")} placeholder="e.g. 'futuristic dashboard'" />
                            {errors.imageHint && <p className="text-sm text-destructive">{errors.imageHint.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input id="imageUrl" {...register("imageUrl")} />
                        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="repoUrl">Repo URL</Label>
                        <Input id="repoUrl" {...register("repoUrl")} />
                        {errors.repoUrl && <p className="text-sm text-destructive">{errors.repoUrl.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="liveUrl">Live URL</Label>
                        <Input id="liveUrl" {...register("liveUrl")} />
                        {errors.liveUrl && <p className="text-sm text-destructive">{errors.liveUrl.message}</p>}
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
