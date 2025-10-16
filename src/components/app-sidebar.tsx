import * as React from 'react';
import { LayoutDashboard, Settings, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { NavMain } from './nav-main';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();

  const data = {
    main: [
      {
        title: t('navigation.dashboard'),
        url: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: t('navigation.simulations'),
        url: '/simulations',
        icon: Play,
      },
      {
        title: t('navigation.settings'),
        url: '/settings',
        icon: Settings,
      },
    ],
  };
  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <img src='/kuuid_logo2.png' alt='Kuuid' className='h-8' />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.main} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
