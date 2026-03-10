"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Truck,
  Users,
  Calendar,
  Settings,
} from "lucide-react";

/**
 * Array of navigation items for the dashboard sidebar/header
 *
 * Each item represents a navigation link in the dashboard navigation bar.
 * The items are displayed as clickable icons with labels that provide
 * access to different sections of the dashboard.
 *
 * @type {Array<{
 *   name: string;        // Display name shown to the user
 *   href: string;        // URL path for navigation (Next.js route)
 *   icon: LucideIcon;    // Icon component from lucide-react library
 * }>}
 *
 * @property {string} name - The display name shown to the user (e.g., "Dashboard", "Repository")
 * @property {string} href - The URL path for Next.js navigation. Should follow the app router structure.
 * @property {LucideIcon} icon - Icon component from lucide-react library that visually represents the navigation item.
 */

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Repository",
    href: "/dashboard/repository-settings",
    icon: FolderOpen,
  },
  { name: "Vehicles", href: "/dashboard/vehicles", icon: Truck },
  { name: "All Users", href: "/dashboard/users", icon: Users },
  { name: "Planner", href: "/dashboard/planner", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className='w-full border-b bg-muted shadow-sm'>
      {/* overflow-x-auto on a non-absolute container so left-side items are always reachable */}
      <div className='h-20 md:h-26 overflow-x-auto scrollbar-hide scroll-smooth'>
        <div className='flex items-center justify-start lg:justify-center h-full min-w-max px-6 md:px-10 gap-2 sm:gap-6 lg:gap-20'>
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center min-w-24 sm:min-w-21 transition-colors snap-center shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-(--dashboard-navbar) hover:text-primary",
                )}>
                <item.icon
                  className='h-7 w-8 sm:h-7 sm:w-9 md:h-10 md:w-10 mb-1 md:mb-1.5 transition-transform group-hover:scale-110'
                  strokeWidth={1.5}
                />
                <span className='text-[11px] sm:text-base md:text-sm font-bold whitespace-nowrap md:mb-2'>
                  {item.name}
                </span>

                {isActive && (
                  <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 sm:w-16 md:w-20 lg:w-24 h-1 bg-primary rounded-full transition-all duration-300' />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
