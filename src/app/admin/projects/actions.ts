"use server";

import { revalidatePath } from "next/cache";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { z } from "zod";

import { isFirebaseAvailable, db } from "@/lib/firebase";
import { localProjects } from "@/lib/data";
import type { Project } from "@/lib/types";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    tags: z.string().min(1, "Tags are required"),
    systemType: z.enum(['Mobile', 'IoT', 'Desktop', 'Web']),
    repoUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    imageUrl: z.string().url("Image URL is required"),
    imageHint: z.string().optional(),
});

export async function addProject(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.data) {
        return { error: "Invalid data provided.", details: validatedFields.error.flatten().fieldErrors };
    }
    
    const { tags, ...rest } = validatedFields.data;
    const newProjectData = {
        ...rest,
        tags: tags.split(',').map(tag => tag.trim()),
    };

    if (isFirebaseAvailable && db) {
        try {
            await addDoc(collection(db, "projects"), newProjectData);
        } catch (e) {
            return { error: "Failed to add project to Firebase." };
        }
    } else {
        // This is a server-side mock. It won't persist across requests.
        // A real implementation would write to a file or a different DB.
        const newProject: Project = { id: `local-${Date.now()}`, ...newProjectData };
        localProjects.unshift(newProject);
    }
    
    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.data) {
        return { error: "Invalid data provided.", details: validatedFields.error.flatten().fieldErrors };
    }

    const { tags, ...rest } = validatedFields.data;
    const updatedProjectData = {
        ...rest,
        tags: tags.split(',').map(tag => tag.trim()),
    };

    if (isFirebaseAvailable && db) {
        try {
            const projectRef = doc(db, "projects", id);
            await updateDoc(projectRef, updatedProjectData);
        } catch (e) {
            return { error: "Failed to update project in Firebase." };
        }
    } else {
        const index = localProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            localProjects[index] = { ...localProjects[index], ...updatedProjectData };
        }
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}

export async function deleteProject(id: string) {
    if (isFirebaseAvailable && db) {
        try {
            await deleteDoc(doc(db, "projects", id));
        } catch (e) {
            return { error: "Failed to delete project from Firebase." };
        }
    } else {
        const index = localProjects.findIndex(p => p.id === id);
        if (index !== -1) {
            localProjects.splice(index, 1);
        }
    }
    
    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}
