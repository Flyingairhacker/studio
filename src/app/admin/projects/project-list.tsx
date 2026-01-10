"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
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
import { deleteProject } from "./actions";

export default function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
    const { toast } = useToast();

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setSelectedProject(undefined);
        setIsFormOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        const result = await deleteProject(id);
        if (result.error) {
            toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
            toast({ title: "Project Deleted", description: "The project has been removed." });
        }
    };
    
    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedProject(undefined);
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                 <h2 className="text-xl font-headline font-semibold">
                    Projects ({initialProjects.length})
                </h2>
                <ProjectForm project={selectedProject} onClose={handleFormClose}>
                   <Button onClick={handleAdd}>
                     <PlusCircle className="mr-2 h-4 w-4" />
                     New Project
                   </Button>
                </ProjectForm>
            </div>
            
            {initialProjects.length === 0 ? (
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
                                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialProjects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>
                                        <Image src={project.imageUrl} alt={project.title} width={50} height={50} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{project.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">{project.systemType}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {project.tags.slice(0, 3).map(tag => <span key={tag} className="text-xs bg-muted/50 px-2 py-1 rounded-full">{tag}</span>)}
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
