import GlassCard from "@/components/ui/glass-card";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import BlogEditor from "./blog-editor";
import { doc, getDoc } from "firebase/firestore";
import { getSdks, initializeFirebase } from "@/firebase";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// This is a server component to fetch the post if it exists
// It helps with SEO and faster initial loads
async function getPost(id: string) {
    if (id === 'new' || !firebaseConfig.apiKey) {
        return null;
    }
    
    try {
        if (getApps().length === 0) {
            initializeApp(firebaseConfig);
        }
        const db = getFirestore();
        const postRef = doc(db, 'blog_posts', id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const data = postSnap.data();
            // Firestore timestamps need to be converted to serializable format for props
            return {
                ...data,
                id: postSnap.id,
                publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
                createdAt: data.createdAt?.toDate?.().toISOString(),
                updatedAt: data.updatedAt?.toDate?.().toISOString(),
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch post:", e);
        return null;
    }
}


export default async function EditPostPage({ params }: { params: { id: string } }) {
    const post = await getPost(params.id);
    const isNewPost = params.id === 'new';
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-glow">
                    {isNewPost ? 'New Blog Post' : 'Edit Post'}
                </h1>
                <p className="text-muted-foreground">
                    {isNewPost ? 'Craft a new article for your audience.' : 'Refine your existing article.'}
                </p>
            </div>
            
            <GlassCard className="p-6">
                <FirebaseClientProvider>
                    <BlogEditor post={post} />
                </FirebaseClientProvider>
            </GlassCard>
        </div>
    );
}
