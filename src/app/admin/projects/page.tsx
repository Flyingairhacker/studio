import GlassCard from "@/components/ui/glass-card";
import { getProjects } from "@/lib/data-access";
import ProjectList from "./project-list";

export default async function AdminProjectsPage() {
    const projects = await getProjects();
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold text-glow">
                    Project Deployments
                </h1>
                <p className="text-muted-foreground">Manage your portfolio projects.</p>
            </div>

            <GlassCard className="p-0 md:p-0">
                <ProjectList initialProjects={projects} />
            </GlassCard>
        </div>
    );
}
