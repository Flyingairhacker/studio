import AdminSidebar from "@/components/layout/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FirebaseClientProvider } from '@/firebase/client-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background pattern-bg">
          <div className="p-4 sm:p-6 md:p-8">
              {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
