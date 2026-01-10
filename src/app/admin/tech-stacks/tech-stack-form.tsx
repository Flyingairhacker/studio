"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TechStack } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import * as LucideIcons from 'lucide-react';

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

const iconNames = Object.keys(LucideIcons).filter(k => k !== 'createLucideIcon' && k !== 'icons');

const techStackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    iconName: z.string().refine(val => iconNames.includes(val), { message: "Invalid icon name." }),
    color: z.string().regex(/^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/, "Must be a valid HSL color string."),
});

type TechStackFormData = z.infer<typeof techStackSchema>;

interface TechStackFormProps {
    techStack?: TechStack;
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

export function TechStackForm({ techStack, children, onClose, isOpen }: TechStackFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();

    const { register, handleSubmit, formState: { errors } } = useForm<TechStackFormData>({
        resolver: zodResolver(techStackSchema),
        defaultValues: techStack || {
            name: "",
            iconName: "Code",
            color: "hsl(210, 40%, 98%)",
        },
    });

    const processSubmit = async (data: TechStackFormData) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Firestore is not available."
            });
            return;
        }

        startTransition(() => {
            if (techStack?.id) {
                const techStackRef = doc(firestore, "tech_stacks", techStack.id);
                updateDocumentNonBlocking(techStackRef, {
                    ...data,
                    updatedAt: serverTimestamp(),
                });
                toast({
                    title: "Tech Stack Updated",
                    description: "The technology has been successfully updated."
                });
            } else {
                const techStacksCollection = collection(firestore, "tech_stacks");
                addDocumentNonBlocking(techStacksCollection, {
                    ...data,
                    createdAt: serverTimestamp(),
                });
                toast({
                    title: "Tech Stack Added",
                    description: "The new technology has been added."
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
                    <DialogTitle className="font-headline text-2xl text-glow">{techStack ? "Edit Tech Stack" : "New Tech Stack"}</DialogTitle>
                    <DialogDescription>
                        {techStack ? "Update the details for this technology." : "Add a new technology to your stack."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(processSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" {...register("name")} className="col-span-3" />
                        {errors.name && <p className="col-span-4 text-sm text-destructive text-right">{errors.name.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="iconName" className="text-right">Icon Name</Label>
                        <Input id="iconName" {...register("iconName")} placeholder="e.g. 'Smartphone'" className="col-span-3" />
                        {errors.iconName && <p className="col-span-4 text-sm text-destructive text-right">{errors.iconName.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">Color (HSL)</Label>
                        <Input id="color" {...register("color")} placeholder="e.g. 'hsl(198, 89%, 48%)'" className="col-span-3" />
                        {errors.color && <p className="col-span-4 text-sm text-destructive text-right">{errors.color.message}</p>}
                    </div>
                    
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="ghost">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Tech Stack"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
