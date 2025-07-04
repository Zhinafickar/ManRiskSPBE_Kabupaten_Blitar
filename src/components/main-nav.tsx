'use client';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  FileText,
  AreaChart,
  Users,
  LogOut,
  Book,
  ClipboardList,
  ChevronDown,
  Recycle,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export function MainNav() {
  const { userProfile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isActiveRiskMenu = pathname.startsWith('/user/survey') || pathname === '/user/results';
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(isActiveRiskMenu);
  
  const isActiveContinuityMenu = pathname.startsWith('/user/continuity');
  const [isContinuityMenuOpen, setIsContinuityMenuOpen] = useState(isActiveContinuityMenu);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const adminMenu = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      href: '/admin/results',
      label: 'Survey Results',
      icon: FileText,
      active: pathname === '/admin/results',
    },
    {
      href: '/admin/visualization',
      label: 'Visualization',
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
      label: 'Survey Results',
      icon: FileText,
      active: pathname === '/superadmin/results',
    },
    {
      href: '/superadmin/visualization',
      label: 'Visualization',
      icon: AreaChart,
      active: pathname === '/superadmin/visualization',
    },
    {
      href: '/superadmin/users',
      label: 'User Management',
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
        return []; // User menu is rendered separately
    }
  };
  
  if (userProfile?.role === 'admin' || userProfile?.role === 'superadmin') {
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
    )
  }

  // User Menu
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/user/dashboard'} tooltip="Dashboard">
          <Link href="/user/dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Collapsible open={isRiskMenuOpen} onOpenChange={setIsRiskMenuOpen}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActiveRiskMenu}
              className="[&[data-state=open]>svg:last-of-type]:rotate-180"
            >
              <ClipboardList />
              <span className="mr-auto group-data-[collapsible=icon]:hidden">Manajement Risiko</span>
              <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/survey-1'}>
                  <Link href="/user/survey-1">Input Form (Single)</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/survey-2'}>
                  <Link href="/user/survey-2">input Tabel (Multi)</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/results'}>
                  <Link href="/user/results">Hasil Survey Anda</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <Collapsible open={isContinuityMenuOpen} onOpenChange={setIsContinuityMenuOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton
                isActive={isActiveContinuityMenu}
                className="[&[data-state=open]>svg:last-of-type]:rotate-180"
                >
                    <Recycle />
                    <span className="mr-auto group-data-[collapsible=icon]:hidden">Kontinuitas</span>
                    <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarMenuSub>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/user/continuity'}>
                            <Link href="/user/continuity">Input Rencana</Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/user/continuity-results'}>
                            <Link href="/user/continuity-results">Hasil Rencana</Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/user/conclusion'} tooltip="Conclusion/Kesimpulan">
          <Link href="/user/conclusion">
            <FileCheck />
            <span>Conclusion/Kesimpulan</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/user/tutorial'} tooltip="Tutorial">
          <Link href="/user/tutorial">
            <Book />
            <span>Tutorial</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
