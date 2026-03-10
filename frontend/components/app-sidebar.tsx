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
  { slug: "subcontractor-details", label: "Subcontractor Details" },
  { slug: "driver-tachograph", label: "Driver Tachograph" },
  { slug: "renewal-tracker", label: "Renewal Tracker" },
  { slug: "policy-review-tracker", label: "Policy Review Tracker" },
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
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  // Detect active module from URL: /dashboard/[slug]/[standAloneId]
  const segments = pathname.split("/");
  const moduleSlug = segments[2] || "";
  const activeModule = CLIENT_MODULES.find((m) => m.slug === moduleSlug);
  const activeClientId = activeModule ? (segments[3] ?? "") : "";

  return (
    <Sidebar collapsible="icon" className="bg-sidebar border-r">
      {/* Toggle */}
      <DesktopSidebarToggle />

      <SidebarContent className="bg-muted flex-1">
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={activeModule?.label || "Company Management"}
                    className="bg-primary hover:bg-primary/90 h-14 rounded-none px-4 font-medium text-white hover:text-white"
                  >
                    <UserRoundCog className="h-5 w-5" />
                    <span className="text-[16px]">
                      {activeModule?.label || "Company Management"}
                    </span>
                    <ChevronDown className="ml-auto h-5 w-5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>

              <CollapsibleContent>
                {activeModule ? (
                  <SidebarMenuSub className="mt-3 -ml-5">
                    {clients.map((client, index) => (
                      <SidebarMenuSubItem key={client.id} className="relative">
                        {/* Vertical line */}
                        {index < clients.length - 1 && (
                          <div className="bg-muted-foreground absolute -top-1 bottom-0 left-6 w-0.5" />
                        )}

                        {/* Horizontal branch line */}
                        <div className="bg-muted-foreground absolute top-1/2 left-6 h-0.5 w-5" />

                        {/* Corner for last item */}
                        {index === clients.length - 1 && (
                          <div className="bg-muted-foreground absolute -top-1 left-6 h-7 w-0.5" />
                        )}
                        <SidebarMenuSubButton
                          asChild
                          isActive={activeClientId === client.id}
                          className={`hover:text-primary py-6 pl-14 font-normal text-(--body-text) hover:text-base ${
                            activeClientId === client.id
                              ? "!bg-white! !text-primary! data-[active=true]:text-primary! ml-12 rounded-none pl-3 shadow-sm! data-[active=true]:bg-white!"
                              : ""
                          } `}
                        >
                          <Link
                            href={`/dashboard/${activeModule.slug}/${client.id}`}
                            className="block"
                          >
                            {client.name}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : (
                  <div className="text-muted-foreground px-6 py-4 text-sm">
                    Please select a module from the footer to view clients.
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-muted p-3">
        <SidebarMenuButton
          asChild
          className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full cursor-pointer justify-start"
        >
          <div
            onClick={async () => {
              const logout = await AuthAction.LogOut();
              console.log(logout, "Log Out success"); // ! Must be remove console log
            }}
            className="flex items-center gap-2 text-[16px]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
