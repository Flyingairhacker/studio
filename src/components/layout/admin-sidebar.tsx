"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Fingerprint, LayoutGrid, Inbox, Palette, LogOut, PanelLeft, Bot } from "lucide-react";
import { logout } from "@/app/login/actions";
import Link from "next/link";

const menuItems = [
  { href: "/admin/projects", label: "Projects", icon: LayoutGrid },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/ai-tools", label: "AI Tools", icon: Bot },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        <SidebarHeader className="flex-row items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20">
                    <Fingerprint />
                </Button>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="font-headline text-lg font-bold">Operator</span>
                    <span className="text-xs text-muted-foreground">Admin Access</span>
                </div>
            </div>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>

        <SidebarMenu>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname.startsWith(href)}
                  tooltip={{ children: label }}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <form action={logout}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Logout" }}>
                <button type="submit" className="w-full">
                  <LogOut />
                  <span>Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
