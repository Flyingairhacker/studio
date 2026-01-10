import AdminSidebar from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-background pattern-bg">
        <div className="p-4 sm:p-6 md:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
