"use server";

import { revalidatePath } from "next/cache";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { z } from "zod";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

import { Project } from "@/lib/types";

// Server-side safe Firebase initialization
function getDb() {
    if (getApps().length === 0) {
        initializeApp(firebaseConfig);
    }
    return getFirestore(getApp());
}


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
    
    const db = getDb();
    
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
    
    const db = getDb();

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
    const db = getDb();

    try {
        await deleteDoc(doc(db, "projects", id));
    } catch (e: any) {
        return { error: `Failed to delete project: ${e.message}` };
    }
    
    revalidatePath("/admin/projects");
    revalidatePath("/");
    return { success: true };
}
