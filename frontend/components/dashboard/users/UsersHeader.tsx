"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UsersHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function UsersHeader({
  searchQuery,
  onSearchChange,
}: UsersHeaderProps) {
  return (
    <div className="">
      <div className="flex flex-col justify-between gap-y-3 md:flex-row md:gap-x-3">
        <h1 className="text-primary mb-2 text-3xl font-bold">All Users</h1>
        <div className="relative flex max-w-xl items-center text-(--input-foreground)">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-(--input-foreground)" />
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-muted text-foreground rounded-none pl-10"
          />
        </div>
      </div>
    </div>
  );
}
