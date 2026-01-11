
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { Project, TechStack } from "@/lib/types";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProjectForm } from "./project-form";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import * as LucideIcons from 'lucide-react';


export default function ProjectList() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    const firestore = useFirestore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const projectsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "projects"), orderBy("createdAt", "desc"));
    }, [firestore]);
    const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsQuery);
    
    const techStacksQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "tech_stacks"));
    }, [firestore]);
    const { data: techStacks, isLoading: isLoadingTechStacks } = useCollection<TechStack>(techStacksQuery);

    const techStacksMap = useMemo(() => {
        if (!techStacks) return new Map();
        return techStacks.reduce((acc, tech) => {
            acc.set(tech.id, tech);
            return acc;
        }, new Map<string, TechStack>());
    }, [techStacks]);

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedProject(undefined);
        setIsFormOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if (!firestore) return;
        const projectRef = doc(firestore, "projects", id);
        deleteDocumentNonBlocking(projectRef);
        toast({ title: "Project Deleted", description: "The project has been removed." });
    };
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedProject(undefined);
    };
    
    if ((isLoadingProjects || isLoadingTechStacks) && !isClient) {
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
                    Projects ({projects?.length || 0})
                </h2>
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>
            
            {isClient && (
              <ProjectForm project={selectedProject} onClose={handleFormClose} isOpen={isFormOpen}>
                  {/* This is a button that opens the dialog but we trigger it from other buttons */}
                  <button className="hidden"></button>
              </ProjectForm>
            )}

            {!projects || projects.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <h3 className="text-xl font-semibold">No Projects Found</h3>
                    <p className="text-muted-foreground mt-2">Start by adding your first project deployment.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">System Type</TableHead>
                                <TableHead className="hidden lg:table-cell">Tech Stack</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>
                                        <Image src={project.imageUrl} alt={project.title} width={50} height={50} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{project.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{project.systemType}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(project.techStackIds || []).slice(0, 4).map(techId => {
                                                const tech = techStacksMap.get(techId);
                                                if (!tech) return null;
                                                const Icon = (LucideIcons as any)[tech.iconName] as LucideIcon;
                                                return Icon ? <Icon key={techId} className="h-5 w-5" title={tech.name} style={{ color: `hsl(${tech.color.split(',')[0]}, ${tech.color.split(',')[1]}, ${tech.color.split(',')[2]})` }} /> : null;
                                            })}
                                            {(project.techStackIds?.length || 0) > 4 && (
                                                <span className="text-xs text-muted-foreground">+{ (project.techStackIds?.length || 0) - 4} more</span>
                                            )}
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
                                                <DropdownMenuItem onClick={() => handleEdit(project)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" /> 
                                                            <span className="text-destructive">Delete</span>
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the project &quot;{project.title}&quot;.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
