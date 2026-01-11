
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TechStack } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import * as LucideIcons from 'lucide-react';
import { Check, ChevronsUpDown } from "lucide-react";
import { iconNames } from "@/lib/lucide-icon-names";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";


const techStackSchema = z.object({
    name: z.string().min(1, "Name is required"),
    iconName: z.string().refine(val => iconNames.includes(val), { message: "Invalid icon name." }),
    color: z.string().regex(/^\d{1,3}\s\d{1,3}%\s\d{1,3}%$/, "Must be a valid HSL color string (e.g., '210 40% 98%')."),
});

type TechStackFormData = z.infer<typeof techStackSchema>;

interface TechStackFormProps {
    techStack?: TechStack;
    children: React.ReactNode;
    onClose: () => void;
    isOpen: boolean;
}

const hslStringToHex = (hsl: string): string => {
    if (!hsl) return '#ffffff';
    const match = /(\d+)\s(\d+)%\s(\d+)%/.exec(hsl);
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
    if (!result) return "0 0% 0%";

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

    return `${h} ${s}% ${l}%`;
};


export function TechStackForm({ techStack, children, onClose, isOpen }: TechStackFormProps) {
    const [isPending, startTransition] = useTransition();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const { register, handleSubmit, formState: { errors }, control, reset, watch } = useForm<TechStackFormData>({
        resolver: zodResolver(techStackSchema),
        defaultValues: {
            name: "",
            iconName: "Code",
            color: "210 40% 98%",
        },
    });

     useEffect(() => {
        if (isOpen) {
            if (techStack) {
                reset({
                    name: techStack.name,
                    iconName: techStack.iconName,
                    color: techStack.color.replace(/hsl\(|\)|,/g, ''),
                });
            } else {
                reset({
                    name: "",
                    iconName: "Code",
                    color: "210 40% 98%",
                });
            }
        }
    }, [techStack, isOpen, reset]);

    const processSubmit = async (data: TechStackFormData) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Firestore is not available."
            });
            return;
        }

        const dataToSave = {
          ...data,
          color: `hsl(${data.color})`
        };

        startTransition(() => {
            if (techStack?.id) {
                const techStackRef = doc(firestore, "tech_stacks", techStack.id);
                updateDocumentNonBlocking(techStackRef, {
                    ...dataToSave,
                    updatedAt: serverTimestamp(),
                });
                toast({
                    title: "Tech Stack Updated",
                    description: "The technology has been successfully updated."
                });
            } else {
                const techStacksCollection = collection(firestore, "tech_stacks");
                addDocumentNonBlocking(techStacksCollection, {
                    ...dataToSave,
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
                        <Label htmlFor="iconName" className="text-right">Icon</Label>
                        <Controller
                            name="iconName"
                            control={control}
                            render={({ field }) => (
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="col-span-3" role="combobox">
                                            <Command shouldFilter={false} className="overflow-visible bg-transparent">
                                                <div className="relative">
                                                     <CommandInput 
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        placeholder="Search icon..."
                                                        className="w-full"
                                                     />
                                                     <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
                                                </div>
                                                <CommandList className="absolute z-10 w-[--radix-popover-trigger-width] top-full mt-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none">
                                                    <CommandEmpty>No icon found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {iconNames
                                                            .filter(name => name.toLowerCase().includes((field.value || '').toLowerCase()))
                                                            .slice(0, 100) // Limit results for performance
                                                            .map((name) => (
                                                            <CommandItem
                                                                key={name}
                                                                value={name}
                                                                onSelect={(currentValue) => {
                                                                    const iconName = iconNames.find(n => n.toLowerCase() === currentValue.toLowerCase());
                                                                    if (iconName) {
                                                                        field.onChange(iconName);
                                                                    }
                                                                    setPopoverOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        field.value === name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </div>
                                    </PopoverTrigger>
                                </Popover>
                            )}
                        />
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
                                        id="color-picker"
                                        type="color"
                                        value={hslStringToHex(field.value)}
                                        onChange={(e) => field.onChange(hexToHslString(e.target.value))}
                                        className="h-10 p-1"
                                    />
                                    <Input
                                      id="color"
                                      {...register("color")}
                                      className="font-mono"
                                      placeholder="210 40% 98%"
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

    