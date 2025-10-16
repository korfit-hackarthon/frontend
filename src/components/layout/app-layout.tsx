import { AppSidebar } from '../app-sidebar';
import { SidebarInset, SidebarProvider } from '../ui/sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
          <div className='flex items-center justify-between w-full px-4'>
            <div>
              <img src='/kuuid_logo.png' alt='Kuuid' className='h-4' />
            </div>
            <SidebarTrigger className='size-10' />
          </div>
        </header> */}
        <div>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
