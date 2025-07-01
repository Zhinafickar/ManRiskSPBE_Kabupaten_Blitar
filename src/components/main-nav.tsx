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
  LineChart,
  Users,
  Shield,
  AreaChart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const { userProfile } = useAuth();
  const pathname = usePathname();

  const userMenu = [
    {
      href: '/user/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/user/dashboard',
    },
    {
      href: '/user/survey-1',
      label: 'Input Survey 1',
      icon: FilePlus,
      active: pathname === '/user/survey-1',
    },
    {
      href: '/user/survey-2',
      label: 'Input Survey 2',
      icon: FilePlus,
      active: pathname === '/user/survey-2',
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

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
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
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
