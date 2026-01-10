import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { Project, ContactMessage } from "./types";

/**
 * Fetches all projects from Firestore.
 * This is intended for Server-Side Rendering or initial data fetching.
 * Client-side real-time updates should use the `useCollection` hook.
 */
export async function getProjects(): Promise<Project[]> {
    if (db) {
        try {
            const q = query(collection(db, "projects"), orderBy("title", "asc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
        } catch (error) {
            console.error("Error fetching projects from Firebase:", error);
            return []; // Return empty on error
        }
    } else {
        console.log("Firebase not available. Returning empty projects array.");
        return [];
    }
}

/**
 * Fetches all contact messages from Firestore.
 * This is for server-side initial load. Real-time updates are handled client-side.
 */
export async function getMessages(): Promise<ContactMessage[]> {
     if (db) {
        try {
            const q = query(collection(db, "contact_messages"), orderBy("sentAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                 // Convert Firestore Timestamp to ISO string for serialization
                sentAt: doc.data().sentAt.toDate().toISOString()
            })) as ContactMessage[];
        } catch (error) {
            console.error("Error fetching messages from Firebase:", error);
            return [];
        }
    } else {
        return [];
    }
}
