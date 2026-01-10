"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition, useEffect } from "react";
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
    color: z.string().regex(/^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/, "Must be a valid HSL color string."),
});

type TechStackFormData = z.infer<typeof techStackSchema>;

interface TechStackFormProps {
    techStack?: TechStack;
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

const hslStringToHex = (hsl: string): string => {
    const match = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/.exec(hsl);
    if (!match) return "#ffffff";
    let h = parseInt(match[1]);
    let s = parseInt(match[2]);
    let l = parseInt(match[3]);

    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToHslString = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "hsl(0, 0%, 0%)";

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
};


export function TechStackForm({ techStack, children, onClose, isOpen }: TechStackFormProps) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const firestore = useFirestore();

    const { register, handleSubmit, formState: { errors }, control, watch, setValue } = useForm<TechStackFormData>({
        resolver: zodResolver(techStackSchema),
        defaultValues: techStack || {
            name: "",
            iconName: "Code",
            color: "hsl(210, 40%, 98%)",
        },
    });

    useEffect(() => {
        if (techStack) {
            setValue('name', techStack.name);
            setValue('iconName', techStack.iconName);
            setValue('color', techStack.color);
        }
    }, [techStack, setValue]);

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
                        <Label htmlFor="color" className="text-right">Color</Label>
                        <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={hslStringToHex(field.value)}
                                        onChange={(e) => field.onChange(hexToHslString(e.target.value))}
                                        className="h-10 p-1"
                                    />
                                    <Input 
                                      value={field.value}
                                      onChange={e => field.onChange(e.target.value)}
                                      className="font-mono"
                                      placeholder="hsl(210, 40%, 98%)"
                                    />
                                </div>
                            )}
                        />
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
