import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarToggle } from "../smart-toggle";

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 flex h-14 items-center justify-between border-b px-4 shadow-sm sm:px-6 md:h-16 lg:px-10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <MobileSidebarToggle />
        <Image
          src="/logo.png"
          alt="OCMP"
          width={150}
          height={40}
          className="object-contain"
          style={{ height: "auto" }}
          priority
        />
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden text-sm font-medium sm:block">
          Hello, Admin
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer md:h-10 md:w-10">
              <AvatarImage
                src="/dashboard/Driver.png"
                alt="Admin"
                suppressHydrationWarning
              />
              <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                AD
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
