"use server";

import { revalidatePath } from "next/cache";
import { setDoc, doc } from "firebase/firestore";
import { z } from "zod";

import { db } from "@/lib/firebase"; // Using the initialized db instance

const bioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const BIO_DOC_ID = "main-bio";

export async function updateBio(values: z.infer<typeof bioSchema>) {
  const validatedFields = bioSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid data provided.",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (!db) {
    return { error: "Firebase is not configured." };
  }

  try {
    const bioRef = doc(db, "bio", BIO_DOC_ID);
    // Use setDoc with merge:true to create or update the document
    await setDoc(bioRef, validatedFields.data, { merge: true });

    // Revalidate paths to show updated info
    revalidatePath("/"); // Homepage hero section
    revalidatePath("/admin/bio");

    return { success: true };
  } catch (e: any) {
    return { error: `Failed to update bio: ${e.message}` };
  }
}
