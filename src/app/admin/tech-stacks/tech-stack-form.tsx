
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

    const watchedIcon = watch("iconName");
    const IconPreview = (LucideIcons as any)[watchedIcon] as LucideIcons.LucideIcon | undefined;

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
            <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl text-glow">{techStack ? "Edit Tech Stack" : "New Tech Stack"}</DialogTitle>
                    <DialogDescription>
                        {techStack ? "Update the details for this technology." : "Add a new technology to your stack."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="iconName">Icon</Label>
                        <Controller
                            name="iconName"
                            control={control}
                            render={({ field }) => (
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={popoverOpen}
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                {IconPreview && <IconPreview className="h-4 w-4" />}
                                                {field.value ? iconNames.find(name => name.toLowerCase() === field.value.toLowerCase()) : "Select icon..."}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search icon..." />
                                            <CommandList>
                                                <CommandEmpty>No icon found.</CommandEmpty>
                                                <CommandGroup>
                                                    {iconNames.map((name) => (
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
                                                                field.value && field.value.toLowerCase() === name.toLowerCase() ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {name}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.iconName && <p className="text-sm text-destructive">{errors.iconName.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                         <Controller
                            name="color"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="color-picker"
                                        type="color"
                                        value={hslStringToHex(field.value)}
                                        onChange={(e) => field.onChange(hexToHslString(e.target.value))}
                                        className="h-10 p-1 w-12 cursor-pointer"
                                    />
                                    <Input
                                      id="color"
                                      value={field.value}
                                      onChange={field.onChange}
                                      className="font-mono"
                                      placeholder="210 40% 98%"
                                    />
                                </div>
                            )}
                        />
                        {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
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
