import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, isFirebaseAvailable } from "./firebase";
import { localProjects, localMessages } from "./data";
import type { Project, ContactMessage } from "./types";

/**
 * Fetches all projects.
 * If Firebase is available, it fetches from the 'projects' collection in Firestore.
 * Otherwise, it returns the mock project data from `lib/data.ts`.
 */
export async function getProjects(): Promise<Project[]> {
    if (isFirebaseAvailable && db) {
        try {
            const q = query(collection(db, "projects"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
        } catch (error) {
            console.error("Error fetching projects from Firebase, falling back to local data.", error);
            // Fallback to local data on error
            return localProjects;
        }
    } else {
        // Return local data if Firebase is not configured/initialized
        return localProjects;
    }
}

/**
 * Fetches all contact messages.
 * If Firebase is available, it fetches from the 'messages' collection in Firestore.
 * Otherwise, it returns the mock message data from `lib/data.ts`.
 * NOTE: This is for initial load. Real-time updates are handled client-side.
 */
export async function getMessages(): Promise<ContactMessage[]> {
     if (isFirebaseAvailable && db) {
        try {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                 // Convert Firestore Timestamp to ISO string
                createdAt: doc.data().createdAt.toDate().toISOString()
            })) as ContactMessage[];
        } catch (error) {
            console.error("Error fetching messages from Firebase, falling back to local data.", error);
            return localMessages;
        }
    } else {
        return localMessages;
    }
}
