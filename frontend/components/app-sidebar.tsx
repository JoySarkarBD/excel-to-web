import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";

import { ChevronDown, LogOut, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { DesktopSidebarToggle } from "./smart-toggle";
import { AuthAction } from "@/service/auth";

const clients = [
  { name: "All Clients", id: 0 },
  { name: "Intel Ltd", id: 1 },
  { name: "RCNL Ltd", id: 2 },
  { name: "Zubair Ltd", id: 3 },
  { name: "Greenwood Ltd", id: 4 },
];

export function AppSidebar() {
  const pathname = usePathname(); // Get current URL path

  // Function to determine active client from URL
  const getActiveClientId = () => {
    if (pathname === "/dashboard") return 0; // All Clients is active

    // Check if URL matches /dashboard/1, /dashboard/2, etc.
    const match = pathname.match(/^\/dashboard\/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }

    return 0; // Default to All Clients
  };

  const activeClientId = getActiveClientId();

  return (
    <Sidebar collapsible='icon' className='border-r bg-sidebar'>
      {/* Toggle */}
      <DesktopSidebarToggle />

      <SidebarContent className='flex-1 bg-muted'>
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className='group/collapsible'>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip='Company Management'
                    className='bg-primary text-white hover:bg-primary/90 hover:text-white h-14 px-4 font-medium rounded-none'>
                    <UserRoundCog className='h-5 w-5' />
                    <span className='text-[16px]'>Company Management</span>
                    <ChevronDown className='ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent>
                <SidebarMenuSub className='-ml-5 mt-3'>
                  {clients.map((client, index) => (
                    <SidebarMenuSubItem key={client.id} className='relative'>
                      {/* Vertical line */}
                      {index < clients.length - 1 && (
                        <div className='absolute left-6 -top-1 bottom-0 w-0.5 bg-(--muted-foreground) ' />
                      )}

                      {/* Horizontal branch line */}
                      <div className='absolute left-6 top-1/2 w-5 h-0.5 bg-(--muted-foreground)' />

                      {/* Corner for last item */}
                      {index === clients.length - 1 && (
                        <div className='absolute left-6 -top-1 w-0.5 h-7 bg-(--muted-foreground)' />
                      )}
                      <SidebarMenuSubButton
                        asChild
                        isActive={activeClientId === client.id}
                        className={`
    text-(--body-text) hover:text-primary hover:text-base 
    font-normal py-6 pl-14 
    ${
      activeClientId === client.id
        ? "!bg-white! !text-primary! shadow-sm! ml-12 rounded-none pl-3 data-[active=true]:bg-white! data-[active=true]:text-primary!"
        : ""
    }
  `}>
                        <Link
                          href={
                            client.id === 0
                              ? "/dashboard"
                              : `/dashboard/${client.id}`
                          }
                          className='block'>
                          {client.name}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='bg-muted p-3'>
        <SidebarMenuButton
          asChild
          className='w-full cursor-pointer justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'>
          <div
          onClick={async()=>{
         const logout = await AuthAction.LogOut();
         console.log(logout, 'Log Out success'); // ! Must be remove console log
          }}
          className='flex items-center gap-2 text-[16px]'>
            <LogOut className='h-4 w-4' />
            <span>Logout Account</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
