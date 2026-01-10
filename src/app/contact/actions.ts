"use server";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Server-side safe Firebase initialization
function getDb() {
    if (getApps().length === 0) {
        initializeApp(firebaseConfig);
    }
    return getFirestore(getApp());
}


const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export async function saveMessage(values: z.infer<typeof formSchema>) {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            error: "Invalid data provided.",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const db = getDb();
    if (!db) {
      return { error: "Failed to connect to secure channel. Please try again later." };
    }

    try {
        await addDoc(collection(db, "contact_messages"), {
            ...validatedFields.data,
            sentAt: serverTimestamp(),
        });
        revalidatePath("/admin/inbox");
    } catch (error) {
        console.error("Firebase error:", error);
        return { error: "Failed to send message via secure channel. Please try again later." };
    }

    return { success: true };
}
