'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Book,
  AreaChart,
  Users,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function MainNav() {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const userMenu = [
    {
      href: '/user/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/user/dashboard',
    },
    {
      href: '/user/survey-1',
      label: 'Input Risiko',
      icon: FilePlus,
      active: pathname === '/user/survey-1',
    },
    {
      href: '/user/results',
      label: 'Hasil Survey',
      icon: FileText,
      active: pathname === '/user/results',
    },
    {
      href: '/user/tutorial',
      label: 'Tutorial',
      icon: Book,
      active: pathname === '/user/tutorial',
    },
  ];

  const adminMenu = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      href: '/admin/results',
      label: 'Hasil Survey',
      icon: FileText,
      active: pathname === '/admin/results',
    },
    {
      href: '/admin/visualization',
      label: 'Visualisasi',
      icon: AreaChart,
      active: pathname === '/admin/visualization',
    },
  ];

  const superAdminMenu = [
    {
      href: '/superadmin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/superadmin/dashboard',
    },
    {
      href: '/superadmin/results',
      label: 'Hasil Survey',
      icon: FileText,
      active: pathname === '/superadmin/results',
    },
    {
      href: '/superadmin/visualization',
      label: 'Visualisasi',
      icon: AreaChart,
      active: pathname === '/superadmin/visualization',
    },
    {
      href: '/superadmin/users',
      label: 'Manajemen User',
      icon: Users,
      active: pathname === '/superadmin/users',
    },
  ];

  const getMenuItems = () => {
    switch (userProfile?.role) {
      case 'admin':
        return adminMenu;
      case 'superadmin':
        return superAdminMenu;
      default:
        return userMenu;
    }
  };

  const menuItems = getMenuItems();

  const allItems = [
    ...menuItems,
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      active: false,
    },
  ];

  return (
    <SidebarMenu>
      {allItems.map((item: any) => (
        <SidebarMenuItem key={item.label}>
          {item.href ? (
            <SidebarMenuButton
              asChild
              isActive={item.active}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              onClick={item.onClick}
              isActive={item.active}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
