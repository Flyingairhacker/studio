"use server";

import { revalidatePath } from "next/cache";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { z } from "zod";

import { db } from "@/lib/firebase";
import { Project } from "@/lib/types";

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

export async function addProjectAction(formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.data) {
        return { error: "Invalid data provided.", details: validatedFields.error.flatten().fieldErrors };
    }
    
    if (!db) {
        return { error: "Firebase is not available." };
    }
    
    const { tags, ...rest } = validatedFields.data;
    const newProjectData = {
        ...rest,
        tags: tags.split(',').map(tag => tag.trim()),
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, "projects"), newProjectData);
    } catch (e: any) {
        return { error: `Failed to add project: ${e.message}` };
    }
    
    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}

export async function updateProjectAction(id: string, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const validatedFields = projectSchema.safeParse(values);

    if (!validatedFields.data) {
        return { error: "Invalid data provided.", details: validatedFields.error.flatten().fieldErrors };
    }
    
    if (!db) {
        return { error: "Firebase is not available." };
    }

    const { tags, ...rest } = validatedFields.data;
    const updatedProjectData = {
        ...rest,
        tags: tags.split(',').map(tag => tag.trim()),
        updatedAt: serverTimestamp(),
    };

    try {
        const projectRef = doc(db, "projects", id);
        await updateDoc(projectRef, updatedProjectData);
    } catch (e: any) {
        return { error: `Failed to update project: ${e.message}` };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}

export async function deleteProjectAction(id: string) {
    if (!db) {
        return { error: "Firebase is not available." };
    }

    try {
        await deleteDoc(doc(db, "projects", id));
    } catch (e: any) {
        return { error: `Failed to delete project: ${e.message}` };
    }
    
    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}
