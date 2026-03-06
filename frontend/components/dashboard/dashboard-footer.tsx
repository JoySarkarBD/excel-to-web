"use client";

import { useSidebar } from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { RepositorySettingsAction } from "@/service/repository-settings";
import { SETTINGS_META } from "@/lib/repository/repository.types";
import { REPOSITORY_SETTINGS_UPDATED } from "@/lib/repository/repository.cookies";

export default function DashboardFooter() {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [footerItems, setFooterItems] = useState<
    Array<{ label: string; href: string }>
  >([]);

  const isExpanded = state === "expanded";
  const sidebarWidth = isMobile ? "0rem" : isExpanded ? "1rem" : "3rem";

  // Fetch enabled links from API
  const fetchLinks = useCallback(async () => {
    try {
      const res = await RepositorySettingsAction.getSettings();
      if (res.status && res.data) {
        const enabled = SETTINGS_META
          .filter((meta) => res.data![meta.key])
          .map(({ label, href }) => ({ label, href }));
        setFooterItems(enabled);
      }
    } catch {
      // Silently ignore — footer simply stays empty until next successful fetch
    }
  }, []);

  // Fetch once on mount + re-fetch when settings page saves
  useEffect(() => {
    fetchLinks();

    const handler = () => fetchLinks();
    window.addEventListener(REPOSITORY_SETTINGS_UPDATED, handler);
    return () => window.removeEventListener(REPOSITORY_SETTINGS_UPDATED, handler);
  }, [fetchLinks]);

  // Update maxScroll when items change
  useEffect(() => {
    const updateMaxScroll = () => {
      if (scrollContainerRef.current && footerItems.length > 0) {
        const container = scrollContainerRef.current;
        setMaxScroll(container.scrollWidth - container.clientWidth);
      }
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);
    return () => window.removeEventListener("resize", updateMaxScroll);
  }, [footerItems]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 200;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
    setScrollPosition(container.scrollLeft);
  };

  const isAtStart = scrollPosition === 0;
  const isAtEnd = scrollPosition >= maxScroll - 1;

  // In no links then no footer
  if (footerItems.length === 0) {
    return null;
  }

  return (
    <footer
      className='bg-muted px-4 py-3 transition-all duration-200 flex'
      style={{ marginLeft: sidebarWidth }}>
      <div className='flex items-center gap-2 w-full'>
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            "p-1 rounded-md border bg-white hover:bg-gray-50 transition-all hidden md:block",
            isAtStart && "opacity-30 cursor-not-allowed",
          )}
          disabled={isAtStart}>
          <ChevronLeft className='h-4 w-4' />
        </button>

        {/* Scrollable tabs */}
        <div
          ref={scrollContainerRef}
          className='flex-1 flex gap-x-2 overflow-x-auto md:overflow-x-hidden scrollbar-hide'
          onScroll={(e) => {
            const container = e.currentTarget;
            setScrollPosition(container.scrollLeft);
            setMaxScroll(container.scrollWidth - container.clientWidth);
          }}>
          {footerItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "inline-flex items-center justify-center h-10 px-3 transition-all duration-200 border",
                  "whitespace-nowrap overflow-hidden shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary min-w-max"
                    : "text-primary border-primary bg-(--primary-light) max-w-23 truncate",
                )}
                title={item.label}>
                <span className={cn("text-sm font-medium truncate")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            "p-1 rounded-md border bg-white hover:bg-gray-50 transition-all hidden md:block",
            isAtEnd && "opacity-30 cursor-not-allowed",
          )}
          disabled={isAtEnd}>
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </footer>
  );
}
