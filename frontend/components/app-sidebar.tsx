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
import { ClientAction } from "@/service/client";
import { useEffect, useState } from "react";

interface SidebarClient {
  id: string;
  name: string;
}

/**
 * Modules that use /dashboard/[slug]/[standAloneId] pattern.
 * Add new modules here as they are built.
 */
const CLIENT_MODULES: { slug: string; label: string }[] = [
  { slug: "driver-details", label: "Driver Details" },
  { slug: "vehicle-list", label: "Vehicle List" },
  { slug: "spot-checks", label: "Spot Checks" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [clients, setClients] = useState<SidebarClient[]>([]);

  // Fetch real clients on mount
  useEffect(() => {
    ClientAction.getClients({ showPerPage: 10, pageNo: 1 })
      .then((res) => {
        if (res.status && res.data?.data) {
          setClients(
            res.data.data.map((row) => ({
              id: row.client._id,
              name: row.client.fullName,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Detect active module from URL: /dashboard/[slug]/[standAloneId]
  const segments = pathname.split("/");
  const moduleSlug = segments[2] || "";
  const activeModule = CLIENT_MODULES.find((m) => m.slug === moduleSlug);
  const activeClientId = activeModule ? segments[3] ?? "" : "";

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
                    tooltip={activeModule?.label || "Company Management"}
                    className='bg-primary text-white hover:bg-primary/90 hover:text-white h-14 px-4 font-medium rounded-none'>
                    <UserRoundCog className='h-5 w-5' />
                    <span className='text-[16px]'>
                      {activeModule?.label || "Company Management"}
                    </span>
                    <ChevronDown className='ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent>
                {activeModule ? (
                  <SidebarMenuSub className='-ml-5 mt-3'>
                    {clients.map((client, index) => (
                      <SidebarMenuSubItem key={client.id} className='relative'>
                        {/* Vertical line */}
                        {index < clients.length - 1 && (
                          <div className='absolute left-6 -top-1 bottom-0 w-0.5 bg-muted-foreground' />
                        )}

                        {/* Horizontal branch line */}
                        <div className='absolute left-6 top-1/2 w-5 h-0.5 bg-muted-foreground' />

                        {/* Corner for last item */}
                        {index === clients.length - 1 && (
                          <div className='absolute left-6 -top-1 w-0.5 h-7 bg-muted-foreground' />
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
                            href={`/dashboard/${activeModule.slug}/${client.id}`}
                            className='block'>
                            {client.name}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : (
                  <div className='px-6 py-4 text-sm text-muted-foreground'>
                    Please select a module from the footer to view clients.
                  </div>
                )}
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
