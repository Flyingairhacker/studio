"use server";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db, isFirebaseAvailable } from "@/lib/firebase";
import { localMessages } from "@/lib/data";

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
    
    const messageData = {
        ...validatedFields.data,
        createdAt: new Date(),
    };
    
    if (isFirebaseAvailable && db) {
        try {
            await addDoc(collection(db, "messages"), {
                ...validatedFields.data,
                createdAt: serverTimestamp(),
            });
            revalidatePath("/admin/inbox");
        } catch (error) {
            console.error("Firebase error:", error);
            return { error: "Failed to send message via secure channel. Please try again later." };
        }
    } else {
        console.log("Firebase not available. Saving message to local data.");
        // This is a server-side mock. It won't persist across requests in a stateless environment.
        localMessages.unshift({ id: `local-${Date.now()}`, ...messageData });
        revalidatePath("/admin/inbox");
    }

    return { success: true };
}
