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
  Info,
  Database,
  BookOpen,
  FilePenLine,
  ClipboardCheck,
  Printer,
  Shield,
  Building,
  KeyRound,
  Fingerprint,
  BarChart,
  ListTree,
  Wrench,
  Workflow,
  FilePlus2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function MainNav() {
  const { userProfile } = useAuth();
  const pathname = usePathname();

  // User Menu States
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(false);
  const [isContinuityMenuOpen, setIsContinuityMenuOpen] = useState(false);

  // Admin Menu States
  const [isAdminDataMenuOpen, setIsAdminDataMenuOpen] = useState(false);

  // Super Admin Menu States
  const [isSuperAdminAccessMenuOpen, setIsSuperAdminAccessMenuOpen] = useState(false);
  const [isSuperAdminDataMenuOpen, setIsSuperAdminDataMenuOpen] = useState(false);

  if (userProfile?.role === 'admin') {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admuinma/dashboard'} tooltip="Dashboard">
                <Link href="/admuinma/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <Collapsible open={isAdminDataMenuOpen} onOpenChange={setIsAdminDataMenuOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={pathname.startsWith('/admuinma/results') || pathname.startsWith('/admuinma/continuity-results') || pathname.startsWith('/admuinma/visualization') || pathname.startsWith('/admuinma/opd')} className="[&[data-state=open]>svg:last-of-type]:rotate-180">
                            <BarChart />
                            <span className="mr-auto group-data-[collapsible=icon]:hidden">Data & Laporan</span>
                            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/admuinma/results'}>
                                    <Link href="/admuinma/results"><FileText /><span>Survey Results</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/admuinma/continuity-results'}>
                                    <Link href="/admuinma/continuity-results"><ClipboardCheck /><span>Continuity Results</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/admuinma/visualization'}>
                                    <Link href="/admuinma/visualization"><AreaChart /><span>Visualization</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/admuinma/opd'}>
                                    <Link href="/admuinma/opd"><Building /><span>OPD</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/system-workflow'} tooltip="Alur Kerja Sistem">
                <Link href="/system-workflow">
                    <Workflow />
                    <span>Alur Kerja Sistem</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
  }
  
  if (userProfile?.role === 'superadmin') {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/superadmin/dashboard'} tooltip="Dashboard">
                <Link href="/superadmin/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
                <Collapsible open={isSuperAdminAccessMenuOpen} onOpenChange={setIsSuperAdminAccessMenuOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={pathname.startsWith('/superadmin/users') || pathname.startsWith('/superadmin/role-management') || pathname.startsWith('/superadmin/token-management')} className="[&[data-state=open]>svg:last-of-type]:rotate-180">
                            <Fingerprint />
                            <span className="mr-auto group-data-[collapsible=icon]:hidden">Akses & Pengguna</span>
                            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/superadmin/users')}>
                                    <Link href="/superadmin/users"><Users /><span>User Management</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/superadmin/role-management')}>
                                    <Link href="/superadmin/role-management"><Shield /><span>Role Management</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith('/superadmin/token-management')}>
                                    <Link href="/superadmin/token-management"><KeyRound /><span>Token Management</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
                <Collapsible open={isSuperAdminDataMenuOpen} onOpenChange={setIsSuperAdminDataMenuOpen}>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={pathname.startsWith('/superadmin/results') || pathname.startsWith('/superadmin/continuity-results') || pathname.startsWith('/superadmin/visualization') || pathname.startsWith('/superadmin/opd')} className="[&[data-state=open]>svg:last-of-type]:rotate-180">
                            <BarChart />
                            <span className="mr-auto group-data-[collapsible=icon]:hidden">Data & Laporan</span>
                            <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/superadmin/results'}>
                                    <Link href="/superadmin/results"><FileText /><span>Survey Results</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/superadmin/continuity-results'}>
                                    <Link href="/superadmin/continuity-results"><ClipboardCheck /><span>Continuity Results</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/superadmin/visualization'}>
                                    <Link href="/superadmin/visualization"><AreaChart /><span>Visualization</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={pathname === '/superadmin/opd'}>
                                    <Link href="/superadmin/opd"><Building /><span>OPD</span></Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenuItem>

             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/system-workflow'} tooltip="Alur Kerja Sistem">
                <Link href="/system-workflow">
                    <Workflow />
                    <span>Alur Kerja Sistem</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
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
              isActive={pathname === '/user/data' || pathname === '/user/tutorial' || pathname === '/user/opd' || pathname === '/user/referensi-input'}
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
                <SidebarMenuSubButton asChild isActive={pathname === '/user/referensi-input'}>
                  <Link href="/user/referensi-input">
                    <ListTree />
                    <span>Referensi Inputan</span>
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
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild isActive={pathname === '/user/opd'}>
                  <Link href="/user/opd">
                    <Building />
                    <span>OPD Lain</span>
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
              isActive={pathname.startsWith('/user/survey') || pathname === '/user/results'}
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
                    <span>Input Form</span>
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
                isActive={pathname.startsWith('/user/continuity')}
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
            <span>Rekap Input</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
