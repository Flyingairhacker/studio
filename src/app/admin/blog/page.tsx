import GlassCard from "@/components/ui/glass-card";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import BlogList from "./blog-list";

export default async function AdminBlogPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-glow">
                    Blog Posts
                </h1>
                <p className="text-muted-foreground">Create and manage your articles.</p>
            </div>

            <GlassCard className="p-0 md:p-0">
                <FirebaseClientProvider>
                    <BlogList />
                </FirebaseClientProvider>
            </GlassCard>
        </div>
    );
}
