"use client";

import { useState, useEffect } from "react";
import type { TechStack } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Edit, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TechStackForm } from "./tech-stack-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import * as LucideIcons from 'lucide-react';


export default function TechStackList() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTechStack, setSelectedTechStack] = useState<TechStack | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    const firestore = useFirestore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const techStacksQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "tech_stacks"), orderBy("name", "asc"));
    }, [firestore]);

    const { data: techStacks, isLoading } = useCollection<TechStack>(techStacksQuery);

    const handleEdit = (techStack: TechStack) => {
        setSelectedTechStack(techStack);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedTechStack(undefined);
        setIsFormOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        const techStackRef = doc(firestore, "tech_stacks", id);
        deleteDocumentNonBlocking(techStackRef);
        toast({ title: "Tech Stack Deleted", description: "The technology has been removed." });
    };
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedTechStack(undefined);
    };
    
    if (isLoading && !isClient) {
        return (
             <div className="p-4">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2 p-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                 <h2 className="text-xl font-headline font-semibold">
                    Tech Stacks ({techStacks?.length || 0})
                </h2>
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Tech Stack
                </Button>
            </div>
            
            {isClient && (
              <TechStackForm techStack={selectedTechStack} onClose={handleFormClose} isOpen={isFormOpen}>
                  <button className="hidden"></button>
              </TechStackForm>
            )}

            {!techStacks || techStacks.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <h3 className="text-xl font-semibold">No Tech Stacks Found</h3>
                    <p className="text-muted-foreground mt-2">Start by adding your first technology.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Icon</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {techStacks.map((tech) => {
                                const Icon = (LucideIcons as any)[tech.iconName] as LucideIcon;
                                return (
                                <TableRow key={tech.id}>
                                    <TableCell>
                                        {Icon && <Icon className="h-6 w-6" style={{ color: tech.color }}/>}
                                    </TableCell>
                                    <TableCell className="font-medium">{tech.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: tech.color }} />
                                            <span className="font-mono text-xs">{tech.color}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(tech)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> 
                                                            <span>Delete</span>
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the tech stack &quot;{tech.name}&quot;.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(tech.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
