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
  ClipboardList,
  ChevronDown,
  Recycle,
  FileCheck,
  Info,
  Database,
  BookOpen,
  FilePenLine,
  TableProperties,
  FilePlus2,
  ClipboardCheck,
  Printer,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function MainNav() {
  const { userProfile } = useAuth();
  const pathname = usePathname();

  const isActiveInfoMenu = pathname === '/user/data' || pathname === '/user/tutorial';
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(isActiveInfoMenu);

  const isActiveRiskMenu = pathname.startsWith('/user/survey') || pathname === '/user/results';
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(isActiveRiskMenu);
  
  const isActiveContinuityMenu = pathname.startsWith('/user/continuity');
  const [isContinuityMenuOpen, setIsContinuityMenuOpen] = useState(isActiveContinuityMenu);

  const adminMenu = [
    {
      href: '/admuinma/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admuinma/dashboard',
    },
    {
      href: '/admuinma/results',
      label: 'Survey Results',
      icon: FileText,
      active: pathname === '/admuinma/results',
    },
    {
      href: '/admuinma/continuity-results',
      label: 'Continuity Results',
      icon: ClipboardCheck,
      active: pathname === '/admuinma/continuity-results',
    },
    {
      href: '/admuinma/visualization',
      label: 'Visualization',
      icon: AreaChart,
      active: pathname === '/admuinma/visualization',
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
      href: '/superadmin/users',
      label: 'User Management',
      icon: Users,
      active: pathname.startsWith('/superadmin/users'),
    },
    {
      href: '/superadmin/role-management',
      label: 'Role Management',
      icon: Shield,
      active: pathname.startsWith('/superadmin/role-management'),
    },
    {
      href: '/superadmin/results',
      label: 'Survey Results',
      icon: FileText,
      active: pathname === '/superadmin/results',
    },
    {
      href: '/superadmin/continuity-results',
      label: 'Continuity Results',
      icon: ClipboardCheck,
      active: pathname === '/superadmin/continuity-results',
    },
    {
      href: '/superadmin/visualization',
      label: 'Visualization',
      icon: AreaChart,
      active: pathname === '/superadmin/visualization',
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
    return (
        <SidebarMenu>
            {menuItems.map((item: any) => (
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
        <Collapsible open={isInfoMenuOpen} onOpenChange={setIsInfoMenuOpen}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActiveInfoMenu}
              className="[&[data-state=open]>svg:last-of-type]:rotate-180"
            >
              <Info />
              <span className="mr-auto group-data-[collapsible=icon]:hidden">Informasi Penting</span>
              <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/data'}>
                  <Link href="/user/data">
                    <Database />
                    <span>Referensi Perhitungan</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/tutorial'}>
                  <Link href="/user/tutorial">
                    <BookOpen />
                    <span>Tutorial</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Collapsible open={isRiskMenuOpen} onOpenChange={setIsRiskMenuOpen}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActiveRiskMenu}
              className="[&[data-state=open]>svg:last-of-type]:rotate-180"
            >
              <ClipboardList />
              <span className="mr-auto group-data-[collapsible=icon]:hidden">Manajemen Risiko</span>
              <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/survey-1'}>
                  <Link href="/user/survey-1">
                    <FilePenLine />
                    <span>Input Form (Single)</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/survey-2'}>
                  <Link href="/user/survey-2">
                    <TableProperties />
                    <span>input Tabel (Multi)</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/results'}>
                  <Link href="/user/results">
                    <FileText />
                    <span>Hasil Survey Anda</span>
                  </Link>
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
                            <Link href="/user/continuity">
                                <FilePlus2 />
                                <span>Input Rencana</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/user/continuity-results'}>
                            <Link href="/user/continuity-results">
                                <ClipboardCheck />
                                <span>Rencana Terinput</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/user/grafik'} tooltip="Grafik Hasil">
          <Link href="/user/grafik">
            <AreaChart />
            <span>Grafik</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === '/user/conclusion'} tooltip="Laporan Akhir">
          <Link href="/user/conclusion">
            <Printer />
            <span>Laporan Akhir</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
