'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Cpu,
  Fingerprint,
  Gamepad2,
  Inbox,
  LayoutGrid,
  LogOut,
  Palette,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const menuItems = [
  { href: '/admin/projects', label: 'Projects', icon: LayoutGrid },
  { href: '/admin/tech-stacks', label: 'Tech Stacks', icon: Cpu },
  { href: '/admin/bio', label: 'Bio', icon: UserCircle },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/branding', label: 'Branding', icon: Palette },
  { href: '/admin/ai-tools', label: 'AI Tools', icon: Bot },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        <SidebarHeader className="flex-row items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Fingerprint />
            </Button>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-headline text-lg font-bold">Admin</span>
              <span className="text-xs text-muted-foreground">CMS Access</span>
            </div>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>

        <SidebarMenu>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <Link href={href}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={{ children: 'Logout' }}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
